/**
 * Card Component
 * Container for content sections with optional animations
 */

import { animate } from "motion";
import type { HTMLAttributes, ReactNode } from "react";
import { useEffect, useRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	withAnimation?: boolean;
}

export function Card({
	children,
	withAnimation = true,
	className = "",
	...props
}: CardProps) {
	const cardRef = useRef<HTMLDivElement>(null);

	// Animate card on mount using Motion One
	useEffect(() => {
		if (cardRef.current && withAnimation) {
			animate(
				cardRef.current,
				{ opacity: [0, 1], y: [20, 0] },
				{ duration: 0.3, easing: "ease-out" },
			);
		}
	}, [withAnimation]);

	return (
		<div
			ref={cardRef}
			className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}
			{...props}
		>
			{children}
		</div>
	);
}
