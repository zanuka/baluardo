import { ofetch } from 'ofetch'
import { mapFetchError } from '@/api/rest/errors'
import { useSessionStore } from '@/stores/session'

const baseURL = import.meta.env.VITE_API_URL ?? ''

export const restClient = ofetch.create({
  baseURL,
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

export function getApiBaseUrl(): string {
  return baseURL
}
