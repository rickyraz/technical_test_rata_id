import { graphql, HttpResponse } from "msw";

type Appointment = {
  id: string;
  patientId: string;
  startDateTime: string;
  endDateTime: string;
  note?: string;
  recurrenceRule: Partial<RecurrenceRule> | null;
  recurrenceId: string | null;
  isException: boolean;
};

type RecurrenceRule = {
  id: string;
  patientId: string;
  frequency: string;
  interval: number;
  startDateTime: string;
  until?: string;
  count?: number | null;
  byDay?: { ordinal: number | null; day: string }[];
  byMonthDay?: number[];
  byMonth?: number[];
  byHour?: number[];
  byMinute?: number[];
  weekStart?: string;
  note?: string;
  rruleString?: string;
};

type Patient = {
  id: string;
  name: string;
  appointments: Appointment[];
  recurrenceRules: RecurrenceRule[];
};

const patients: Patient[] = [
  {
    id: "1",
    name: "Jessica Novia",
    appointments: [],
    recurrenceRules: [
      // WEEKLY - Every Tuesday
      {
        id: "rule1",
        patientId: "1",
        frequency: "WEEKLY",
        interval: 1,
        startDateTime: "2025-12-20T10:00:00Z",
        until: "2026-03-20T10:00:00Z",
        byDay: [{ ordinal: null, day: "TU" }],
        note: "Weekly checkup for aligners",
      },
    ],
  },
  {
    id: "2",
    name: "Melrose Burhan",
    appointments: [
      {
        id: "app1",
        patientId: "2",
        startDateTime: "2025-12-18T14:00:00Z",
        endDateTime: "2025-12-18T15:00:00Z",
        note: "Initial 3D scan",
        recurrenceRule: null,
        recurrenceId: null,
        isException: false,
      },
    ],
    recurrenceRules: [
      // DAILY - Every 3 days
      {
        id: "rule2",
        patientId: "2",
        frequency: "DAILY",
        interval: 3,
        startDateTime: "2025-12-20T09:00:00Z",
        count: 10,
        note: "Daily medication reminder",
      },
    ],
  },
  {
    id: "3",
    name: "Novira Veronica",
    appointments: [],
    recurrenceRules: [
      // MONTHLY - 1st and 15th
      {
        id: "rule3",
        patientId: "3",
        frequency: "MONTHLY",
        interval: 1,
        startDateTime: "2025-12-01T14:00:00Z",
        byMonthDay: [1, 15],
        count: 12,
        note: "Bi-monthly scaling",
      },
    ],
  },
  {
    id: "4",
    name: "Vania Liman",
    appointments: [],
    recurrenceRules: [
      // YEARLY - Every 6 months (June & December)
      {
        id: "rule4",
        patientId: "4",
        frequency: "YEARLY",
        interval: 1,
        startDateTime: "2025-12-15T10:00:00Z",
        byMonth: [6, 12],
        count: 8,
        note: "Biannual comprehensive dental exam",
      },
    ],
  },
];

let nextId = 5; // For new patients/appointments/rules
let nextRuleId = 2;
let nextAppId = 2;

function addInterval(date: Date, frequency: string, interval: number): Date {
  const next = new Date(date);

  switch (frequency) {
    case "DAILY":
      next.setDate(next.getDate() + interval);
      break;

    case "WEEKLY":
      next.setDate(next.getDate() + (7 * interval));
      break;

    case "MONTHLY":
      next.setMonth(next.getMonth() + interval);
      break;

    case "YEARLY":
      next.setFullYear(next.getFullYear() + interval);
      break;

    default:
      throw new Error(`Unknown frequency: ${frequency}`);
  }

  return next;
}

function expandAppointmentsFromRule(
  rule: RecurrenceRule,
  fromDate: string,
  toDate: string,
): Appointment[] {
  const appointments: Appointment[] = [];
  const start = new Date(rule.startDateTime);
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const maxCount = rule.count || 365; // Default max

  let current = new Date(start);
  let count = 0;

  while (current <= to && count < maxCount) {
    if (current >= from) {
      // Check byDay filter (for WEEKLY/MONTHLY)
      if (rule.byDay && rule.byDay.length > 0) {
        const dayMap: Record<string, number> = {
          SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6
        };
        const currentDay = current.getDay();
        const allowedDays = rule.byDay.map(bd => dayMap[bd.day]);

        if (!allowedDays.includes(currentDay)) {
          current = addInterval(current, rule.frequency, rule.interval);
          continue;
        }
      }

      // Check byMonthDay filter (for MONTHLY/YEARLY)
      if (rule.byMonthDay && rule.byMonthDay.length > 0) {
        const currentDate = current.getDate();
        if (!rule.byMonthDay.includes(currentDate)) {
          current = addInterval(current, rule.frequency, rule.interval);
          continue;
        }
      }

      // Check byMonth filter (for YEARLY)
      if (rule.byMonth && rule.byMonth.length > 0) {
        const currentMonth = current.getMonth() + 1; // 1-12
        if (!rule.byMonth.includes(currentMonth)) {
          current = addInterval(current, rule.frequency, rule.interval);
          continue;
        }
      }

      const end = new Date(current);
      end.setHours(end.getHours() + 1); // Default 1 hour duration

      appointments.push({
        id: `gen-${rule.id}-${count}`,
        patientId: rule.patientId,
        startDateTime: current.toISOString(),
        endDateTime: end.toISOString(),
        note: rule.note,
        recurrenceRule: rule,
        recurrenceId: current.toISOString(),
        isException: false,
      });

      count++;
    }

    current = addInterval(current, rule.frequency, rule.interval);

    // Check until
    if (rule.until && current > new Date(rule.until)) break;
  }

  return appointments;
}

