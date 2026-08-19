<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-raised px-8 py-16 text-center"
    data-testid="empty-state"
  >
    <p class="text-lg font-medium text-foreground">{{ title }}</p>
    <p v-if="description" class="mt-2 max-w-md text-sm text-muted">
      {{ description }}
    </p>
  </div>
</template>
