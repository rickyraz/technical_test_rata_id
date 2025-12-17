import { createFileRoute } from "@tanstack/react-router";
import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { animate } from "motion";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "urql";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardPanel,
} from "../../components/ui/card";
import { AllAppointmentsQuery, } from "../../queries/patients";

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
				{
					opacity: [0, 1],
					transform: ["translateY(30px)", "translateY(0)"],
				},
				{ duration: 0.3, easing: "ease-out" },
			);
		}
	}, []);

	// Calculate date range based on view mode
	const getDateRange = () => {
		const start = new Date(currentDate);
		const end = new Date(currentDate);

		switch (viewMode) {
			case "daily":
				start.setHours(0, 0, 0, 0);
				end.setHours(23, 59, 59, 999);
				break;
			case "weekly": {
				// Get start of week (Monday)
				const day = start.getDay();
				const diff = start.getDate() - day + (day === 0 ? -6 : 1);
				start.setDate(diff);
				start.setHours(0, 0, 0, 0);
				end.setDate(start.getDate() + 6);
				end.setHours(23, 59, 59, 999);
				break;
			}
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

	const { fromDate, toDate } = getDateRange();

	const [allAppointmentsResult] = useQuery({
		query: AllAppointmentsQuery,
		variables: { fromDate, toDate },
	});

	const allAppointments: Appointment[] = (
		allAppointmentsResult.data?.allAppointments?.appointments || []
	).map((apt) => ({
		id: apt.id,
		patientId: apt.patient.id,
		patientName: apt.patient.name,
		startDateTime: apt.startDateTime,
		endDateTime: apt.endDateTime,
		note: apt.note,
	}));

	const sortedAppointments = allAppointments.sort(
		(a, b) =>
			new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime(),
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
		<div className="container mx-auto px-4 py-8 max-w-6xl">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold flex items-center">
						<CalendarIcon className="w-8 h-8 mr-3" />
						Kalender Janji Temu
					</h1>
					<p className="text-muted-foreground mt-1">
						Lihat jadwal janji temu pasien
					</p>
				</div>
			</div>

			<Card className="mb-6">
				<CardPanel>
					<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
						<Tabs
							value={viewMode}
							onValueChange={(value) => setViewMode(value as ViewMode)}
						>
							<TabsList aria-label="Tampilan kalender">
								<TabsTab value="daily">Harian</TabsTab>
								<TabsTab value="weekly">Mingguan</TabsTab>
								<TabsTab value="monthly">Bulanan</TabsTab>
							</TabsList>
						</Tabs>

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
				</CardPanel>
			</Card>

			<div ref={containerRef}>
				<Card>
					{allAppointmentsResult.fetching ? (
						<CardPanel>
							<div className="flex justify-center items-center py-12">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
							</div>
						</CardPanel>
					) : sortedAppointments.length === 0 ? (
						<CardPanel>
							<div className="text-center py-12">
								<p className="text-muted-foreground text-lg">
									Tidak ada janji temu pada periode ini
								</p>
							</div>
						</CardPanel>
					) : (
						<CardPanel>
							<div className="space-y-4">
								{Object.entries(
									sortedAppointments.reduce(
										(groups, apt) => {
											const date = new Date(
												apt.startDateTime,
											).toLocaleDateString("id-ID");
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
										<h3 className="font-semibold text-lg mb-3">{date}</h3>
										<div className="space-y-2">
											{appointments.map((apt) => (
												<div
													key={apt.id}
													className="p-4 bg-accent/10 border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors"
												>
													<div className="flex justify-between items-start">
														<div className="flex-1">
															<p className="font-medium text-lg">
																{apt.patientName}
															</p>
															<p className="text-sm text-muted-foreground">
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
																<p className="text-sm mt-1">{apt.note}</p>
															)}
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</CardPanel>
					)}
				</Card>
			</div>
		</div>
	);
}