export const handlers = [
  graphql.query("allPatients", () => {
    return HttpResponse.json({
      data: {
        allPatients: patients.map((p) => ({
          id: p.id,
          name: p.name,
          recurrenceRules: p.recurrenceRules,
          appointments: [],
        })),
      },
    });
  }),

  graphql.query("patient", ({ variables }) => {
    const { id } = variables;
    const patient = patients.find((p) => p.id === id);

    if (!patient) {
      return HttpResponse.json({
        errors: [{ message: "Patient not found" }],
      });
    }

    return HttpResponse.json({
      data: {
        patient: {
          id: patient.id,
          name: patient.name,
          recurrenceRules: patient.recurrenceRules,
          appointments: patient.appointments,
        },
      },
    });
  }),

  graphql.query("patientWithNextAppointment", ({ variables }) => {
    const { id } = variables;
    const patient = patients.find((p) => p.id === id);

    if (!patient) {
      return HttpResponse.json({
        errors: [{ message: "Patient not found" }],
      });
    }

    const now = new Date();

    // Get all upcoming appointments
    let upcoming = patient.appointments.filter(
      (app) => new Date(app.startDateTime) >= now,
    );

    // Expand rules (simplified - expand 3 months ahead)
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    patient.recurrenceRules.forEach((rule) => {
      const expanded = expandAppointmentsFromRule(
        rule,
        now.toISOString(),
        threeMonthsLater.toISOString(),
      );
      upcoming = [...upcoming, ...expanded];
    });

    // Sort and get next
    const nextAppointment =
      upcoming.sort(
        (a, b) =>
          new Date(a.startDateTime).getTime() -
          new Date(b.startDateTime).getTime(),
      )[0] || null;

    return HttpResponse.json({
      data: {
        patient: {
          id: patient.id,
          name: patient.name,
          nextAppointment,
        },
      },
    });
  }),

  graphql.query("appointmentsByPatient", ({ variables }) => {
    const { patientId, fromDate, toDate } = variables;
    const patient = patients.find((p) => p.id === patientId);

    if (!patient) {
      return HttpResponse.json({
        errors: [{ message: "Patient not found" }],
      });
    }

    let apps = patient.appointments.filter(
      (app) =>
        new Date(app.startDateTime) >= new Date(fromDate) &&
        new Date(app.startDateTime) <= new Date(toDate),
    );

    patient.recurrenceRules.forEach((rule) => {
      const expanded = expandAppointmentsFromRule(rule, fromDate, toDate);
      apps = [...apps, ...expanded];
    });

    return HttpResponse.json({
      data: {
        appointmentsByPatient: apps,
      },
    });
  }),

  graphql.mutation("createRecurrenceRule", ({ variables }) => {
    const input = variables.input;
    const patient = patients.find((p) => p.id === input.patientId);

    if (!patient) {
      return HttpResponse.json({
        errors: [{ message: "Patient not found" }],
      });
    }

    const newRule = {
      id: `rule${nextRuleId++}`,
      ...input,
      patientId: input.patientId,
    };

    patient.recurrenceRules.push(newRule);

    return HttpResponse.json({
      data: {
        createRecurrenceRule: newRule,
      },
    });
  }),

  graphql.mutation("createOneTimeAppointment", ({ variables }) => {
    const input = variables.input;
    const patient = patients.find((p) => p.id === input.patientId);
    if (!patient) {
      return HttpResponse.json({
        errors: [{ message: "Patient not found" }],
      });
    }

    const newApp = {
      id: `app${nextAppId++}`,
      ...input,
      patientId: input.patientId,
      recurrenceRule: null,
      recurrenceId: null,
      isException: false,
    };

    patient.appointments.push(newApp);

    return HttpResponse.json({
      data: {
        createOneTimeAppointment: newApp,
      },
    });
  }),

  graphql.mutation("createExceptionForRule", ({ variables }) => {
    const input = variables.input;
    // Find patient via rule
    const patient = patients.find((p) =>
      p.recurrenceRules.some((r) => r.id === input.ruleId),
    );
    if (!patient) {
      return HttpResponse.json({
        errors: [{ message: "Rule not found" }],
      });
    }

    const newException = {
      id: `app${nextAppId++}`,
      patientId: patient.id,
      startDateTime: input.newStartDateTime || input.originalStartDateTime,
      endDateTime: input.newEndDateTime,
      note: input.note,
      recurrenceRule: { id: input.ruleId }, // Link
      recurrenceId: input.originalStartDateTime,
      isException: true,
    };
    patient.appointments.push(newException);

    return HttpResponse.json({
      data: {
        createExceptionForRule: newException,
      },
    });
  }),

  // Add more mutations if needed, e.g., for patients (though schema doesn't have createPatient)
  // For demo, assume patients are static; add a mock createPatient if required
  graphql.mutation("createPatient", ({ variables }) => {
    const { name } = variables;
    const newPatient = {
      id: `${nextId++}`,
      name,
      appointments: [],
      recurrenceRules: [],
    };
    patients.push(newPatient);
    // return res(ctx.data({ createPatient: newPatient }));
    return HttpResponse.json({
      data: {
        createPatient: newPatient,
      },
    });
  }),
];
