<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { isMswEnabled } from '@/api/flags'
import SiteSwitcher from '@/components/layout/SiteSwitcher.vue'
import { useSessionStore } from '@/stores/session'
import { useToastStore } from '@/stores/toasts'

const route = useRoute()
const session = useSessionStore()
const toasts = useToastStore()
const mockApi = isMswEnabled()
const isDev = import.meta.env.DEV

const pageTitle = computed(() => {
  const title = route.meta.title
  return typeof title === 'string' ? title : 'vastion'
})

const densityLabel = computed(() =>
  session.density === 'comfortable' ? 'Compact layout' : 'Comfortable layout',
)

const themeLabel = computed(() => (session.theme === 'dark' ? 'Light theme' : 'Dark theme'))
</script>

<template>
  <header
    data-shell="header"
    class="header flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-6"
  >
    <h1 class="truncate text-base font-semibold text-slate-100">{{ pageTitle }}</h1>
    <div class="flex shrink-0 items-center gap-3">
      <SiteSwitcher />
      <span
        v-if="isDev"
        data-testid="api-mode"
        class="hidden rounded-md border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted sm:inline"
      >
        {{ mockApi ? 'MSW' : 'Live API' }}
      </span>
      <button
        type="button"
        data-testid="density-toggle"
        class="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/60 hover:text-slate-100"
        :title="densityLabel"
        @click="session.toggleDensity()"
      >
        {{ session.density === 'comfortable' ? 'Compact' : 'Comfortable' }}
      </button>
      <button
        type="button"
        data-testid="theme-toggle"
        class="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/60 hover:text-slate-100"
        :title="themeLabel"
        @click="session.toggleTheme()"
      >
        {{ session.theme === 'dark' ? 'Light' : 'Dark' }}
      </button>
      <button
        type="button"
        data-testid="toast-demo"
        class="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/60 hover:text-slate-100"
        @click="toasts.push('Queue synced — detections loaded from API.', 'info')"
      >
        Demo toast
      </button>
      <p class="hidden text-sm text-muted sm:block" data-testid="operator-name">
        {{ session.operatorName }}
      </p>
    </div>
  </header>
</template>
