<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <td
    :class="
      cn(
        'h-(--table-row-height) px-[calc(var(--space-3)*var(--density-scale))] align-middle text-foreground',
        $props.class,
      )
    "
  >
    <slot />
  </td>
</template>
