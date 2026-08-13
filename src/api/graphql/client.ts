export function getGraphqlUrl(): string {
  return import.meta.env.VITE_GRAPHQL_URL ?? ''
}
