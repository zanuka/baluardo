import { ofetch } from 'ofetch'
import { getApiBaseUrl } from '@/api/flags'
import { mapFetchError } from '@/api/rest/errors'
import { useSessionStore } from '@/stores/session'

export const restClient = ofetch.create({
  baseURL: getApiBaseUrl(),
  retry: false,
  async onRequest({ options }) {
    const session = useSessionStore()
    const headers = new Headers(options.headers as HeadersInit | undefined)
    headers.set('X-Operator-Role', session.operatorRole)
    headers.set('X-Operator-Name', session.operatorName)
    options.headers = headers
  },
  async onResponseError({ response }) {
    throw mapFetchError({
      status: response.status,
      data: response._data,
    })
  },
})
