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
import { SearchIcon } from "lucide-react";
import { animate } from "motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "urql";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { DataTable } from "../../components/DataTable";
import { Pagination } from "../../components/ui/Pagination";
import { useAuth } from "../../contexts/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";
import { AllPatientsQuery } from "../../queries/patients";
import { loadPatients, savePatients } from "@/mocks/storage";

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

export function mapPatientsFromGql(list: any[] = []): Patient[] {
	return list.map(p => ({
		id: p.id,
		name: p.name,
		phone: p.phone ?? null,
		email: p.email ?? null,
		address: p.address ?? "",
		medicalHistory: p.medicalHistory ?? "",
		createdAt: p.createdAt,
		lastVisit: p.lastVisit,
		outstandingBalance: p.outstandingBalance,
		updatedAt: p.updatedAt,
		appointments: [],
		recurrenceRules: p.recurrenceRules ?? [],
	}));
}

function PatientsListPage() {
	const navigate = useNavigate();
	const { canEdit } = useAuth();

	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	const debouncedSearch = useDebounce(searchTerm, 500);

	// Single source of truth: localStorage priority
	const storedPatients = useMemo(() => loadPatients(), []);
	const useLocalStorage = storedPatients.length > 0;

	const [result] = useQuery({
		query: AllPatientsQuery,
		variables: {
			search: debouncedSearch || null,
			limit: itemsPerPage,
			offset: (currentPage - 1) * itemsPerPage,
		},
		pause: useLocalStorage, // Pause jika ada localStorage
	});

	// Filter localStorage data
	const filteredPatients = useMemo(() => {
		if (!useLocalStorage) return [];

		if (!debouncedSearch) return storedPatients;

		const searchLower = debouncedSearch.toLowerCase();
		return storedPatients.filter(p =>
			p.name.toLowerCase().includes(searchLower) ||
			p.phone?.toLowerCase().includes(searchLower) ||
			p.email?.toLowerCase().includes(searchLower)
		);
	}, [storedPatients, debouncedSearch, useLocalStorage]);

	// Paginate localStorage data
	const paginatedLocalPatients = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredPatients.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredPatients, currentPage, itemsPerPage]);

	// Final data & metadata
	const patients = useLocalStorage
		? paginatedLocalPatients
		: (result.data?.allPatients?.patients ?? []);

	const total = useLocalStorage
		? filteredPatients.length
		: (result.data?.allPatients?.total ?? 0);

	const totalPages = Math.ceil(total / itemsPerPage);
	const isLoading = result.fetching;
	const error = result.error?.message;

	// Save to localStorage when server data arrives
	useEffect(() => {
		if (!useLocalStorage && result.data?.allPatients?.patients) {
			savePatients(result.data.allPatients.patients);
		}
	}, [result.data, useLocalStorage]);

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
				{ duration: 0.5 },
			);
		}
	}, []);

	const columns: ColumnDef<Patient>[] = [
		{
			accessorKey: "name",
			header: "Nama Pasien",
			cell: (info) => (
				<span className="font-medium text-gray-900">
					{info.getValue() as string}
				</span>
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
			accessorKey: "medicalHistory",
			header: "Riwayat Medis",
			cell: (info) => info.getValue() || "-",
		},
		{
			accessorKey: "outstandingBalance",
			header: "Sisa Tagihan",
			cell: (info) => {
				const balance = info.getValue() as number | null;
				return balance ? `Rp ${balance.toLocaleString("id-ID")}` : "Rp 0";
			},
		},
	];

	const handleRowClick = (patient: Patient) => {
		navigate({ to: "/patients/$patientId", params: { patientId: patient.id } });
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div ref={containerRef} className="container mx-auto px-4 py-8 max-w-6xl">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Patient List</h1>
					<p className="text-gray-600 mt-1">Manage clinic patient data</p>
				</div>
				{canEdit && (
					<Button onClick={() => navigate({ to: "/patients/new" })}>
						+ Add New Patient
					</Button>
				)}
			</div>

			<Card className="mb-6 px-6">
				<InputGroup>
					<InputGroupInput
						aria-label="Search"
						placeholder="Search patients by name, phone, or email..."
						type="search"
						size="lg"
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setCurrentPage(1);
						}}
					/>
					<InputGroupAddon>
						<SearchIcon />
					</InputGroupAddon>
				</InputGroup>
			</Card>

			<Card>
				{error && (
					<div className="text-red-600 p-4 bg-red-50 rounded-lg mb-4">
						Error: {error}
					</div>
				)}

				{isLoading && (
					<div className="flex justify-center items-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
					</div>
				)}

				{!isLoading && patients.length === 0 && (
					<div className="text-center py-12">
						<p className="text-gray-500 text-lg">
							{searchTerm
								? "Tidak ada pasien yang ditemukan"
								: "Belum ada data pasien"}
						</p>
					</div>
				)}

				{!isLoading && patients.length > 0 && (
					<div className="px-6">
						<DataTable
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
					</div>
				)}
			</Card>
		</div>
	);
}

