/**
 * Input Component
 * Reusable input field with label and error handling
 */

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	helperText?: string;
}

export function Input({
	label,
	error,
	helperText,
	className = "",
	id,
	...props
}: InputProps) {
	const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

	return (
		<div className="w-full">
			{label && (
				<label
					htmlFor={inputId}
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					{label}
				</label>
			)}
			<input
				id={inputId}
				className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
					error
						? "border-red-500 focus:ring-red-500"
						: "border-gray-300"
				} ${className}`}
				{...props}
			/>
			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
			{helperText && !error && (
				<p className="mt-1 text-sm text-gray-500">{helperText}</p>
			)}
		</div>
	);
}
