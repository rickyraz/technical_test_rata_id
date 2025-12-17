import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
	columns: ColumnDef<TData>[];
	data: TData[];
	onRowClick?: (row: TData) => void;
	className?: string;
	framed?: boolean;
}

export function DataTable<TData>({
	columns,
	data,
	onRowClick,
	className,
	framed = false,
}: DataTableProps<TData>) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Table className={className} data-slot={framed ? "frame" : undefined}>
			<TableHeader>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<TableHead
								key={header.id}
								className={cn(
									header.column.getCanSort() &&
										"cursor-pointer select-none font-bold",
								)}
								onClick={header.column.getToggleSortingHandler()}
							>
								<div className="flex items-center gap-2">
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
									{{
										asc: " 🔼",
										desc: " 🔽",
									}[header.column.getIsSorted() as string] ?? null}
								</div>
							</TableHead>
						))}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{table.getRowModel().rows.map((row) => (
					<TableRow
						key={row.id}
						className={cn(onRowClick && "cursor-pointer")}
						onClick={() => onRowClick?.(row.original)}
					>
						{row.getVisibleCells().map((cell) => (
							<TableCell key={cell.id}>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
