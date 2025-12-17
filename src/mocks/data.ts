// data.ts

import type {
    Appointment,
    RecurrenceRule,
} from "./recurrence";

/* -------------------- entities -------------------- */

export type Patient = {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    medicalHistory?: string;
    appointments: Appointment[];
    recurrenceRules: RecurrenceRule[];
    outstandingBalance?: number;
    insuranceInfo?: string;
    lastVisit?: string;
    createdAt: string;
    updatedAt: string;
};

export type WorkflowStep = {
    id: string;
    name: string;
    description: string;
    order: number;
};

export type Workflow = {
    id: string;
    name: string;
    steps: WorkflowStep[];
    createdAt: string;
    updatedAt: string;
};

/* -------------------- id counters -------------------- */

export const nextPatientId = 5;
export let nextRuleId = 5;
export let nextAppointmentId = 2;
export let nextWorkflowId = 1;


export function createRecurrenceRule(input: Omit<RecurrenceRule, "id">) {
    const rule: RecurrenceRule = {
        id: `rule${nextRuleId++}`,
        ...input,
    };
    return rule;
}

export function createAppointment(
    input: Omit<Appointment, "id">
) {
    const app: Appointment = {
        id: `app${nextAppointmentId++}`,
        ...input,
    };
    return app;
}

export function createWorkflow(input: Omit<Workflow, "id" | "createdAt" | "updatedAt">) {
    const workflow: Workflow = {
        id: `workflow${nextWorkflowId++}`,
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    return workflow;
}

// ----

