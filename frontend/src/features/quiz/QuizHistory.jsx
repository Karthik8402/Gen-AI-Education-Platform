import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext' // ✅ Add ThemeContext
import { api } from '@/services/api'
import { formatDate } from '@/services/utils/helpers'
import {
  History,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Target,
  BookOpen,
  Award,
  Brain,
  Zap,
  Calendar,
  Filter,
  Search,
  ChevronRight,
  Trophy,
  Star,
  AlertTriangle,
  Plus,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function QuizHistory() {
  const [attempts, setAttempts] = useState([])
  const [filteredAttempts, setFilteredAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterPerformance, setFilterPerformance] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const navigate = useNavigate()
  const { currentTheme } = useTheme() // ✅ Add theme hook

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api('/api/quiz/attempts') 
        const attemptsData = res.attempts || []
        setAttempts(attemptsData)
        setFilteredAttempts(attemptsData)
      } catch (error) {
        console.error('Failed to fetch quiz history:', error)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Filter and search logic
  useEffect(() => {
    let filtered = [...attempts]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(attempt => 
        attempt.topic?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(attempt => attempt.difficulty === filterDifficulty)
    }

    // Performance filter
    if (filterPerformance !== 'all') {
      filtered = filtered.filter(attempt => {
        if (!attempt.score) return false
        const percentage = (attempt.score.correct / attempt.score.total) * 100
        
        switch (filterPerformance) {
          case 'excellent': return percentage >= 80
          case 'good': return percentage >= 60 && percentage < 80
          case 'needs-improvement': return percentage < 60
          default: return true
        }
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.submitted_at) - new Date(a.submitted_at)
        case 'oldest':
          return new Date(a.submitted_at) - new Date(b.submitted_at)
        case 'score-high':
          const aScore = a.score ? (a.score.correct / a.score.total) * 100 : 0
          const bScore = b.score ? (b.score.correct / b.score.total) * 100 : 0
          return bScore - aScore
        case 'score-low':
          const aScoreLow = a.score ? (a.score.correct / a.score.total) * 100 : 0
          const bScoreLow = b.score ? (b.score.correct / b.score.total) * 100 : 0
          return aScoreLow - bScoreLow
        default:
          return 0
      }
    })

    setFilteredAttempts(filtered)
  }, [attempts, searchTerm, filterDifficulty, filterPerformance, sortBy])

  const handleAttemptClick = (attemptId) => {
    navigate(`/quiz/results/${attemptId}`)
  }

  const getScoreColor = (score) => {
    if (!score) return currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
    const percentage = (score.correct / score.total) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-500'
  }

  const getScoreBackground = (score) => {
    if (!score) return currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
    const percentage = (score.correct / score.total) * 100
    if (percentage >= 80) return currentTheme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'
    if (percentage >= 60) return currentTheme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100'
    return currentTheme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
  }

  const getPerformanceBadge = (score) => {
    if (!score) return { 
      text: 'Unknown', 
      color: currentTheme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700' 
    }
    const percentage = (score.correct / score.total) * 100
    const darkSuffix = currentTheme === 'dark' ? ' dark:bg-purple-900/30 dark:text-purple-300' : ''
    const darkSuffix2 = currentTheme === 'dark' ? ' dark:bg-green-900/30 dark:text-green-300' : ''
    const darkSuffix3 = currentTheme === 'dark' ? ' dark:bg-yellow-900/30 dark:text-yellow-300' : ''
    const darkSuffix4 = currentTheme === 'dark' ? ' dark:bg-red-900/30 dark:text-red-300' : ''
    
    if (percentage >= 90) return { text: 'Outstanding', color: `bg-purple-100 text-purple-800${darkSuffix}`, icon: Trophy }
    if (percentage >= 80) return { text: 'Excellent', color: `bg-green-100 text-green-800${darkSuffix2}`, icon: Award }
    if (percentage >= 60) return { text: 'Good', color: `bg-yellow-100 text-yellow-800${darkSuffix3}`, icon: Star }
    return { text: 'Needs Work', color: `bg-red-100 text-red-800${darkSuffix4}`, icon: AlertTriangle }
  }

  // Statistics
  const totalAttempts = attempts.length
  const averageScore = totalAttempts > 0 
    ? Math.round(attempts.reduce((sum, attempt) => {
        const percentage = attempt.score ? (attempt.score.correct / attempt.score.total) * 100 : 0
        return sum + percentage
      }, 0) / totalAttempts)
    : 0

  const bestScore = attempts.length > 0
    ? Math.max(...attempts.map(attempt => 
        attempt.score ? (attempt.score.correct / attempt.score.total) * 100 : 0
      ))
    : 0

  const recentTrend = attempts.length >= 2
    ? (() => {
        const recent = attempts
          .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
          .slice(0, 5)
        const recentAvg = recent.reduce((sum, attempt) => {
          const percentage = attempt.score ? (attempt.score.correct / attempt.score.total) * 100 : 0
          return sum + percentage
        }, 0) / recent.length
        
        const older = attempts
          .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
          .slice(5, 10)
        
        if (older.length === 0) return 'neutral'
        
        const olderAvg = older.reduce((sum, attempt) => {
          const percentage = attempt.score ? (attempt.score.correct / attempt.score.total) * 100 : 0
          return sum + percentage
        }, 0) / older.length
        
        if (recentAvg > olderAvg + 5) return 'improving'
        if (recentAvg < olderAvg - 5) return 'declining'
        return 'stable'
      })()
    : 'neutral'

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        currentTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="max-w-6xl mx-auto py-12 px-6">
          <div className={`rounded-3xl border p-12 shadow-xl backdrop-blur-sm transition-colors duration-300 ${
            currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="animate-pulse">
              <div className={`h-8 rounded-xl w-1/3 mb-6 ${
                currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-20 rounded-xl ${
                    currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      currentTheme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-7xl mx-auto py-8 px-6 space-y-8">
        
        {/* Enhanced Header with Statistics */}
        <div className={`rounded-3xl border shadow-xl backdrop-blur-sm overflow-hidden transition-colors duration-300 ${
          currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="h-2 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className={`text-3xl font-bold mb-2 flex items-center transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  <History className="w-8 h-8 text-indigo-600 mr-3" />
                  Quiz History
                </h1>
                <p className={`text-lg transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Track your learning progress and performance over time
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">{totalAttempts}</div>
                <div className={`text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Total Attempts</div>
              </div>
            </div>

            {/* Statistics Dashboard */}
            {totalAttempts > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-700'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                      }`}>Average Score</p>
                      <p className={`text-3xl font-bold transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-blue-200' : 'text-blue-900'
                      }`}>{averageScore}%</p>
                    </div>
                    <BarChart3 className={`w-8 h-8 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                </div>

                <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700'
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-green-300' : 'text-green-700'
                      }`}>Best Score</p>
                      <p className={`text-3xl font-bold transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-green-200' : 'text-green-900'
                      }`}>{Math.round(bestScore)}%</p>
                    </div>
                    <Trophy className={`w-8 h-8 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                </div>

                <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'bg-gradient-to-r from-purple-900/30 to-violet-900/30 border-purple-700'
                    : 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-purple-300' : 'text-purple-700'
                      }`}>Total Questions</p>
                      <p className={`text-3xl font-bold transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-purple-200' : 'text-purple-900'
                      }`}>
                        {attempts.reduce((sum, attempt) => sum + (attempt.score?.total || 0), 0)}
                      </p>
                    </div>
                    <Brain className={`w-8 h-8 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                </div>

                <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'bg-gradient-to-r from-orange-900/30 to-yellow-900/30 border-orange-700'
                    : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-orange-300' : 'text-orange-700'
                      }`}>Trend</p>
                      <div className="flex items-center space-x-2">
                        {recentTrend === 'improving' ? (
                          <>
                            <TrendingUp className="w-6 h-6 text-green-600" />
                            <span className={`text-lg font-bold transition-colors duration-300 ${
                              currentTheme === 'dark' ? 'text-green-200' : 'text-green-900'
                            }`}>Improving</span>
                          </>
                        ) : recentTrend === 'declining' ? (
                          <>
                            <TrendingDown className="w-6 h-6 text-red-600" />
                            <span className={`text-lg font-bold transition-colors duration-300 ${
                              currentTheme === 'dark' ? 'text-red-200' : 'text-red-900'
                            }`}>Needs Focus</span>
                          </>
                        ) : (
                          <>
                            <Target className="w-6 h-6 text-blue-600" />
                            <span className={`text-lg font-bold transition-colors duration-300 ${
                              currentTheme === 'dark' ? 'text-blue-200' : 'text-blue-900'
                            }`}>Stable</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Filters and Search */}
            <div className={`rounded-2xl p-6 mb-8 border transition-colors duration-300 ${
              currentTheme === 'dark'
                ? 'bg-gray-700/50 border-gray-600'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-64">
                  <Search className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search by topic..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 ${
                      currentTheme === 'dark'
                        ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder:text-gray-500'
                        : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>

                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className={`px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 ${
                    currentTheme === 'dark'
                      ? 'border-gray-600 bg-gray-800 text-gray-100'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>

                <select
                  value={filterPerformance}
                  onChange={(e) => setFilterPerformance(e.target.value)}
                  className={`px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 ${
                    currentTheme === 'dark'
                      ? 'border-gray-600 bg-gray-800 text-gray-100'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="all">All Performance</option>
                  <option value="excellent">Excellent (80%+)</option>
                  <option value="good">Good (60-79%)</option>
                  <option value="needs-improvement">Needs Work (&lt;60%)</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 ${
                    currentTheme === 'dark'
                      ? 'border-gray-600 bg-gray-800 text-gray-100'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="score-high">Highest Score</option>
                  <option value="score-low">Lowest Score</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Attempts List */}
        <div className={`rounded-3xl border shadow-xl backdrop-blur-sm overflow-hidden transition-colors duration-300 ${
          currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {filteredAttempts.length === 0 ? (
            <div className="p-16 text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300 ${
                currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {attempts.length === 0 ? (
                  <History className={`w-10 h-10 transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                ) : (
                  <Search className={`w-10 h-10 transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                )}
              </div>
              <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {attempts.length === 0 ? 'No quiz attempts yet' : 'No results found'}
              </h3>
              <p className={`mb-8 transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {attempts.length === 0 
                  ? 'Start taking quizzes to see your history and track your progress'
                  : 'Try adjusting your filters or search terms'
                }
              </p>
              {attempts.length === 0 && (
                <button
                  onClick={() => navigate('/quiz/interface')}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Take Your First Quiz
                </button>
              )}
            </div>
          ) : (
            <div className={`divide-y transition-colors duration-300 ${
              currentTheme === 'dark' ? 'divide-gray-700' : 'divide-gray-100'
            }`}>
              {filteredAttempts.map((attempt, index) => {
                const percentage = attempt.score?.total > 0 
                  ? Math.round((attempt.score.correct / attempt.score.total) * 100) 
                  : 0
                
                const badge = getPerformanceBadge(attempt.score)
                const BadgeIcon = badge.icon

                return (
                  <div
                    key={attempt.attemptId || index}
                    onClick={() => handleAttemptClick(attempt.attemptId)}
                    className={`p-6 cursor-pointer transition-all duration-200 group ${
                      currentTheme === 'dark'
                        ? 'hover:bg-gradient-to-r hover:from-blue-900/20 hover:to-indigo-900/20'
                        : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleAttemptClick(attempt.attemptId)
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start space-x-4">
                          {/* Topic Icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                            currentTheme === 'dark'
                              ? 'bg-gradient-to-r from-indigo-900/40 to-purple-900/40'
                              : 'bg-gradient-to-r from-indigo-100 to-purple-100'
                          }`}>
                            <BookOpen className="w-6 h-6 text-indigo-600" />
                          </div>

                          <div className="flex-1">
                            {/* Topic and Badges */}
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              <h3 className={`text-lg font-semibold truncate transition-colors duration-300 ${
                                currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                              }`}>
                                {attempt.topic || 'Unknown Topic'}
                              </h3>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                                attempt.difficulty === 'beginner' 
                                  ? currentTheme === 'dark'
                                    ? 'bg-green-900/30 text-green-300 border-green-700'
                                    : 'bg-green-100 text-green-800 border-green-300'
                                  : attempt.difficulty === 'intermediate'
                                  ? currentTheme === 'dark'
                                    ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700'
                                    : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                  : currentTheme === 'dark'
                                    ? 'bg-red-900/30 text-red-300 border-red-700'
                                    : 'bg-red-100 text-red-800 border-red-300'
                              }`}>
                                <Target className="w-3 h-3 mr-1" />
                                {attempt.difficulty || 'intermediate'}
                              </span>
                            </div>

                            {/* Details */}
                            <div className={`flex items-center space-x-4 text-sm mb-2 transition-colors duration-300 ${
                              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(attempt.submitted_at)}
                              </span>
                              <span className="flex items-center">
                                <Brain className="w-4 h-4 mr-1" />
                                {attempt.score?.total || 0} questions
                              </span>
                              {attempt.timingData?.totalTimeSpent && (
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {Math.round(attempt.timingData.totalTimeSpent / 60)}m
                                </span>
                              )}
                            </div>

                            {/* Performance Badge */}
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                              {BadgeIcon && <BadgeIcon className="w-4 h-4 mr-1" />}
                              {badge.text}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Score Section */}
                      <div className="flex items-center space-x-6 ml-6">
                        {/* Score Display */}
                        <div className="text-right">
                          <div className={`text-2xl font-bold mb-1 ${getScoreColor(attempt.score)}`}>
                            {attempt.score?.correct || 0}/{attempt.score?.total || 0}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreBackground(attempt.score)} ${getScoreColor(attempt.score)}`}>
                            {percentage}%
                          </div>
                        </div>

                        {/* View Details Button */}
                        <div className="flex items-center space-x-2">
                          <button className={`p-2 rounded-lg transition-all group-hover:text-indigo-600 ${
                            currentTheme === 'dark'
                              ? 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-900/20'
                              : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                          }`}>
                            <Eye className="w-5 h-5" />
                          </button>
                          <ChevronRight className={`w-5 h-5 transition-colors group-hover:text-indigo-600 ${
                            currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer Actions */}
          {filteredAttempts.length > 0 && (
            <div className={`border-t p-6 transition-colors duration-300 ${
              currentTheme === 'dark'
                ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-700'
                : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200'
            }`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className={`text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Showing {filteredAttempts.length} of {totalAttempts} attempts
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/analytics')}
                    className={`inline-flex items-center px-6 py-3 border rounded-xl font-medium transition-all ${
                      currentTheme === 'dark'
                        ? 'text-gray-300 hover:text-gray-100 border-gray-600 hover:bg-gray-700'
                        : 'text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </button>
                  <button
                    onClick={() => navigate('/quiz/interface')}
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Take Another Quiz
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
