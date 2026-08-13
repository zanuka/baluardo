<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-lg border border-red-900/40 bg-red-950/20 px-8 py-16 text-center"
    data-testid="error-state"
  >
    <p class="text-lg font-medium text-red-100">{{ title }}</p>
    <p v-if="description" class="mt-2 max-w-md text-sm text-red-200/80">
      {{ description }}
    </p>
    <button
      type="button"
      class="mt-6 rounded-md border border-red-700/60 px-4 py-2 text-sm font-medium text-red-100 transition-colors hover:border-red-500 hover:bg-red-900/30"
      data-testid="error-retry"
      @click="$emit('retry')"
    >
      Try again
    </button>
  </div>
</template>
