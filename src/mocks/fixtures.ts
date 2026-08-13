import type { Detection, Site } from '@/api/rest/schemas'

export const mockSites: Site[] = [
  { id: 'site-alpha', name: 'Sector Alpha', code: 'ALPHA' },
  { id: 'site-beta', name: 'Outpost Beta', code: 'BETA' },
  { id: 'site-gamma', name: 'Relay Gamma', code: 'GAMMA' },
]

const now = Date.now()

function minutesAgo(minutes: number): string {
  return new Date(now - minutes * 60_000).toISOString()
}

const seedDetections: Detection[] = [
  {
    id: 'det-001',
    siteId: 'site-alpha',
    sensorId: 'sen-a1',
    status: 'open',
    severity: 'critical',
    confidence: 0.94,
    summary: 'Anomalous RF burst near perimeter fence',
    detectedAt: minutesAgo(4),
    lastUpdated: minutesAgo(2),
    provenance: {
      sensorId: 'sen-a1',
      sensorName: 'RF Array North',
      model: 'watchdesk-rf',
      modelVersion: '2.1.0',
    },
  },
  {
    id: 'det-002',
    siteId: 'site-alpha',
    sensorId: 'sen-a2',
    status: 'open',
    severity: 'high',
    confidence: 0.81,
    summary: 'Elevated particulate reading — sector 3',
    detectedAt: minutesAgo(18),
    lastUpdated: minutesAgo(12),
    provenance: {
      sensorId: 'sen-a2',
      sensorName: 'Air Quality Node 3',
      model: 'watchdesk-aq',
      modelVersion: '1.4.2',
    },
  },
  {
    id: 'det-003',
    siteId: 'site-beta',
    sensorId: 'sen-b1',
    status: 'open',
    severity: 'medium',
    confidence: 0.67,
    summary: 'Motion cluster detected in restricted zone',
    detectedAt: minutesAgo(35),
    lastUpdated: minutesAgo(30),
    provenance: {
      sensorId: 'sen-b1',
      sensorName: 'Thermal Cam East',
      model: 'watchdesk-thermal',
      modelVersion: '3.0.1',
    },
  },
  {
    id: 'det-004',
    siteId: 'site-beta',
    sensorId: 'sen-b2',
    status: 'acked',
    severity: 'low',
    confidence: 0.52,
    summary: 'Routine acoustic signature — logged',
    detectedAt: minutesAgo(90),
    lastUpdated: minutesAgo(45),
    provenance: {
      sensorId: 'sen-b2',
      sensorName: 'Acoustic Pod 7',
      model: 'watchdesk-acoustic',
      modelVersion: '1.0.0',
    },
  },
  {
    id: 'det-005',
    siteId: 'site-gamma',
    sensorId: 'sen-g1',
    status: 'open',
    severity: 'high',
    confidence: 0.88,
    summary: 'Link degradation on relay uplink',
    detectedAt: minutesAgo(8),
    lastUpdated: minutesAgo(5),
    provenance: {
      sensorId: 'sen-g1',
      sensorName: 'Relay Monitor',
      model: 'watchdesk-net',
      modelVersion: '2.2.0',
    },
  },
  {
    id: 'det-006',
    siteId: 'site-gamma',
    sensorId: 'sen-g2',
    status: 'rejected',
    severity: 'medium',
    confidence: 0.41,
    summary: 'False positive — weather interference',
    detectedAt: minutesAgo(120),
    lastUpdated: minutesAgo(60),
    provenance: {
      sensorId: 'sen-g2',
      sensorName: 'Radar Sweep West',
      model: 'watchdesk-radar',
      modelVersion: '1.8.0',
    },
  },
  {
    id: 'det-forbidden',
    siteId: 'site-alpha',
    sensorId: 'sen-a1',
    status: 'open',
    severity: 'critical',
    confidence: 0.99,
    summary: 'Restricted detection — supervisor clearance required',
    detectedAt: minutesAgo(1),
    lastUpdated: minutesAgo(1),
    provenance: {
      sensorId: 'sen-a1',
      sensorName: 'RF Array North',
      model: 'watchdesk-rf',
      modelVersion: '2.1.0',
    },
  },
]

let detections = seedDetections.map((detection) => ({
  ...detection,
  provenance: { ...detection.provenance },
}))

export function getDetections(): Detection[] {
  return detections.map((detection) => ({
    ...detection,
    provenance: { ...detection.provenance },
  }))
}

export function findDetection(id: string): Detection | undefined {
  const detection = detections.find((item) => item.id === id)
  if (!detection) {
    return undefined
  }
  return { ...detection, provenance: { ...detection.provenance } }
}

export function updateDetection(updated: Detection): void {
  const index = detections.findIndex((item) => item.id === updated.id)
  if (index !== -1) {
    detections[index] = { ...updated, provenance: { ...updated.provenance } }
  }
}

export function resetDetections(): void {
  detections = seedDetections.map((detection) => ({
    ...detection,
    provenance: { ...detection.provenance },
  }))
}
