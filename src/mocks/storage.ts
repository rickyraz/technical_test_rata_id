import type { Patient, Workflow } from "./data";
import { Appointment } from "./recurrence";

const PATIENT_KEY = "clinic_patients";

export const patients: Patient[] = [
    {
        id: "1",
        name: "Jessica Novia",
        email: "jessica@example.com",
        phone: "555-1234",
        address: "123 Main St, Springfield",
        medicalHistory: "No known allergies. Previous cavity fillings.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        appointments: [],
        recurrenceRules: [
            {
                id: "rule1",
                patientId: "1",
                frequency: "WEEKLY",
                interval: 1,
                startDateTime: "2025-12-23T03:00:00Z", // 23 Des 2025 10:00 WIB
                until: "2026-03-23T03:00:00Z",
                byDay: [{ ordinal: null, day: "TU" }],
                note: "Weekly aligner check",
            },
        ],
    },

    {
        id: "2",
        name: "Melrose Burhan",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        appointments: [
            {
                id: "app1",
                patientId: "2",
                startDateTime: "2025-12-26T07:00:00Z", // 26 Des 2025 14:00 WIB
                endDateTime: "2025-12-26T08:00:00Z",
                note: "Initial 3D scan",
                recurrenceRule: null,
                recurrenceId: null,
                isException: false,
            },
        ],
        recurrenceRules: [
            {
                id: "rule2",
                patientId: "2",
                frequency: "DAILY",
                interval: 3,
                startDateTime: "2025-12-23T02:00:00Z", // 23 Des 2025 09:00 WIB
                count: 10,
                note: "Medication reminder",
            },
        ],
    },

    {
        id: "3",
        name: "Novira Veronica",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        appointments: [],
        recurrenceRules: [
            {
                id: "rule3",
                patientId: "3",
                frequency: "MONTHLY",
                interval: 1,
                startDateTime: "2025-12-01T07:00:00Z", // 1 Des 2025 14:00 WIB
                byMonthDay: [1, 15],
                count: 4,
                note: "Scaling schedule",
            },
        ],
    },

    {
        id: "4",
        name: "Vania Liman",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        appointments: [],
        recurrenceRules: [
            {
                id: "rule4",
                patientId: "4",
                frequency: "YEARLY",
                interval: 1,
                startDateTime: "2025-12-15T03:00:00Z", // 15 Des 2025 10:00 WIB
                byMonth: [6, 12],
                count: 3,
                note: "Biannual dental exam",
            },
        ],
    },
];

export function loadPatients(): Patient[] {
    if (typeof window === "undefined") {
        console.log("bukan client tapi server")
        return patients;
    }

    const stored = localStorage.getItem(PATIENT_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (err) {
            console.error("err", err)
            return patients;
        }
    }

    return patients;
}

export function loadPatient(patientId: string): Patient | null {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem(PATIENT_KEY);
    if (!raw) return null;

    const patients: Patient[] = JSON.parse(raw);
    return patients.find(p => p.id === patientId) ?? null;
}

export function savePatients(patients: Patient[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(PATIENT_KEY, JSON.stringify(patients));
}

export function savePatient(patient: Patient) {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem(PATIENT_KEY);
    const patients: Patient[] = raw ? JSON.parse(raw) : [];

    const updated = patients.some(p => p.id === patient.id)
        ? patients.map(p => (p.id === patient.id ? patient : p))
        : [...patients, patient];

    localStorage.setItem(PATIENT_KEY, JSON.stringify(updated));
}

// ---

const APPOINTMENT_KEY = "clinic_appointments";

type AppointmentCache = Record<
    string,
    {
        fromDate: string;
        toDate: string;
        items: Appointment[];
        updatedAt: string;
    }
>;

export function loadAppointments(patientId: string): Appointment[] | null {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem(APPOINTMENT_KEY);
    if (!raw) return null;

    const cache: AppointmentCache = JSON.parse(raw);
    return cache[patientId]?.items ?? null;
}

export function saveAppointments(
    patientId: string,
    fromDate: string,
    toDate: string,
    items: Appointment[],
) {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem(APPOINTMENT_KEY);
    const cache: AppointmentCache = raw ? JSON.parse(raw) : {};

    cache[patientId] = {
        fromDate,
        toDate,
        items,
        updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(cache));
}

// ---

// Workflows storage
export function loadWorkflows(): Workflow[] {
    const stored = localStorage.getItem("workflows");
    return stored ? JSON.parse(stored) : [];
}

export function saveWorkflows(workflows: Workflow[]): void {
    localStorage.setItem("workflows", JSON.stringify(workflows));
}