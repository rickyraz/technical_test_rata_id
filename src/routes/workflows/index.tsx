import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createFileRoute } from "@tanstack/react-router";
import { GripVertical, Plus, Trash2, Workflow as WorkflowIcon } from "lucide-react";
import { animate } from "motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardPanel } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../contexts/AuthContext";
import { loadWorkflows, saveWorkflows } from "@/mocks/storage";
import { Workflow, WorkflowStep } from "@/mocks/data";

export const Route = createFileRoute("/workflows/")({
	component: WorkflowsPage,
});


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

	const [workflowName, setWorkflowName] = useState("");
	const [steps, setSteps] = useState<WorkflowStep[]>([
		{ id: "1", name: "Registrasi", description: "Pendaftaran pasien", order: 1 },
		{ id: "2", name: "Pemeriksaan", description: "Pemeriksaan dokter", order: 2 },
		{ id: "3", name: "Obat", description: "Pengambilan obat", order: 3 },
		{ id: "4", name: "Pembayaran", description: "Pembayaran kasir", order: 4 },
	]);

	const workflows = useMemo(() => loadWorkflows(), []);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const containerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (containerRef.current) {
			animate(
				containerRef.current,
				{ opacity: [0, 1], transform: ["translateY(30px)", "translateY(0)"] },
				{ duration: 0.4 },
			);
		}
	}, []);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setSteps((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);
				const reordered = arrayMove(items, oldIndex, newIndex);
				return reordered.map((item, index) => ({ ...item, order: index + 1 }));
			});
		}
	};

	const handleAddStep = () => {
		const newId = crypto.randomUUID();
		setSteps([
			...steps,
			{ id: newId, name: "", description: "", order: steps.length + 1 },
		]);
	};

	const handleUpdateStep = (id: string, field: string, value: string) => {
		setSteps((prev) =>
			prev.map((step) => (step.id === id ? { ...step, [field]: value } : step)),
		);
	};

	const handleDeleteStep = (id: string) => {
		setSteps((prev) =>
			prev
				.filter((step) => step.id !== id)
				.map((step, index) => ({ ...step, order: index + 1 })),
		);
	};

	const handleSaveWorkflow = () => {
		if (!workflowName.trim()) {
			alert("Nama workflow harus diisi");
			return;
		}

		if (steps.length === 0) {
			alert("Tambahkan minimal 1 langkah");
			return;
		}

		const newWorkflow: Workflow = {
			id: crypto.randomUUID(),
			name: workflowName,
			steps: steps.map((step) => ({
				id: step.id,
				name: step.name,
				description: step.description,
				order: step.order,
			})),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const updated = [...workflows, newWorkflow];
		saveWorkflows(updated);

		alert("Workflow berhasil disimpan!");
		setWorkflowName("");
		setSteps([]);
		window.location.reload();
	};

	return (
		<div ref={containerRef} className="container mx-auto px-4 py-8 max-w-6xl">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900 flex items-center">
					<WorkflowIcon className="w-8 h-8 mr-3" />
					Workflow Builder
				</h1>
				<p className="text-gray-600 mt-1">Buat dan kelola alur kerja klinik</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>

						<h2 className="text-xl font-semibold mb-4">Buat Workflow Baru</h2>
					</CardHeader>
					<CardPanel>


						<Input
							alt="Nama Workflow"
							value={workflowName}
							onChange={(e) => setWorkflowName(e.target.value)}
							placeholder="Misal: Alur Pemeriksaan Umum"
							disabled={!canEdit}
							size="lg"
							className="mb-4 "
						/>

						<div className="mb-4 ">
							<div className="flex justify-between items-center mb-3">
								<span className="block text-sm font-medium text-gray-700">
									Langkah-langkah Workflow
								</span>
								{canEdit && (
									<Button variant="secondary" size="sm" onClick={handleAddStep}>
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

						{canEdit && (
							<Button
								variant="default"
								onClick={handleSaveWorkflow}
								className="w-full"
							>
								Simpan Workflow
							</Button>
						)}
					</CardPanel>
				</Card>

				<Card>
					<CardHeader>

						<h2 className="text-xl font-semibold mb-4">Workflow Tersimpan</h2>
					</CardHeader>
					<CardPanel>
						{workflows.length === 0 ? (
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
										<h3 className="font-semibold text-lg mb-3">{workflow.name}</h3>
										<div className="space-y-2">
											{workflow.steps
												.sort((a, b) => a.order - b.order)
												.map((step, index) => (
													<div key={step.id} className="flex items-start gap-2">
														<span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-sm font-medium shrink-0">
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
											{new Date(workflow.createdAt).toLocaleDateString("id-ID")}
										</p>
									</div>
								))}
							</div>
						)}
					</CardPanel>
				</Card>
			</div>
		</div>
	);
}