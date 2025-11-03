import React, { useState } from 'react'
import Button from '../../components/ui/Button'
import {
  User,
  Users,
  Clock,
  Calendar,
  Star,
  CheckCircle,
  BookOpen,
  Target,
  TrendingUp,
  Award,
  Sparkles,
  Eye,
  Heart,
  Share,
  Play
} from 'lucide-react'

const Tag = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    difficulty: {
      beginner: 'bg-green-50 text-green-700 ring-green-600/20',
      intermediate: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
      advanced: 'bg-red-50 text-red-700 ring-red-600/20'
    },
    duration: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    topic: 'bg-purple-50 text-purple-700 ring-purple-600/20'
  }

  const getVariantClass = () => {
    if (variant === 'default') return variants.default
    if (typeof variant === 'object') return variant
    return variants[variant] || variants.default
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition-all hover:scale-105 ${getVariantClass()}`}>
      {children}
    </span>
  )
}

const ProgressBar = ({ value, max = 100, color = 'indigo' }) => {
  const percentage = Math.min((value / max) * 100, 100)
  const colorClasses = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div 
        className={`h-2 rounded-full transition-all duration-1000 ${colorClasses[color]} relative overflow-hidden`}
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
      </div>
    </div>
  )
}

export default function CourseCard({
  title,
  description,
  instructor,
  difficulty = 'intermediate',
  durationWeeks = 8,
  enrolledCount = 0,
  maxStudents = 100,
  tags = [],
  recommendedScore, // 0..1
  isEnrolled = false,
  canEnroll = false,
  onEnroll,
  rating = null,
  totalLessons = null,
  completedLessons = 0,
  lastUpdated = null,
  level = null
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const enrollmentPercentage = (enrolledCount / maxStudents) * 100
  const difficultyColors = {
    beginner: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    intermediate: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    advanced: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
  }

  const difficultyColor = difficultyColors[difficulty] || difficultyColors.intermediate

  return (
    <div 
      className={`group relative flex h-full flex-col rounded-3xl border-2 border-gray-200 bg-white shadow-lg backdrop-blur-sm transition-all duration-300 overflow-hidden ${
        isHovered ? 'shadow-2xl scale-105 border-indigo-300' : 'hover:shadow-xl hover:scale-102'
      } ${isEnrolled ? 'ring-2 ring-green-200' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50 opacity-60"></div>
      
      {/* Recommendation Badge */}
      {typeof recommendedScore === 'number' && recommendedScore > 0.7 && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            <Sparkles className="w-3 h-3" />
            <span>{Math.round(recommendedScore * 100)}% match</span>
          </div>
        </div>
      )}

      {/* Enrolled Badge */}
      {isEnrolled && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            <CheckCircle className="w-3 h-3" />
            <span>Enrolled</span>
          </div>
        </div>
      )}

      <div className="relative flex flex-col h-full p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-900 transition-colors leading-tight">
              {title}
            </h3>
            {rating && (
              <div className="flex items-center mt-2 space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-600">({rating})</span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={`p-2 rounded-full transition-all ${
                isFavorited 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-all">
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed mb-4 flex-grow-0">
          {description}
        </p>

        {/* Enhanced Tags Section */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Tag variant={difficultyColors[difficulty]?.bg || 'bg-gray-50'}>
            <Target className="w-3 h-3 mr-1" />
            {difficulty}
          </Tag>
          <Tag variant="duration">
            <Clock className="w-3 h-3 mr-1" />
            {durationWeeks} weeks
          </Tag>
          {totalLessons && (
            <Tag variant="topic">
              <BookOpen className="w-3 h-3 mr-1" />
              {totalLessons} lessons
            </Tag>
          )}
          {tags.slice(0, 2).map((tag) => (
            <Tag key={tag} variant="default">
              {tag}
            </Tag>
          ))}
        </div>

        {/* Enhanced Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center text-gray-500 text-xs">
              <User className="w-3 h-3 mr-1" />
              <span>Instructor</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">{instructor}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-gray-500 text-xs">
              <Users className="w-3 h-3 mr-1" />
              <span>Enrollment</span>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 text-sm">
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

        {/* Progress Section (for enrolled students) */}
        {isEnrolled && totalLessons && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-green-900">Your Progress</span>
              <span className="text-xs text-green-700">
                {Math.round((completedLessons / totalLessons) * 100)}% complete
              </span>
            </div>
            <ProgressBar 
              value={completedLessons} 
              max={totalLessons} 
              color="green"
            />
            <div className="flex items-center justify-between mt-2 text-xs text-green-700">
              <span>{completedLessons} of {totalLessons} lessons</span>
              <div className="flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>On track</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Section */}
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`flex items-center text-xs font-medium ${
                isEnrolled 
                  ? 'text-green-700' 
                  : canEnroll 
                    ? 'text-indigo-600' 
                    : 'text-gray-500'
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
                <span className="text-xs text-gray-400">
                  Updated {lastUpdated}
                </span>
              )}
            </div>

            {/* Action Button */}
            <div className="flex items-center space-x-2">
              {isEnrolled ? (
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Continue
                </Button>
              ) : canEnroll ? (
                <Button 
                  size="sm" 
                  onClick={onEnroll}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  Enroll Now
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-gray-400 transition-all"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Overlay Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}></div>
    </div>
  )
}
