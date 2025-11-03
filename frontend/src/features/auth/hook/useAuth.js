// src/hook/useAuth.js
import { useContext, useMemo } from 'react'
import AuthContext from '../context/AuthContext'

/**
 * useAuth
 * - Wraps the AuthContext to keep imports short and add small helpers.
 * - Returns: { user, role, loading, login, register, logout, isLoggedIn, hasRole }
 */
export default function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>')
  }

  const { user, role, loading, login, register, logout } = ctx

  const isLoggedIn = Boolean(user)
  const helpers = useMemo(
    () => ({
      isLoggedIn,
      hasRole: (roles) => {
        if (!roles || roles.length === 0) return true
        return roles.includes(role || 'student')
      },
    }),
    [isLoggedIn, role]
  )

  return { user, role, loading, login, register, logout, ...helpers }
}
