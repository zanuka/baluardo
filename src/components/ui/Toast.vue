<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { ToastVariant } from '@/stores/toasts'
import { type HTMLAttributes } from 'vue'

defineProps<{
  message: string
  variant: ToastVariant
  class?: HTMLAttributes['class']
}>()

defineEmits<{
  dismiss: []
}>()

const variantClasses: Record<ToastVariant, string> = {
  info: 'border-toast-info-border bg-toast-info-bg text-toast-info-fg',
  success: 'border-toast-success-border bg-toast-success-bg text-toast-success-fg',
  warning: 'border-toast-warning-border bg-toast-warning-bg text-toast-warning-fg',
  error: 'border-toast-error-border bg-toast-error-bg text-toast-error-fg',
}
</script>

<template>
  <div
    class="pointer-events-auto flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-(--shadow-overlay)"
    :class="cn(variantClasses[variant], $props.class)"
    :data-testid="`toast-${variant}`"
  >
    <p class="flex-1 text-sm">{{ message }}</p>
    <button
      type="button"
      class="shrink-0 text-xs text-muted hover:text-foreground"
      :aria-label="`Dismiss: ${message}`"
      @click="$emit('dismiss')"
    >
      Dismiss
    </button>
  </div>
</template>
