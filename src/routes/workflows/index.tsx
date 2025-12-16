/**
 * Workflow Builder Page
 * Features:
 * - Create and manage clinical workflows
 * - Drag-and-drop functionality using @dnd-kit/core
 * - Add, remove, and reorder workflow steps
 * - Save workflow via GraphQL mutation
 * - Example: "Registrasi → Pemeriksaan → Obat → Pembayaran"
 */

import {
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createFileRoute } from "@tanstack/react-router";
import { GripVertical, Plus, Trash2, Workflow } from "lucide-react";
import { animate } from "motion";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "urql";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../contexts/AuthContext";
import {
	AllWorkflowsQuery,
	CreateWorkflowMutation,
} from "../../queries/workflows";

export const Route = createFileRoute("/workflows/")({
	component: WorkflowsPage,
});

interface WorkflowStep {
	id: string;
	name: string;
	description: string;
	order: number;
}

// Sortable Step Component
function SortableStep({
	step,
	onUpdate,
	onDelete,
	canEdit,
}: {
	step: WorkflowStep;
	onUpdate: (id: string, field: string, value: string) => void;
	onDelete: (id: string) => void;
	canEdit: boolean;
}) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: step.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow"
		>
			<div className="flex items-start gap-3">
				{/* Drag Handle */}
				{canEdit && (
					<button
						type="button"
						{...attributes}
						{...listeners}
						className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
					>
						<GripVertical className="w-5 h-5" />
					</button>
				)}

				{/* Step Content */}
				<div className="flex-1">
					<Input
						value={step.name}
						onChange={(e) => onUpdate(step.id, "name", e.target.value)}
						placeholder="Nama langkah"
						disabled={!canEdit}
						className="font-medium mb-2"
					/>
					<Input
						value={step.description}
						onChange={(e) => onUpdate(step.id, "description", e.target.value)}
						placeholder="Deskripsi (opsional)"
						disabled={!canEdit}
					/>
				</div>

				{/* Delete Button */}
				{canEdit && (
					<button
						type="button"
						onClick={() => onDelete(step.id)}
						className="mt-1 text-red-500 hover:text-red-700"
					>
						<Trash2 className="w-5 h-5" />
					</button>
				)}
			</div>
		</div>
	);
}

