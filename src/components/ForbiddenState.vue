<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-lg border border-warning-border bg-warning-surface px-8 py-16 text-center"
    data-testid="forbidden-state"
  >
    <p class="text-lg font-medium text-warning-fg">
      {{ title ?? 'Access denied' }}
    </p>
    <p class="mt-2 max-w-md text-sm text-warning-fg/80">
      {{
        description ??
          'You do not have permission to view this queue. Contact a supervisor if you need access.'
      }}
    </p>
  </div>
</template>
