import React, { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken, clearToken } from '@/services/api'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) { setLoading(false); return }
    api('/api/auth/me')
      .then(data => {
        // backend returns {"user": {uid, email, role,...}, stats: {...}}
        setUser(data.user)
        setRole(data.user?.role || 'student')
      })
      .catch(() => {
        clearToken()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await api('/api/auth/login', { method: 'POST', body: { email, password } })
    setToken(data.token)
    // data.user includes email, username, role per backend
    setUser({ ...data.user })
    setRole(data.user?.role || 'student')
    return data
  }

  const register = async (username, email, password) => {
    const data = await api('/api/auth/signup', { method: 'POST', body: { username, email, password } })
    setToken(data.token)
    setUser({ ...data.user })
    setRole(data.user?.role || 'student')
    return data
  }

  const logout = () => { clearToken(); setUser(null); setRole('student') }

  return <AuthCtx.Provider value={{ user, role, loading, login, register, logout }}>{children}</AuthCtx.Provider>
}
