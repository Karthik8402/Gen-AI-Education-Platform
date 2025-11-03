import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Brain,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Target,
  BookOpen,
  ArrowRight,
  Loader,
  Shield,
  Building,
  GraduationCap,
  X,
  Info
} from 'lucide-react'

const SignUp = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { currentTheme } = useTheme()
  const [showPwd, setShowPwd] = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirm: '', 
    age: '', 
    learningStyle: 'visual',
    educationLevel: 'undergraduate',
    department: 'computer-science', // ✅ Added department
    subjects: []
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [validationErrors, setValidationErrors] = useState({}) // ✅ Field-specific errors

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    // Clear field-specific error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Clear general error
    if (error) setError('')
    if (success) setSuccess('')

    // Password strength checker
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const onSubjectChange = (subject) => {
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }))
  }

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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateStep1 = () => {
    const errors = {}
    
    if (!form.name.trim()) {
      errors.name = 'Full name is required'
    } else if (form.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    if (!form.email.trim()) {
      errors.email = 'Email address is required'
    } else if (!validateEmail(form.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!form.password) {
      errors.password = 'Password is required'
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    } else if (passwordStrength < 2) {
      errors.password = 'Password is too weak. Add uppercase, numbers, or symbols'
    }

    if (!form.confirm) {
      errors.confirm = 'Please confirm your password'
    } else if (form.password !== form.confirm) {
      errors.confirm = 'Passwords do not match'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = () => {
    const errors = {}
    
    if (form.age && (isNaN(form.age) || form.age < 13 || form.age > 100)) {
      errors.age = 'Age must be between 13 and 100'
    }

    if (!form.department) {
      errors.department = 'Please select your department/field of study'
    }

    if (!form.educationLevel) {
      errors.educationLevel = 'Please select your education level'
    }

    if (!form.learningStyle) {
      errors.learningStyle = 'Please select your learning style'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    setError('')
    setSuccess('')
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const prevStep = () => {
    setError('')
    setSuccess('')
    setValidationErrors({})
    setStep(1)
  }

  const handleSpecificError = (errorMessage) => {
    // Handle specific backend errors
    const lowerError = errorMessage.toLowerCase()
    
    if (lowerError.includes('email') && (lowerError.includes('exists') || lowerError.includes('already') || lowerError.includes('registered'))) {
      setValidationErrors({ email: 'This email address is already registered' })
      setError('An account with this email already exists. Try signing in instead.')
      return true
    }
    
    if (lowerError.includes('invalid email') || lowerError.includes('email format')) {
      setValidationErrors({ email: 'Please enter a valid email address' })
      return true
    }
    
    if (lowerError.includes('password') && lowerError.includes('weak')) {
      setValidationErrors({ password: 'Password is too weak' })
      return true
    }
    
    if (lowerError.includes('name') && lowerError.includes('required')) {
      setValidationErrors({ name: 'Full name is required' })
      return true
    }

    return false
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setValidationErrors({})

    if (step === 1) {
      nextStep()
      return
    }

    if (!validateStep2()) {
      return
    }

    setLoading(true)
    try {
      // Step 1: Register user account
      const data = await register(form.name.trim(), form.email.trim().toLowerCase(), form.password)

      // Step 2: Create comprehensive student profile
      await api('/api/student/profile', {
        method: 'POST',
        body: {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          age: form.age ? Number(form.age) : null,
          learningStyle: form.learningStyle || 'visual',
          skillLevel: 'beginner',
          subjects: form.subjects.length > 0 ? form.subjects : ['general'],
          educationLevel: form.educationLevel,
          department: form.department, // ✅ Include department
          preferences: {
            difficulty: 'adaptive',
            contentType: 'mixed',
            learningGoals: 'skill_improvement'
          }
        },
      })

      // Success message
      setSuccess('Account created successfully! Redirecting to placement quiz...')

      // Step 3: Smart routing based on role
      const role = data.user?.role || 'student'

      // Delay for success message visibility
      setTimeout(() => {
        if (role === 'student') {
          console.log('🎯 New student - routing to placement quiz')
          navigate('/placement-quiz', {
            replace: true,
            state: { 
              isNewUser: true,
              welcomeMessage: `Welcome to AI Education, ${form.name}! Let's assess your current skill level to personalize your learning experience.`
            }
          })
        } else if (role === 'teacher') {
          navigate('/dashboard/teacher', { replace: true })
        } else if (role === 'admin') {
          navigate('/dashboard/admin', { replace: true })
        }
      }, 1500)

    } catch (err) {
      console.error('Registration error:', err)
      
      // Handle specific errors first
      if (err.response?.data?.error) {
        if (!handleSpecificError(err.response.data.error)) {
          setError(err.response.data.error)
        }
      } else if (err.response?.data?.message) {
        if (!handleSpecificError(err.response.data.message)) {
          setError(err.response.data.message)
        }
      } else if (err.message) {
        if (!handleSpecificError(err.message)) {
          setError(err.message)
        }
      } else {
        setError('Failed to create account. Please try again.')
      }

      // If email already exists, go back to step 1
      if (error.toLowerCase().includes('email') && error.toLowerCase().includes('already')) {
        setStep(1)
      }
    } finally {
      setLoading(false)
    }
  }

  const learningStyles = [
    { id: 'visual', label: 'Visual', icon: '👁️', description: 'Learn through images, diagrams, and visual aids' },
    { id: 'auditory', label: 'Auditory', icon: '👂', description: 'Learn through listening and verbal instruction' },
    { id: 'kinesthetic', label: 'Kinesthetic', icon: '✋', description: 'Learn through hands-on practice and movement' },
    { id: 'reading', label: 'Reading/Writing', icon: '📚', description: 'Learn through reading and writing activities' }
  ]

  const subjectOptions = [
    'Programming', 'Mathematics', 'Science', 'History', 'Languages', 
    'Business', 'Arts', 'Engineering', 'Medicine', 'Literature'
  ]

  const educationLevels = [
    { id: 'high-school', label: 'High School' },
    { id: 'undergraduate', label: 'Undergraduate' },
    { id: 'graduate', label: 'Graduate' },
    { id: 'professional', label: 'Professional' }
  ]

  // ✅ Department options
  const departmentOptions = [
    { id: 'computer-science', label: 'Computer Science', icon: '💻' },
    { id: 'engineering', label: 'Engineering', icon: '⚙️' },
    { id: 'mathematics', label: 'Mathematics', icon: '🔢' },
    { id: 'physics', label: 'Physics', icon: '🔬' },
    { id: 'chemistry', label: 'Chemistry', icon: '🧪' },
    { id: 'biology', label: 'Biology', icon: '🧬' },
    { id: 'medicine', label: 'Medicine', icon: '⚕️' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'economics', label: 'Economics', icon: '📈' },
    { id: 'psychology', label: 'Psychology', icon: '🧠' },
    { id: 'literature', label: 'Literature', icon: '📚' },
    { id: 'history', label: 'History', icon: '📜' },
    { id: 'arts', label: 'Arts & Design', icon: '🎨' },
    { id: 'languages', label: 'Languages', icon: '🌍' },
    { id: 'other', label: 'Other', icon: '📋' }
  ]

  const clearError = () => {
    setError('')
    setSuccess('')
    setValidationErrors({})
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
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent'
              : 'text-gray-900'
          }`}>
            {step === 1 ? 'Create Your Account' : 'Complete Your Profile'}
          </h1>
          <p className={`transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {step === 1 
              ? 'Join thousands of students learning with AI-powered education'
              : 'Help us customize your learning journey'
            }
          </p>
          <div className="mt-4">
            <span className={`text-sm transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Already have an account?{' '}
              <Link to="/login" className={`font-semibold transition-colors duration-300 ${
                currentTheme === 'dark'
                  ? 'text-indigo-400 hover:text-indigo-300'
                  : 'text-indigo-600 hover:text-indigo-500'
              }`}>
                Sign in
              </Link>
            </span>
          </div>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${
              step >= 1 ? 'bg-indigo-600 text-white' : 
              currentTheme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-400'
            }`}>
              {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
            </div>
            <span className={`ml-2 text-sm font-medium transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>Account</span>
          </div>
          <div className="flex-1 mx-4">
            <div className={`h-1 rounded-full overflow-hidden transition-colors duration-300 ${
              currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: step >= 2 ? '100%' : '0%' }}
              ></div>
            </div>
          </div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${
              step >= 2 ? 'bg-indigo-600 text-white' : 
              currentTheme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-400'
            }`}>
              {step > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
            </div>
            <span className={`ml-2 text-sm font-medium transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>Profile</span>
          </div>
        </div>

        {/* Enhanced Form Card */}
        <div className={`rounded-3xl border shadow-xl p-8 backdrop-blur-sm transition-colors duration-300 ${
          currentTheme === 'dark'
            ? 'bg-gray-800/95 border-gray-700'
            : 'bg-white/95 border-gray-200'
        }`}>
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            {/* Enhanced Error Display */}
            {error && (
              <div className={`flex items-start p-4 border-l-4 border-red-400 rounded-lg ${
                currentTheme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
              }`}>
                <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    currentTheme === 'dark' ? 'text-red-300' : 'text-red-700'
                  }`}>{error}</p>
                  {error.toLowerCase().includes('email') && error.toLowerCase().includes('already') && (
                    <div className="mt-2">
                      <Link
                        to="/login"
                        className={`text-sm underline ${
                          currentTheme === 'dark' ? 'text-red-300' : 'text-red-600'
                        }`}
                      >
                        Sign in with existing account
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearError}
                  className={`ml-2 ${
                    currentTheme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Enhanced Success Display */}
            {success && (
              <div className={`flex items-center p-4 border-l-4 border-green-400 rounded-lg ${
                currentTheme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
              }`}>
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                <p className={`text-sm font-medium ${
                  currentTheme === 'dark' ? 'text-green-300' : 'text-green-700'
                }`}>{success}</p>
              </div>
            )}

            {step === 1 ? (
              <>
                {/* Step 1: Basic Information */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        validationErrors.name ? 'text-red-400' : 
                        currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      <input
                        id="name" 
                        name="name" 
                        type="text" 
                        required 
                        value={form.name} 
                        onChange={onChange}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                          validationErrors.name 
                            ? 'border-red-400 focus:border-red-500' 
                            : currentTheme === 'dark'
                              ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-gray-600'
                              : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500'
                        } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        validationErrors.email ? 'text-red-400' : 
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
                          validationErrors.email 
                            ? 'border-red-400 focus:border-red-500' 
                            : currentTheme === 'dark'
                              ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-gray-600'
                              : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500'
                        } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
                        placeholder="Enter your email address"
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        validationErrors.password ? 'text-red-400' : 
                        currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      <input
                        id="password" 
                        name="password" 
                        type={showPwd ? 'text' : 'password'} 
                        required 
                        minLength={6}
                        value={form.password} 
                        onChange={onChange}
                        className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl transition-all duration-300 ${
                          validationErrors.password 
                            ? 'border-red-400 focus:border-red-500' 
                            : currentTheme === 'dark'
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
                    
                    {/* Password Strength Indicator */}
                    {form.password && (
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
                      </div>
                    )}
                    {validationErrors.password && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirm" className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Shield className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        validationErrors.confirm ? 'text-red-400' : 
                        currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      <input
                        id="confirm" 
                        name="confirm" 
                        type={showPwd2 ? 'text' : 'password'} 
                        required 
                        minLength={6}
                        value={form.confirm} 
                        onChange={onChange}
                        className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl transition-all duration-300 ${
                          validationErrors.confirm 
                            ? 'border-red-400 focus:border-red-500' 
                            : currentTheme === 'dark'
                              ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-gray-600'
                              : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500'
                        } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
                        placeholder="Confirm your password"
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
                    {validationErrors.confirm && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.confirm}
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Step 2: Personalization */}
                <div className="space-y-6">
                  <div className={`text-center pb-4 border-b transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <Sparkles className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>Let's Personalize Your Experience</h3>
                    <p className={`text-sm mt-1 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>This helps us create the perfect learning environment for you</p>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Age (Optional)
                    </label>
                    <input
                      name="age" 
                      type="number" 
                      min="13" 
                      max="100"
                      value={form.age} 
                      onChange={onChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                        validationErrors.age 
                          ? 'border-red-400 focus:border-red-500' 
                          : currentTheme === 'dark'
                            ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-gray-600'
                            : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-indigo-500'
                      } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
                      placeholder="Enter your age"
                    />
                    {validationErrors.age && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.age}</p>
                    )}
                  </div>

                  {/* ✅ Department Selection */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Department / Field of Study *
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                      {departmentOptions.map(dept => (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, department: dept.id }))}
                          className={`flex items-center p-3 rounded-xl border-2 text-left transition-all ${
                            form.department === dept.id
                              ? 'border-indigo-500 text-indigo-700' + 
                                (currentTheme === 'dark' ? ' bg-indigo-900/30 text-indigo-300' : ' bg-indigo-50')
                              : currentTheme === 'dark'
                                ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-xl mr-3">{dept.icon}</span>
                          <span className="font-medium">{dept.label}</span>
                        </button>
                      ))}
                    </div>
                    {validationErrors.department && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.department}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Education Level *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {educationLevels.map(level => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, educationLevel: level.id }))}
                          className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            form.educationLevel === level.id
                              ? 'border-indigo-500 text-indigo-700' + 
                                (currentTheme === 'dark' ? ' bg-indigo-900/30 text-indigo-300' : ' bg-indigo-50')
                              : currentTheme === 'dark'
                                ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                    {validationErrors.educationLevel && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.educationLevel}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Learning Style *
                    </label>
                    <div className="space-y-3">
                      {learningStyles.map(style => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, learningStyle: style.id }))}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            form.learningStyle === style.id
                              ? 'border-indigo-500' + 
                                (currentTheme === 'dark' ? ' bg-indigo-900/30' : ' bg-indigo-50')
                              : currentTheme === 'dark'
                                ? 'border-gray-600 hover:border-gray-500'
                                : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start">
                            <span className="text-2xl mr-3">{style.icon}</span>
                            <div>
                              <div className={`font-medium transition-colors duration-300 ${
                                currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                              }`}>{style.label}</div>
                              <div className={`text-sm mt-1 transition-colors duration-300 ${
                                currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>{style.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {validationErrors.learningStyle && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.learningStyle}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Subjects of Interest (Optional - Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {subjectOptions.map(subject => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => onSubjectChange(subject)}
                          className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                            form.subjects.includes(subject)
                              ? 'border-indigo-500 text-indigo-700' + 
                                (currentTheme === 'dark' ? ' bg-indigo-900/30 text-indigo-300' : ' bg-indigo-50')
                              : currentTheme === 'dark'
                                ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                    <div className={`mt-2 text-xs flex items-center ${
                      currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Info className="w-3 h-3 mr-1" />
                      Selected: {form.subjects.length} subjects
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 space-x-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className={`flex items-center px-6 py-3 border-2 rounded-xl font-medium transition-all ${
                    currentTheme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Back
                </button>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 ${step === 1 ? 'w-full' : ''}`}
              >
                {loading && <Loader className="w-5 h-5 mr-2 animate-spin" />}
                {loading 
                  ? 'Creating Your Account...' 
                  : step === 1 
                    ? 'Continue' 
                    : 'Create Account & Start Learning'
                }
                {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
              </button>
            </div>

            {/* Terms and Privacy */}
            <div className={`pt-4 border-t transition-colors duration-300 ${
              currentTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <p className={`text-xs text-center leading-relaxed transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                By creating an account, you agree to our{' '}
                <Link to="/terms" className={`font-medium transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'text-indigo-400 hover:text-indigo-300'
                    : 'text-indigo-600 hover:text-indigo-500'
                }`}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className={`font-medium transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'text-indigo-400 hover:text-indigo-300'
                    : 'text-indigo-600 hover:text-indigo-500'
                }`}>
                  Privacy Policy
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Enhanced Benefits Section */}
        <div className={`mt-8 backdrop-blur-sm rounded-2xl border p-6 transition-colors duration-300 ${
          currentTheme === 'dark'
            ? 'bg-gray-800/50 border-gray-700/50'
            : 'bg-white/50 border-white/20'
        }`}>
          <h3 className={`text-sm font-semibold mb-4 text-center transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>What You'll Get</h3>
          <div className="space-y-3 text-sm">
            <div className={`flex items-center transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <CheckCircle className="w-4 h-4 text-green-500 mr-3 shrink-0" />
              <span>Personalized AI-generated study materials</span>
            </div>
            <div className={`flex items-center transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <CheckCircle className="w-4 h-4 text-green-500 mr-3 shrink-0" />
              <span>Adaptive quizzes that adjust to your skill level</span>
            </div>
            <div className={`flex items-center transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <CheckCircle className="w-4 h-4 text-green-500 mr-3 shrink-0" />
              <span>Detailed progress tracking and analytics</span>
            </div>
            <div className={`flex items-center transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <CheckCircle className="w-4 h-4 text-green-500 mr-3 shrink-0" />
              <span>Free access to all core features</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
