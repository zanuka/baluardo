<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const navItems = [{ label: 'Detections', to: '/detections' }]
</script>

<template>
  <aside
    class="flex w-56 shrink-0 flex-col border-r border-border bg-surface-raised"
    aria-label="Primary navigation"
  >
    <div class="border-b border-border px-4 py-5">
      <p class="text-xs font-semibold uppercase tracking-wider text-muted">com-scan</p>
      <p class="mt-1 text-sm font-medium text-slate-100">Watchdesk</p>
    </div>
    <nav class="flex flex-1 flex-col gap-1 p-3">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="rounded-md px-3 py-2 text-sm font-medium transition-colors"
        :class="
          route.path.startsWith(item.to)
            ? 'bg-accent/20 text-blue-200'
            : 'text-muted hover:bg-surface hover:text-slate-100'
        "
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
