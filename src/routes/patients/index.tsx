/**
 * Patients List Page
 * Features:
 * - List all patients in a table (using coss.com/ui design)
 * - Search functionality with debounced input
 * - Pagination support
 * - Click row to navigate to patient detail
 * - Add new patient button (role-based visibility)
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { animate } from "motion";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "urql";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Pagination } from "../../components/ui/Pagination";
import { Table } from "../../components/ui/Table";
import { useAuth } from "../../contexts/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";
import { AllPatientsQuery } from "../../queries/patients";

export const Route = createFileRoute("/patients/")({
	component: PatientsListPage,
});

interface Patient {
	id: string;
	name: string;
	phone: string | null;
	email: string | null;
	address: string | null;
	lastVisit: string | null;
	outstandingBalance: number | null;
}

function PatientsListPage() {
	const navigate = useNavigate();
	const { canEdit } = useAuth();

	// State for search and pagination
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	// Debounce search term to reduce API calls
	const debouncedSearch = useDebounce(searchTerm, 500);

	// GraphQL query with URQL
	const [result] = useQuery({
		query: AllPatientsQuery,
		variables: {
			search: debouncedSearch || null,
			limit: itemsPerPage,
			offset: (currentPage - 1) * itemsPerPage,
		},
	});

	const { data, fetching, error } = result;
	const patients = data?.allPatients?.patients || [];
	const total = data?.allPatients?.total || 0;
	const totalPages = Math.ceil(total / itemsPerPage);

	// Animation for page container
	const containerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (containerRef.current) {
			animate(
				containerRef.current,
				{ opacity: [0, 1], y: [-20, 0] },
				{ duration: 0.4, easing: "ease-out" },
			);
		}
	}, []);

	// Table columns definition
	const columns: ColumnDef<Patient>[] = [
		{
			accessorKey: "name",
			header: "Nama Pasien",
			cell: (info) => (
				<span className="font-medium text-gray-900">{info.getValue() as string}</span>
			),
		},
		{
			accessorKey: "phone",
			header: "Telepon",
			cell: (info) => info.getValue() || "-",
		},
		{
			accessorKey: "email",
			header: "Email",
			cell: (info) => info.getValue() || "-",
		},
		{
			accessorKey: "lastVisit",
			header: "Kunjungan Terakhir",
			cell: (info) => {
				const date = info.getValue() as string | null;
				return date ? new Date(date).toLocaleDateString("id-ID") : "-";
			},
		},
		{
			accessorKey: "outstandingBalance",
			header: "Sisa Tagihan",
			cell: (info) => {
				const balance = info.getValue() as number | null;
				return balance
					? `Rp ${balance.toLocaleString("id-ID")}`
					: "Rp 0";
			},
		},
	];

	// Handle row click to navigate to patient detail
	const handleRowClick = (patient: Patient) => {
		navigate({ to: "/patients/$patientId", params: { patientId: patient.id } });
	};

	// Handle page change
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		// Scroll to top on page change
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div ref={containerRef} className="container mx-auto px-4 py-8 max-w-7xl">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Daftar Pasien</h1>
					<p className="text-gray-600 mt-1">
						Kelola data pasien klinik
					</p>
				</div>
				{canEdit && (
					<Button
						variant="primary"
						onClick={() => navigate({ to: "/patients/new" })}
					>
						+ Tambah Pasien
					</Button>
				)}
			</div>

			{/* Search Bar */}
			<Card className="mb-6">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
					<Input
						type="text"
						placeholder="Cari pasien berdasarkan nama, telepon, atau email..."
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setCurrentPage(1); // Reset to first page on search
						}}
						className="pl-10"
					/>
				</div>
			</Card>

			{/* Table */}
			<Card withAnimation={false}>
				{error && (
					<div className="text-red-600 p-4 bg-red-50 rounded-lg mb-4">
						Error: {error.message}
					</div>
				)}

				{fetching && (
					<div className="flex justify-center items-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
					</div>
				)}

				{!fetching && patients.length === 0 && (
					<div className="text-center py-12">
						<p className="text-gray-500 text-lg">
							{searchTerm
								? "Tidak ada pasien yang ditemukan"
								: "Belum ada data pasien"}
						</p>
					</div>
				)}

				{!fetching && patients.length > 0 && (
					<>
						<Table
							columns={columns}
							data={patients}
							onRowClick={handleRowClick}
						/>
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={handlePageChange}
							itemsPerPage={itemsPerPage}
							totalItems={total}
						/>
					</>
				)}
			</Card>
		</div>
	);
}
