<script setup lang="ts">
import { computed } from 'vue'
import Label from '@/components/ui/Label.vue'
import { useDetectionFilters } from '@/features/detections/composables/useDetectionFilters'
import { useSites } from '@/features/detections/composables/useSites'
import { cn } from '@/lib/utils'

const { filters, setFilters } = useDetectionFilters()
const { sites, isLoading } = useSites()

const siteOptions = computed(() => [
  { id: 'all', name: 'All sites' },
  ...sites.value.map((site) => ({ id: site.id, name: site.name })),
])

const selectClass = cn(
  'h-[var(--control-height)] rounded-md border border-border bg-surface px-[calc(var(--space-3)*var(--density-scale))] text-sm text-foreground focus-visible:border-accent focus-visible:focus-ring disabled:opacity-50',
)
</script>

<template>
  <label class="flex flex-col gap-1">
    <Label class="sr-only">Site</Label>
    <select
      data-testid="site-switcher"
      :class="selectClass"
      :value="filters.site"
      :disabled="isLoading"
      @change="setFilters({ site: ($event.target as HTMLSelectElement).value })"
    >
      <option v-for="site in siteOptions" :key="site.id" :value="site.id">
        {{ site.name }}
      </option>
    </select>
  </label>
</template>
