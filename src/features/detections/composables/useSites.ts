import { onMounted, ref } from 'vue'
import { fetchSites } from '@/api/rest/sites'
import type { Site } from '@/api/rest/schemas'

export function useSites() {
  const sites = ref<Site[]>([])
  const isLoading = ref(false)
  const error = ref(false)

  async function load() {
    isLoading.value = true
    error.value = false
    try {
      sites.value = await fetchSites()
    } catch {
      error.value = true
      sites.value = []
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    load()
  })

  return {
    sites,
    isLoading,
    error,
    reload: load,
  }
}
