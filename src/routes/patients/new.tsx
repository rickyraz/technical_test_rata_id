import { revalidateLogic, useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ZodValidator } from "@tanstack/zod-form-adapter";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "urql";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardHeader,
	CardPanel,
	CardTitle,
} from "../../components/ui/card";
import { Field, FieldError, FieldLabel } from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { CreatePatientMutation } from "../../queries/patients";

export const Route = createFileRoute("/patients/new")({
	component: NewPatientPage,
});

const patientSchema = z.object({
	name: z.string().min(1, "Name is Mandatory"),
	dateOfBirth: z.string(),
	phone: z.string().regex(/^[\d\s\-+()]*$/, "Phone Number is invalid"),
	email: z.email("Email Format is invalid"),
	address: z.string(),
	medicalHistory: z.string().nullish(),
});

function NewPatientPage() {
	const navigate = useNavigate();
	const [createResult, createPatient] = useMutation(CreatePatientMutation);

	const form = useForm({
		defaultValues: {
			name: "",
			dateOfBirth: "",
			phone: "",
			email: "",
			address: "",
			medicalHistory: "",
		},
		validationLogic: revalidateLogic(),
		validators: {
			onChange: patientSchema,
		},
		onSubmit: async ({ value }) => {
			const result = await createPatient({
				input: {
					name: value.name,
					dateOfBirth: value.dateOfBirth || null,
					phone: value.phone || null,
					email: value.email || null,
					address: value.address || null,
					medicalHistory: value.medicalHistory || null,
				},
			});

			if (result.data?.createPatient) {
				navigate({
					to: "/patients/$patientId",
					params: { patientId: result.data.createPatient.id },
				});
			}
		},
	});

	return (
		<div className="container mx-auto px-4 py-8 max-w-3xl">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate({ to: "/patients" })}
				className="mb-4"
			>
				<ArrowLeft className="w-4 h-4 mr-2" />
				Kembali ke Daftar
			</Button>

			<Card>
				<CardHeader>
					<CardTitle>Tambah Pasien Baru</CardTitle>
				</CardHeader>
				<CardPanel>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-6"
					>
						<form.Field name="name">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Nama Lengkap *</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Masukkan nama lengkap"
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError>
												{field.state.meta.errors
													.map((err) =>
														typeof err === "string" ? err : err?.message,
													)
													.join(", ")}
											</FieldError>
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field name="dateOfBirth">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Tanggal Lahir</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										type="date"
									/>
								</Field>
							)}
						</form.Field>

						<form.Field name="phone">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Nomor Telepon</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											type="tel"
											placeholder="+62 812 3456 7890"
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError>
												{field.state.meta.errors
													.map((err) =>
														typeof err === "string" ? err : err?.message,
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
									field.state.meta.isTouched && !field.state.meta.isValid;

								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Email</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											type="email"
											placeholder="email@example.com"
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError>
												{field.state.meta.errors
													.map((err) =>
														typeof err === "string" ? err : err?.message,
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
									<FieldLabel htmlFor={field.name}>Riwayat Medis</FieldLabel>
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

						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, isSubmitting]) => (
								<div className="flex gap-3 pt-4">
									<Button
										type="submit"
										disabled={!canSubmit}
										className="flex-1"
									>
										{isSubmitting ? "Menyimpan..." : "Simpan Pasien"}
									</Button>
									<Button
										type="button"
										variant="secondary"
										onClick={() => navigate({ to: "/patients" })}
										disabled={isSubmitting}
									>
										Batal
									</Button>
								</div>
							)}
						</form.Subscribe>

						{createResult.error && (
							<div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
								<p className="text-destructive text-sm">
									Error: {createResult.error.message}
								</p>
							</div>
						)}
					</form>
				</CardPanel>
			</Card>
		</div>
	);

	// return (
	// 	<div className="container mx-auto px-4 py-8 max-w-3xl">
	// 		<Button
	// 			variant="ghost"
	// 			size="sm"
	// 			onClick={() => navigate({ to: "/patients" })}
	// 			className="mb-4"
	// 		>
	// 			<ArrowLeft className="w-4 h-4 mr-2" />
	// 			Kembali ke Daftar
	// 		</Button>

	// 		<Card>
	// 			<CardHeader>
	// 				<CardTitle>Tambah Pasien Baru</CardTitle>
	// 			</CardHeader>
	// 			<CardPanel>
	// 				<form
	// 					onSubmit={(e) => {
	// 						e.preventDefault();
	// 						form.handleSubmit();
	// 					}}
	// 					className="space-y-6"
	// 				>
	// 					<form.Field
	// 						name="name"
	// 						children={(field) => {
	// 							const isInvalid =
	// 								field.state.meta.isTouched && !field.state.meta.isValid;
	// 							return (
	// 								<div>
	// 									<label className="block text-sm font-medium mb-2">
	// 										Nama Lengkap *
	// 									</label>
	// 									<InputGroup>
	// 										<InputGroupInput
	// 											name={field.name}
	// 											value={field.state.value}
	// 											onBlur={field.handleBlur}
	// 											onChange={(e) => field.handleChange(e.target.value)}
	// 											placeholder="Masukkan nama lengkap"
	// 											aria-invalid={isInvalid}
	// 										/>
	// 									</InputGroup>
	// 									{isInvalid && (
	// 										<p className="text-sm text-destructive mt-1">
	// 											{field.state.meta.errors.join(", ")}
	// 										</p>
	// 									)}
	// 								</div>
	// 							);
	// 						}}
	// 					/>

	// 					<form.Field
	// 						name="dateOfBirth"
	// 						children={(field) => (
	// 							<div>
	// 								<label className="block text-sm font-medium mb-2">
	// 									Tanggal Lahir
	// 								</label>
	// 								<InputGroup>
	// 									<InputGroupInput
	// 										name={field.name}
	// 										value={field.state.value}
	// 										onBlur={field.handleBlur}
	// 										onChange={(e) => field.handleChange(e.target.value)}
	// 										type="date"
	// 									/>
	// 								</InputGroup>
	// 							</div>
	// 						)}
	// 					/>

	// 					<form.Field
	// 						name="phone"
	// 						children={(field) => {
	// 							const isInvalid =
	// 								field.state.meta.isTouched && !field.state.meta.isValid;
	// 							return (
	// 								<div>
	// 									<label className="block text-sm font-medium mb-2">
	// 										Nomor Telepon
	// 									</label>
	// 									<InputGroup>
	// 										<InputGroupInput
	// 											name={field.name}
	// 											value={field.state.value}
	// 											onBlur={field.handleBlur}
	// 											onChange={(e) => field.handleChange(e.target.value)}
	// 											type="tel"
	// 											placeholder="+62 812 3456 7890"
	// 											aria-invalid={isInvalid}
	// 										/>
	// 									</InputGroup>
	// 									{isInvalid && (
	// 										<p className="text-sm text-destructive mt-1">
	// 											{field.state.meta.errors.join(", ")}
	// 										</p>
	// 									)}
	// 								</div>
	// 							);
	// 						}}
	// 					/>

	// 					<form.Field
	// 						name="email"
	// 						children={(field) => {
	// 							const isInvalid =
	// 								field.state.meta.isTouched && !field.state.meta.isValid;
	// 							return (
	// 								<div>
	// 									<label className="block text-sm font-medium mb-2">
	// 										Email
	// 									</label>
	// 									<InputGroup>
	// 										<InputGroupInput
	// 											name={field.name}
	// 											value={field.state.value}
	// 											onBlur={field.handleBlur}
	// 											onChange={(e) => field.handleChange(e.target.value)}
	// 											type="email"
	// 											placeholder="email@example.com"
	// 											aria-invalid={isInvalid}
	// 										/>
	// 									</InputGroup>
	// 									{isInvalid && (
	// 										<p className="text-sm text-destructive mt-1">
	// 											{field.state.meta.errors.join(", ")}
	// 										</p>
	// 									)}
	// 								</div>
	// 							);
	// 						}}
	// 					/>

	// 					<form.Field
	// 						name="address"
	// 						children={(field) => (
	// 							<div>
	// 								<label className="block text-sm font-medium mb-2">
	// 									Alamat
	// 								</label>
	// 								<textarea
	// 									name={field.name}
	// 									value={field.state.value}
	// 									onBlur={field.handleBlur}
	// 									onChange={(e) => field.handleChange(e.target.value)}
	// 									className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
	// 									rows={3}
	// 									placeholder="Masukkan alamat lengkap"
	// 								/>
	// 							</div>
	// 						)}
	// 					/>

	// 					<form.Field
	// 						name="medicalHistory"
	// 						children={(field) => (
	// 							<div>
	// 								<label className="block text-sm font-medium mb-2">
	// 									Riwayat Medis
	// 								</label>
	// 								<textarea
	// 									name={field.name}
	// 									value={field.state.value}
	// 									onBlur={field.handleBlur}
	// 									onChange={(e) => field.handleChange(e.target.value)}
	// 									className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
	// 									rows={4}
	// 									placeholder="Alergi, penyakit kronis, dll."
	// 								/>
	// 							</div>
	// 						)}
	// 					/>

	// 					{createResult.error && (
	// 						<div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
	// 							<p className="text-destructive text-sm">
	// 								Error: {createResult.error.message}
	// 							</p>
	// 						</div>
	// 					)}

	// 					<form.Subscribe
	// 						selector={(state) => [state.canSubmit, state.isSubmitting]}
	// 						children={([canSubmit, isSubmitting]) => (
	// 							<div className="flex gap-3 pt-4">
	// 								<Button
	// 									type="submit"
	// 									variant="default"
	// 									disabled={!canSubmit}
	// 									className="flex-1"
	// 								>
	// 									{isSubmitting ? "Menyimpan..." : "Simpan Pasien"}
	// 								</Button>
	// 								<Button
	// 									type="button"
	// 									variant="secondary"
	// 									onClick={() => navigate({ to: "/patients" })}
	// 									disabled={isSubmitting}
	// 								>
	// 									Batal
	// 								</Button>
	// 							</div>
	// 						)}
	// 					/>
	// 				</form>
	// 			</CardPanel>
	// 		</Card>
	// 	</div>
	// );
}
