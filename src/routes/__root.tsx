import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Outlet,
	Scripts,
	useRouteContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Calendar, Home, Users, Workflow } from "lucide-react";
import { type Client, Provider } from "urql";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{
	urqlQueryClient: Client;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Healthcare Scheduling System",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	notFoundComponent: () => (
		<div className="p-8 text-center">
			<h1 className="text-2xl font-bold mb-4">404 - Halaman Tidak Ditemukan</h1>
			<p>URL yang kamu akses tidak valid.</p>
		</div>
	),
	shellComponent: RootComponent,
});

function RootComponent() {
	const context = useRouteContext({ from: Route.id });
	return (
		<Provider value={context.urqlQueryClient}>
			<AuthProvider>
				<RootDocument>
					<Outlet />
				</RootDocument>
			</AuthProvider>
		</Provider>
	);
}

// Navigation Header Component
function Navigation() {
	const { user } = useAuth();

	return (
		<nav className="bg-white border-b border-gray-200 shadow-sm">
			<div className="container mx-auto px-4">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center gap-8">
						<Link
							to="/"
							className="text-xl font-bold text-blue-600 flex items-center gap-2"
						>
							<Home className="w-6 h-6" />
							Healthcare System
						</Link>

						<div className="flex gap-4">
							<Link
								to="/patients"
								className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
							>
								<Users className="w-4 h-4" />
								Pasien
							</Link>
							<Link
								to="/calendar"
								className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
							>
								<Calendar className="w-4 h-4" />
								Kalender
							</Link>
							<Link
								to="/workflows"
								className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
							>
								<Workflow className="w-4 h-4" />
								Workflow
							</Link>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div className="text-sm text-gray-600">
							<span className="font-medium">{user?.name}</span>
							<span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
								{user?.role}
							</span>
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="bg-gray-50 min-h-screen">
				<Navigation />
				<main>{children}</main>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
