export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? ''
}

export function isMswEnabled(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_USE_MSW === 'true'
}
