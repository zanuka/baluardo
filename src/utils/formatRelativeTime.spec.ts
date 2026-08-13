import { describe, expect, it } from 'vitest'
import { formatRelativeTime } from '@/utils/formatRelativeTime'

describe('formatRelativeTime', () => {
  const now = Date.parse('2026-01-01T12:00:00.000Z')

  it('returns just now for recent timestamps', () => {
    expect(formatRelativeTime('2026-01-01T11:59:30.000Z', now)).toBe('just now')
  })

  it('returns minutes ago', () => {
    expect(formatRelativeTime('2026-01-01T11:45:00.000Z', now)).toBe('15m ago')
  })

  it('returns hours ago', () => {
    expect(formatRelativeTime('2026-01-01T09:00:00.000Z', now)).toBe('3h ago')
  })
})
