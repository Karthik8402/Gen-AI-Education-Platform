import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import {
  ArrowUpRightIcon,
  BookOpenIcon,
  ChartBarIcon,
  AcademicCapIcon,
  TrophyIcon,
  ClockIcon,
  SparklesIcon,
  FireIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'
import {
  Brain,
  Target,
  TrendingUp,
  TrendingDown,
  Zap,
  Award,
  BarChart3,
  Clock,
  Calendar,
  PlayCircle,
  BookMarked,
  Star,
  ArrowRight,
  Users,
  Globe,
  Smartphone,
  CheckCircle,
  Loader,
  Eye,
  Sparkles, 
  Trophy,
  RotateCcw,
  AlertCircle
} from 'lucide-react'
import { api } from '@/services/api'
import { formatDate } from '@/services/utils/helpers'

const StatCard = ({ title, value, change, icon: Icon, color, unit = '', trend, subtitle }) => {
  const { currentTheme } = useTheme()
  
  return (
    <div className={`relative overflow-hidden rounded-3xl border shadow-xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300 ${
      currentTheme === 'dark'
        ? 'border-gray-700 bg-gray-800'
        : 'border-gray-200 bg-white'
    }`}>
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 opacity-60 ${
        currentTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-white via-white to-blue-50'
      }`}></div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className={`w-full h-full rounded-full ${color} transform translate-x-8 -translate-y-8`}></div>
      </div>
      
      <div className="relative p-8">
        <div className="flex items-start justify-between mb-6">
          <div className={`rounded-2xl p-4 ${color} shadow-xl transform hover:scale-110 transition-transform duration-200`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300 ${
              trend === 'up' 
                ? currentTheme === 'dark' 
                  ? 'bg-green-900/30 text-green-300' 
                  : 'bg-green-100 text-green-700'
                : trend === 'down' 
                  ? currentTheme === 'dark' 
                    ? 'bg-red-900/30 text-red-300' 
                    : 'bg-red-100 text-red-700'
                  : currentTheme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : 
               trend === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
              {change}
            </div>
          )}
        </div>
        
        <div>
          <p className={`text-sm font-semibold mb-2 transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>{title}</p>
          <p className={`text-4xl font-bold mb-1 transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>{value ?? 0}{unit}</p>
          {subtitle && (
            <p className={`text-xs transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>{subtitle}</p>
          )}
          {change && !trend && (
            <p className={`mt-3 text-sm font-medium ${change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
              {change} vs last week
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const ActivityItem = ({ title, time, detail, score, type = 'quiz' }) => {
  const { currentTheme } = useTheme()
  
  return (
    <div className={`group flex items-start gap-4 p-4 rounded-2xl transition-all duration-200 ${
      currentTheme === 'dark'
        ? 'hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600'
        : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
    }`}>
      <div className={`rounded-xl p-3 shadow-lg ${
        type === 'quiz' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
        type === 'course' ? 'bg-gradient-to-r from-purple-500 to-violet-600' :
        'bg-gradient-to-r from-green-500 to-emerald-600'
      }`}>
        {type === 'quiz' ? <BookOpenIcon className="w-5 h-5 text-white" /> :
         type === 'course' ? <AcademicCapIcon className="w-5 h-5 text-white" /> :
         <TrophyIcon className="w-5 h-5 text-white" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-sm font-semibold transition-colors duration-300 ${
              currentTheme === 'dark'
                ? 'text-gray-100 group-hover:text-indigo-300'
                : 'text-gray-900 group-hover:text-indigo-900'
            }`}>{title}</p>
            <p className={`text-sm mt-1 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>{detail}</p>
            <div className={`flex items-center mt-2 text-xs transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Calendar className="w-3 h-3 mr-1" />
              {time}
            </div>
          </div>
          {score && (
            <div className="flex items-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold transition-colors duration-300 ${
                score >= 80 
                  ? currentTheme === 'dark'
                    ? 'bg-green-900/30 text-green-300 border border-green-700'
                    : 'bg-green-100 text-green-800 border border-green-200'
                  : score >= 60 
                    ? currentTheme === 'dark'
                      ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : currentTheme === 'dark'
                      ? 'bg-red-900/30 text-red-300 border border-red-700'
                      : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {score >= 80 ? <Trophy className="w-3 h-3 mr-1" /> : 
                 score >= 60 ? <Target className="w-3 h-3 mr-1" /> : 
                 <TrendingUp className="w-3 h-3 mr-1" />}
                {score}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { currentTheme } = useTheme()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // API-connected data fetching
  const fetchData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await api('/api/analytics/me')
      
      if (response.status === 'success') {
        setData(response.analytics)
      } else {
        throw new Error(response.error || 'Failed to load dashboard data')
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      
      if (err.response?.status === 401) {
        setError('Please log in to view your dashboard')
      } else if (err.response?.status === 404) {
        setError('Dashboard data not found. Please take a quiz first.')
      } else if (err.response) {
        setError(err.response.error || err.response.message || 'Server error occurred')
      } else if (err.request) {
        setError('Unable to connect to server. Please check your internet connection.')
      } else {
        setError(err.message || 'Failed to load dashboard data')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchData(true)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ✅ FIXED: Main container background that responds to theme changes
  const mainBgClass = currentTheme === 'dark' 
    ? 'min-h-screen bg-gray-900' 
    : 'min-h-screen bg-white'

  // Loading state with theme support
  if (loading) {
    return (
      <div className={`${mainBgClass} transition-colors duration-300`}>
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-xl mb-6 animate-pulse">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>Loading Your Dashboard</h1>
            <p className={`text-lg transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Fetching your personalized learning insights...</p>
          </div>
          
          <div className="animate-pulse space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-48 rounded-3xl transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'bg-gray-800'
                    : 'bg-gray-200'
                }`}></div>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className={`lg:col-span-2 h-96 rounded-3xl transition-colors duration-300 ${
                currentTheme === 'dark'
                  ? 'bg-gray-800'
                  : 'bg-gray-200'
              }`}></div>
              <div className={`h-96 rounded-3xl transition-colors duration-300 ${
                currentTheme === 'dark'
                  ? 'bg-gray-800'
                  : 'bg-gray-200'
              }`}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state with retry option
  if (error) {
    return (
      <div className={`${mainBgClass} transition-colors duration-300`}>
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="text-center py-20">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              currentTheme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
            }`}>
              <AlertCircle className={`w-10 h-10 ${
                currentTheme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`} />
            </div>
            <h3 className={`text-2xl font-bold mb-4 ${
              currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>Dashboard Unavailable</h3>
            <p className={`mb-8 max-w-md mx-auto ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>{error}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={fetchData}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                  currentTheme === 'dark'
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Try Again
              </button>
              <Link
                to="/quiz/interface"
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  currentTheme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                <PlayCircle className="w-5 h-5" />
                Take Quiz
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No data state
  if (!data || !data.performance || data.performance.totalAttempts === 0) {
    return (
      <div className={`${mainBgClass} transition-colors duration-300`}>
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="text-center py-20">
            <Brain className={`w-20 h-20 mx-auto mb-6 ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <h3 className={`text-2xl font-bold mb-4 ${
              currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>No Analytics Data Available</h3>
            <p className={`mb-8 text-lg ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Start taking quizzes to see your personalized dashboard.</p>
            <Link 
              to="/quiz/interface" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Take Your First Quiz
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Extract data from API response
  const perf = data.performance || {}
  const recent = data.recentActivity || []
  const recs = data.insights?.recommendations || []
  const student = data.student || {}
  const mlInsights = data.insights || {}

  // Calculate derived stats
  const averageScore = perf.overallAccuracy || 0
  const skillLevel = student.currentSkillLevel || 'beginner'
  const totalAttempts = perf.totalAttempts || 0
  const learningStreak = perf.learningStreak || 0

  return (
    <main className={`${mainBgClass} transition-colors duration-300`}>
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Enhanced Header with Refresh */}
        <div className="mb-12 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className={`text-4xl font-bold transition-all duration-300 ${
                    currentTheme === 'dark'
                      ? 'bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'
                  }`}>
                    Welcome back, {student.username || student.email?.split('@')[0] || 'Student'}! 👋
                  </h1>
                  <button 
                    onClick={handleRefresh} 
                    disabled={refreshing}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      refreshing ? 'animate-spin' : ''
                    } ${
                      currentTheme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                    }`}
                    title="Refresh dashboard"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
                <p className={`text-xl transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Track your learning progress and discover AI-powered recommendations.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Link
                to="/placement-quiz"
                className={`inline-flex items-center rounded-2xl border-2 px-6 py-3 text-sm font-semibold shadow-sm transition-all duration-300 ${
                  currentTheme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                <Target className="w-4 h-4 mr-2" />
                Retake Assessment
              </Link>
              <Link
                to="/quiz/interface"
                className="inline-flex items-center rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Quiz
                <ArrowUpRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards with Real Data */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          <StatCard
            title="Quiz Attempts"
            value={totalAttempts}
            change={learningStreak > 0 ? `${learningStreak} day streak` : 'Start practicing!'}
            icon={BookOpenIcon}
            color="bg-gradient-to-r from-indigo-500 to-indigo-600"
            trend={totalAttempts > 0 ? 'up' : 'stable'}
            subtitle="Total practice sessions"
          />
          <StatCard
            title="Questions Mastered"
            value={perf.totalCorrect || 0}
            change={perf.totalQuestions > 0 ? `${Math.round(((perf.totalCorrect || 0)/(perf.totalQuestions || 1))*100)}% accuracy` : 'No attempts yet'}
            icon={CheckCircle}
            color="bg-gradient-to-r from-green-500 to-emerald-600"
            trend={(perf.totalCorrect || 0) > (perf.totalQuestions || 1) * 0.7 ? 'up' : 'stable'}
            subtitle={`Out of ${perf.totalQuestions || 0} attempted`}
          />
          <StatCard
            title="Learning Streak"
            value={learningStreak}
            change={learningStreak > 0 ? "Keep it up!" : "Start your streak!"}
            icon={FireIcon}
            color="bg-gradient-to-r from-orange-500 to-red-600"
            trend={learningStreak > 0 ? 'up' : 'stable'}
            subtitle="Days of consistent practice"
            unit=" days"
          />
          <StatCard
            title="Average Score"
            value={Math.round(averageScore)}
            change={averageScore > 70 ? 'Excellent!' : averageScore > 50 ? 'Good progress' : 'Keep improving'}
            icon={TrophyIcon}
            color="bg-gradient-to-r from-purple-500 to-violet-600"
            trend={averageScore > 70 ? 'up' : averageScore > 50 ? 'stable' : 'down'}
            unit="%"
            subtitle="Across all attempts"
          />
        </div>

        {/* Enhanced Skill Level Banner */}
        {skillLevel && (
          <div className={`mb-12 overflow-hidden rounded-3xl border-2 shadow-xl transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'border-blue-700 bg-gray-800'
              : 'border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50'
          }`}>
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-6 shadow-xl">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-900'
                    }`}>
                      Current Skill Level: <span className="capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{skillLevel}</span>
                    </h3>
                    <div className={`flex items-center space-x-6 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                    }`}>
                      <span className="flex items-center text-lg">
                        <Target className="w-5 h-5 mr-2" />
                        {skillLevel === 'beginner' && 'Building foundational knowledge'}
                        {skillLevel === 'intermediate' && 'Developing practical skills'}
                        {skillLevel === 'expert' && 'Mastering advanced concepts'}
                      </span>
                      <span className="flex items-center text-lg">
                        <Sparkles className="w-5 h-5 mr-2" />
                        AI-Predicted Level
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-5xl font-bold mb-2 transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-900'
                  }`}>{Math.round(averageScore)}%</div>
                  <div className={`font-semibold text-lg transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                  }`}>Mastery Score</div>
                  <div className={`text-sm mt-1 transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-blue-500' : 'text-blue-600'
                  }`}>
                    {averageScore >= 80 ? '🎉 Outstanding!' : 
                     averageScore >= 60 ? '👏 Great work!' : 
                     '💪 Keep practicing!'}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Progress bar */}
              <div className="mt-8">
                <div className={`flex justify-between text-sm mb-3 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                }`}>
                  <span className="font-medium">Progress to mastery</span>
                  <span className="font-bold">{Math.min(averageScore, 100)}%</span>
                </div>
                <div className={`w-full rounded-full h-4 shadow-inner transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'bg-gray-700' : 'bg-blue-200'
                }`}>
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 shadow-lg relative overflow-hidden"
                    style={{ width: `${Math.min(averageScore, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Enhanced Main Content Grid */}
      <div className="grid gap-10 lg:grid-cols-3 mb-12">
        {/* Enhanced AI Recommendations with Real Data */}
        <section className="lg:col-span-2">
          <div className={`rounded-3xl border shadow-xl backdrop-blur-sm overflow-hidden transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
              <div className="flex items-center">
                <SparklesIcon className="w-8 h-8 text-white mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-white">🤖 AI-Powered Recommendations</h2>
                  <p className="text-indigo-100 mt-1">
                    Personalized suggestions based on your {skillLevel} level and {Math.round(averageScore)}% performance
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {recs.length > 0 ? (
                <div className="space-y-6">
                  {recs.slice(0, 3).map((rec, index) => (
                    <div key={index} className={`flex items-start justify-between rounded-2xl border-2 p-6 transition-all group ${
                      currentTheme === 'dark'
                        ? 'border-gray-600 hover:border-indigo-500 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600'
                        : 'border-gray-100 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                    }`}>
                      <div className="flex items-start">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform ${
                          currentTheme === 'dark'
                            ? 'bg-gradient-to-r from-indigo-800 to-purple-800'
                            : 'bg-gradient-to-r from-indigo-100 to-purple-100'
                        }`}>
                          <span className="text-xl">
                            {rec.type === 'skill_building' ? '🎯' : 
                             rec.type === 'topic_improvement' ? '📚' : '💡'}
                          </span>
                        </div>
                        <div>
                          <p className={`font-semibold mb-2 transition-colors duration-300 ${
                            currentTheme === 'dark'
                              ? 'text-gray-100 group-hover:text-indigo-300'
                              : 'text-gray-900 group-hover:text-indigo-900'
                          }`}>
                            {rec.title}
                          </p>
                          <p className={`text-sm transition-colors duration-300 ${
                            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {rec.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          rec.priority === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : rec.priority === 'medium'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {rec.priority}
                        </span>
                        <Link
                          to="/quiz/interface"
                          className={`inline-flex items-center text-sm font-bold whitespace-nowrap group-hover:translate-x-1 transition-all ${
                            currentTheme === 'dark'
                              ? 'text-indigo-400 hover:text-indigo-300'
                              : 'text-indigo-600 hover:text-indigo-800'
                          }`}
                        >
                          {rec.action || 'Practice now'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <LightBulbIcon className={`mx-auto h-16 w-16 mb-6 ${
                    currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <h3 className={`text-xl font-bold mb-4 ${
                    currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Get Personalized Recommendations</h3>
                  <p className={`mb-8 max-w-md mx-auto ${
                    currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Complete a few more quizzes to unlock AI-powered suggestions tailored to your learning style and skill level.
                  </p>
                  <Link
                    to="/quiz/interface"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Take More Quizzes
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Enhanced Recent Activity with Real Data */}
        <aside>
          <div className={`rounded-3xl border shadow-xl backdrop-blur-sm overflow-hidden transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <ClockIcon className="w-6 h-6 mr-2" />
                Recent Activity
              </h2>
            </div>

            <div className="p-6">
              {recent.length > 0 ? (
                <div className="space-y-2">
                  {recent.slice(0, 5).map((activity, index) => (
                    <ActivityItem
                      key={activity.attemptId || index}
                      title={`${activity.topic} Quiz`}
                      detail={`${activity.score?.correct || 0}/${activity.score?.total || 0} questions • ${activity.difficulty} level`}
                      time={formatDate ? formatDate(activity.submittedAt) : new Date(activity.submittedAt).toLocaleDateString()}
                      score={Math.round(activity.percentage || 0)}
                      type="quiz"
                    />
                  ))}

                  <div className={`pt-6 mt-6 border-t transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <Link
                      to="/analytics"
                      className={`flex items-center justify-center w-full text-sm font-bold py-4 rounded-xl transition-all group ${
                        currentTheme === 'dark'
                          ? 'text-indigo-400 hover:text-indigo-300 hover:bg-gray-700'
                          : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50'
                      }`}
                    >
                      View Detailed Analytics
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClockIcon className={`mx-auto h-16 w-16 mb-4 ${
                    currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <h4 className={`font-bold mb-2 ${
                    currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>No Recent Activity</h4>
                  <p className={`text-sm mb-6 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>Start taking quizzes to see your progress here</p>
                  <Link
                    to="/quiz/interface"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start First Quiz
                  </Link>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Enhanced Quick Actions */}
      <section className={`rounded-3xl border shadow-xl backdrop-blur-sm overflow-hidden transition-colors duration-300 ${
        currentTheme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className={`px-8 py-6 ${
          currentTheme === 'dark'
            ? 'bg-gradient-to-r from-gray-700 to-gray-600'
            : 'bg-gradient-to-r from-gray-800 to-gray-900'
        }`}>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Zap className="w-6 h-6 mr-3" />
            Quick Actions
          </h2>
          <p className="text-gray-300 mt-1">Jump to your favorite features</p>
        </div>
        
        <div className="p-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/quiz/interface"
              className={`group flex items-center rounded-2xl border-2 p-6 transition-all duration-200 transform hover:scale-105 ${
                currentTheme === 'dark'
                  ? 'border-gray-600 hover:border-indigo-500 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50'
              }`}
            >
              <div className={`rounded-xl p-4 group-hover:scale-110 transition-all ${
                currentTheme === 'dark'
                  ? 'bg-indigo-900/30 group-hover:bg-indigo-600'
                  : 'bg-indigo-100 group-hover:bg-indigo-600'
              }`}>
                <BookOpenIcon className={`h-8 w-8 transition-colors ${
                  currentTheme === 'dark'
                    ? 'text-indigo-400 group-hover:text-white'
                    : 'text-indigo-600 group-hover:text-white'
                }`} />
              </div>
              <div className="ml-6">
                <p className={`font-bold text-lg transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'text-gray-100 group-hover:text-indigo-300'
                    : 'text-gray-900 group-hover:text-indigo-900'
                }`}>Take Quiz</p>
                <p className={`text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Practice on any topic</p>
              </div>
            </Link>

            <Link
              to="/courses"
              className={`group flex items-center rounded-2xl border-2 p-6 transition-all duration-200 transform hover:scale-105 ${
                currentTheme === 'dark'
                  ? 'border-gray-600 hover:border-purple-500 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50'
              }`}
            >
              <div className={`rounded-xl p-4 group-hover:scale-110 transition-all ${
                currentTheme === 'dark'
                  ? 'bg-purple-900/30 group-hover:bg-purple-600'
                  : 'bg-purple-100 group-hover:bg-purple-600'
              }`}>
                <AcademicCapIcon className={`h-8 w-8 transition-colors ${
                  currentTheme === 'dark'
                    ? 'text-purple-400 group-hover:text-white'
                    : 'text-purple-600 group-hover:text-white'
                }`} />
              </div>
              <div className="ml-6">
                <p className={`font-bold text-lg transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'text-gray-100 group-hover:text-purple-300'
                    : 'text-gray-900 group-hover:text-purple-900'
                }`}>Browse Courses</p>
                <p className={`text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Structured learning</p>
              </div>
            </Link>

            <Link
              to="/analytics"
              className={`group flex items-center rounded-2xl border-2 p-6 transition-all duration-200 transform hover:scale-105 ${
                currentTheme === 'dark'
                  ? 'border-gray-600 hover:border-green-500 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600'
                  : 'border-gray-200 hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50'
              }`}
            >
              <div className={`rounded-xl p-4 group-hover:scale-110 transition-all ${
                currentTheme === 'dark'
                  ? 'bg-green-900/30 group-hover:bg-green-600'
                  : 'bg-green-100 group-hover:bg-green-600'
              }`}>
                <ChartBarIcon className={`h-8 w-8 transition-colors ${
                  currentTheme === 'dark'
                    ? 'text-green-400 group-hover:text-white'
                    : 'text-green-600 group-hover:text-white'
                }`} />
              </div>
              <div className="ml-6">
                <p className={`font-bold text-lg transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'text-gray-100 group-hover:text-green-300'
                    : 'text-gray-900 group-hover:text-green-900'
                }`}>View Analytics</p>
                <p className={`text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Track progress</p>
              </div>
            </Link>

            <Link
              to="/profile"
              className={`group flex items-center rounded-2xl border-2 p-6 transition-all duration-200 transform hover:scale-105 ${
                currentTheme === 'dark'
                  ? 'border-gray-600 hover:border-orange-500 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600'
                  : 'border-gray-200 hover:border-orange-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50'
              }`}
            >
              <div className={`rounded-xl p-4 group-hover:scale-110 transition-all ${
                currentTheme === 'dark'
                  ? 'bg-orange-900/30 group-hover:bg-orange-600'
                  : 'bg-orange-100 group-hover:bg-orange-600'
              }`}>
                <TrophyIcon className={`h-8 w-8 transition-colors ${
                  currentTheme === 'dark'
                    ? 'text-orange-400 group-hover:text-white'
                    : 'text-orange-600 group-hover:text-white'
                }`} />
              </div>
              <div className="ml-6">
                <p className={`font-bold text-lg transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'text-gray-100 group-hover:text-orange-300'
                    : 'text-gray-900 group-hover:text-orange-900'
                }`}>Profile</p>
                <p className={`text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Update preferences</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Data Update Info */}
        <div className={`mt-6 text-center text-sm ${ currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500' }`}>
          Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Just now'} • 
          Data range: {data.dataRange || `${totalAttempts} quiz attempts`}
        </div>
      </div>
    </main>
  )
}
