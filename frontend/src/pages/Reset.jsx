import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext' // ✅ Add theme context
import { api } from '@/services/api'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Brain,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader,
  Shield,
  Key,
  Clock,
  ArrowLeft,
  RefreshCw,
  Info
} from 'lucide-react'

const Reset = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentTheme } = useTheme() // ✅ Add theme hook
  const [step, setStep] = useState('request') // 'request', 'sent', 'reset'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [email, setEmail] = useState('')
  const [countdown, setCountdown] = useState(0)
  
  // Reset password form state
  const [resetForm, setResetForm] = useState({
    token: '',
    password: '',
    confirmPassword: ''
  })
  const [showPwd, setShowPwd] = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Check if we have a reset token in the URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const token = urlParams.get('token')
    if (token) {
      setStep('reset')
      setResetForm(prev => ({ ...prev, token }))
    }
  }, [location])

  // Countdown timer for resend functionality
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const getPasswordStrengthText = (strength) => {
    const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    return levels[strength] || 'Very Weak'
  }

  const getPasswordStrengthColor = (strength) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
    return colors[strength] || 'bg-gray-200'
  }

  // Request password reset
  const handleRequestReset = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await api('/api/auth/request-reset', {
        method: 'POST',
        body: { email: email.trim() }
      })
      
      setStep('sent')
      setCountdown(60) // 60 second cooldown before resend
      setSuccess(`Reset instructions sent to ${email}`)
    } catch (err) {
      // Enhanced error handling for development
      if (err.response?.status === 404) {
        setError('No account found with this email address')
      } else if (err.response?.status === 429) {
        setError('Too many reset requests. Please wait before trying again.')
      } else {
        setError(err.message || 'Failed to send reset email. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Reset password with token
  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (!resetForm.password || !resetForm.confirmPassword) {
      setError('Please fill in all fields')
      return
    }
    
    if (resetForm.password !== resetForm.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (resetForm.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (passwordStrength < 2) {
      setError('Password is too weak. Please include uppercase, lowercase, numbers, or symbols.')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await api('/api/auth/reset-password', {
        method: 'POST',
        body: {
          token: resetForm.token,
          password: resetForm.password
        }
      })
      
      setSuccess('Password successfully reset! You can now sign in with your new password.')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password reset successful! Please sign in with your new password.' }
        })
      }, 3000)
      
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Invalid or expired reset token. Please request a new password reset.')
      } else if (err.response?.status === 404) {
        setError('Reset token not found. Please request a new password reset.')
      } else {
        setError(err.message || 'Failed to reset password. The link may have expired.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (countdown > 0) return
    
    setCountdown(60)
    setError('')
    try {
      await api('/api/auth/request-reset', {
        method: 'POST',
        body: { email }
      })
      setSuccess('Reset email sent again!')
    } catch (err) {
      setError('Failed to resend email. Please try again.')
    }
  }

  const onResetFormChange = (e) => {
    const { name, value } = e.target
    setResetForm(prev => ({ ...prev, [name]: value }))
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
    
    // Clear errors when user starts typing
    if (error) setError('')
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-6 transition-colors duration-300 ${
      currentTheme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-md w-full">
        
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            {step === 'reset' ? <Key className="w-8 h-8 text-white" /> : <Brain className="w-8 h-8 text-white" />}
          </div>
          <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent'
              : 'text-gray-900'
          }`}>
            {step === 'request' && 'Reset Password'}
            {step === 'sent' && 'Check Your Email'}
            {step === 'reset' && 'Create New Password'}
          </h1>
          <p className={`transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {step === 'request' && 'Enter your email address and we\'ll send you a reset link'}
            {step === 'sent' && 'We\'ve sent password reset instructions to your email'}
            {step === 'reset' && 'Enter your new password below'}
          </p>
        </div>

        {/* Enhanced Form Card */}
        <div className={`rounded-3xl border shadow-xl p-8 backdrop-blur-sm transition-colors duration-300 ${
          currentTheme === 'dark'
            ? 'bg-gray-800/95 border-gray-700'
            : 'bg-white/95 border-gray-200'
        }`}>
          
          {/* Enhanced Success Message */}
          {success && (
            <div className={`flex items-start p-4 border-l-4 border-green-400 rounded-lg mb-6 ${
              currentTheme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
            }`}>
              <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  currentTheme === 'dark' ? 'text-green-300' : 'text-green-700'
                }`}>{success}</p>
              </div>
              {step !== 'reset' && (
                <button
                  onClick={clearMessages}
                  className={`ml-2 ${
                    currentTheme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'
                  }`}
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* Enhanced Error Message */}
          {error && (
            <div className={`flex items-start p-4 border-l-4 border-red-400 rounded-lg mb-6 ${
              currentTheme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
            }`}>
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  currentTheme === 'dark' ? 'text-red-300' : 'text-red-700'
                }`}>{error}</p>
              </div>
              <button
                onClick={clearMessages}
                className={`ml-2 ${
                  currentTheme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'
                }`}
              >
                ×
              </button>
            </div>
          )}

          {/* Step 1: Request Reset */}
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div>
                <label htmlFor="email" className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError('')
                    }}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                      currentTheme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-gray-600'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500'
                    } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {loading && <Loader className="w-5 h-5 mr-2 animate-spin" />}
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
              </button>
            </form>
          )}

          {/* Step 2: Enhanced Email Sent */}
          {step === 'sent' && (
            <div className="text-center space-y-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                currentTheme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'
              }`}>
                <Mail className={`w-10 h-10 ${
                  currentTheme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
              
              <div>
                <p className={`mb-4 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  We've sent password reset instructions to:
                </p>
                <p className={`font-semibold px-4 py-2 rounded-lg transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'text-indigo-300 bg-indigo-900/30'
                    : 'text-indigo-600 bg-indigo-50'
                }`}>
                  {email}
                </p>
              </div>

              <div className={`border rounded-lg p-4 transition-colors duration-300 ${
                currentTheme === 'dark'
                  ? 'bg-blue-900/20 border-blue-700'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start">
                  <Clock className={`w-5 h-5 mr-2 mt-0.5 shrink-0 ${
                    currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <div className={`text-sm ${
                    currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    <p className="font-medium mb-1">Didn't receive the email?</p>
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li>Check your spam/junk folder</li>
                      <li>Make sure the email address is correct</li>
                      <li>The link expires in 24 hours</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handleResendEmail}
                disabled={countdown > 0}
                className={`w-full flex items-center justify-center px-6 py-3 border-2 rounded-xl font-medium transition-all ${
                  countdown > 0 
                    ? 'opacity-50 cursor-not-allowed'
                    : 'transform hover:scale-105'
                } ${
                  currentTheme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${countdown > 0 ? 'animate-spin' : ''}`} />
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
              </button>
            </div>
          )}

          {/* Step 3: Enhanced Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="password" className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  New Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <input
                    id="password"
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={resetForm.password}
                    onChange={onResetFormChange}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl transition-all duration-300 ${
                      currentTheme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-gray-600'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500'
                    } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                      currentTheme === 'dark' 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Enhanced Password Strength Indicator */}
                {resetForm.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex space-x-1 flex-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${
                              i < passwordStrength ? getPasswordStrengthColor(passwordStrength) : 
                              currentTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                            } flex-1`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs font-medium transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                    {passwordStrength < 2 && (
                      <div className={`flex items-center text-xs mt-1 ${
                        currentTheme === 'dark' ? 'text-orange-300' : 'text-orange-600'
                      }`}>
                        <Info className="w-3 h-3 mr-1" />
                        Include uppercase, lowercase, numbers, or symbols
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <Shield className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPwd2 ? 'text' : 'password'}
                    required
                    value={resetForm.confirmPassword}
                    onChange={onResetFormChange}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl transition-all duration-300 ${
                      currentTheme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-gray-600'
                        : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500'
                    } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd2(!showPwd2)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                      currentTheme === 'dark' 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showPwd2 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {resetForm.confirmPassword && resetForm.password !== resetForm.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !resetForm.password || !resetForm.confirmPassword || resetForm.password !== resetForm.confirmPassword}
                className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:from-green-700 hover:to-emerald-700 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {loading && <Loader className="w-5 h-5 mr-2 animate-spin" />}
                {loading ? 'Updating Password...' : 'Update Password'}
                {!loading && <CheckCircle className="w-5 h-5 ml-2" />}
              </button>
            </form>
          )}

          {/* Enhanced Back to Login Link */}
          <div className={`mt-8 pt-6 border-t text-center transition-colors duration-300 ${
            currentTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <Link
              to="/login"
              className={`inline-flex items-center text-sm font-medium transition-colors duration-300 ${
                currentTheme === 'dark'
                  ? 'text-indigo-400 hover:text-indigo-300'
                  : 'text-indigo-600 hover:text-indigo-500'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Enhanced Security Notice */}
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center text-xs transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            <Shield className="w-3 h-3 mr-1" />
            <span>Reset links expire in 24 hours for security</span>
          </div>
        </div>

        {/* Development Note - Remove in production */}
        {step === 'request' && (
          <div className={`mt-4 p-4 rounded-xl border transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300'
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <div className="flex items-start">
              <Info className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-medium mb-1">Development Mode</p>
                <p>Password reset functionality requires email server configuration. Check backend logs for reset tokens during development.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reset
