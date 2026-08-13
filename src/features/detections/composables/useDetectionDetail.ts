import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchDetection } from '@/api/rest/detections'
import type { Detection } from '@/api/rest/schemas'
import { useAsyncReload } from '@/features/detections/composables/useDetectionFilters'

export function useDetectionDetail() {
  const route = useRoute()
  const detection = ref<Detection | null>(null)

  const detectionId = computed(() => route.params.id as string)

  const { viewState, reload } = useAsyncReload(async () => {
    detection.value = await fetchDetection(detectionId.value)
  })

  const displayState = computed(() => {
    if (viewState.value === 'loading' || viewState.value === 'error' || viewState.value === 'forbidden') {
      return viewState.value
    }
    if (!detection.value) {
      return 'error'
    }
    return 'success'
  })

  function patchDetection(updated: Detection) {
    detection.value = updated
  }

  onMounted(() => {
    reload()
  })

  watch(detectionId, () => {
    detection.value = null
    reload()
  })

  return {
    detection,
    detectionId,
    viewState: displayState,
    reload,
    patchDetection,
  }
}
