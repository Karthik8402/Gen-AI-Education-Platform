// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken, clearToken } from '@/services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null) // ✅ Declare user state
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api('/api/auth/me')
      .then((data) => {
        setUser(data.user) // ✅ Use setUser, not undefined 'user'
        setRole(data.user?.role || 'student')
      })
      .catch(() => {
        clearToken()
        setUser(null)
        setRole('student')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await api('/api/auth/login', { 
      method: 'POST', 
      body: { email, password } 
    })
    setToken(data.token)
    setUser(data.user)
    setRole(data.user?.role || 'student')
    return data
  }

  const register = async (username, email, password) => {
    const data = await api('/api/auth/signup', { 
      method: 'POST', 
      body: { username, email, password } 
    })
    setToken(data.token)
    setUser(data.user)
    setRole(data.user?.role || 'student')
    return data
  }

  const logout = () => {
    clearToken()
    setUser(null)
    setRole('student')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      loading, 
      login, 
      register, 
      logout,
      isAuthenticated: !!user // ✅ Safe derived value
    }}>
      {children}
    </AuthContext.Provider>
  )
}
