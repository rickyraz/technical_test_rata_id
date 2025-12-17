// recurrence.ts

export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type Weekday = "SU" | "MO" | "TU" | "WE" | "TH" | "FR" | "SA";

export type ByDay = {
    ordinal: number | null;
    day: Weekday;
};

export type RecurrenceRule = {
    id: string;
    patientId: string;
    frequency: RecurrenceFrequency;
    interval: number;
    startDateTime: string;
    until?: string;
    count?: number | null;
    byDay?: ByDay[];
    byMonthDay?: number[];
    byMonth?: number[];
    byHour?: number[];
    byMinute?: number[];
    weekStart?: Weekday;
    note?: string;
    rruleString?: string;
};

export type Appointment = {
    id: string;
    patientId: string;
    startDateTime: string;
    endDateTime: string;
    note?: string;
    recurrenceRule: RecurrenceRule | null;
    recurrenceId: string | null;
    isException: boolean;
};

/* -------------------- helpers -------------------- */

const DAY_MAP: Record<Weekday, number> = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
};

export function addInterval(
    date: Date,
    frequency: RecurrenceFrequency,
    interval: number,
): Date {
    const next = new Date(date);

    switch (frequency) {
        case "DAILY":
            next.setDate(next.getDate() + interval);
            break;
        case "WEEKLY":
            next.setDate(next.getDate() + 7 * interval);
            break;
        case "MONTHLY":
            next.setMonth(next.getMonth() + interval);
            break;
        case "YEARLY":
            next.setFullYear(next.getFullYear() + interval);
            break;
    }

    return next;
}

/* -------------------- expansion -------------------- */

export function expandAppointmentsFromRule(
    rule: RecurrenceRule,
    fromDate: string,
    toDate: string,
): Appointment[] {
    const result: Appointment[] = [];

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const start = new Date(rule.startDateTime);

    let current = new Date(start);
    let generated = 0;
    const max = rule.count ?? 500;

    while (current <= to && generated < max) {
        // Check filters
        let shouldInclude = current >= from;

        if (shouldInclude && rule.byDay?.length) {
            const weekday = current.getDay();
            const allowed = rule.byDay.map((d) => DAY_MAP[d.day]);
            shouldInclude = allowed.includes(weekday);
        }

        if (shouldInclude && rule.byMonthDay?.length) {
            shouldInclude = rule.byMonthDay.includes(current.getDate());
        }

        if (shouldInclude && rule.byMonth?.length) {
            const month = current.getMonth() + 1;
            shouldInclude = rule.byMonth.includes(month);
        }

        // Add appointment if passes all filters
        if (shouldInclude) {
            const end = new Date(current);
            end.setHours(end.getHours() + 1);

            result.push({
                id: `gen-${rule.id}-${generated}`,
                patientId: rule.patientId,
                startDateTime: current.toISOString(),
                endDateTime: end.toISOString(),
                note: rule.note,
                recurrenceRule: rule,
                recurrenceId: current.toISOString(),
                isException: false,
            });

            generated++;
        }

        // Always increment current date
        current = addInterval(current, rule.frequency, rule.interval);

        if (rule.until && current > new Date(rule.until)) break;
    }

    return result;
}
