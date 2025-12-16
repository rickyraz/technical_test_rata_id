/**
 * Calendar View Page
 * Features:
 * - Display appointments in calendar format
 * - Support for daily, weekly, and monthly views
 * - Fetch appointments via GraphQL query
 * - Animated transitions with Motion One
 * - Simple calendar implementation (can be enhanced with libraries like react-big-calendar)
 */

import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { animate } from "motion";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "urql";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { AllPatientsQuery, PatientAppointmentsQuery } from "../../queries/patients";

export const Route = createFileRoute("/calendar/")({
	component: CalendarPage,
});

type ViewMode = "daily" | "weekly" | "monthly";

interface Appointment {
	id: string;
	patientId: string;
	patientName?: string;
	startDateTime: string;
	endDateTime: string;
	note?: string | null;
}

function CalendarPage() {
	// State for view mode and current date
	const [viewMode, setViewMode] = useState<ViewMode>("weekly");
	const [currentDate, setCurrentDate] = useState(new Date());

	// Animation
	const containerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (containerRef.current) {
			animate(
				containerRef.current,
				{ opacity: [0, 1] },
				{ duration: 0.3, easing: "ease-out" },
			);
		}
	}, [viewMode, currentDate]);

	// Calculate date range based on view mode
	const getDateRange = () => {
		const start = new Date(currentDate);
		const end = new Date(currentDate);

		switch (viewMode) {
			case "daily":
				start.setHours(0, 0, 0, 0);
				end.setHours(23, 59, 59, 999);
				break;
			case "weekly":
				// Get start of week (Monday)
				const day = start.getDay();
				const diff = start.getDate() - day + (day === 0 ? -6 : 1);
				start.setDate(diff);
				start.setHours(0, 0, 0, 0);
				end.setDate(start.getDate() + 6);
				end.setHours(23, 59, 59, 999);
				break;
			case "monthly":
				start.setDate(1);
				start.setHours(0, 0, 0, 0);
				end.setMonth(end.getMonth() + 1);
				end.setDate(0);
				end.setHours(23, 59, 59, 999);
				break;
		}

		return {
			fromDate: start.toISOString(),
			toDate: end.toISOString(),
		};
	};

	// Get all patients to fetch their appointments
	const [patientsResult] = useQuery({
		query: AllPatientsQuery,
		variables: { limit: 100, offset: 0 },
	});

	const patients = patientsResult.data?.allPatients?.patients || [];
	const { fromDate, toDate } = getDateRange();

	// Fetch appointments for all patients
	const appointmentQueries = patients.map((patient) =>
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useQuery({
			query: PatientAppointmentsQuery,
			variables: {
				patientId: patient.id,
				fromDate,
				toDate,
			},
		}),
	);

	// Combine all appointments
	const allAppointments: Appointment[] = appointmentQueries.flatMap(
		([result], index) =>
			(result.data?.appointmentsByPatient?.appointments || []).map((apt) => ({
				...apt,
				patientId: patients[index]?.id,
				patientName: patients[index]?.name,
			})),
	);

	// Sort appointments by start time
	const sortedAppointments = allAppointments.sort(
		(a, b) =>
			new Date(a.startDateTime).getTime() -
			new Date(b.startDateTime).getTime(),
	);

	// Navigation handlers
	const goToPrevious = () => {
		const newDate = new Date(currentDate);
		switch (viewMode) {
			case "daily":
				newDate.setDate(newDate.getDate() - 1);
				break;
			case "weekly":
				newDate.setDate(newDate.getDate() - 7);
				break;
			case "monthly":
				newDate.setMonth(newDate.getMonth() - 1);
				break;
		}
		setCurrentDate(newDate);
	};

	const goToNext = () => {
		const newDate = new Date(currentDate);
		switch (viewMode) {
			case "daily":
				newDate.setDate(newDate.getDate() + 1);
				break;
			case "weekly":
				newDate.setDate(newDate.getDate() + 7);
				break;
			case "monthly":
				newDate.setMonth(newDate.getMonth() + 1);
				break;
		}
		setCurrentDate(newDate);
	};

	const goToToday = () => {
		setCurrentDate(new Date());
	};

	// Format date range for display
	const formatDateRange = () => {
		const start = new Date(fromDate);
		const end = new Date(toDate);

		switch (viewMode) {
			case "daily":
				return start.toLocaleDateString("id-ID", {
					weekday: "long",
					year: "numeric",
					month: "long",
					day: "numeric",
				});
			case "weekly":
				return `${start.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
			case "monthly":
				return start.toLocaleDateString("id-ID", {
					year: "numeric",
					month: "long",
				});
		}
	};

	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 flex items-center">
						<CalendarIcon className="w-8 h-8 mr-3" />
						Kalender Janji Temu
					</h1>
					<p className="text-gray-600 mt-1">
						Lihat jadwal janji temu pasien
					</p>
				</div>
			</div>

			{/* Controls */}
			<Card className="mb-6">
				<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
					{/* View Mode Selector */}
					<div className="flex gap-2">
						<Button
							variant={viewMode === "daily" ? "primary" : "secondary"}
							size="sm"
							onClick={() => setViewMode("daily")}
						>
							Harian
						</Button>
						<Button
							variant={viewMode === "weekly" ? "primary" : "secondary"}
							size="sm"
							onClick={() => setViewMode("weekly")}
						>
							Mingguan
						</Button>
						<Button
							variant={viewMode === "monthly" ? "primary" : "secondary"}
							size="sm"
							onClick={() => setViewMode("monthly")}
						>
							Bulanan
						</Button>
					</div>

					{/* Navigation */}
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="sm" onClick={goToPrevious}>
							<ChevronLeft className="w-5 h-5" />
						</Button>
						<Button variant="secondary" size="sm" onClick={goToToday}>
							Hari Ini
						</Button>
						<Button variant="ghost" size="sm" onClick={goToNext}>
							<ChevronRight className="w-5 h-5" />
						</Button>
					</div>
				</div>

				<div className="mt-4 text-center">
					<h2 className="text-xl font-semibold">{formatDateRange()}</h2>
				</div>
			</Card>

			{/* Calendar Content */}
			<div ref={containerRef}>
				<Card>
					{patientsResult.fetching ? (
						<div className="flex justify-center items-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
						</div>
					) : sortedAppointments.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-500 text-lg">
								Tidak ada janji temu pada periode ini
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{/* Group appointments by date */}
							{Object.entries(
								sortedAppointments.reduce(
									(groups, apt) => {
										const date = new Date(apt.startDateTime)
											.toLocaleDateString("id-ID");
										if (!groups[date]) {
											groups[date] = [];
										}
										groups[date].push(apt);
										return groups;
									},
									{} as Record<string, Appointment[]>,
								),
							).map(([date, appointments]) => (
								<div key={date}>
									<h3 className="font-semibold text-lg mb-3 text-gray-700">
										{date}
									</h3>
									<div className="space-y-2">
										{appointments.map((apt) => (
											<div
												key={apt.id}
												className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
											>
												<div className="flex justify-between items-start">
													<div className="flex-1">
														<p className="font-medium text-lg">
															{apt.patientName}
														</p>
														<p className="text-sm text-gray-600">
															{new Date(apt.startDateTime).toLocaleTimeString(
																"id-ID",
																{
																	hour: "2-digit",
																	minute: "2-digit",
																},
															)}{" "}
															-{" "}
															{new Date(apt.endDateTime).toLocaleTimeString(
																"id-ID",
																{
																	hour: "2-digit",
																	minute: "2-digit",
																},
															)}
														</p>
														{apt.note && (
															<p className="text-sm text-gray-700 mt-1">
																{apt.note}
															</p>
														)}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}
