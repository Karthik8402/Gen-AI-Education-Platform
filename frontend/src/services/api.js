// frontend/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const setToken = (t) => localStorage.setItem('token', t)
export const getToken = () => localStorage.getItem('token')
export const clearToken = () => localStorage.removeItem('token')

// ✅ Base function that works as before (for existing components)
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
    err.response = { status: res.status, data: json }  // ✅ For error handling
    err.data = json
    err.url = url
    throw err
  }

  return json
}

// ✅ Add .get(), .post(), etc. methods to the function (NEW!)
api.get = async (path, config = {}) => {
  const result = await api(path, { method: 'GET', ...config })
  return { data: result }  // Return axios-like response
}

api.post = async (path, body, config = {}) => {
  const result = await api(path, { method: 'POST', body, ...config })
  return { data: result }  // Return axios-like response
}

api.put = async (path, body, config = {}) => {
  const result = await api(path, { method: 'PUT', body, ...config })
  return { data: result }
}

api.delete = async (path, config = {}) => {
  const result = await api(path, { method: 'DELETE', ...config })
  return { data: result }
}

api.patch = async (path, body, config = {}) => {
  const result = await api(path, { method: 'PATCH', body, ...config })
  return { data: result }
}

export function getErrorMessage(err, fallback = 'Something went wrong') {
  if (!err) return fallback
  if (typeof err === 'string') return err
  return err.message || fallback
}

export default api
