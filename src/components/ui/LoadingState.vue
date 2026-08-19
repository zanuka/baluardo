<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    rows?: number
  }>(),
  {
    rows: 5,
  },
)

const skeletonRows = computed(() => Array.from({ length: props.rows }, (_, index) => index))
</script>

<template>
  <div class="space-y-2" data-testid="loading-state">
    <div
      v-for="row in skeletonRows"
      :key="row"
      class="animate-pulse rounded-lg border border-border bg-surface-raised"
      :style="{ height: 'var(--table-row-height)' }"
    />
  </div>
</template>
