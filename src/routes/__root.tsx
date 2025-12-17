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
import { Calendar, Users, Workflow } from "lucide-react";
import { type Client, Provider } from "urql";
import NavItem from "@/components/Nav";
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
				title: "Clinic Management System - Rata ID Technical Test",
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

function Navigation() {
	const { user } = useAuth();

	return (
		<nav className="bg-white border-b border-gray-200">
			<div className="container mx-auto px-4 max-w-6xl">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center gap-8">
						<Link
							to="/"
							className="text-xl font-bold text-red-600 flex items-center gap-4"
						>
							<img src="/rata_logo.webp" alt="Logo" className="w-12 h-auto" />
							Clinic Management System
						</Link>

						<div className="flex gap-4">
							<NavItem to="/patients" icon={Users}>
								Patients
							</NavItem>
							<NavItem to="/calendar" icon={Calendar}>
								Calender
							</NavItem>
							<NavItem to="/workflows" icon={Workflow}>
								Workflow
							</NavItem>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div className="text-sm text-gray-600">
							<span className="font-medium">{user?.name}</span>
							<span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
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
