/**
 * Auth Context
 * Provides user authentication state and role-based access control
 * Implements role-based UI logic (e.g., staff cannot edit)
 */

import { createContext, useContext, useState, type ReactNode } from "react";
import { graphql } from "../graphql";
import { useQuery } from "urql";

// Define user roles from GraphQL schema
export type UserRole = "ADMIN" | "DOCTOR" | "STAFF";

export interface User {
	id: string;
	name: string;
	role: UserRole;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	canEdit: boolean; // Derived: true if ADMIN or DOCTOR
	canDelete: boolean; // Derived: true if ADMIN
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// GraphQL query to get current user
const CurrentUserQuery = graphql(`
	query CurrentUser {
		currentUser {
			id
			name
			role
		}
	}
`);

export function AuthProvider({ children }: { children: ReactNode }) {
	// Mock user for demo - in real app, this would come from authentication
	const [mockUser] = useState<User>({
		id: "1",
		name: "Dr. Admin",
		role: "ADMIN", // Change to "STAFF" to test read-only mode
	});

	// In a real app, you'd use the GraphQL query:
	// const [result] = useQuery({ query: CurrentUserQuery });
	// const user = result.data?.currentUser || null;

	// Role-based permissions
	const canEdit = mockUser?.role === "ADMIN" || mockUser?.role === "DOCTOR";
	const canDelete = mockUser?.role === "ADMIN";

	const value: AuthContextType = {
		user: mockUser,
		isLoading: false,
		canEdit,
		canDelete,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