// function PatientsListPage() {
// 	const navigate = useNavigate();
// 	const { canEdit } = useAuth();
// 	const [source,] = useState<"storage" | "server">("storage");

// 	const [patients, setPatients] = useState<Patient[]>([]);
// 	const [, setLoading] = useState(true);
// 	const [error, setError] = useState<string | null>(null);

// 	// State for search and pagination
// 	const [searchTerm, setSearchTerm] = useState("");
// 	const [currentPage, setCurrentPage] = useState(1);
// 	const itemsPerPage = 10;

// 	const debouncedSearch = useDebounce(searchTerm, 500);

// 	const [result, reexecuteQuery] = useQuery({
// 		query: AllPatientsQuery,
// 		variables: {
// 			search: debouncedSearch || null,
// 			limit: itemsPerPage,
// 			offset: (currentPage - 1) * itemsPerPage,
// 		},
// 		pause: true, // 🔴 PENTING
// 	});

// 	useEffect(() => {
// 		const stored = loadPatients();

// 		if (stored && stored.length > 0) {
// 			// ✅ PRIORITAS localStorage
// 			setPatients(stored);
// 			setLoading(false);
// 			return;
// 		}

// 		// ❌ Kalau tidak ada → fetch dari server
// 		reexecuteQuery();
// 	}, [debouncedSearch, currentPage]);

// 	useEffect(() => {
// 		if (result.fetching) return;

// 		if (result.error) {
// 			setError(result.error.message);
// 			setLoading(false);
// 			return;
// 		}

// 		if (result.data?.allPatients) {
// 			const mapped: Patient[] = result.data.allPatients.patients;

// 			setPatients(mapped);
// 			savePatients(mapped); // ✅ cache
// 			setLoading(false);
// 		}
// 	}, [result]);

// 	const filteredPatients = useMemo(() => {
// 		if (source === "server") return patients;

// 		return patients.filter(p =>
// 			p.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
// 		);
// 	}, [patients, debouncedSearch, source]);

// 	const total =
// 		source === "server"
// 			? result.data?.allPatients?.total ?? 0
// 			: filteredPatients.length;
// 	const totalPages = Math.ceil(total / itemsPerPage);

// 	// Animation for page container
// 	const containerRef = useRef<HTMLDivElement>(null);
// 	useEffect(() => {
// 		if (containerRef.current) {
// 			animate(
// 				containerRef.current,
// 				{
// 					opacity: [0, 1],
// 					transform: ["translateY(30px)", "translateY(0)"],
// 				},
// 				{ duration: 0.5 },
// 			);
// 		}
// 	}, []);

