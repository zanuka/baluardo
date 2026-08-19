<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  sensorName?: string
  sensorId: string
  degraded?: boolean
}>()

const label = computed(() => props.sensorName ?? props.sensorId)
</script>

<template>
  <span
    class="inline-flex max-w-48 items-center gap-1 truncate rounded-sm bg-surface px-1.5 py-0.5 text-xs text-muted"
    :title="label"
  >
    <span v-if="degraded" class="text-data-degraded" aria-hidden="true">⚠</span>
    <span class="truncate">{{ label }}</span>
  </span>
</template>
