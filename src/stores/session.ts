import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type AppDensity = 'comfortable' | 'compact'
export type AppTheme = 'dark' | 'light'
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

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
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
    setOperatorRole,
  }
})
