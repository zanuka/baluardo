<script setup lang="ts">
import type { DetectionSeverity, DetectionStatus } from '@/api/rest/schemas'
import { useDetectionFilters } from '@/features/detections/composables/useDetectionFilters'

const { filters, setFilters } = useDetectionFilters()

const severityOptions: { value: DetectionSeverity | ''; label: string }[] = [
  { value: '', label: 'All severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const statusOptions: { value: DetectionStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'acked', label: 'Acknowledged' },
  { value: 'rejected', label: 'Rejected' },
]

const selectClass =
  'rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent'
</script>

<template>
  <div class="flex flex-wrap items-end gap-4" data-testid="detections-filters">
    <label class="flex flex-col gap-1">
      <span class="text-xs font-medium uppercase tracking-wide text-muted">Severity</span>
      <select
        data-testid="filter-severity"
        :class="selectClass"
        :value="filters.severity"
        @change="
          setFilters({
            severity: ($event.target as HTMLSelectElement).value as DetectionSeverity | '',
          })
        "
      >
        <option v-for="option in severityOptions" :key="option.label" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-xs font-medium uppercase tracking-wide text-muted">Status</span>
      <select
        data-testid="filter-status"
        :class="selectClass"
        :value="filters.status"
        @change="
          setFilters({
            status: ($event.target as HTMLSelectElement).value as DetectionStatus | '',
          })
        "
      >
        <option v-for="option in statusOptions" :key="option.label" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>
  </div>
</template>
