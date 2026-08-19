export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? ''
}

export function isDevEnvironment(): boolean {
  return import.meta.env.DEV
}

export function isMswEnabled(): boolean {
  return isDevEnvironment() && import.meta.env.VITE_USE_MSW === 'true'
}
