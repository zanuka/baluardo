<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'degraded' | 'offline' | 'error' | 'warning'
    class?: HTMLAttributes['class']
  }>(),
  {
    variant: 'default',
  },
)

const variantClasses = {
  default: 'border-border bg-surface-raised text-foreground',
  degraded: 'border-data-degraded/60 bg-warning-surface text-warning-fg',
  offline: 'border-data-offline/60 bg-surface-raised text-muted',
  error: 'border-error-border bg-error-surface text-error-fg',
  warning: 'border-warning-border bg-warning-surface text-warning-fg',
}
</script>

<template>
  <div
    role="alert"
    :class="
      cn('rounded-lg border px-4 py-3 text-sm', variantClasses[props.variant], props.class)
    "
  >
    <slot />
  </div>
</template>
