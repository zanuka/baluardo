<script setup lang="ts">
import { type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <thead :class="cn('border-b border-border [&_tr]:border-0', $props.class)">
    <slot />
  </thead>
</template>
