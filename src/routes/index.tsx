/**
 * Home Page
 * Landing page with overview and quick links to main features
 * Animated with Motion One
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Users, Workflow, ArrowRight } from "lucide-react";
import { animate } from "motion";
import { useEffect, useRef } from "react";
import { Card } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const { user } = useAuth();
	const containerRef = useRef<HTMLDivElement>(null);

	// Animate page on mount
	useEffect(() => {
		if (containerRef.current) {
			animate(
				containerRef.current,
				{ opacity: [0, 1], y: [30, 0] },
				{ duration: 0.5, easing: "ease-out" },
			);
		}
	}, []);

	const features = [
		{
			title: "Daftar Pasien",
			description:
				"Kelola data pasien dengan fitur pencarian, pagination, dan detail lengkap",
			icon: Users,
			link: "/patients",
			color: "blue",
		},
		{
			title: "Kalender Janji Temu",
			description:
				"Lihat jadwal appointment dalam tampilan harian, mingguan, atau bulanan",
			icon: Calendar,
			link: "/calendar",
			color: "green",
		},
		{
			title: "Workflow Builder",
			description:
				"Buat dan kelola alur kerja klinik dengan drag-and-drop",
			icon: Workflow,
			link: "/workflows",
			color: "purple",
		},
	];

	return (
		<div ref={containerRef} className="container mx-auto px-4 py-12 max-w-6xl">
			{/* Hero Section */}
			<div className="text-center mb-12">
				<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
					Healthcare Scheduling System
				</h1>
				<p className="text-xl text-gray-600 max-w-2xl mx-auto">
					Sistem manajemen klinik yang membantu Anda mengelola pasien,
					jadwal appointment, dan workflow dengan mudah
				</p>
			</div>

			{/* User Info */}
			{user && (
				<Card className="mb-8 text-center">
					<p className="text-lg">
						Selamat datang,{" "}
						<span className="font-semibold text-blue-600">{user.name}</span>!
					</p>
					<p className="text-gray-600 mt-1">
						Role: <span className="font-medium">{user.role}</span>
					</p>
				</Card>
			)}

			{/* Features Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
				{features.map((feature, index) => {
					const Icon = feature.icon;
					const colorClasses = {
						blue: "bg-blue-500 hover:bg-blue-600",
						green: "bg-green-500 hover:bg-green-600",
						purple: "bg-purple-500 hover:bg-purple-600",
					}[feature.color];

					return (
						<Link
							key={feature.title}
							to={feature.link}
							className="group"
							style={{
								animationDelay: `${index * 0.1}s`,
							}}
						>
							<Card className="h-full transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer">
								<div
									className={`w-12 h-12 ${colorClasses} rounded-lg flex items-center justify-center mb-4 transition-colors`}
								>
									<Icon className="w-6 h-6 text-white" />
								</div>
								<h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
									{feature.title}
								</h3>
								<p className="text-gray-600 mb-4">{feature.description}</p>
								<div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
									Lihat Detail
									<ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
								</div>
							</Card>
						</Link>
					);
				})}
			</div>

			{/* Tech Stack Info */}
			<Card className="bg-gradient-to-r from-blue-50 to-purple-50">
				<h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div>
						<p className="text-sm text-gray-600">Frontend</p>
						<p className="font-medium">React 19</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">Router</p>
						<p className="font-medium">TanStack Start</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">Styling</p>
						<p className="font-medium">Tailwind CSS</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">API</p>
						<p className="font-medium">GraphQL + URQL</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">State</p>
						<p className="font-medium">gql.tada</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">Animation</p>
						<p className="font-medium">Motion One</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">Drag & Drop</p>
						<p className="font-medium">@dnd-kit/core</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">Runtime</p>
						<p className="font-medium">Bun</p>
					</div>
				</div>
			</Card>

			{/* Footer */}
			<div className="text-center mt-12 text-gray-600">
				<p>
					Build with ❤️ using modern web technologies
				</p>
			</div>
		</div>
	);
}
