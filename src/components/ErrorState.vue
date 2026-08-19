<script setup lang="ts">
import Button from '@/components/ui/Button.vue'

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
    class="flex flex-col items-center justify-center rounded-lg border border-error-border bg-error-surface px-8 py-16 text-center"
    data-testid="error-state"
  >
    <p class="text-lg font-medium text-error-fg">{{ title }}</p>
    <p v-if="description" class="mt-2 max-w-md text-sm text-error-fg/80">
      {{ description }}
    </p>
    <Button
      variant="outline"
      class="mt-6 border-error-border text-error-fg hover:bg-error-surface"
      data-testid="error-retry"
      @click="$emit('retry')"
    >
      Try again
    </Button>
  </div>
</template>
