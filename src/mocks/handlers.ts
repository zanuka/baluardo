import { http, HttpResponse } from 'msw'
import { getApiBaseUrl } from '@/api/flags'
import type { Detection, DetectionSeverity, DetectionStatus } from '@/api/rest/schemas'
import { findDetection, getDetections, mockSites, updateDetection } from '@/mocks/fixtures'

const apiBase = getApiBaseUrl()

function problem(status: number, title: string, detail?: string) {
  return HttpResponse.json({ title, detail: detail ?? title, status }, { status })
}

function requireOperator(request: Request) {
  const role = request.headers.get('X-Operator-Role')
  if (!role) {
    return problem(401, 'Unauthorized', 'Operator role header is required.')
  }
  if (role !== 'analyst' && role !== 'supervisor') {
    return problem(403, 'Forbidden', 'Forbidden')
  }
  return null
}

function filterDetections(items: Detection[], params: URLSearchParams): Detection[] {
  let filtered = [...items]

  const site = params.get('site')
  if (site) {
    filtered = filtered.filter((item) => item.siteId === site)
  }

  const severity = params.get('severity') as DetectionSeverity | null
  if (severity) {
    filtered = filtered.filter((item) => item.severity === severity)
  }

  const status = params.get('status') as DetectionStatus | null
  if (status) {
    filtered = filtered.filter((item) => item.status === status)
  }

  return filtered.sort((a, b) => Date.parse(b.detectedAt) - Date.parse(a.detectedAt))
}

export const handlers = [
  http.get(`${apiBase}/api/v1/sites`, ({ request }) => {
    const denied = requireOperator(request)
    if (denied) {
      return denied
    }
    return HttpResponse.json({ items: mockSites })
  }),

  http.get(`${apiBase}/api/v1/detections`, ({ request }) => {
    const denied = requireOperator(request)
    if (denied) {
      return denied
    }

    const url = new URL(request.url)
    const items = filterDetections(getDetections(), url.searchParams)
    return HttpResponse.json({ items, nextCursor: null })
  }),

  http.get(`${apiBase}/api/v1/detections/:id`, ({ params, request }) => {
    const denied = requireOperator(request)
    if (denied) {
      return denied
    }

    const id = params.id as string
    if (id === 'det-forbidden') {
      return problem(403, 'Forbidden', 'You do not have clearance for this detection.')
    }

    const detection = findDetection(id)
    if (!detection) {
      return problem(404, 'Not Found', 'Detection not found.')
    }

    return HttpResponse.json(detection)
  }),

  http.post(`${apiBase}/api/v1/detections/:id/ack`, ({ params, request }) => {
    const denied = requireOperator(request)
    if (denied) {
      return denied
    }

    const id = params.id as string
    const current = findDetection(id)

    if (!current) {
      return problem(404, 'Not Found', 'Detection not found.')
    }

    if (current.status === 'rejected') {
      return problem(409, 'Conflict', 'Cannot acknowledge a rejected detection.')
    }

    if (current.status === 'acked') {
      return HttpResponse.json(current)
    }

    const updated: Detection = {
      ...current,
      status: 'acked',
      lastUpdated: new Date().toISOString(),
    }
    updateDetection(updated)

    return HttpResponse.json(updated)
  }),

  http.post(`${apiBase}/api/v1/detections/:id/reject`, async ({ params, request }) => {
    const denied = requireOperator(request)
    if (denied) {
      return denied
    }

    const id = params.id as string
    const body = (await request.json()) as { reason?: string }

    if (!body.reason?.trim()) {
      return problem(400, 'Bad Request', 'Reject reason is required.')
    }

    const current = findDetection(id)

    if (!current) {
      return problem(404, 'Not Found', 'Detection not found.')
    }

    if (current.status === 'rejected') {
      return HttpResponse.json(current)
    }

    if (current.status === 'acked') {
      return problem(409, 'Conflict', 'Cannot reject an acknowledged detection.')
    }

    const updated: Detection = {
      ...current,
      status: 'rejected',
      lastUpdated: new Date().toISOString(),
    }
    updateDetection(updated)

    return HttpResponse.json(updated)
  }),
]
