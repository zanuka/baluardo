<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <th
    :class="
      cn(
        'h-(--table-row-height) px-[calc(var(--space-3)*var(--density-scale))] text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted',
        $props.class,
      )
    "
  >
    <slot />
  </th>
</template>
