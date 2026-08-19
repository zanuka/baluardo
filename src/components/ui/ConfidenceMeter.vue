<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  confidence: number
}>()

const percent = computed(() => Math.round(props.confidence * 100))

const level = computed(() => {
  if (props.confidence >= 0.8) {
    return 'high'
  }
  if (props.confidence >= 0.5) {
    return 'mid'
  }
  return 'low'
})

const fillClass = computed(() => {
  if (level.value === 'high') {
    return 'bg-confidence-high'
  }
  if (level.value === 'mid') {
    return 'bg-confidence-mid'
  }
  return 'bg-confidence-low'
})
</script>

<template>
  <div
    class="flex min-w-14 flex-col items-end gap-1"
    role="meter"
    :aria-valuenow="percent"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="`Confidence ${percent} percent`"
  >
    <span class="tabular-nums text-xs font-medium text-foreground">{{ percent }}%</span>
    <div class="h-1.5 w-full overflow-hidden rounded-full bg-surface">
      <div
        :class="cn('h-full rounded-full transition-all', fillClass)"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>
