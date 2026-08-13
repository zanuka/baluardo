<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Detection } from '@/api/rest/schemas'
import { formatRelativeTime } from '@/utils/formatRelativeTime'

defineProps<{
  detection: Detection
}>()

const severityClasses: Record<Detection['severity'], string> = {
  critical: 'bg-red-900/50 text-red-200 ring-red-700/50',
  high: 'bg-orange-900/40 text-orange-200 ring-orange-700/50',
  medium: 'bg-amber-900/40 text-amber-200 ring-amber-700/50',
  low: 'bg-slate-700/50 text-slate-300 ring-slate-600/50',
}

const statusClasses: Record<Detection['status'], string> = {
  open: 'text-blue-200',
  acked: 'text-emerald-300',
  rejected: 'text-muted line-through',
}
</script>

<template>
  <RouterLink
    :to="`/detections/${detection.id}`"
    class="flex items-start gap-4 rounded-lg border border-border bg-surface-raised px-4 py-3 transition-colors hover:border-accent/40 hover:bg-surface"
    data-testid="detection-row"
  >
    <span
      class="mt-0.5 inline-flex shrink-0 rounded px-2 py-0.5 text-xs font-semibold uppercase ring-1 ring-inset"
      :class="severityClasses[detection.severity]"
    >
      {{ detection.severity }}
    </span>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-slate-100">{{ detection.summary }}</p>
      <p class="mt-1 text-xs text-muted">
        {{ detection.provenance.sensorName ?? detection.sensorId }}
        · {{ formatRelativeTime(detection.detectedAt) }}
      </p>
    </div>
    <div class="shrink-0 text-right">
      <p class="text-xs font-medium capitalize" :class="statusClasses[detection.status]">
        {{ detection.status }}
      </p>
      <p class="mt-1 text-xs text-muted">{{ Math.round(detection.confidence * 100) }}%</p>
    </div>
  </RouterLink>
</template>
