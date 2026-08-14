import { computed, onMounted, ref } from 'vue'
import { fetchDetections } from '@/api/rest/detections'
import type { Detection } from '@/api/rest/schemas'
import {
  resolveListViewState,
  useAsyncReload,
  useDetectionFilters,
  watchFilters,
} from '@/features/detections/composables/useDetectionFilters'

export function useDetectionsList() {
  const { apiFilters } = useDetectionFilters()
  const items = ref<Detection[]>([])
  const nextCursor = ref<string | null>(null)

  const { viewState, reload } = useAsyncReload(async () => {
    const result = await fetchDetections(apiFilters.value)
    items.value = result.items
    nextCursor.value = result.nextCursor ?? null
  })

  const itemCount = computed(() => items.value.length)
  const displayState = computed(() => resolveListViewState(viewState, itemCount))

  onMounted(() => {
    reload()
  })

  watchFilters(apiFilters, reload)

  return {
    items,
    nextCursor,
    viewState: displayState,
    reload,
  }
}
