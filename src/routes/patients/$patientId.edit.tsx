/**
 * Edit Patient Form Page
 * Features:
 * - Pre-filled form with existing patient data
 * - Form validation
 * - Submit via GraphQL mutation
 * - Animated form with Motion One
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { animate } from "motion";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "urql";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import {
	PatientDetailQuery,
	UpdatePatientMutation,
} from "../../queries/patients";

export const Route = createFileRoute("/patients/$patientId/edit")({
	component: EditPatientPage,
});

interface FormData {
	name: string;
	dateOfBirth: string;
	phone: string;
	email: string;
	address: string;
	medicalHistory: string;
}

interface FormErrors {
	name?: string;
	email?: string;
	phone?: string;
}

function EditPatientPage() {
	const { patientId } = Route.useParams();
	const navigate = useNavigate();

	// Query existing patient data
	const [patientResult] = useQuery({
		query: PatientDetailQuery,
		variables: { id: patientId },
	});

	// Update mutation
	const [updateResult, updatePatient] = useMutation(UpdatePatientMutation);

	// Form state
	const [formData, setFormData] = useState<FormData>({
		name: "",
		dateOfBirth: "",
		phone: "",
		email: "",
		address: "",
		medicalHistory: "",
	});

	const [errors, setErrors] = useState<FormErrors>({});

	// Populate form when data loads
	useEffect(() => {
		if (patientResult.data?.patient) {
			const p = patientResult.data.patient;
			setFormData({
				name: p.name || "",
				dateOfBirth: "", // Not in schema, keep empty
				phone: p.phone || "",
				email: p.email || "",
				address: p.address || "",
				medicalHistory: p.medicalHistory || "",
			});
		}
	}, [patientResult.data]);

	// Animation
	const formRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (formRef.current && !patientResult.fetching) {
			animate(
				formRef.current,
				{ opacity: [0, 1], y: [20, 0] },
				{ duration: 0.4, easing: "ease-out" },
			);
		}
	}, [patientResult.fetching]);

	// Validation logic
	const validate = (): boolean => {
		const newErrors: FormErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Nama wajib diisi";
		}

		if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Format email tidak valid";
		}

		if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
			newErrors.phone = "Format telepon tidak valid";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validate()) {
			return;
		}

		// Submit via GraphQL mutation
		const result = await updatePatient({
			id: patientId,
			input: {
				name: formData.name || null,
				dateOfBirth: formData.dateOfBirth || null,
				phone: formData.phone || null,
				email: formData.email || null,
				address: formData.address || null,
				medicalHistory: formData.medicalHistory || null,
			},
		});

		if (result.data?.updatePatient) {
			// Navigate back to patient detail page
			navigate({
				to: "/patients/$patientId",
				params: { patientId },
			});
		}
	};

	// Handle input change
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear error for this field
		if (errors[name as keyof FormErrors]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }));
		}
	};

	if (patientResult.fetching) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
			</div>
		);
	}

	if (patientResult.error || !patientResult.data?.patient) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Card>
					<p className="text-red-600">
						Error:{" "}
						{patientResult.error?.message || "Pasien tidak ditemukan"}
					</p>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-3xl">
			<Button
				variant="ghost"
				size="sm"
				onClick={() =>
					navigate({ to: "/patients/$patientId", params: { patientId } })
				}
				className="mb-4"
			>
				<ArrowLeft className="w-4 h-4 mr-2" />
				Kembali ke Detail
			</Button>

			<div ref={formRef}>
				<Card>
					<h1 className="text-2xl font-bold mb-6">
						Edit Pasien: {patientResult.data.patient.name}
					</h1>

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Name - Required */}
						<Input
							label="Nama Lengkap *"
							name="name"
							value={formData.name}
							onChange={handleChange}
							error={errors.name}
							placeholder="Masukkan nama lengkap"
							required
						/>

						{/* Date of Birth */}
						<Input
							label="Tanggal Lahir"
							name="dateOfBirth"
							type="date"
							value={formData.dateOfBirth}
							onChange={handleChange}
						/>

						{/* Phone */}
						<Input
							label="Nomor Telepon"
							name="phone"
							type="tel"
							value={formData.phone}
							onChange={handleChange}
							error={errors.phone}
							placeholder="+62 812 3456 7890"
						/>

						{/* Email */}
						<Input
							label="Email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							error={errors.email}
							placeholder="email@example.com"
						/>

						{/* Address */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Alamat
							</label>
							<textarea
								name="address"
								value={formData.address}
								onChange={handleChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								rows={3}
								placeholder="Masukkan alamat lengkap"
							/>
						</div>

						{/* Medical History */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Riwayat Medis
							</label>
							<textarea
								name="medicalHistory"
								value={formData.medicalHistory}
								onChange={handleChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								rows={4}
								placeholder="Alergi, penyakit kronis, dll."
							/>
						</div>

						{/* Error Display */}
						{updateResult.error && (
							<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-red-600">
									Error: {updateResult.error.message}
								</p>
							</div>
						)}

						{/* Submit Buttons */}
						<div className="flex gap-3 pt-4">
							<Button
								type="submit"
								variant="primary"
								isLoading={updateResult.fetching}
								className="flex-1"
							>
								Simpan Perubahan
							</Button>
							<Button
								type="button"
								variant="secondary"
								onClick={() =>
									navigate({
										to: "/patients/$patientId",
										params: { patientId },
									})
								}
								disabled={updateResult.fetching}
							>
								Batal
							</Button>
						</div>
					</form>
				</Card>
			</div>
		</div>
	);
}
