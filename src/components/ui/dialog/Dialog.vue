<script setup lang="ts">
import { DialogRoot, type DialogRootEmits, type DialogRootProps, useForwardPropsEmits } from 'reka-ui'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<Omit<DialogRootProps, 'open'>>()
const emits = defineEmits<DialogRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DialogRoot v-model:open="open" v-bind="forwarded">
    <slot />
  </DialogRoot>
</template>
