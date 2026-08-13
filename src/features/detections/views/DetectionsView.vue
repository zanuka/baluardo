<script setup lang="ts">
import { computed } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import ForbiddenState from '@/components/ForbiddenState.vue'
import DetectionsFilters from '@/features/detections/components/DetectionsFilters.vue'
import DetectionListItem from '@/features/detections/components/DetectionListItem.vue'
import { useDetectionFilters } from '@/features/detections/composables/useDetectionFilters'
import { useDetectionsList } from '@/features/detections/composables/useDetectionsList'

const { items, viewState, reload } = useDetectionsList()
const { filters } = useDetectionFilters()

const emptyDescription = computed(() => {
  const parts: string[] = []
  if (filters.value.site !== 'all') {
    parts.push('site filter')
  }
  if (filters.value.severity) {
    parts.push('severity filter')
  }
  if (filters.value.status) {
    parts.push('status filter')
  }
  if (parts.length === 0) {
    return 'When sensors report new readings, prioritized detections will appear here for triage.'
  }
  return `No detections match the current ${parts.join(' and ')}. Try clearing filters.`
})
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-lg font-semibold text-slate-100">Triage queue</h2>
        <p class="mt-1 text-sm text-muted">Prioritized detections awaiting operator review.</p>
      </div>
      <DetectionsFilters />
    </div>

    <div
      v-if="viewState === 'loading'"
      class="flex items-center justify-center rounded-lg border border-border bg-surface-raised py-16"
      data-testid="loading-state"
    >
      <p class="text-sm text-muted">Loading detections…</p>
    </div>

    <ForbiddenState v-else-if="viewState === 'forbidden'" />

    <ErrorState
      v-else-if="viewState === 'error'"
      title="Could not load detections"
      description="The queue is unavailable right now. Check the API connection and try again."
      @retry="reload"
    />

    <EmptyState
      v-else-if="viewState === 'empty'"
      title="No detections in queue"
      :description="emptyDescription"
    />

    <ul v-else class="space-y-2" data-testid="detections-list">
      <li v-for="detection in items" :key="detection.id">
        <DetectionListItem :detection="detection" />
      </li>
    </ul>
  </div>
</template>
