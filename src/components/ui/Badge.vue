<script setup lang="ts">
import { badgeVariants } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'severity' | 'status' | 'outline'

const props = withDefaults(
  defineProps<{
    variant?: BadgeVariant
    class?: string
  }>(),
  {
    variant: 'default',
  },
)
</script>

<template>
  <span :class="cn(badgeVariants({ variant: props.variant }), props.class)">
    <slot />
  </span>
</template>
