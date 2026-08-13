const MINUTE_MS = 60_000
const HOUR_MS = 3_600_000
const DAY_MS = 86_400_000

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const timestamp = Date.parse(iso)
  if (Number.isNaN(timestamp)) {
    return iso
  }

  const diff = now - timestamp
  const absDiff = Math.abs(diff)
  const suffix = diff >= 0 ? 'ago' : 'from now'

  if (absDiff < MINUTE_MS) {
    return 'just now'
  }
  if (absDiff < HOUR_MS) {
    const minutes = Math.floor(absDiff / MINUTE_MS)
    return `${minutes}m ${suffix}`
  }
  if (absDiff < DAY_MS) {
    const hours = Math.floor(absDiff / HOUR_MS)
    return `${hours}h ${suffix}`
  }
  const days = Math.floor(absDiff / DAY_MS)
  return `${days}d ${suffix}`
}
