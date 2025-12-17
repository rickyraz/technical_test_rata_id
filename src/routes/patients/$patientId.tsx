import { revalidateLogic, useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	useNavigate,
} from "@tanstack/react-router";
import {
	ArrowLeft,
	Calendar,
	Edit,
	Mail,
	MapPin,
	Phone,
	Trash2,
	User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useClient, useMutation } from "urql";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardHeader,
	CardPanel,
	CardTitle,
} from "../../components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPanel,
	DialogPopup,
	DialogTitle,
} from "../../components/ui/dialog";
import { Field, FieldError, FieldLabel } from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { useAuth } from "../../contexts/AuthContext";
import {
	DeletePatientMutation,
	PatientAppointmentsQuery,
	PatientDetailQuery,
	UpdatePatientMutation,
} from "../../queries/patients";
import { Patient } from "@/mocks/data";
import { loadAppointments, loadPatient, saveAppointments, savePatient } from "@/mocks/storage";
import { Appointment } from "@/mocks/recurrence";

export const Route = createFileRoute("/patients/$patientId")({
	component: PatientDetailPage,
	// loader: async ({ params, context }) => {
	// 	const { patientId } = params;
	// 	const fromDate = new Date().toISOString();
	// 	const toDate = new Date(
	// 		Date.now() + 90 * 24 * 60 * 60 * 1000,
	// 	).toISOString();

	// 	const client = context.urqlQueryClient;

	// 	const [patientResult, appointmentsResult] = await Promise.all([
	// 		client.query(PatientDetailQuery, { id: patientId }).toPromise(),
	// 		client
	// 			.query(PatientAppointmentsQuery, {
	// 				patientId,
	// 				fromDate,
	// 				toDate,
	// 			})
	// 			.toPromise(),
	// 	]);

	// 	return {
	// 		patient: patientResult.data?.patient,
	// 		appointments:
	// 			appointmentsResult.data?.appointmentsByPatient?.appointments || [],
	// 	};
	// },

	loader: async ({ params, context }) => {
		const { patientId } = params;

		return {
			patientId,
		};
	},
	ssr: "data-only"

});

const patientFormSchema = z.object({
	name: z.string().min(1, "Nama wajib diisi"),
	dateOfBirth: z.string(),
	phone: z
		.string()
		.regex(/^[\d\s\-+()]*$/, "Format telepon tidak valid")
		.or(z.literal("")),
	email: z.email("Format email tidak valid").or(z.literal("")),
	address: z.string(),
	medicalHistory: z.string(),
});

function mapPatientFromGql(p: any): Patient {
	return {
		id: p.id,
		name: p.name,
		phone: p.phone ?? null,
		email: p.email ?? null,
		address: p.address ?? "",
		medicalHistory: p.medicalHistory ?? "",
		createdAt: p.createdAt,
		updatedAt: p.updatedAt,
		appointments: [],
		recurrenceRules: p.recurrenceRules ?? [],
	};
}

