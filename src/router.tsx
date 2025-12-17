import { createRouter } from "@tanstack/react-router";
import { cacheExchange, createClient } from "urql";
import { mockExchange } from "./mocks/mockExchange.ts"; 
import { routeTree } from "./routeTree.gen";

const client = createClient({
	url: "/graphql",
	exchanges: [cacheExchange, mockExchange],
	suspense: true, // React Suspense integration
});

export const getRouter = () => {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
		context: {
			urqlQueryClient: client,
		},
	});

	return router;
};
