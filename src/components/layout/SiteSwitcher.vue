<script setup lang="ts">
import { computed } from 'vue'
import { useDetectionFilters } from '@/features/detections/composables/useDetectionFilters'
import { useSites } from '@/features/detections/composables/useSites'

const { filters, setFilters } = useDetectionFilters()
const { sites, isLoading } = useSites()

const siteOptions = computed(() => [
  { id: 'all', name: 'All sites' },
  ...sites.value.map((site) => ({ id: site.id, name: site.name })),
])
</script>

<template>
  <label class="flex flex-col gap-1">
    <span class="sr-only">Site</span>
    <select
      data-testid="site-switcher"
      class="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
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
