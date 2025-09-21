import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { api } from '@/services/api'
import {
  BookOpen,
  Search,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Sparkles,
  Brain,
  TrendingUp,
  Users,
  Clock,
  Target,
  AlertCircle,
  RotateCcw,
  Star,
  Trophy,
  Award,
  CheckCircle,
  Play,
  Eye,
  Heart,
  Share
} from 'lucide-react'

// ✅ Beautiful Courses Loader Component
const CoursesLoader = () => {
  const { currentTheme } = useTheme()

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      currentTheme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="text-center max-w-md mx-auto px-6">
        {/* Main Icon Container */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl animate-pulse transition-colors duration-300 ${
          currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="relative">
            {/* Spinning Border */}
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            
            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
            
            {/* Floating Sparkles */}
            <div className="absolute -top-2 -right-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <div className="absolute -bottom-1 -left-1 animate-pulse">
              <Users className="w-3 h-3 text-green-500" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4 mb-8">
          <h2 className={`text-3xl font-bold transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Loading Courses
          </h2>
          
          <p className={`text-lg leading-relaxed transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Finding personalized courses tailored to your learning journey...
          </p>
        </div>

        {/* Animated Course Preview */}
        <div className={`rounded-2xl border p-6 mb-8 backdrop-blur-sm transition-colors duration-300 ${
          currentTheme === 'dark'
            ? 'bg-gray-800/80 border-gray-600'
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg mx-auto mb-2 animate-pulse"></div>
              <div className={`text-sm transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Programming</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2 animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className={`text-sm transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>AI & ML</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-2 animate-pulse" style={{animationDelay: '0.4s'}}></div>
              <div className={`text-sm transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Data Science</div>
            </div>
          </div>
        </div>

        {/* AI Powered Badge */}
        <div className={`flex items-center justify-center space-x-2 text-sm transition-colors duration-300 ${
          currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Brain className="w-4 h-4" />
          <span>AI-Curated Course Recommendations</span>
        </div>

        {/* Animated Progress Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full animate-bounce transition-colors duration-300 ${
                currentTheme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-600'
              }`}
              style={{ 
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ✅ Enhanced Tag Component with consistent sizing
const Tag = ({ children, variant = 'default' }) => {
  const { currentTheme } = useTheme()
  
  const variants = {
    default: currentTheme === 'dark' 
      ? 'bg-indigo-900/30 text-indigo-300 ring-indigo-600/20' 
      : 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    difficulty: currentTheme === 'dark'
      ? 'bg-green-900/30 text-green-300 ring-green-600/20'
      : 'bg-green-50 text-green-700 ring-green-600/20',
    duration: currentTheme === 'dark'
      ? 'bg-blue-900/30 text-blue-300 ring-blue-600/20'
      : 'bg-blue-50 text-blue-700 ring-blue-600/20',
    topic: currentTheme === 'dark'
      ? 'bg-purple-900/30 text-purple-300 ring-purple-600/20'
      : 'bg-purple-50 text-purple-700 ring-purple-600/20'
  }

  const getVariantClass = () => {
    return variants[variant] || variants.default
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-all hover:scale-105 whitespace-nowrap ${getVariantClass()}`}>
      {children}
    </span>
  )
}

// Progress Bar Component with theme support
const ProgressBar = ({ value, max = 100, color = 'indigo' }) => {
  const { currentTheme } = useTheme()
  const percentage = Math.min((value / max) * 100, 100)
  
  const colorClasses = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <div className={`w-full rounded-full h-2 overflow-hidden transition-colors duration-300 ${
      currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
    }`}>
      <div 
        className={`h-2 rounded-full transition-all duration-1000 ${colorClasses[color]} relative overflow-hidden`}
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
      </div>
    </div>
  )
}

// ✅ Enhanced Course Card Component with perfect alignment
const ThemedCourseCard = ({
  title,
  description,
  instructor,
  difficulty = 'intermediate',
  durationWeeks = 8,
  enrolledCount = 0,
  maxStudents = 100,
  tags = [],
  recommendedScore,
  isEnrolled = false,
  canEnroll = false,
  onEnroll,
  rating = 4.5,
  totalLessons = 12,
  completedLessons = 0,
  lastUpdated = null
}) => {
  const { currentTheme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const enrollmentPercentage = (enrolledCount / maxStudents) * 100

  return (
    <div 
      className={`group relative flex flex-col rounded-3xl border-2 shadow-lg backdrop-blur-sm transition-all duration-300 overflow-hidden min-h-[520px] ${
        isHovered ? 'shadow-2xl scale-[1.02] border-indigo-400' : 'hover:shadow-xl'
      } ${isEnrolled ? 'ring-2 ring-green-200' : ''} ${
        currentTheme === 'dark'
          ? 'border-gray-700 bg-gray-800'
          : 'border-gray-200 bg-white'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Gradient Overlay */}
      <div className={`absolute inset-0 opacity-60 transition-colors duration-300 ${
        currentTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-white via-white to-blue-50'
      }`}></div>
      
      {/* Recommendation Badge */}
      {typeof recommendedScore === 'number' && recommendedScore > 0.7 && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            <Sparkles className="w-3 h-3" />
            <span>{Math.round(recommendedScore * 100)}% match</span>
          </div>
        </div>
      )}

      {/* Enrolled Badge */}
      {isEnrolled && (
        <div className="absolute top-4 left-4 z-20">
          <div className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            <CheckCircle className="w-3 h-3" />
            <span>Enrolled</span>
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="relative flex flex-col h-full p-6">
        {/* Header Section - Fixed Height */}
        <div className="mb-4 min-h-[120px]">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <h3 className={`text-xl font-bold leading-tight line-clamp-2 transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              } group-hover:text-indigo-600`}>
                {title}
              </h3>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className={`p-1.5 rounded-full transition-all ${
                  isFavorited 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : currentTheme === 'dark'
                      ? 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                }`}
              >
                <Heart className={`w-3 h-3 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              <button className={`p-1.5 rounded-full transition-all ${
                currentTheme === 'dark'
                  ? 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
              }`}>
                <Share className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Rating */}
          {rating && (
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className={`text-sm font-medium transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>({rating})</span>
            </div>
          )}
        </div>

        {/* Description - Fixed Height */}
        <div className="mb-4 min-h-[60px]">
          <p className={`line-clamp-3 text-sm leading-relaxed transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {description}
          </p>
        </div>

        {/* Tags Section - Fixed Height */}
        <div className="mb-6 min-h-[32px]">
          <div className="flex flex-wrap items-center gap-2">
            <Tag variant="difficulty">
              <Target className="w-3 h-3 mr-1" />
              {difficulty}
            </Tag>
            <Tag variant="duration">
              <Clock className="w-3 h-3 mr-1" />
              {durationWeeks} weeks
            </Tag>
            <Tag variant="topic">
              <BookOpen className="w-3 h-3 mr-1" />
              {totalLessons} lessons
            </Tag>
            {tags.slice(0, 1).map((tag) => (
              <Tag key={tag} variant="default">
                {tag}
              </Tag>
            ))}
          </div>
        </div>

        {/* Info Grid Section - Fixed Height */}
        <div className="mb-6 min-h-[80px]">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className={`flex items-center text-xs transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Users className="w-3 h-3 mr-1" />
                <span>Instructor</span>
              </div>
              <p className={`font-semibold text-sm transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>{instructor}</p>
            </div>
            
            <div className="space-y-1">
              <div className={`flex items-center text-xs transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Users className="w-3 h-3 mr-1" />
                <span>Enrollment</span>
              </div>
              <div className="space-y-2">
                <p className={`font-semibold text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {enrolledCount}/{maxStudents}
                </p>
                <ProgressBar 
                  value={enrolledCount} 
                  max={maxStudents} 
                  color={enrollmentPercentage > 80 ? 'red' : enrollmentPercentage > 50 ? 'yellow' : 'green'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section for Enrolled Students */}
        {isEnrolled && (
          <div className={`mb-6 p-4 rounded-2xl border transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-green-900/20 border-green-700'
              : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-semibold transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-green-300' : 'text-green-900'
              }`}>Your Progress</span>
              <span className={`text-xs transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-green-400' : 'text-green-700'
              }`}>
                {Math.round((completedLessons / totalLessons) * 100)}% complete
              </span>
            </div>
            <ProgressBar 
              value={completedLessons} 
              max={totalLessons} 
              color="green"
            />
            <div className={`flex items-center justify-between mt-2 text-xs transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-green-400' : 'text-green-700'
            }`}>
              <span>{completedLessons} of {totalLessons} lessons</span>
              <div className="flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>On track</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Section - Always at Bottom */}
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`flex items-center text-xs font-medium ${
                isEnrolled 
                  ? currentTheme === 'dark' ? 'text-green-400' : 'text-green-700'
                  : canEnroll 
                    ? currentTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                    : currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {isEnrolled ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enrolled
                  </>
                ) : canEnroll ? (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Ready to start
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    View only
                  </>
                )}
              </span>
              
              {lastUpdated && (
                <span className={`text-xs transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Updated {lastUpdated}
                </span>
              )}
            </div>

            {/* Action Button */}
            <div className="flex items-center space-x-2">
              {isEnrolled ? (
                <button className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-semibold flex items-center min-w-[100px] justify-center">
                  <Play className="w-4 h-4 mr-2" />
                  Continue
                </button>
              ) : canEnroll ? (
                <button 
                  onClick={onEnroll}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] text-sm font-semibold flex items-center min-w-[100px] justify-center"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Enroll Now
                </button>
              ) : (
                <button className={`px-4 py-2.5 border-2 rounded-lg transition-all text-sm font-semibold flex items-center min-w-[100px] justify-center ${
                  currentTheme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Overlay Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 transition-opacity duration-300 pointer-events-none ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}></div>
    </div>
  )
}

// Main Courses Component
export default function Courses() {
  const { user } = useAuth()
  const { currentTheme } = useTheme()
  const navigate = useNavigate()
  
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recommended')
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await api('/api/courses')
      
      if (response.courses) {
        setCourses(response.courses)
      } else {
        throw new Error('Invalid response format')
      }

    } catch (err) {
      console.error('Courses fetch error:', err)
      setError(err.message || 'Failed to load courses')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleEnroll = async (courseId) => {
    try {
      const response = await api(`/api/courses/${courseId}/enroll`, {
        method: 'POST'
      })

      // Update local state
      setCourses(prev => prev.map(course => 
        course.courseId === courseId 
          ? { 
              ...course, 
              isEnrolled: true, 
              canEnroll: false,
              enrolledCount: course.enrolledCount + 1 
            }
          : course
      ))

      // Show success message
      alert(`Successfully enrolled in ${response.courseTitle}!`)

    } catch (err) {
      console.error('Enrollment error:', err)
      alert(err.message || 'Failed to enroll in course')
    }
  }

  const handleRefresh = () => {
    fetchCourses(true)
  }

  // Filter and sort courses
  const filteredCourses = courses
    .filter(course => 
      !searchTerm || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 }
          return difficultyOrder[a.difficultyLevel] - difficultyOrder[b.difficultyLevel]
        case 'enrollment':
          return b.enrolledCount - a.enrolledCount
        case 'recommended':
        default:
          return (b.recommendationScore || 0) - (a.recommendationScore || 0)
      }
    })

  // Course Stats Component
  const CourseStats = () => {
    const totalCourses = courses.length
    const enrolledCourses = courses.filter(c => c.isEnrolled).length
    const availableCourses = courses.filter(c => c.canEnroll && !c.isEnrolled).length
    const recommendedCourses = courses.filter(c => c.recommendationScore > 0.7).length

    const stats = [
      { label: 'Total Courses', value: totalCourses, icon: BookOpen, color: currentTheme === 'dark' ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-100' },
      { label: 'Enrolled', value: enrolledCourses, icon: Users, color: currentTheme === 'dark' ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-100' },
      { label: 'Available', value: availableCourses, icon: Target, color: currentTheme === 'dark' ? 'text-purple-400 bg-purple-900/30' : 'text-purple-600 bg-purple-100' },
      { label: 'Recommended', value: recommendedCourses, icon: Sparkles, color: currentTheme === 'dark' ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-600 bg-yellow-100' }
    ]

    if (totalCourses === 0) return null

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className={`rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all ${
              currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{stat.label}</p>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Empty State Component
  const EmptyState = () => (
    <div className="col-span-full">
      <div className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-16 text-center shadow-sm transition-colors duration-300 ${
        currentTheme === 'dark'
          ? 'border-gray-600 bg-gray-800'
          : 'border-gray-300 bg-white'
      }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute inset-0 transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gradient-to-br from-gray-800 to-gray-700'
              : 'bg-gradient-to-br from-indigo-50 to-purple-50'
          }`}></div>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="m 40 0 l 0 40 l -40 0" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Content */}
        <div className="relative">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50'
              : 'bg-gradient-to-r from-indigo-100 to-purple-100'
          }`}>
            <BookOpen className={`w-10 h-10 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
          </div>
          
          <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>No Courses Found</h3>
          <p className={`mb-8 max-w-md mx-auto text-lg transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            We couldn't find any courses matching your criteria. Try adjusting your filters or check back later for new content.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse All Courses
            </button>
            <button 
              onClick={() => navigate('/quiz/interface')}
              className={`inline-flex items-center px-6 py-3 border-2 rounded-xl font-semibold transition-all ${
                currentTheme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Recommendations
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ✅ BEAUTIFUL LOADER - Using the same style as PlacementQuiz and Analytics
  if (loading) {
    return <CoursesLoader />
  }

  // Error State
  if (error) {
    return (
      <div className={`min-h-screen p-4 lg:p-6 flex items-center justify-center transition-colors duration-300 ${
        currentTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="text-center max-w-md">
          <AlertCircle className={`w-16 h-16 mx-auto mb-6 transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-red-400' : 'text-red-600'
          }`} />
          <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>Unable to Load Courses</h3>
          <p className={`mb-8 transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchCourses}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                currentTheme === 'dark'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                currentTheme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-4 lg:p-6 transition-colors duration-300 ${
      currentTheme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className={`rounded-3xl border backdrop-blur-sm p-6 lg:p-8 mb-6 transition-colors duration-300 ${
          currentTheme === 'dark'
            ? 'bg-gray-800/95 border-gray-700/50'
            : 'bg-white/95 border-white/20'
        }`}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className={`text-3xl lg:text-4xl font-bold transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'
                }`}>
                  Discover Courses
                </h1>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={`p-2 rounded-lg transition-all duration-200 ${refreshing ? 'animate-spin' : ''} ${
                    currentTheme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
              <p className={`text-lg mb-4 transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Explore AI-curated courses tailored to your learning journey and skill level.
              </p>
            </div>
          </div>
        </div>

        {/* Course Stats */}
        <CourseStats />

        {/* Search and Filter Section */}
        {courses.length > 0 && (
          <div className={`rounded-2xl border backdrop-blur-sm p-6 mb-6 transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gray-800/95 border-gray-700/50'
              : 'bg-white/95 border-white/20'
          }`}>
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${
                    currentTheme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-500'
                  }`}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${
                    currentTheme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-gray-100'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="recommended">Recommended</option>
                  <option value="title">Title A-Z</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="enrollment">Most Popular</option>
                </select>

                {/* View Mode Toggle */}
                <div className={`flex items-center rounded-lg p-1 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'grid' 
                        ? currentTheme === 'dark'
                          ? 'bg-gray-600 text-indigo-400 shadow-sm'
                          : 'bg-white text-indigo-600 shadow-sm'
                        : currentTheme === 'dark'
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'list' 
                        ? currentTheme === 'dark'
                          ? 'bg-gray-600 text-indigo-400 shadow-sm'
                          : 'bg-white text-indigo-600 shadow-sm'
                        : currentTheme === 'dark'
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {searchTerm && (
              <div className="mt-4 flex items-center space-x-2">
                <span className={`text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Active filters:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'bg-indigo-900/50 text-indigo-300'
                    : 'bg-indigo-100 text-indigo-800'
                }`}>
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className={`ml-2 transition-colors duration-300 ${
                      currentTheme === 'dark'
                        ? 'text-indigo-400 hover:text-indigo-300'
                        : 'text-indigo-600 hover:text-indigo-800'
                    }`}
                  >
                    ×
                  </button>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Course Content */}
        <div className={`rounded-3xl border backdrop-blur-sm p-6 lg:p-8 transition-colors duration-300 ${
          currentTheme === 'dark'
            ? 'bg-gray-800/95 border-gray-700/50'
            : 'bg-white/95 border-white/20'
        }`}>
          {filteredCourses.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Results Summary */}
              <div className="flex items-center justify-between mb-8">
                <p className={`transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Showing <span className="font-semibold">{filteredCourses.length}</span> of <span className="font-semibold">{courses.length}</span> courses
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={`text-sm font-medium transition-colors duration-300 ${
                      currentTheme === 'dark'
                        ? 'text-indigo-400 hover:text-indigo-300'
                        : 'text-indigo-600 hover:text-indigo-800'
                    }`}
                  >
                    Clear search
                  </button>
                )}
              </div>

              {/* Course Grid */}
              <div className={`grid gap-8 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredCourses.map((course) => (
                  <ThemedCourseCard
                    key={course.courseId}
                    title={course.title}
                    description={course.description}
                    instructor={course.instructor}
                    difficulty={course.difficultyLevel}
                    durationWeeks={course.durationWeeks}
                    enrolledCount={course.enrolledCount}
                    maxStudents={course.maxStudents}
                    tags={course.tags}
                    recommendedScore={course.recommendationScore}
                    isEnrolled={course.isEnrolled}
                    canEnroll={course.canEnroll}
                    rating={4.5}
                    totalLessons={12}
                    completedLessons={course.isEnrolled ? 3 : 0}
                    lastUpdated="2 days ago"
                    onEnroll={() => handleEnroll(course.courseId)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
