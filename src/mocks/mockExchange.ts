import {
    type Exchange,
    getOperationName,
    makeResult,
    type Operation,
} from "urql";
import { map, pipe } from "wonka";
import { createAppointment, createRecurrenceRule, } from "./data"; // patients
import { type Appointment, expandAppointmentsFromRule } from "./recurrence";
import { loadPatients, savePatients } from "./storage";

// handler / resolver untuk intercept query

export const mockExchange: Exchange = () => (ops$) =>
    pipe(
        ops$,
        map((operation: Operation) => {
            const opName = getOperationName(operation.query);
            const vars = operation.variables ?? {};

            switch (opName) {
                // =====================
                // QUERIES
                // =====================
                case "AllPatients": {
                    const {
                        search,
                        limit = 10,
                        offset = 0,
                    } = vars as {
                        search?: string;
                        limit?: number;
                        offset?: number;
                    };

                    const patients = loadPatients();
                    let filtered = patients;
                    if (search) {
                        const term = search.toLowerCase();
                        filtered = patients.filter(
                            (p) =>
                                p.name.toLowerCase().includes(term) ||
                                p.phone?.toLowerCase().includes(term) ||
                                p.email?.toLowerCase().includes(term),
                        );
                    }

                    const paginated = filtered.slice(offset, offset + limit);

                    return makeResult(operation, {
                        data: {
                            allPatients: {
                                patients: paginated,
                                total: filtered.length,
                            },
                        },
                    });
                }

                case "PatientDetail": {
                    const patients = loadPatients();
                    const patient = patients.find((p) => p.id === vars.id);
                    if (!patient) {
                        return makeResult(operation, {
                            errors: [{ message: "Patient not found" }],
                        });
                    }

                    // Ensure all fields exist
                    return makeResult(operation, {
                        data: {
                            patient: {
                                ...patient,
                                phone: patient.phone ?? null,
                                email: patient.email ?? null,
                                address: patient.address ?? null,
                                medicalHistory: patient.medicalHistory ?? null,
                                outstandingBalance: patient.outstandingBalance ?? 0,
                                insuranceInfo: patient.insuranceInfo ?? null,
                                lastVisit: patient.lastVisit ?? null,
                                nextAppointment: null, // atau logic untuk cari next appointment
                            },
                        },
                    });
                }

                case "AllAppointments": {
                    const { fromDate, toDate } = vars;
                    const from = new Date(fromDate);
                    const to = new Date(toDate);

                    const patients = loadPatients();

                    const allAppointments: Appointment[] = [];

                    patients.forEach((patient) => {
                        const apps = patient.appointments.filter((apt) => {
                            const aptStart = new Date(apt.startDateTime);
                            return aptStart >= from && aptStart <= to;
                        });

                        allAppointments.push(
                            ...apps.map((apt) => ({
                                ...apt,
                                patient: {
                                    id: patient.id,
                                    name: patient.name,
                                },
                            }))
                        );

                        patient.recurrenceRules.forEach((rule) => {
                            const expanded = expandAppointmentsFromRule(rule, fromDate, toDate);
                            allAppointments.push(
                                ...expanded.map((apt) => ({
                                    ...apt,
                                    patient: {
                                        id: patient.id,
                                        name: patient.name,
                                    },
                                }))
                            );
                        });
                    });

                    return makeResult(operation, {
                        data: {
                            allAppointments: {
                                appointments: allAppointments,
                                total: allAppointments.length,
                            },
                        },
                    });
                }

                case "PatientAppointments": {
                    const { patientId, fromDate, toDate } = vars;
                    const patients = loadPatients();
                    const patient = patients.find((p) => p.id === patientId);

                    if (!patient) {
                        return makeResult(operation, {
                            errors: [{ message: "Patient not found" }],
                        });
                    }

                    const from = new Date(fromDate);
                    const to = new Date(toDate);

                    const apps = patient.appointments.filter((apt) => {
                        const aptStart = new Date(apt.startDateTime);
                        return aptStart >= from && aptStart <= to;
                    });

                    patient.recurrenceRules.forEach((rule) => {
                        apps.push(...expandAppointmentsFromRule(rule, fromDate, toDate));
                    });

                    return makeResult(operation, {
                        data: {
                            appointmentsByPatient: {
                                appointments: apps,
                                total: apps.length,
                            },
                        },
                    });
                }

                // =====================
                // MUTATIONS
                // =====================
                case "CreatePatient": {
                    const input = vars.input;
                    const patients = loadPatients();

                    const newPatient = {
                        id: crypto.randomUUID(),
                        name: input.name,
                        phone: input.phone || null,
                        email: input.email || null,
                        address: input.address || null,
                        medicalHistory: input.medicalHistory || null,
                        appointments: [],
                        recurrenceRules: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };

                    const updatedPatients = [...patients, newPatient];

                    savePatients(updatedPatients);

                    return makeResult(operation, {
                        data: {
                            createPatient: newPatient,
                        },
                    });
                }

                case "UpdatePatient": {
                    const { id, input } = vars;
                    const patients = loadPatients();

                    console.log("patients", patients)

                    const patient = patients.find((p) => p.id === id);

                    if (!patient) {
                        return makeResult(operation, {
                            errors: [{ message: "Patient not found" }],
                        });
                    }

                    if (input.name !== undefined) patient.name = input.name;
                    if (input.phone !== undefined) patient.phone = input.phone || undefined;
                    if (input.email !== undefined) patient.email = input.email || undefined;
                    if (input.address !== undefined) patient.address = input.address || undefined;
                    if (input.medicalHistory !== undefined) patient.medicalHistory = input.medicalHistory || undefined;
                    patient.updatedAt = new Date().toISOString();

                    savePatients(patients); // ← Save updated array

                    return makeResult(operation, {
                        data: { updatePatient: patient },
                    });
                }

                case "DeletePatient": {
                    const { id } = vars;
                    const patients = loadPatients();

                    const index = patients.findIndex(p => p.id === id);
                    if (index === -1) {
                        return makeResult(operation, {
                            errors: [{ message: "Patient not found" }],
                        });
                    }

                    patients.splice(index, 1);

                    savePatients(patients);

                    return makeResult(operation, {
                        data: {
                            deletePatient: {
                                success: true,
                                message: "Patient deleted successfully",
                            },
                        },
                    });
                }

                case "createRecurrenceRule": {
                    const input = vars.input;
                    const patients = loadPatients();
                    const patient = patients.find((p) => p.id === input.patientId);

                    if (!patient) {
                        return makeResult(operation, {
                            errors: [{ message: "Patient not found" }],
                        });
                    }

                    const rule = createRecurrenceRule(input);
                    patient.recurrenceRules.push(rule);

                    return makeResult(operation, {
                        data: { createRecurrenceRule: rule },
                    });
                }

                case "createOneTimeAppointment": {
                    const input = vars.input;
                    const patients = loadPatients();
                    const patient = patients.find((p) => p.id === input.patientId);

                    if (!patient) {
                        return makeResult(operation, {
                            errors: [{ message: "Patient not found" }],
                        });
                    }

                    const app = createAppointment({
                        ...input,
                        isException: false,
                        recurrenceRule: null,
                        recurrenceId: null,
                    });

                    patient.appointments.push(app);

                    return makeResult(operation, {
                        data: { createOneTimeAppointment: app },
                    });
                }
            }

            return makeResult(operation, {
                errors: [{ message: `Unhandled operation: ${opName}` }],
            });
        }),
    );
