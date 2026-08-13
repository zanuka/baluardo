import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

const AUTO_DISMISS_MS = 5000

export const useToastStore = defineStore('toasts', () => {
  const items = ref<Toast[]>([])
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  function dismiss(id: string) {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    items.value = items.value.filter((toast) => toast.id !== id)
  }

  function push(message: string, variant: ToastVariant = 'info') {
    const id = crypto.randomUUID()
    items.value.push({ id, message, variant })

    const timer = setTimeout(() => {
      dismiss(id)
    }, AUTO_DISMISS_MS)
    timers.set(id, timer)
  }

  return {
    items,
    push,
    dismiss,
  }
})
