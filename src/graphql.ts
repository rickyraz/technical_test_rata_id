import { initGraphQLTada } from 'gql.tada';
import type { introspection } from './graphql-env.d.ts';

export const graphql = initGraphQLTada<{
    introspection: introspection;
    // biome-ignore lint/complexity/noBannedTypes: <Notes>
    scalars: { /* Custom scalars if needed, e.g., DateTime: string */ };
}>();

export type { FragmentOf, ResultOf, VariablesOf } from 'gql.tada';
export { readFragment } from 'gql.tada';

