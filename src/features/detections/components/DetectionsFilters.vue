<script setup lang="ts">
import type { DetectionSeverity, DetectionStatus } from '@/api/rest/schemas'
import Label from '@/components/ui/Label.vue'
import { useDetectionFilters } from '@/features/detections/composables/useDetectionFilters'
import { cn } from '@/lib/utils'

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

const selectClass = cn(
  'h-[var(--control-height)] rounded-md border border-border bg-surface px-[calc(var(--space-3)*var(--density-scale))] text-sm text-foreground focus-visible:border-accent focus-visible:focus-ring',
)
</script>

<template>
  <div class="flex flex-wrap items-end gap-(--stack-gap)" data-testid="detections-filters">
    <label class="flex flex-col gap-1">
      <Label>Severity</Label>
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
      <Label>Status</Label>
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
