import { detectionSchema, detectionsListSchema } from '@/api/rest/schemas'
import { describe, expect, it } from 'vitest'

describe('detection schemas', () => {
  it('parses a valid detection', () => {
    const parsed = detectionSchema.parse({
      id: 'det-001',
      siteId: 'site-alpha',
      sensorId: 'sen-a1',
      status: 'open',
      severity: 'critical',
      confidence: 0.94,
      summary: 'Test detection',
      detectedAt: '2026-01-01T00:00:00.000Z',
      lastUpdated: '2026-01-01T00:05:00.000Z',
      provenance: {
        sensorId: 'sen-a1',
        sensorName: 'RF Array',
        model: 'watchdesk-rf',
        modelVersion: '1.0.0',
      },
    })

    expect(parsed.id).toBe('det-001')
    expect(parsed.status).toBe('open')
  })

  it('parses a detections list response', () => {
    const parsed = detectionsListSchema.parse({
      items: [],
      nextCursor: null,
    })

    expect(parsed.items).toEqual([])
    expect(parsed.nextCursor).toBeNull()
  })

  it('allows an omitted nextCursor', () => {
    const parsed = detectionsListSchema.parse({ items: [] })
    expect(parsed.nextCursor).toBeUndefined()
  })
})
