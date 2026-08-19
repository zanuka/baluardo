<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { isDevEnvironment, isMswEnabled } from '@/api/flags'
import Button from '@/components/ui/Button.vue'
import SiteSwitcher from '@/components/layout/SiteSwitcher.vue'
import { useSessionStore } from '@/stores/session'
import { useToastStore } from '@/stores/toasts'

const route = useRoute()
const session = useSessionStore()
const toasts = useToastStore()
const mockApi = isMswEnabled()
const isDev = isDevEnvironment()

const pageTitle = computed(() => {
  const title = route.meta.title
  return typeof title === 'string' ? title : 'baluardo'
})

const densityLabel = computed(() =>
  session.density === 'comfortable' ? 'Compact layout' : 'Comfortable layout',
)

const themeLabel = computed(() => {
  if (session.theme === 'dark') {
    return 'Switch to light theme'
  }
  if (session.theme === 'light') {
    return 'Switch to high-contrast theme'
  }
  return 'Switch to dark theme'
})

const themeButtonLabel = computed(() => {
  if (session.theme === 'dark') {
    return 'Light'
  }
  if (session.theme === 'light') {
    return 'High contrast'
  }
  return 'Dark'
})
</script>

<template>
  <header
    data-shell="header"
    class="header flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-(--shell-padding)"
  >
    <h1 class="truncate text-base font-semibold text-foreground">{{ pageTitle }}</h1>
    <div class="flex shrink-0 items-center gap-3">
      <SiteSwitcher />
      <span
        v-if="isDev"
        data-testid="api-mode"
        class="hidden rounded-md border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted sm:inline"
      >
        {{ mockApi ? 'MSW' : 'Live API' }}
      </span>
      <Button
        variant="outline"
        size="sm"
        data-testid="density-toggle"
        :title="densityLabel"
        @click="session.toggleDensity()"
      >
        {{ session.density === 'comfortable' ? 'Compact' : 'Comfortable' }}
      </Button>
      <Button
        variant="outline"
        size="sm"
        data-testid="theme-toggle"
        :title="themeLabel"
        @click="session.cycleTheme()"
      >
        {{ themeButtonLabel }}
      </Button>
      <Button
        variant="outline"
        size="sm"
        data-testid="toast-demo"
        @click="toasts.push('Queue synced — detections loaded from API.', 'info')"
      >
        Demo toast
      </Button>
      <p class="hidden text-sm text-muted sm:block" data-testid="operator-name">
        {{ session.operatorName }}
      </p>
    </div>
  </header>
</template>
