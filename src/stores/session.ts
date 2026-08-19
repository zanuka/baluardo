import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { appThemes, type TokenDensity, type TokenTheme } from '@/styles/tokens'

export type AppDensity = TokenDensity
export type AppTheme = TokenTheme
export type OperatorRole = 'analyst' | 'supervisor'

export const useSessionStore = defineStore('session', () => {
  const operatorName = ref('Operator')
  const operatorRole = ref<OperatorRole>('analyst')
  const density = ref<AppDensity>('comfortable')
  const theme = ref<AppTheme>('dark')

  const isSupervisor = computed(() => operatorRole.value === 'supervisor')

  function setDensity(value: AppDensity) {
    density.value = value
  }

  function setTheme(value: AppTheme) {
    theme.value = value
  }

  function toggleDensity() {
    density.value = density.value === 'comfortable' ? 'compact' : 'comfortable'
  }

  function cycleTheme() {
    const index = appThemes.indexOf(theme.value)
    theme.value = appThemes[(index + 1) % appThemes.length] ?? 'dark'
  }

  function toggleTheme() {
    cycleTheme()
  }

  function setOperatorRole(role: OperatorRole) {
    operatorRole.value = role
  }

  return {
    operatorName,
    operatorRole,
    isSupervisor,
    density,
    theme,
    setDensity,
    setTheme,
    toggleDensity,
    toggleTheme,
    cycleTheme,
    setOperatorRole,
  }
})
