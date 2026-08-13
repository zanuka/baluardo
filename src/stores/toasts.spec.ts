import { describe, expect, it, vi } from 'vitest'
import { useToastStore } from '@/stores/toasts'
import { createPinia, setActivePinia } from 'pinia'

describe('useToastStore', () => {
  it('pushes and dismisses toasts', () => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    const store = useToastStore()

    store.push('Queue synced', 'success')

    expect(store.items).toHaveLength(1)
    expect(store.items[0].message).toBe('Queue synced')
    expect(store.items[0].variant).toBe('success')

    const id = store.items[0].id
    store.dismiss(id)

    expect(store.items).toHaveLength(0)
    vi.useRealTimers()
  })

  it('auto-dismisses after a delay', () => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    const store = useToastStore()

    store.push('Stale feed', 'warning')
    expect(store.items).toHaveLength(1)

    vi.advanceTimersByTime(5000)

    expect(store.items).toHaveLength(0)
    vi.useRealTimers()
  })
})
