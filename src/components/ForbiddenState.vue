<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-lg border border-amber-900/40 bg-amber-950/20 px-8 py-16 text-center"
    data-testid="forbidden-state"
  >
    <p class="text-lg font-medium text-amber-100">
      {{ title ?? 'Access denied' }}
    </p>
    <p class="mt-2 max-w-md text-sm text-amber-200/80">
      {{
        description ??
          'You do not have permission to view this queue. Contact a supervisor if you need access.'
      }}
    </p>
  </div>
</template>
