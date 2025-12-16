/**
 * Button Component
 * Reusable button with variants and sizes
 * Integrates with Motion One for animations
 */

import { animate } from "motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useEffect, useRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "danger" | "ghost";
	size?: "sm" | "md" | "lg";
	children: ReactNode;
	isLoading?: boolean;
}

export function Button({
	variant = "primary",
	size = "md",
	children,
	isLoading = false,
	className = "",
	disabled,
	...props
}: ButtonProps) {
	const buttonRef = useRef<HTMLButtonElement>(null);

	// Animation on mount using Motion One
	useEffect(() => {
		if (buttonRef.current) {
			animate(
				buttonRef.current,
				{ opacity: [0, 1], scale: [0.95, 1] },
				{ duration: 0.2, easing: "ease-out" },
			);
		}
	}, []);

	const baseStyles = "rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";

	const variantStyles = {
		primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
		secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
		danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
		ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
	};

	const sizeStyles = {
		sm: "px-3 py-1.5 text-sm",
		md: "px-4 py-2 text-base",
		lg: "px-6 py-3 text-lg",
	};

	return (
		<button
			ref={buttonRef}
			className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading ? (
				<span className="flex items-center gap-2">
					<span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
					Loading...
				</span>
			) : (
				children
			)}
		</button>
	);
}
