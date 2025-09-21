import React, { useState } from 'react'
import CourseCard from './CourseCard'
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
  Target
} from 'lucide-react'

const EmptyState = () => (
  <div className="col-span-full">
    <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-gray-300 bg-white p-16 text-center shadow-sm">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50"></div>
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
        <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10 text-indigo-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Courses Found</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
          We couldn't find any courses matching your criteria. Try adjusting your filters or check back later for new content.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <Search className="w-4 h-4 mr-2" />
            Browse All Courses
          </button>
          <button className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all">
            <Sparkles className="w-4 h-4 mr-2" />
            Get Recommendations
          </button>
        </div>
        
        {/* Suggested Actions */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Clear Filters</h4>
            <p className="text-sm text-gray-600">Remove search filters to see all available courses</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">AI Recommendations</h4>
            <p className="text-sm text-gray-600">Let AI suggest courses based on your profile</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Popular Courses</h4>
            <p className="text-sm text-gray-600">Check out what other students are taking</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const LoadingSkeleton = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="rounded-3xl border-2 border-gray-200 bg-white p-6 h-96">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

const CourseStats = ({ courses = [] }) => {
  const totalCourses = courses.length
  const enrolledCourses = courses.filter(c => c.isEnrolled).length
  const availableCourses = courses.filter(c => c.canEnroll && !c.isEnrolled).length
  const recommendedCourses = courses.filter(c => c.recommendationScore > 0.7).length

  const stats = [
    { label: 'Total Courses', value: totalCourses, icon: BookOpen, color: 'text-blue-600 bg-blue-100' },
    { label: 'Enrolled', value: enrolledCourses, icon: Users, color: 'text-green-600 bg-green-100' },
    { label: 'Available', value: availableCourses, icon: Target, color: 'text-purple-600 bg-purple-100' },
    { label: 'Recommended', value: recommendedCourses, icon: Sparkles, color: 'text-yellow-600 bg-yellow-100' }
  ]

  if (totalCourses === 0) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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

export default function CourseList({ 
  courses = [], 
  onEnroll, 
  loading = false,
  title = "Available Courses",
  subtitle = "Discover courses tailored to your learning journey",
  showStats = true,
  showSearch = true,
  gridCols = "sm:grid-cols-2 lg:grid-cols-3"
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recommended') // recommended, title, difficulty, enrollment
  const [viewMode, setViewMode] = useState('grid') // grid, list
  const [showFilters, setShowFilters] = useState(false)

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

  if (loading) {
    return (
      <div className="space-y-8">
        {showStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-8"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        )}
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-xl text-gray-600 mb-8">{subtitle}</p>
      </div>

      {/* Course Stats */}
      {showStats && <CourseStats courses={courses} />}

      {/* Search and Filter Section */}
      {showSearch && courses.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option value="recommended">Recommended</option>
                <option value="title">Title A-Z</option>
                <option value="difficulty">Difficulty</option>
                <option value="enrollment">Most Popular</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
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
              <span className="text-sm text-gray-600">Active filters:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredCourses.length}</span> of <span className="font-semibold">{courses.length}</span> courses
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Course Cards */}
          <div className={`grid gap-8 ${gridCols}`}>
            {filteredCourses.map((course) => (
              <CourseCard
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
                rating={course.rating}
                totalLessons={course.totalLessons}
                completedLessons={course.completedLessons}
                lastUpdated={course.lastUpdated}
                onEnroll={() => onEnroll?.(course.courseId)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
