<script setup lang="ts">
import { Primitive } from 'reka-ui'
import { type ButtonHTMLAttributes, computed } from 'vue'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'ghost' | 'link'
type ButtonSize = 'default' | 'sm' | 'icon'

const props = withDefaults(
  defineProps<{
    as?: string
    type?: ButtonHTMLAttributes['type']
    variant?: ButtonVariant
    size?: ButtonSize
    class?: string
    disabled?: boolean
  }>(),
  {
    as: 'button',
    type: 'button',
    variant: 'default',
    size: 'default',
  },
)

const componentClass = computed(() =>
  cn(buttonVariants({ variant: props.variant, size: props.size }), props.class),
)
</script>

<template>
  <Primitive
    :as="as"
    :type="as === 'button' ? type : undefined"
    :class="componentClass"
    :disabled="disabled"
  >
    <slot />
  </Primitive>
</template>
