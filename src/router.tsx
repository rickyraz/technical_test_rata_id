import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { createClient } from 'urql';


const client = createClient({
  url: '/graphql',  // MSW intercepts this
  exchanges: [],  // Default exchanges (add cacheExchange from @urql/exchange-graphcache if needed for caching)
  suspense: true,  // Optional: Enable for React Suspense integration
});

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: {
      urqlQueryClient: client,
    },
  })

  return router
}

