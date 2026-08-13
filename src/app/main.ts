import { createApp } from 'vue'
import App from '@/app/App.vue'
import { pinia } from '@/app/plugins/pinia'
import { router } from '@/app/router'
import '@/styles/main.css'

async function bootstrap() {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MSW === 'true') {
    const { startMockServiceWorker } = await import('@/mocks/browser')
    await startMockServiceWorker()
  }

  const app = createApp(App)

  app.use(pinia)
  app.use(router)
  app.mount('#app')
}

bootstrap()
