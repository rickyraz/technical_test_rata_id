/**
 * useDebounce Hook
 * Debounces a value with a specified delay
 * Useful for search inputs to reduce API calls
 */

import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 500): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		// Set up timeout to update debounced value after delay
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		// Clean up timeout if value changes before delay completes
		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}
