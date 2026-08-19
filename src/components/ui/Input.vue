<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

const modelValue = defineModel<string | number>()

const props = withDefaults(
  defineProps<{
    mono?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    mono: false,
  },
)

const inputClass = computed(() =>
  cn(
    'flex h-[var(--control-height)] w-full rounded-md border border-border bg-surface px-[calc(var(--space-3)*var(--density-scale))] text-sm text-foreground placeholder:text-muted focus-visible:border-accent focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50',
    props.mono && 'font-mono',
    props.class,
  ),
)
</script>

<template>
  <input v-model="modelValue" :class="inputClass" />
</template>
