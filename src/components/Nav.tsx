import { Link } from "@tanstack/react-router";

export default function NavItem({
	to,
	icon: Icon,
	children,
}: {
	to: string;
	icon: React.ElementType;
	children: React.ReactNode;
}) {
	return (
		<Link
			to={to}
			activeProps={{
				className: "text-red-600 bg-red-50",
			}}
			inactiveProps={{
				className: "text-gray-700 hover:text-red-600 hover:bg-red-50",
			}}
			className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
		>
			<Icon className="w-4 h-4" />
			{children}
		</Link>
	);
}
