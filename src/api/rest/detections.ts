import { restClient } from '@/api/rest/client'
import {
  detectionSchema,
  detectionsListSchema,
  type Detection,
  type DetectionFilters,
  type DetectionsList,
} from '@/api/rest/schemas'

function buildQuery(filters: DetectionFilters): Record<string, string> {
  const query: Record<string, string> = {}
  if (filters.site && filters.site !== 'all') {
    query.site = filters.site
  }
  if (filters.severity) {
    query.severity = filters.severity
  }
  if (filters.status) {
    query.status = filters.status
  }
  if (filters.cursor) {
    query.cursor = filters.cursor
  }
  return query
}

export async function fetchDetections(filters: DetectionFilters = {}): Promise<DetectionsList> {
  const raw = await restClient('/api/v1/detections', { query: buildQuery(filters) })
  return detectionsListSchema.parse(raw)
}

export async function fetchDetection(id: string): Promise<Detection> {
  const raw = await restClient(`/api/v1/detections/${id}`)
  return detectionSchema.parse(raw)
}

export async function ackDetection(id: string): Promise<Detection> {
  const raw = await restClient(`/api/v1/detections/${id}/ack`, { method: 'POST' })
  return detectionSchema.parse(raw)
}

export async function rejectDetection(id: string, reason: string): Promise<Detection> {
  const raw = await restClient(`/api/v1/detections/${id}/reject`, {
    method: 'POST',
    body: { reason },
  })
  return detectionSchema.parse(raw)
}
