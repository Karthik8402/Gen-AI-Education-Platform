// src/features/auth/PrivateRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PrivateRoute({ children, roles = [] }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user) {
    // Not authenticated - redirect to login
    return <Navigate to="/login" replace />
  }

  if (roles.length > 0 && !roles.includes(role)) {
    // Authenticated but doesn't have required role
    return <Navigate to="/unauthorized" replace />
  }

  // Authenticated and authorized
  return children
}
