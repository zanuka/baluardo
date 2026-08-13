import { computed, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RestError } from '@/api/rest/errors'
import {
  detectionSeveritySchema,
  detectionStatusSchema,
  type DetectionSeverity,
  type DetectionStatus,
} from '@/api/rest/schemas'

export interface DetectionFilterValues {
  site: string
  severity: DetectionSeverity | ''
  status: DetectionStatus | ''
}

function readFilterQuery(route: ReturnType<typeof useRoute>): DetectionFilterValues {
  const site = typeof route.query.site === 'string' ? route.query.site : 'all'
  const severityRaw = typeof route.query.severity === 'string' ? route.query.severity : ''
  const statusRaw = typeof route.query.status === 'string' ? route.query.status : ''

  const severity = detectionSeveritySchema.safeParse(severityRaw)
  const status = detectionStatusSchema.safeParse(statusRaw)

  return {
    site,
    severity: severity.success ? severity.data : '',
    status: status.success ? status.data : '',
  }
}

export function useDetectionFilters() {
  const route = useRoute()
  const router = useRouter()

  const filters = computed(() => readFilterQuery(route))

  const apiFilters = computed(() => ({
    site: filters.value.site === 'all' ? undefined : filters.value.site,
    severity: filters.value.severity || undefined,
    status: filters.value.status || undefined,
  }))

  function setFilters(partial: Partial<DetectionFilterValues>) {
    const next = { ...filters.value, ...partial }
    const query: Record<string, string> = {}

    if (next.site && next.site !== 'all') {
      query.site = next.site
    }
    if (next.severity) {
      query.severity = next.severity
    }
    if (next.status) {
      query.status = next.status
    }

    router.replace({ query })
  }

  return {
    filters,
    apiFilters,
    setFilters,
  }
}

export type ViewState = 'idle' | 'loading' | 'success' | 'empty' | 'error' | 'forbidden'

export function resolveListViewState(
  status: Ref<ViewState> | { value: ViewState },
  itemCount: Ref<number> | { value: number },
): ViewState {
  if (status.value === 'loading' || status.value === 'error' || status.value === 'forbidden') {
    return status.value
  }
  if (itemCount.value === 0) {
    return 'empty'
  }
  return 'success'
}

export function useAsyncReload(load: () => Promise<void>) {
  const viewState = ref<ViewState>('idle')

  async function reload() {
    viewState.value = 'loading'
    try {
      await load()
      viewState.value = 'success'
    } catch (error) {
      if (error instanceof RestError && error.kind === 'forbidden') {
        viewState.value = 'forbidden'
      } else {
        viewState.value = 'error'
      }
    }
  }

  return { viewState, reload }
}

export function watchFilters(filters: ReturnType<typeof useDetectionFilters>['apiFilters'], reload: () => void) {
  watch(filters, () => {
    reload()
  })
}
