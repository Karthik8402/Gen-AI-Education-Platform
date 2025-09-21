// src/services/utils/helpers.js

// 1) Dates and times (lightweight)
// Format: 2025-08-27T13:45:00Z -> "27 Aug 2025, 7:15 PM"
export function formatDate(iso, locale = 'en-IN', options) {
  if (!iso) return ''
  try {
    const date = typeof iso === 'string' ? new Date(iso) : iso
    return new Intl.DateTimeFormat(locale, options || {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    }).format(date)
  } catch {
    return ''
  }
}

// 2) Numbers
export function formatNumber(n, locale = 'en-IN') {
  if (n == null || isNaN(n)) return '0'
  return new Intl.NumberFormat(locale).format(n)
}

export function formatPercent(value, digits = 0, locale = 'en-IN') {
  if (value == null || isNaN(value)) return '0%'
  return new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: digits, maximumFractionDigits: digits })
    .format(value)
}

// 3) Strings
export function capitalize(s = '') {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
}

// Truncate to a max length and append ellipsis
export function truncate(s = '', max = 80) {
  if (!s) return ''
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

// 4) Tailwind class merging (tiny clsx-like)
export function cn(...args) {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// 5) Safe JSON helpers
export function tryParseJSON(str, fallback = null) {
  try { return JSON.parse(str) } catch { return fallback }
}

export function safeJSONStringify(obj, space = 0) {
  try { return JSON.stringify(obj, null, space) } catch { return '' }
}

// 6) URL and query
export function buildQuery(params = {}) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v == null) return
    if (Array.isArray(v)) v.forEach(val => sp.append(k, String(val)))
    else sp.set(k, String(v))
  })
  return sp.toString()
}

// 7) Token helpers (optional if not using src/lib/api directly)
const TOKEN_KEY = 'access_token'
export const token = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

// 8) Guard helpers
export function hasRole(userRole, allowed = []) {
  if (!allowed || allowed.length === 0) return true
  return allowed.includes(userRole || 'student')
}

// 9) Misc utils
export const sleep = (ms) => new Promise(res => setTimeout(res, ms))

// Clamp a number between min and max
export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max)
}
