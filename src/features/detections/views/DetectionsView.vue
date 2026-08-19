<script setup lang="ts">
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import ForbiddenState from '@/components/ForbiddenState.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { severityRowAccentClasses } from '@/components/ui/severity'
import VirtualizedTable from '@/components/ui/VirtualizedTable.vue'
import DetectionListItem from '@/features/detections/components/DetectionListItem.vue'
import DetectionsFilters from '@/features/detections/components/DetectionsFilters.vue'
import { useDetectionFilters } from '@/features/detections/composables/useDetectionFilters'
import { useDetectionsList } from '@/features/detections/composables/useDetectionsList'
import { detectionRowGridTemplate } from '@/features/detections/constants'
import { computed } from 'vue'

const { items, viewState, reload } = useDetectionsList()
const { filters } = useDetectionFilters()

const columns = [
  { id: 'severity', header: 'Severity', class: 'justify-center' },
  { id: 'summary', header: 'Detection' },
  { id: 'status', header: 'Status', class: 'justify-end' },
  { id: 'confidence', header: 'Confidence', class: 'justify-end' },
]

const detectionRowGrid = detectionRowGridTemplate

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
  <div class="mx-auto max-w-5xl space-y-(--stack-gap)">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-lg font-semibold text-foreground">Triage queue</h2>
        <p class="mt-1 text-sm text-muted">Prioritized detections awaiting operator review.</p>
      </div>
      <DetectionsFilters />
    </div>

    <LoadingState v-if="viewState === 'loading'" />

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

    <VirtualizedTable
      v-else
      :items="items"
      :columns="columns"
      :grid-template-columns="detectionRowGrid"
      :get-row-key="(row) => row.id"
      :get-row-class="(row) => severityRowAccentClasses[row.severity]"
      test-id="detections-list"
    >
      <template #row="{ item }">
        <DetectionListItem :detection="item" />
      </template>
    </VirtualizedTable>
  </div>
</template>
