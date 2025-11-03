import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext' // ✅ Add theme context
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Brain,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader,
  Shield,
  Sparkles,
  Users,
  BookOpen,
  BarChart3,
  User,
  GraduationCap,
  Settings
} from 'lucide-react'

const SignIn = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { currentTheme } = useTheme() // ✅ Add theme hook
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ email: '', password: '', remember: true })

  // Handle success messages from other pages (like signup)
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message)
      // Clear the state to prevent showing the message on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const onChange = e => {
    const { name, type, value, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    // Clear errors when user starts typing
    if (error) setError('')
  }

  const onSubmit = async e => {
    e.preventDefault()

    // Enhanced form validation
    if (!form.email.trim()) {
      setError('Please enter your email address')
      return
    }
    if (!form.password) {
      setError('Please enter your password')
      return
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError('Please enter a valid email address')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const data = await login(form.email, form.password)

      // Get redirect path from URL params or default
      const redirectTo = new URLSearchParams(location.search).get('redirect')
      const role = data.user?.role || 'student'

      // Smart redirection logic
      if (redirectTo) {
        navigate(redirectTo, { replace: true })
      } else {
        // Role-based navigation with improved routing
        switch (role) {
          case 'student':
            navigate('/dashboard', { replace: true })
            break
          case 'teacher':
            navigate('/dashboard/teacher', { replace: true })
            break
          case 'admin':
            navigate('/dashboard/admin', { replace: true })
            break
          default:
            navigate('/dashboard', { replace: true })
        }
      }

    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Updated demo credentials to match your sample data
  const demoCredentials = [
    { 
      role: 'Student', 
      email: 'test@test.com', 
      password: 'test123',
      icon: User,
      description: 'Access student dashboard and AI quizzes'
    },
    { 
      role: 'Teacher', 
      email: 'teacher@test.com', 
      password: 'teacher123',
      icon: GraduationCap,
      description: 'Manage courses and student progress'
    },
    { 
      role: 'Admin', 
      email: 'admin@test.com', 
      password: 'admin123',
      icon: Settings,
      description: 'Full system administration access'
    }
  ]

  const fillDemoCredentials = (email, password) => {
    setForm(prev => ({ ...prev, email, password }))
    setError('')
    setSuccess('')
  }

  const benefits = [
    { icon: Brain, text: 'AI-powered personalized learning' },
    { icon: BarChart3, text: 'Detailed progress analytics' },
    { icon: BookOpen, text: 'Adaptive content generation' },
    { icon: Users, text: 'Collaborative learning environment' }
  ]

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
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent'
              : 'text-gray-900'
          }`}>Welcome Back!</h1>
          <p className={`mb-4 transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Sign in to continue your AI-powered learning journey
          </p>
          <div>
            <span className={`text-sm transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Don't have an account?{' '}
              <Link to="/signup" className={`font-semibold transition-colors duration-300 ${
                currentTheme === 'dark'
                  ? 'text-indigo-400 hover:text-indigo-300'
                  : 'text-indigo-600 hover:text-indigo-500'
              }`}>
                Create one here
              </Link>
            </span>
          </div>
        </div>

        {/* Enhanced Login Form Card */}
        <div className={`rounded-3xl border shadow-xl p-8 backdrop-blur-sm mb-6 transition-colors duration-300 ${
          currentTheme === 'dark'
            ? 'bg-gray-800/95 border-gray-700'
            : 'bg-white/95 border-gray-200'
        }`}>
          <form onSubmit={onSubmit} className="space-y-6" noValidate>

            {/* Success Message */}
            {success && (
              <div className={`flex items-center p-4 border-l-4 border-green-400 rounded-lg ${
                currentTheme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
              }`}>
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                <p className={`text-sm ${
                  currentTheme === 'dark' ? 'text-green-300' : 'text-green-700'
                }`}>{success}</p>
              </div>
            )}

            {/* Enhanced Error Display */}
            {error && (
              <div className={`flex items-center p-4 border-l-4 border-red-400 rounded-lg ${
                currentTheme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
              }`}>
                <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                <p className={`text-sm ${
                  currentTheme === 'dark' ? 'text-red-300' : 'text-red-700'
                }`}>{error}</p>
              </div>
            )}

            {/* Enhanced Email Input */}
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
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={onChange}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                    currentTheme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-gray-600'
                      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500'
                  } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Enhanced Password Input */}
            <div>
              <label htmlFor="password" className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={onChange}
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl transition-all duration-300 ${
                    currentTheme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-gray-600'
                      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500'
                  } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
                  placeholder="Enter your password"
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
            </div>

            {/* Enhanced Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={form.remember}
                  onChange={onChange}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                />
                <span className={`text-sm select-none transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Remember me</span>
              </label>
              <Link
                to="/reset"
                className={`text-sm font-semibold transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'text-indigo-400 hover:text-indigo-300'
                    : 'text-indigo-600 hover:text-indigo-500'
                }`}
              >
                Forgot password?
              </Link>
            </div>

            {/* Enhanced Submit Button */}
            <button
              type="submit"
              disabled={loading || !form.email.trim() || !form.password}
              className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {loading && <Loader className="w-5 h-5 mr-2 animate-spin" />}
              {loading ? 'Signing you in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
            </button>
          </form>
        </div>

        {/* Enhanced Demo Credentials */}
        <div className={`backdrop-blur-sm rounded-2xl border p-6 mb-6 transition-colors duration-300 ${
          currentTheme === 'dark'
            ? 'bg-gray-800/70 border-gray-700/50'
            : 'bg-white/70 border-white/20'
        }`}>
          <div className="flex items-center mb-4">
            <Sparkles className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className={`text-sm font-semibold transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>Quick Login - Demo Accounts</h3>
          </div>
          <div className="space-y-3">
            {demoCredentials.map((cred, index) => (
              <button
                key={index}
                type="button"
                onClick={() => fillDemoCredentials(cred.email, cred.password)}
                className={`w-full text-left p-4 rounded-xl border transition-all group ${
                  currentTheme === 'dark'
                    ? 'border-gray-600 hover:border-indigo-500 hover:bg-gray-700/50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      index === 0 ? 'bg-blue-100' : 
                      index === 1 ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      <cred.icon className={`w-5 h-5 ${
                        index === 0 ? 'text-blue-600' : 
                        index === 1 ? 'text-green-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <div>
                      <div className={`font-medium transition-colors duration-300 ${
                        currentTheme === 'dark'
                          ? 'text-gray-200 group-hover:text-indigo-300'
                          : 'text-gray-900 group-hover:text-indigo-900'
                      }`}>{cred.role} Demo</div>
                      <div className={`text-xs transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>{cred.email}</div>
                      <div className={`text-xs mt-1 transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                      }`}>{cred.description}</div>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-all ${
                    currentTheme === 'dark'
                      ? 'text-gray-500 group-hover:text-indigo-400'
                      : 'text-gray-400 group-hover:text-indigo-600'
                  } group-hover:translate-x-1`} />
                </div>
              </button>
            ))}
          </div>
          <p className={`text-xs mt-4 text-center transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Click any demo account to auto-fill credentials
          </p>
        </div>

        {/* Enhanced Benefits Section */}
        <div className={`backdrop-blur-sm rounded-2xl border p-6 mb-6 transition-colors duration-300 ${
          currentTheme === 'dark'
            ? 'bg-gray-800/50 border-gray-700/50'
            : 'bg-white/50 border-white/20'
        }`}>
          <h3 className={`text-sm font-semibold mb-4 text-center transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>Why Choose Our Platform?</h3>
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className={`flex items-center text-sm transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <benefit.icon className="w-4 h-4 text-indigo-600 mr-3 shrink-0" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Security Notice */}
        <div className="text-center">
          <div className={`inline-flex items-center text-xs transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            <Shield className="w-3 h-3 mr-1" />
            <span>Your data is encrypted and secure</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
