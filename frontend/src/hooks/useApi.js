// src/hooks/useApi.js
import { useCallback, useMemo, useState } from 'react'
import { api } from '@/services/api'

/**
 * useApi
 * - Simple fetch helper wrapped in React state for pending/error/data.
 * - Usage A (imperative):
 *     const { get, post, pending, error } = useApi()
 *     const data = await get('/api/analytics/overview')
 * - Usage B (one-shot on mount):
 *     const { data, pending, error, refetch } = useApi('/api/analytics/overview')
 */
export default function useApi(initialPath = null, initialOptions = null) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)

  const run = useCallback(async (path, opts = {}) => {
    setPending(true)
    setError(null)
    try {
      const res = await api(path, opts)
      setData(res)
      return res
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setPending(false)
    }
  }, [])

  const get = useCallback((path, options = {}) => {
    return run(path, { ...options, method: 'GET' })
  }, [run])

  const post = useCallback((path, body, options = {}) => {
    return run(path, { ...options, method: 'POST', body })
  }, [run])

  const put = useCallback((path, body, options = {}) => {
    return run(path, { ...options, method: 'PUT', body })
  }, [run])

  const del = useCallback((path, options = {}) => {
    return run(path, { ...options, method: 'DELETE' })
  }, [run])

  const refetch = useCallback(async () => {
    if (!initialPath) return null
    return run(initialPath, initialOptions || { method: 'GET' })
  }, [initialPath, initialOptions, run])

  // Auto-run if initialPath provided and caller calls refetch in useEffect.
  // Keeping auto-run out avoids surprise requests. Call refetch() manually.

  return useMemo(
    () => ({ data, error, pending, get, post, put, del, refetch }),
    [data, error, pending, get, post, put, del, refetch]
  )
}
