/**
 * Appointment GraphQL Queries and Mutations
 * Handles both one-time appointments and recurring appointments
 */

import { graphql } from "../graphql";

// Mutation: Create one-time appointment
export const CreateOneTimeAppointmentMutation = graphql(`
	mutation CreateOneTimeAppointment($input: CreateOneTimeAppointmentInput!) {
		createOneTimeAppointment(input: $input) {
			id
			startDateTime
			endDateTime
			note
			patient {
				id
				name
			}
		}
	}
`);

// Mutation: Create recurrence rule (for recurring appointments)
export const CreateRecurrenceRuleMutation = graphql(`
	mutation CreateRecurrenceRule($input: CreateRecurrenceRuleInput!) {
		createRecurrenceRule(input: $input) {
			id
			frequency
			interval
			startDateTime
			until
			count
			byDay {
				ordinal
				day
			}
			byMonthDay
			byMonth
			note
		}
	}
`);

// Mutation: Update recurrence rule
export const UpdateRecurrenceRuleMutation = graphql(`
	mutation UpdateRecurrenceRule($id: ID!, $input: UpdateRecurrenceRuleInput!) {
		updateRecurrenceRule(id: $id, input: $input) {
			id
			frequency
			interval
			startDateTime
			until
			count
			note
		}
	}
`);

// Mutation: Create exception for recurring appointment
export const CreateExceptionAppointmentMutation = graphql(`
	mutation CreateExceptionAppointment($input: CreateExceptionAppointmentInput!) {
		createExceptionForRule(input: $input) {
			id
			startDateTime
			endDateTime
			note
			isException
			recurrenceId
		}
	}
`);

// Mutation: Delete appointment
export const DeleteAppointmentMutation = graphql(`
	mutation DeleteAppointment($id: ID!) {
		deleteAppointment(id: $id) {
			success
			message
		}
	}
`);

// Mutation: Delete recurrence rule
export const DeleteRecurrenceRuleMutation = graphql(`
	mutation DeleteRecurrenceRule($id: ID!) {
		deleteRecurrenceRule(id: $id) {
			success
			message
		}
	}
`);