function PatientDetailPage() {
	const { patientId } = Route.useParams();
	const navigate = useNavigate();
	const { canEdit, canDelete } = useAuth();
	const client = useClient();

	const [isEditOpen, setIsEditOpen] = useState(false);

	// Memoize date range
	const { fromDate, toDate } = useMemo(() => ({
		fromDate: new Date().toISOString(),
		toDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
	}), []);

	// Fetch patient dengan cache priority
	const [patient, setPatient] = useState<Patient | null>(() => loadPatient(patientId));

	useEffect(() => {
		if (patient) return; // Sudah ada di cache

		client
			.query(PatientDetailQuery, { id: patientId })
			.toPromise()
			.then((result) => {
				const gqlPatient = result.data?.patient;
				if (!gqlPatient) return;

				const mapped = mapPatientFromGql(gqlPatient);
				setPatient(mapped);
				savePatient(mapped);
			});
	}, [patientId, patient, client]);

	// Fetch appointments dengan cache priority
	const [appointments, setAppointments] = useState<Appointment[]>(() =>
		loadAppointments(patientId, fromDate, toDate) || []
	);

	useEffect(() => {
		if (appointments.length > 0) return; // Sudah ada di cache

		client
			.query(PatientAppointmentsQuery, { patientId, fromDate, toDate })
			.toPromise()
			.then((result) => {
				const raw = result.data?.appointmentsByPatient?.appointments ?? [];
				const mapped: Appointment[] = raw.map(a => ({
					id: a.id,
					patientId,
					startDateTime: a.startDateTime,
					endDateTime: a.endDateTime,
					note: a.note,
					recurrenceId: a.recurrenceId ?? null,
					isException: a.isException ?? false,
					recurrenceRule: null,
				}));

				setAppointments(mapped);
				saveAppointments(patientId, fromDate, toDate, mapped);
			});
	}, [patientId, fromDate, toDate, appointments.length, client]);

	const [, deletePatient] = useMutation(DeletePatientMutation);
	const [updateResult, updatePatient] = useMutation(UpdatePatientMutation);

	const form = useForm({
		defaultValues: {
			name: patient?.name || "",
			dateOfBirth: "",
			phone: patient?.phone || "",
			email: patient?.email || "",
			address: patient?.address || "",
			medicalHistory: patient?.medicalHistory || "",
		},
		validatorAdapter: revalidateLogic(),
		validators: {
			onChange: patientFormSchema,
		},
		onSubmit: async ({ value }) => {
			const result = await updatePatient({
				id: patientId,
				input: {
					name: value.name || null,
					dateOfBirth: value.dateOfBirth || null,
					phone: value.phone || null,
					email: value.email || null,
					address: value.address || null,
					medicalHistory: value.medicalHistory || null,
				},
			});

			if (result.data?.updatePatient) {
				const updated = mapPatientFromGql(result.data.updatePatient);
				setPatient(updated);
				savePatient(updated);
				setIsEditOpen(false);
			}
		},
	});

	const handleDelete = async () => {
		if (!window.confirm(`Apakah Anda yakin ingin menghapus pasien ${patient?.name}?`)) {
			return;
		}

		const result = await deletePatient({ id: patientId });
		if (result.data?.deletePatient?.success) {
			navigate({ to: "/patients" });
		}
	};

	if (!patient) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Card>
					<CardPanel>
						<p className="text-destructive">Error: Pasien tidak ditemukan</p>
					</CardPanel>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-6xl">
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
					<h1 className="text-3xl font-bold">{patient.name}</h1>
					<p className="text-muted-foreground mt-1">Detail Informasi Pasien</p>
				</div>
				<div className="flex gap-2">
					{canEdit && (
						<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
							<Button variant="secondary" onClick={() => setIsEditOpen(true)}>
								<Edit className="w-4 h-4 mr-2" />
								Edit
							</Button>
							<DialogPopup className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
								<form
									onSubmit={(e) => {
										e.preventDefault();
										form.handleSubmit();
									}}
									className="contents"
								>
									<DialogHeader>
										<DialogTitle>Edit Pasien: {patient.name}</DialogTitle>
										<DialogDescription>
											Ubah informasi pasien di bawah ini. Klik simpan setelah
											selesai.
										</DialogDescription>
									</DialogHeader>
									<DialogPanel className="space-y-6">
										<form.Field name="name">
											{(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field data-invalid={isInvalid}>
														<FieldLabel htmlFor={field.name}>
															Nama Lengkap *
														</FieldLabel>
														<Input
															id={field.name}
															name={field.name}
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															placeholder="Masukkan nama lengkap"
															aria-invalid={isInvalid}
														/>
														{isInvalid && (
															<FieldError>
																{field.state.meta.errors
																	.map((err) =>
																		typeof err === "string"
																			? err
																			: err?.message,
																	)
																	.join(", ")}
															</FieldError>
														)}
													</Field>
												);
											}}
										</form.Field>

										<form.Field name="phone">
											{(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field data-invalid={isInvalid}>
														<FieldLabel htmlFor={field.name}>
															Nomor Telepon
														</FieldLabel>
														<Input
															id={field.name}
															name={field.name}
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															type="tel"
															placeholder="+62 812 3456 7890"
															aria-invalid={isInvalid}
														/>
														{isInvalid && (
															<FieldError>
																{field.state.meta.errors
																	.map((err) =>
																		typeof err === "string"
																			? err
																			: err?.message,
																	)
																	.join(", ")}
															</FieldError>
														)}
													</Field>
												);
											}}
										</form.Field>

										<form.Field name="email">
											{(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field data-invalid={isInvalid}>
														<FieldLabel htmlFor={field.name}>Email</FieldLabel>
														<Input
															id={field.name}
															name={field.name}
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															type="email"
															placeholder="email@example.com"
															aria-invalid={isInvalid}
														/>
														{isInvalid && (
															<FieldError>
																{field.state.meta.errors
																	.map((err) =>
																		typeof err === "string"
																			? err
																			: err?.message,
																	)
																	.join(", ")}
															</FieldError>
														)}
													</Field>
												);
											}}
										</form.Field>

										<form.Field name="address">
											{(field) => (
												<Field>
													<FieldLabel htmlFor={field.name}>Alamat</FieldLabel>
													<Textarea
														id={field.name}
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														rows={3}
														placeholder="Masukkan alamat lengkap"
													/>
												</Field>
											)}
										</form.Field>

										<form.Field name="medicalHistory">
											{(field) => (
												<Field>
													<FieldLabel htmlFor={field.name}>
														Riwayat Medis
													</FieldLabel>
													<Textarea
														id={field.name}
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														rows={4}
														placeholder="Alergi, penyakit kronis, dll."
													/>
												</Field>
											)}
										</form.Field>

										{updateResult.error && (
											<div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
												<p className="text-destructive text-sm">
													Error: {updateResult.error.message}
												</p>
											</div>
										)}
									</DialogPanel>
									<DialogFooter>
										<form.Subscribe
											selector={(state) => [
												state.canSubmit,
												state.isSubmitting,
											]}
										>
											{([canSubmit, isSubmitting]) => (
												<>
													<DialogClose render={<Button variant="ghost" />}>
														Batal
													</DialogClose>
													<Button type="submit" disabled={!canSubmit}>
														{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
													</Button>
												</>
											)}
										</form.Subscribe>
									</DialogFooter>
								</form>
							</DialogPopup>
						</Dialog>
					)}
					{canDelete && (
						<Button variant="destructive" onClick={handleDelete}>
							<Trash2 className="w-4 h-4 mr-2" />
							Hapus
						</Button>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<User className="w-5 h-5 mr-2" />
								Informasi Dasar
							</CardTitle>
						</CardHeader>
						<CardPanel>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<span className="text-sm text-muted-foreground">Nama</span>
									<p className="font-medium">{patient.name}</p>
								</div>
								<div>
									<span className="text-sm text-muted-foreground flex items-center">
										<Phone className="w-4 h-4 mr-1" />
										Telepon
									</span>
									<p className="font-medium">{patient.phone || "-"}</p>
								</div>
								<div>
									<span className="text-sm text-muted-foreground flex items-center">
										<Mail className="w-4 h-4 mr-1" />
										Email
									</span>
									<p className="font-medium">{patient.email || "-"}</p>
								</div>
								<div>
									<span className="text-sm text-muted-foreground flex items-center">
										<MapPin className="w-4 h-4 mr-1" />
										Alamat
									</span>
									<p className="font-medium">{patient.address || "-"}</p>
								</div>
							</div>
						</CardPanel>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Riwayat Medis</CardTitle>
						</CardHeader>
						<CardPanel>
							<p>{patient.medicalHistory || "Tidak ada riwayat medis"}</p>
						</CardPanel>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Calendar className="w-5 h-5 mr-2" />
								Jadwal (3 Bulan Ke Depan)
							</CardTitle>
						</CardHeader>
						<CardPanel>
							{appointments.length === 0 ? (
								<p className="text-muted-foreground">Tidak ada jadwal</p>
							) : (
								<div className="space-y-3">
									{appointments.map((apt) => (
										<div
											key={apt.id}
											className="p-3 bg-accent/10 rounded-lg border border-accent/20"
										>
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
											<p className="text-sm text-muted-foreground">
												{new Date(apt.startDateTime).toLocaleTimeString(
													"id-ID",
													{
														hour: "2-digit",
														minute: "2-digit",
													},
												)}{" "}
												-{" "}
												{new Date(apt.endDateTime).toLocaleTimeString("id-ID", {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
											{apt.note && <p className="text-sm mt-1">{apt.note}</p>}
										</div>
									))}
								</div>
							)}
						</CardPanel>
					</Card>

					{patient.recurrenceRules && patient.recurrenceRules.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Jadwal Berulang</CardTitle>
							</CardHeader>
							<CardPanel>
								<div className="space-y-3">
									{patient.recurrenceRules.map((rule) => (
										<div
											key={rule.id}
											className="p-3 bg-accent/10 rounded-lg border border-accent/20"
										>
											<p className="font-medium">
												{rule.frequency} - Setiap {rule.interval}{" "}
												{rule.frequency.toLowerCase()}
											</p>
											<p className="text-sm text-muted-foreground">
												Mulai:{" "}
												{new Date(rule.startDateTime).toLocaleDateString(
													"id-ID",
												)}
											</p>
											{rule.until && (
												<p className="text-sm text-muted-foreground">
													Sampai:{" "}
													{new Date(rule.until).toLocaleDateString("id-ID")}
												</p>
											)}
											{rule.count && (
												<p className="text-sm text-muted-foreground">
													Jumlah: {rule.count} kali
												</p>
											)}
											{rule.note && (
												<p className="text-sm text-muted-foreground mt-1">
													{rule.note}
												</p>
											)}
										</div>
									))}
								</div>
							</CardPanel>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
