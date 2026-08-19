<script setup lang="ts">
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { staleThresholdMs } from '@/styles/tokens'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  timestamp: string
}>()

const relative = computed(() => formatRelativeTime(props.timestamp))

const isStale = computed(() => {
  const parsed = Date.parse(props.timestamp)
  if (Number.isNaN(parsed)) {
    return false
  }
  return Date.now() - parsed > staleThresholdMs
})

const isUnknown = computed(() => Number.isNaN(Date.parse(props.timestamp)))
</script>

<template>
  <span
    :class="
      cn(
        'text-xs',
        isUnknown && 'text-freshness-unknown',
        isStale && 'font-medium text-freshness-stale',
        !isUnknown && !isStale && 'text-muted',
      )
    "
    :title="timestamp"
  >
    <template v-if="isUnknown">—</template>
    <template v-else-if="isStale">Stale · {{ relative }}</template>
    <template v-else>{{ relative }}</template>
  </span>
</template>
