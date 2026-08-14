<script setup lang="ts">
import ToastStack from '@/components/ToastStack.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useSessionStore } from '@/stores/session'
import { watchEffect } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const session = useSessionStore()

watchEffect(() => {
  document.documentElement.dataset.theme = session.theme
  document.documentElement.dataset.density = session.density
})

watchEffect(() => {
  const title = typeof route.meta.title === 'string' ? route.meta.title : 'baluardo'
  document.title = `${title} · baluardo`
})
</script>

<template>
  <div
    class="flex min-h-screen bg-surface text-slate-100"
    data-testid="app-shell"
    :data-density="session.density"
    :data-theme="session.theme"
  >
    <AppSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <AppHeader />
      <main class="flex-1 overflow-auto p-6">
        <router-view />
      </main>
    </div>
    <ToastStack />
  </div>
</template>
