/**
 * Workflow GraphQL Queries and Mutations
 * Handles clinic workflow management
 */

import { graphql } from "../graphql";

// Query: Get all workflows
export const AllWorkflowsQuery = graphql(`
	query AllWorkflows($search: String, $limit: Int, $offset: Int) {
		allWorkflows(search: $search, limit: $limit, offset: $offset) {
			workflows {
				id
				name
				steps {
					id
					name
					description
					order
				}
				createdAt
				updatedAt
			}
			total
		}
	}
`);

// Query: Get single workflow
export const WorkflowDetailQuery = graphql(`
	query WorkflowDetail($id: ID!) {
		workflow(id: $id) {
			id
			name
			steps {
				id
				name
				description
				order
			}
			createdAt
			updatedAt
		}
	}
`);

// Mutation: Create workflow
export const CreateWorkflowMutation = graphql(`
	mutation CreateWorkflow($input: CreateWorkflowInput!) {
		createWorkflow(input: $input) {
			id
			name
			steps {
				id
				name
				description
				order
			}
			createdAt
		}
	}
`);

// Mutation: Update workflow
export const UpdateWorkflowMutation = graphql(`
	mutation UpdateWorkflow($id: ID!, $input: UpdateWorkflowInput!) {
		updateWorkflow(id: $id, input: $input) {
			id
			name
			steps {
				id
				name
				description
				order
			}
			updatedAt
		}
	}
`);

// Mutation: Delete workflow
export const DeleteWorkflowMutation = graphql(`
	mutation DeleteWorkflow($id: ID!) {
		deleteWorkflow(id: $id) {
			success
			message
		}
	}
`);
