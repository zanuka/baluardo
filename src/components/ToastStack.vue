<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Toast from '@/components/ui/Toast.vue'
import { useToastStore } from '@/stores/toasts'

const toastStore = useToastStore()
const { items } = storeToRefs(toastStore)
</script>

<template>
  <div
    aria-live="polite"
    class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-end gap-2 p-4"
    data-testid="toast-stack"
  >
    <Toast
      v-for="toast in items"
      :key="toast.id"
      :message="toast.message"
      :variant="toast.variant"
      @dismiss="toastStore.dismiss(toast.id)"
    />
  </div>
</template>