// 	// Table columns definition
// 	const columns: ColumnDef<Patient>[] = [
// 		{
// 			accessorKey: "name",
// 			header: "Nama Pasien",
// 			cell: (info) => (
// 				<span className="font-medium text-gray-900">
// 					{info.getValue() as string}
// 				</span>
// 			),
// 		},
// 		{
// 			accessorKey: "phone",
// 			header: "Telepon",
// 			cell: (info) => info.getValue() || "-",
// 		},
// 		{
// 			accessorKey: "email",
// 			header: "Email",
// 			cell: (info) => info.getValue() || "-",
// 		},
// 		{
// 			accessorKey: "medicalHistory",
// 			header: "Riwayat Medis",
// 			cell: (info) => info.getValue() || "-",
// 		},
// 		{
// 			accessorKey: "outstandingBalance",
// 			header: "Sisa Tagihan",
// 			cell: (info) => {
// 				const balance = info.getValue() as number | null;
// 				return balance ? `Rp ${balance.toLocaleString("id-ID")}` : "Rp 0";
// 			},
// 		},
// 	];

// 	// Handle row click to navigate to patient detail
// 	const handleRowClick = (patient: Patient) => {
// 		navigate({ to: "/patients/$patientId", params: { patientId: patient.id } });
// 	};

// 	// Handle page change
// 	const handlePageChange = (page: number) => {
// 		setCurrentPage(page);
// 		window.scrollTo({ top: 0, behavior: "smooth" });
// 	};

// 	return (
// 		<div ref={containerRef} className="container mx-auto px-4 py-8  max-w-6xl">
// 			{/* Header */}
// 			<div className="flex justify-between items-center mb-6">
// 				<div>
// 					<h1 className="text-3xl font-bold text-gray-900">Patient List</h1>
// 					<p className="text-gray-600 mt-1">Manage clinic patient data</p>
// 				</div>
// 				{canEdit && (
// 					<Button onClick={() => navigate({ to: "/patients/new" })}>
// 						+ Add New Patient
// 					</Button>
// 				)}
// 			</div>

// 			{/* Search Bar */}
// 			<Card className="mb-6 px-6">
// 				<div className="flex items-center space-x-2">
// 					{/* <Input
// 						size="lg"
// 						type="text"
// 						className="border-0 shadow-gray-50"
// 						placeholder="Cari pasien berdasarkan nama, telepon, atau email..."
// 						value={searchTerm}
// 						onChange={(e) => {
// 							setSearchTerm(e.target.value);
// 							setCurrentPage(1); // Reset to first page on search
// 						}}
// 					/> */}

// 					<InputGroup>
// 						<InputGroupInput
// 							aria-label="Search"
// 							placeholder="Search pationts by name, phone, or email..."
// 							type="search"
// 							size="lg"
// 							value={searchTerm}
// 							onChange={(e) => {
// 								setSearchTerm(e.target.value);
// 								setCurrentPage(1); // Reset to first page on search
// 							}}
// 						/>
// 						<InputGroupAddon>
// 							<SearchIcon />
// 						</InputGroupAddon>
// 					</InputGroup>
// 				</div>
// 			</Card>

// 			{/* Table */}
// 			<Card>
// 				{error && (
// 					<div className="text-red-600 p-4 bg-red-50 rounded-lg mb-4">
// 						Error: {error}
// 					</div>
// 				)}

// 				{/* {fetching && (
// 					<div className="flex justify-center items-center py-12">
// 						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
// 					</div>
// 				)} */}

// 				{patients.length === 0 && (
// 					<div className="text-center py-12">
// 						<p className="text-gray-500 text-lg">
// 							{searchTerm
// 								? "Tidak ada pasien yang ditemukan"
// 								: "Belum ada data pasien"}
// 						</p>
// 					</div>
// 				)}

// 				{patients.length > 0 && (
// 					<div className="px-6">
// 						<DataTable
// 							columns={columns}
// 							data={patients}
// 							onRowClick={handleRowClick}
// 						/>
// 						<Pagination
// 							currentPage={currentPage}
// 							totalPages={totalPages}
// 							onPageChange={handlePageChange}
// 							itemsPerPage={itemsPerPage}
// 							totalItems={total}
// 						/>
// 					</div>
// 				)}
// 			</Card>
// 		</div>
// 	);
// }
