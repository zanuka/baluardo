<script setup lang="ts">
import type { DetectionSeverity } from '@/api/rest/schemas'
import { badgeVariants } from '@/components/ui/badge'
import { severityIcons } from '@/components/ui/severity'
import { cn } from '@/lib/utils'
import { severityShortLabels } from '@/styles/tokens'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    severity: DetectionSeverity
    showLabel?: boolean
    class?: string
  }>(),
  {
    showLabel: true,
  },
)

const label = computed(() =>
  props.showLabel ? severityShortLabels[props.severity] : props.severity,
)

const Icon = computed(() => severityIcons[props.severity])
</script>

<template>
  <span
    :class="cn(badgeVariants({ variant: 'severity', severity: props.severity }), props.class)"
    :aria-label="`Severity: ${label}`"
  >
    <component :is="Icon" class="size-3 shrink-0" aria-hidden="true" />
    <span v-if="showLabel">{{ label }}</span>
  </span>
</template>
