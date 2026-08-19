<script setup lang="ts">
import type { DetectionStatus } from '@/api/rest/schemas'
import { badgeVariants } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const props = defineProps<{
  status: DetectionStatus
  class?: string
}>()
</script>

<template>
  <span :class="cn(badgeVariants({ variant: 'status', status: props.status }), 'capitalize', props.class)">
    {{ status }}
  </span>
</template>
