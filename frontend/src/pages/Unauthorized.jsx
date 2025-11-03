// src/pages/Unauthorized.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext' // ✅ Add theme context
import { ShieldExclamationIcon, HomeIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { AlertCircle, Lock, ArrowLeft, BarChart3 } from 'lucide-react'

export default function Unauthorized() {
  const { user, role } = useAuth()
  const { currentTheme } = useTheme() // ✅ Add theme hook

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
      currentTheme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-md w-full space-y-8">
        {/* Enhanced Card Container */}
        <div className={`rounded-3xl shadow-2xl backdrop-blur-sm border p-8 transition-colors duration-300 ${
          currentTheme === 'dark'
            ? 'bg-gray-800/95 border-gray-700'
            : 'bg-white/95 border-gray-200'
        }`}>
          {/* Icon Section */}
          <div className="text-center mb-8">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
              currentTheme === 'dark'
                ? 'bg-red-900/30 text-red-400'
                : 'bg-red-100 text-red-600'
            }`}>
              <Lock className="w-10 h-10" />
            </div>
            
            <h2 className={`text-3xl font-extrabold mb-4 transition-colors duration-300 ${
              currentTheme === 'dark'
                ? 'bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent'
            }`}>
              Access Denied
            </h2>
            
            <p className={`text-lg mb-4 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              You don't have permission to access this page
            </p>
            
            {user && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors duration-300 ${
                currentTheme === 'dark'
                  ? 'bg-gray-700 text-gray-300 border border-gray-600'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                <AlertCircle className="w-4 h-4" />
                Current role: <span className="font-semibold">{role}</span>
              </div>
            )}
          </div>

          {/* Enhanced Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/dashboard"
              className={`group relative w-full flex items-center justify-center gap-3 py-4 px-6 text-sm font-semibold rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                currentTheme === 'dark'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Go to Dashboard
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
            
            <Link
              to="/"
              className={`group relative w-full flex items-center justify-center gap-3 py-4 px-6 text-sm font-semibold rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
                currentTheme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          {/* Enhanced Info Section */}
          <div className={`mt-8 p-4 rounded-2xl border-l-4 transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-blue-900/20 border-blue-500 text-blue-300'
              : 'bg-blue-50 border-blue-500 text-blue-700'
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Need Access?</h4>
                <p className="text-sm opacity-90">
                  Contact your administrator if you believe this is an error, or try logging in with the correct account.
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced User Info */}
          {user && (
            <div className={`mt-6 p-4 rounded-2xl transition-colors duration-300 ${
              currentTheme === 'dark'
                ? 'bg-gray-700/50'
                : 'bg-gray-50'
            }`}>
              <div className="text-center">
                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Logged in as
                </p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'bg-green-900/30 text-green-300'
                    : 'bg-green-100 text-green-700'
                }`}>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {user.email || 'Unknown User'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer Links */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-6">
            <Link
              to="/login"
              className={`text-sm font-medium transition-colors duration-200 ${
                currentTheme === 'dark'
                  ? 'text-indigo-400 hover:text-indigo-300'
                  : 'text-indigo-600 hover:text-indigo-500'
              }`}
            >
              Switch Account
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors duration-200 ${
                currentTheme === 'dark'
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-600 hover:text-gray-500'
              }`}
            >
              Get Help
            </Link>
          </div>
          
          <p className={`text-xs transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            GenAI Education Platform • Unauthorized Access
          </p>
        </div>
      </div>
    </div>
  )
}
