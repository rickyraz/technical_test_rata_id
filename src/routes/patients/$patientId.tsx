/**
 * Patient Detail Page
 * Features:
 * - Display complete patient information
 * - Show visit/appointment history
 * - Show recurring appointment rules
 * - Edit button (role-based)
 * - Delete button (role-based)
 * - Animated transitions using Motion One
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Calendar,
	Mail,
	MapPin,
	Phone,
	User,
	Edit,
	Trash2,
	ArrowLeft,
} from "lucide-react";
import { animate } from "motion";
import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "urql";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../contexts/AuthContext";
import {
	DeletePatientMutation,
	PatientAppointmentsQuery,
	PatientDetailQuery,
} from "../../queries/patients";

export const Route = createFileRoute("/patients/$patientId")({
	component: PatientDetailPage,
});

function PatientDetailPage() {
	const { patientId } = Route.useParams();
	const navigate = useNavigate();
	const { canEdit, canDelete } = useAuth();

	// Query patient data
	const [patientResult] = useQuery({
		query: PatientDetailQuery,
		variables: { id: patientId },
	});

	// Query appointments for the next 3 months
	const fromDate = new Date().toISOString();
	const toDate = new Date(
		Date.now() + 90 * 24 * 60 * 60 * 1000,
	).toISOString();

	const [appointmentsResult] = useQuery({
		query: PatientAppointmentsQuery,
		variables: {
			patientId,
			fromDate,
			toDate,
		},
	});

	// Delete mutation
	const [deleteResult, deletePatient] = useMutation(DeletePatientMutation);

	const patient = patientResult.data?.patient;
	const appointments = appointmentsResult.data?.appointmentsByPatient?.appointments || [];

	// Animation
	const containerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (containerRef.current) {
			animate(
				containerRef.current,
				{ opacity: [0, 1], x: [50, 0] },
				{ duration: 0.4, easing: "ease-out" },
			);
		}
	}, []);

	// Handle delete
	const handleDelete = async () => {
		if (
			window.confirm(
				`Apakah Anda yakin ingin menghapus pasien ${patient?.name}?`,
			)
		) {
			const result = await deletePatient({ id: patientId });
			if (result.data?.deletePatient?.success) {
				navigate({ to: "/patients" });
			}
		}
	};

	if (patientResult.fetching) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
			</div>
		);
	}

	if (patientResult.error || !patient) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Card>
					<p className="text-red-600">
						Error: {patientResult.error?.message || "Pasien tidak ditemukan"}
					</p>
				</Card>
			</div>
		);
	}

	return (
		<div ref={containerRef} className="container mx-auto px-4 py-8 max-w-6xl">
			{/* Header with Actions */}
			<div className="flex justify-between items-start mb-6">
				<div>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate({ to: "/patients" })}
						className="mb-2"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Kembali ke Daftar
					</Button>
					<h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
					<p className="text-gray-600 mt-1">Detail Informasi Pasien</p>
				</div>
				<div className="flex gap-2">
					{canEdit && (
						<Button
							variant="secondary"
							onClick={() =>
								navigate({
									to: "/patients/$patientId/edit",
									params: { patientId },
								})
							}
						>
							<Edit className="w-4 h-4 mr-2" />
							Edit
						</Button>
					)}
					{canDelete && (
						<Button variant="danger" onClick={handleDelete}>
							<Trash2 className="w-4 h-4 mr-2" />
							Hapus
						</Button>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Patient Info */}
				<div className="lg:col-span-2 space-y-6">
					{/* Basic Information */}
					<Card>
						<h2 className="text-xl font-semibold mb-4 flex items-center">
							<User className="w-5 h-5 mr-2" />
							Informasi Dasar
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="text-sm text-gray-500">Nama Lengkap</label>
								<p className="font-medium">{patient.name}</p>
							</div>
							<div>
								<label className="text-sm text-gray-500 flex items-center">
									<Phone className="w-4 h-4 mr-1" />
									Telepon
								</label>
								<p className="font-medium">{patient.phone || "-"}</p>
							</div>
							<div>
								<label className="text-sm text-gray-500 flex items-center">
									<Mail className="w-4 h-4 mr-1" />
									Email
								</label>
								<p className="font-medium">{patient.email || "-"}</p>
							</div>
							<div>
								<label className="text-sm text-gray-500 flex items-center">
									<MapPin className="w-4 h-4 mr-1" />
									Alamat
								</label>
								<p className="font-medium">{patient.address || "-"}</p>
							</div>
						</div>
					</Card>

					{/* Medical History */}
					<Card>
						<h2 className="text-xl font-semibold mb-4">Riwayat Medis</h2>
						<p className="text-gray-700">
							{patient.medicalHistory || "Tidak ada riwayat medis tercatat"}
						</p>
					</Card>

					{/* Appointment History */}
					<Card>
						<h2 className="text-xl font-semibold mb-4 flex items-center">
							<Calendar className="w-5 h-5 mr-2" />
							Riwayat Kunjungan (3 Bulan Ke Depan)
						</h2>
						{appointmentsResult.fetching ? (
							<div className="text-center py-4">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
							</div>
						) : appointments.length === 0 ? (
							<p className="text-gray-500">Tidak ada jadwal kunjungan</p>
						) : (
							<div className="space-y-3">
								{appointments.map((apt) => (
									<div
										key={apt.id}
										className="p-3 bg-gray-50 rounded-lg border border-gray-200"
									>
										<div className="flex justify-between items-start">
											<div>
												<p className="font-medium">
													{new Date(apt.startDateTime).toLocaleDateString(
														"id-ID",
														{
															weekday: "long",
															year: "numeric",
															month: "long",
															day: "numeric",
														},
													)}
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
													<p className="text-sm text-gray-600 mt-1">
														{apt.note}
													</p>
												)}
												{apt.isException && (
													<span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
														Exception
													</span>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</Card>

					{/* Recurrence Rules */}
					{patient.recurrenceRules && patient.recurrenceRules.length > 0 && (
						<Card>
							<h2 className="text-xl font-semibold mb-4">Jadwal Berulang</h2>
							<div className="space-y-3">
								{patient.recurrenceRules.map((rule) => (
									<div
										key={rule.id}
										className="p-3 bg-blue-50 rounded-lg border border-blue-200"
									>
										<p className="font-medium">
											{rule.frequency} - Setiap {rule.interval}{" "}
											{rule.frequency.toLowerCase()}
										</p>
										<p className="text-sm text-gray-600">
											Mulai:{" "}
											{new Date(rule.startDateTime).toLocaleDateString("id-ID")}
										</p>
										{rule.until && (
											<p className="text-sm text-gray-600">
												Sampai: {new Date(rule.until).toLocaleDateString("id-ID")}
											</p>
										)}
										{rule.count && (
											<p className="text-sm text-gray-600">
												Jumlah: {rule.count} kali
											</p>
										)}
										{rule.note && (
											<p className="text-sm text-gray-600 mt-1">{rule.note}</p>
										)}
									</div>
								))}
							</div>
						</Card>
					)}
				</div>

				{/* Right Column - Summary */}
				<div className="space-y-6">
					{/* Next Appointment */}
					{patient.nextAppointment && (
						<Card>
							<h3 className="font-semibold mb-3">Kunjungan Berikutnya</h3>
							<div className="bg-green-50 p-4 rounded-lg border border-green-200">
								<p className="text-sm text-gray-600">
									{new Date(
										patient.nextAppointment.startDateTime,
									).toLocaleDateString("id-ID", {
										weekday: "long",
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
								<p className="font-medium text-lg mt-1">
									{new Date(
										patient.nextAppointment.startDateTime,
									).toLocaleTimeString("id-ID", {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</p>
							</div>
						</Card>
					)}

					{/* Billing Info */}
					<Card>
						<h3 className="font-semibold mb-3">Informasi Tagihan</h3>
						<div className="space-y-2">
							<div>
								<label className="text-sm text-gray-500">Sisa Tagihan</label>
								<p className="text-2xl font-bold text-red-600">
									Rp{" "}
									{(patient.outstandingBalance || 0).toLocaleString("id-ID")}
								</p>
							</div>
							{patient.insuranceInfo && (
								<div>
									<label className="text-sm text-gray-500">Asuransi</label>
									<p className="font-medium">{patient.insuranceInfo}</p>
								</div>
							)}
						</div>
					</Card>

					{/* Metadata */}
					<Card>
						<h3 className="font-semibold mb-3">Metadata</h3>
						<div className="space-y-2 text-sm">
							<div>
								<label className="text-gray-500">Dibuat</label>
								<p>{new Date(patient.createdAt).toLocaleDateString("id-ID")}</p>
							</div>
							<div>
								<label className="text-gray-500">Terakhir Diupdate</label>
								<p>{new Date(patient.updatedAt).toLocaleDateString("id-ID")}</p>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
