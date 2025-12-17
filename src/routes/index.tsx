import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Users, Workflow } from "lucide-react";
import { animate } from "motion";
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
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
				{
					opacity: [0, 1],
					transform: ["translateY(30px)", "translateY(0)"],
				},
				{ duration: 0.5 },
			);
		}
	}, []);

	const features = [
		{
			title: "Patient List",
			description:
				"Manage patient data with search, pagination and complete detail features",
			icon: Users,
			link: "/patients",
			preview: "Hey, system! show me all patients",
		},
		{
			title: "Appointment Calendar",
			description:
				"View appointment schedules in daily, weekly, or monthly views",
			icon: Calendar,
			link: "/calendar",
			preview: "Show appointments for today",
		},
		{
			title: "Workflow Builder",
			description: "Create and manage clinic workflows with drag-and-drop",
			icon: Workflow,
			link: "/workflows",
			preview: "Create new clinic workflow",
		},
	];

	return (
		<div ref={containerRef} className="container mx-auto px-4 py-12 max-w-6xl">
			{user && (
				<div className="mb-4">
					<p className="text-4xl">
						Welcome,{" "}
						<span className="font-semibold text-[#bf0d1f]">{user.name}</span>!
					</p>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
				{features.map((feature) => {
					const Icon = feature.icon;

					return (
						<Link
							key={feature.title}
							to={feature.link}
							className="group gap-8 mb-4 block"
						>
							<Card className="h-full p-6 rounded-2xl border border-gray-200 bg-white transition-all hover:shadow-md">
								{/* Icon */}
								<div
									className={`w-10 h-10 bg-[#75235e] hover:bg-red-900 rounded-lg flex items-center justify-center mb-4`}
								>
									<Icon className="w-5 h-5 text-white" />
								</div>

								{/* Title */}
								<h3 className="text-lg font-semibold mb-2">{feature.title}</h3>

								{/* Description */}
								<p className="text-gray-600 text-sm mb-4">
									{feature.description}
								</p>

								{/* Preview Bubble (seperti gambar) */}
								<div className="mb-4">
									<div className="inline-block bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700">
										{feature.preview}
									</div>
								</div>

								{/* CTA */}
								<div className="flex items-center text-red-600 font-medium text-sm group-hover:gap-2 transition-all">
									Try now
									<ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
								</div>
							</Card>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