function WorkflowsPage() {
	const { canEdit } = useAuth();

	// State for new workflow being created
	const [workflowName, setWorkflowName] = useState("");
	const [steps, setSteps] = useState<WorkflowStep[]>([
		{ id: "1", name: "Registrasi", description: "Pendaftaran pasien", order: 1 },
		{ id: "2", name: "Pemeriksaan", description: "Pemeriksaan dokter", order: 2 },
		{ id: "3", name: "Obat", description: "Pengambilan obat", order: 3 },
		{ id: "4", name: "Pembayaran", description: "Pembayaran kasir", order: 4 },
	]);

	// Query existing workflows
	const [workflowsResult] = useQuery({
		query: AllWorkflowsQuery,
		variables: { limit: 10, offset: 0 },
	});

	// Create mutation
	const [createResult, createWorkflow] = useMutation(CreateWorkflowMutation);

	// Drag and drop sensors
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	// Animation
	const containerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (containerRef.current) {
			animate(
				containerRef.current,
				{ opacity: [0, 1], y: [20, 0] },
				{ duration: 0.4, easing: "ease-out" },
			);
		}
	}, []);

	// Handle drag end
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setSteps((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);

				const reordered = arrayMove(items, oldIndex, newIndex);
				// Update order numbers
				return reordered.map((item, index) => ({
					...item,
					order: index + 1,
				}));
			});
		}
	};

	// Add new step
	const handleAddStep = () => {
		const newId = (steps.length + 1).toString();
		setSteps([
			...steps,
			{
				id: newId,
				name: "",
				description: "",
				order: steps.length + 1,
			},
		]);
	};

	// Update step
	const handleUpdateStep = (id: string, field: string, value: string) => {
		setSteps((prev) =>
			prev.map((step) =>
				step.id === id ? { ...step, [field]: value } : step,
			),
		);
	};

	// Delete step
	const handleDeleteStep = (id: string) => {
		setSteps((prev) =>
			prev
				.filter((step) => step.id !== id)
				.map((step, index) => ({ ...step, order: index + 1 })),
		);
	};

	// Save workflow
	const handleSaveWorkflow = async () => {
		if (!workflowName.trim()) {
			alert("Nama workflow harus diisi");
			return;
		}

		if (steps.length === 0) {
			alert("Tambahkan minimal 1 langkah");
			return;
		}

		const result = await createWorkflow({
			input: {
				name: workflowName,
				steps: steps.map((step) => ({
					name: step.name,
					description: step.description || null,
					order: step.order,
				})),
			},
		});

		if (result.data?.createWorkflow) {
			alert("Workflow berhasil disimpan!");
			setWorkflowName("");
			setSteps([]);
		}
	};

	const workflows = workflowsResult.data?.allWorkflows?.workflows || [];

	return (
		<div ref={containerRef} className="container mx-auto px-4 py-8 max-w-6xl">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900 flex items-center">
					<Workflow className="w-8 h-8 mr-3" />
					Workflow Builder
				</h1>
				<p className="text-gray-600 mt-1">
					Buat dan kelola alur kerja klinik
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Left: Create New Workflow */}
				<div>
					<Card>
						<h2 className="text-xl font-semibold mb-4">
							Buat Workflow Baru
						</h2>

						{/* Workflow Name */}
						<Input
							label="Nama Workflow"
							value={workflowName}
							onChange={(e) => setWorkflowName(e.target.value)}
							placeholder="Misal: Alur Pemeriksaan Umum"
							disabled={!canEdit}
							className="mb-4"
						/>

						{/* Drag and Drop Steps */}
						<div className="mb-4">
							<div className="flex justify-between items-center mb-3">
								<label className="block text-sm font-medium text-gray-700">
									Langkah-langkah Workflow
								</label>
								{canEdit && (
									<Button
										variant="secondary"
										size="sm"
										onClick={handleAddStep}
									>
										<Plus className="w-4 h-4 mr-1" />
										Tambah Langkah
									</Button>
								)}
							</div>

							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}
							>
								<SortableContext
									items={steps}
									strategy={verticalListSortingStrategy}
								>
									{steps.map((step) => (
										<SortableStep
											key={step.id}
											step={step}
											onUpdate={handleUpdateStep}
											onDelete={handleDeleteStep}
											canEdit={canEdit}
										/>
									))}
								</SortableContext>
							</DndContext>

							{steps.length === 0 && (
								<p className="text-gray-500 text-center py-8">
									Belum ada langkah. Klik "Tambah Langkah" untuk memulai.
								</p>
							)}
						</div>

						{/* Save Button */}
						{canEdit && (
							<div>
								{createResult.error && (
									<div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
										Error: {createResult.error.message}
									</div>
								)}
								<Button
									variant="primary"
									onClick={handleSaveWorkflow}
									isLoading={createResult.fetching}
									className="w-full"
								>
									Simpan Workflow
								</Button>
							</div>
						)}
					</Card>
				</div>

				{/* Right: Existing Workflows */}
				<div>
					<Card>
						<h2 className="text-xl font-semibold mb-4">
							Workflow Tersimpan
						</h2>

						{workflowsResult.fetching ? (
							<div className="flex justify-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
							</div>
						) : workflows.length === 0 ? (
							<p className="text-gray-500 text-center py-8">
								Belum ada workflow tersimpan
							</p>
						) : (
							<div className="space-y-4">
								{workflows.map((workflow) => (
									<div
										key={workflow.id}
										className="border border-gray-200 rounded-lg p-4 bg-gray-50"
									>
										<h3 className="font-semibold text-lg mb-3">
											{workflow.name}
										</h3>
										<div className="space-y-2">
											{workflow.steps
												.sort((a, b) => a.order - b.order)
												.map((step, index) => (
													<div
														key={step.id}
														className="flex items-start gap-2"
													>
														<span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex-shrink-0">
															{index + 1}
														</span>
														<div>
															<p className="font-medium">{step.name}</p>
															{step.description && (
																<p className="text-sm text-gray-600">
																	{step.description}
																</p>
															)}
														</div>
													</div>
												))}
										</div>
										<p className="text-xs text-gray-500 mt-3">
											Dibuat:{" "}
											{new Date(workflow.createdAt).toLocaleDateString(
												"id-ID",
											)}
										</p>
									</div>
								))}
							</div>
						)}
					</Card>
				</div>
			</div>
		</div>
	);
}
