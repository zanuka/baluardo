<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Detection } from '@/api/rest/schemas'
import { detectionRowGridTemplate } from '@/features/detections/constants'
import ConfidenceMeter from '@/components/ui/ConfidenceMeter.vue'
import FreshnessIndicator from '@/components/ui/FreshnessIndicator.vue'
import ProvenanceChip from '@/components/ui/ProvenanceChip.vue'
import SeverityIndicator from '@/components/ui/SeverityIndicator.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

defineProps<{
  detection: Detection
}>()
</script>

<template>
  <RouterLink
    :to="`/detections/${detection.id}`"
    class="grid h-full w-full items-center gap-[calc(var(--space-3)*var(--density-scale))] px-[calc(var(--space-3)*var(--density-scale))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring"
    :style="{ gridTemplateColumns: detectionRowGridTemplate }"
    data-testid="detection-row-link"
  >
    <div class="flex justify-center">
      <SeverityIndicator :severity="detection.severity" />
    </div>
    <div class="min-w-0">
      <p class="truncate text-sm font-medium text-foreground">{{ detection.summary }}</p>
      <div class="mt-0.5 flex flex-wrap items-center gap-2">
        <ProvenanceChip
          :sensor-id="detection.sensorId"
          :sensor-name="detection.provenance.sensorName"
        />
        <FreshnessIndicator :timestamp="detection.detectedAt" />
      </div>
    </div>
    <div class="flex justify-end">
      <StatusBadge :status="detection.status" />
    </div>
    <div class="flex justify-end">
      <ConfidenceMeter :confidence="detection.confidence" />
    </div>
  </RouterLink>
</template>
