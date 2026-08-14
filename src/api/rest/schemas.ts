import { z } from 'zod'

export const detectionStatusSchema = z.enum(['open', 'acked', 'rejected'])
export const detectionSeveritySchema = z.enum(['critical', 'high', 'medium', 'low'])

export const detectionProvenanceSchema = z.object({
  sensorId: z.string(),
  sensorName: z.string().optional(),
  model: z.string().optional(),
  modelVersion: z.string().optional(),
})

export const detectionSchema = z.object({
  id: z.string(),
  siteId: z.string(),
  sensorId: z.string(),
  status: detectionStatusSchema,
  severity: detectionSeveritySchema,
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  detectedAt: z.string(),
  lastUpdated: z.string(),
  provenance: detectionProvenanceSchema,
})

export const detectionsListSchema = z.object({
  items: z.array(detectionSchema),
  nextCursor: z.string().nullish(),
})

export const siteSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
})

export const sitesListSchema = z.object({
  items: z.array(siteSchema),
})

export type DetectionStatus = z.infer<typeof detectionStatusSchema>
export type DetectionSeverity = z.infer<typeof detectionSeveritySchema>
export type DetectionProvenance = z.infer<typeof detectionProvenanceSchema>
export type Detection = z.infer<typeof detectionSchema>
export type DetectionsList = z.infer<typeof detectionsListSchema>
export type Site = z.infer<typeof siteSchema>
export type SitesList = z.infer<typeof sitesListSchema>

export interface DetectionFilters {
  site?: string
  severity?: DetectionSeverity
  status?: DetectionStatus
  cursor?: string
}
