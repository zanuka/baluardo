import { describe, expect, it } from 'vitest'
import { useSessionStore } from '@/stores/session'
import { createPinia, setActivePinia } from 'pinia'

describe('useSessionStore', () => {
  it('starts with defaults', () => {
    setActivePinia(createPinia())
    const store = useSessionStore()

    expect(store.operatorName).toBe('Operator')
    expect(store.operatorRole).toBe('analyst')
    expect(store.density).toBe('comfortable')
    expect(store.theme).toBe('dark')
  })

  it('toggles density and theme', () => {
    setActivePinia(createPinia())
    const store = useSessionStore()

    store.toggleDensity()
    expect(store.density).toBe('compact')

    store.toggleTheme()
    expect(store.theme).toBe('light')
  })

  it('updates operator role', () => {
    setActivePinia(createPinia())
    const store = useSessionStore()

    store.setOperatorRole('supervisor')

    expect(store.operatorRole).toBe('supervisor')
    expect(store.isSupervisor).toBe(true)
  })
})
