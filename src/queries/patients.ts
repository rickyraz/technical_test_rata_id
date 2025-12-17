import { graphql } from "../graphql";

// Query: Get all patients with search and pagination
export const AllPatientsQuery = graphql(`
	query AllPatients($search: String, $limit: Int, $offset: Int) {
		allPatients(search: $search, limit: $limit, offset: $offset) {
			patients {
				id
				name
				phone
				email
				address
				lastVisit
				medicalHistory
				outstandingBalance
				insuranceInfo
				createdAt
				updatedAt
			}
			total
		}
	}
`);

// Query: Get single patient with detailed information
export const PatientDetailQuery = graphql(`
	query PatientDetail($id: ID!) {
		patient(id: $id) {
			id
			name
			phone
			email
			address
			lastVisit
			medicalHistory
			outstandingBalance
			insuranceInfo
			createdAt
			updatedAt
			nextAppointment {
				id
				startDateTime
				endDateTime
				note
			}
			recurrenceRules {
				id
				frequency
				interval
				startDateTime
				until
				count
				note
			}
		}
	}
`);

// Query: Get patient appointments in a date range
export const PatientAppointmentsQuery = graphql(`
	query PatientAppointments($patientId: ID!, $fromDate: String!, $toDate: String!) {
		appointmentsByPatient(patientId: $patientId, fromDate: $fromDate, toDate: $toDate) {
			appointments {
				id
				startDateTime
				endDateTime
				note
				isException
				recurrenceId
			}
			total
		}
	}
`);

export const AllAppointmentsQuery = graphql(`
	query AllAppointments($fromDate: String!, $toDate: String!) {
		allAppointments(fromDate: $fromDate, toDate: $toDate) {
			appointments {
				id
				patient {
					id
					name
				}
				startDateTime
				endDateTime
				note
			}
			total
		}
	}
`);

// Mutation: Create new patient
export const CreatePatientMutation = graphql(`
	mutation CreatePatient($input: CreatePatientInput!) {
		createPatient(input: $input) {
			id
			name
			phone
			email
			address
			medicalHistory
			createdAt
		}
	}
`);

// Mutation: Update existing patient
export const UpdatePatientMutation = graphql(`
	mutation UpdatePatient($id: ID!, $input: UpdatePatientInput!) {
		updatePatient(id: $id, input: $input) {
			id
			name
			phone
			email
			address
			medicalHistory
			updatedAt
		}
	}
`);

// Mutation: Delete patient
export const DeletePatientMutation = graphql(`
	mutation DeletePatient($id: ID!) {
		deletePatient(id: $id) {
			success
			message
		}
	}
`);
