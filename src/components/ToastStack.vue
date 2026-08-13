<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToastStore, type ToastVariant } from '@/stores/toasts'

const toastStore = useToastStore()
const { items } = storeToRefs(toastStore)

const variantClasses: Record<ToastVariant, string> = {
  info: 'border-border bg-surface-raised text-slate-100',
  success: 'border-emerald-700/60 bg-emerald-950/80 text-emerald-100',
  warning: 'border-amber-700/60 bg-amber-950/80 text-amber-100',
  error: 'border-red-700/60 bg-red-950/80 text-red-100',
}
</script>

<template>
  <div
    aria-live="polite"
    class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-end gap-2 p-4"
    data-testid="toast-stack"
  >
    <div
      v-for="toast in items"
      :key="toast.id"
      class="pointer-events-auto flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg"
      :class="variantClasses[toast.variant]"
      :data-testid="`toast-${toast.variant}`"
    >
      <p class="flex-1 text-sm">{{ toast.message }}</p>
      <button
        type="button"
        class="shrink-0 text-xs text-muted hover:text-slate-100"
        :aria-label="`Dismiss: ${toast.message}`"
        @click="toastStore.dismiss(toast.id)"
      >
        Dismiss
      </button>
    </div>
  </div>
</template>
