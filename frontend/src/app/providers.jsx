import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const PrivateRoute = ({ children, roles }) => {
  const { user, role, loading } = useAuth()
  const location = useLocation()
  
  if (loading) return null
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />
  return children
}

export default PrivateRoute
