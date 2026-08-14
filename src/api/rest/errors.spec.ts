import { describe, expect, it } from 'vitest'
import { RestError, mapFetchError, restErrorMessage } from '@/api/rest/errors'

describe('mapFetchError', () => {
  it('maps 401 to forbidden', () => {
    const error = mapFetchError({
      status: 401,
      data: { detail: 'Operator role header is required.' },
    })
    expect(error.kind).toBe('forbidden')
    expect(error.status).toBe(401)
  })

  it('maps 403 to forbidden', () => {
    const error = mapFetchError({ status: 403, data: { detail: 'No access' } })
    expect(error).toBeInstanceOf(RestError)
    expect(error.kind).toBe('forbidden')
    expect(error.status).toBe(403)
  })

  it('maps 409 to conflict', () => {
    const error = mapFetchError({ status: 409, data: { detail: 'Already handled' } })
    expect(error.kind).toBe('conflict')
  })

  it('maps network failures', () => {
    const error = mapFetchError({ status: 0 })
    expect(error.kind).toBe('network')
  })
})

describe('restErrorMessage', () => {
  it('returns operator-friendly conflict copy', () => {
    const error = new RestError('conflict', 409, 'Conflict')
    expect(restErrorMessage(error)).toContain('cannot be updated')
  })
})
