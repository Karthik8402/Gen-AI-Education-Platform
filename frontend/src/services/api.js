// frontend/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const setToken = (t) => localStorage.setItem('token', t) // ✅ Fixed key
export const getToken = () => localStorage.getItem('token')     // ✅ Fixed key
export const clearToken = () => localStorage.removeItem('token') // ✅ Fixed key

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken()
  const url = `${API_URL}${path}`

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let json = null
  try { 
    json = text ? JSON.parse(text) : null 
  } catch (_) {}

  if (!res.ok) {
    let msg = res.statusText || 'Request failed'
    if (json) {
      if (Array.isArray(json.error)) msg = json.error.join(', ')
      else msg = json.error || json.message || msg
    }
    const err = new Error(msg)
    err.status = res.status
    err.data = json
    err.url = url
    throw err
  }

  return json
}

export function getErrorMessage(err, fallback = 'Something went wrong') {
  if (!err) return fallback
  if (typeof err === 'string') return err
  return err.message || fallback
}
