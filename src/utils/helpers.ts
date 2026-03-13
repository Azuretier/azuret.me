/* ── Helper Utilities ──────────────────────────────────────── */

const AVATAR_COLORS = [
  '#5b6ee1', '#8b5cf6', '#1d9bf0', '#10b981',
  '#f59e0b', '#f43f5e', '#ec4899', '#6366f1',
]

/**
 * Deterministic avatar colour from a name string.
 */
export function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/**
 * Human-readable relative time string.
 */
export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr + 'Z').getTime()
  const diff = Math.max(0, now - then)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

const DATE_LOCALES: Record<string, string> = {
  en: 'en-US',
  ja: 'ja-JP',
  th: 'th-TH',
  es: 'es-ES',
}

/**
 * Locale-aware date formatting.
 */
export function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr + 'Z').toLocaleDateString(DATE_LOCALES[locale] || 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
