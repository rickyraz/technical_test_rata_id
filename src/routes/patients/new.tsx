/**
 * New Patient Form Page
 * Features:
 * - Form validation (basic client-side validation)
 * - Submit via GraphQL mutation
 * - Animated form with Motion One
 * - Redirects to patient detail after creation
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { animate } from "motion";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "urql";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { CreatePatientMutation } from "../../queries/patients";

export const Route = createFileRoute("/patients/new")({
	component: NewPatientPage,
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

function NewPatientPage() {
	const navigate = useNavigate();
	const [createResult, createPatient] = useMutation(CreatePatientMutation);

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

	// Animation
	const formRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (formRef.current) {
			animate(
				formRef.current,
				{ opacity: [0, 1], y: [20, 0] },
				{ duration: 0.4, easing: "ease-out" },
			);
		}
	}, []);

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
		const result = await createPatient({
			input: {
				name: formData.name,
				dateOfBirth: formData.dateOfBirth || null,
				phone: formData.phone || null,
				email: formData.email || null,
				address: formData.address || null,
				medicalHistory: formData.medicalHistory || null,
			},
		});

		if (result.data?.createPatient) {
			// Navigate to patient detail page
			navigate({
				to: "/patients/$patientId",
				params: { patientId: result.data.createPatient.id },
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

			<div ref={formRef}>
				<Card>
					<h1 className="text-2xl font-bold mb-6">Tambah Pasien Baru</h1>

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
						{createResult.error && (
							<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-red-600">
									Error: {createResult.error.message}
								</p>
							</div>
						)}

						{/* Submit Buttons */}
						<div className="flex gap-3 pt-4">
							<Button
								type="submit"
								variant="primary"
								isLoading={createResult.fetching}
								className="flex-1"
							>
								Simpan Pasien
							</Button>
							<Button
								type="button"
								variant="secondary"
								onClick={() => navigate({ to: "/patients" })}
								disabled={createResult.fetching}
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
