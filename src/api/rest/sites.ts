import { restClient } from '@/api/rest/client'
import { sitesListSchema, type Site } from '@/api/rest/schemas'

export async function fetchSites(): Promise<Site[]> {
  const raw = await restClient('/api/v1/sites')
  const parsed = sitesListSchema.parse(raw)
  return parsed.items
}
