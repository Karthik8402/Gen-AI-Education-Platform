import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowUpRightIcon, 
  BookOpenIcon, 
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  PlusIcon,
  ClockIcon,
  TrophyIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { api } from '../../services/api'
import { formatDate } from '../../services/utils/helpers'

const StatCard = ({ title, value, change, icon: Icon, color, unit = '' }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{value ?? 0}{unit}</p>
        {change && (
          <p className={`mt-2 text-sm ${change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
            {change} vs last week
          </p>
        )}
      </div>
      <div className={`rounded-lg p-3 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
)

const ActivityItem = ({ title, time, detail, score, type }) => (
  <div className="flex items-start gap-4">
    <div className={`h-2.5 w-2.5 translate-y-2 rounded-full ${
      type === 'quiz' ? 'bg-indigo-600' : 
      type === 'enrollment' ? 'bg-emerald-600' : 
      'bg-purple-600'
    }`}></div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{detail}</p>
      <p className="mt-1 text-xs text-gray-400">{time}</p>
    </div>
    {score && (
      <span className={`text-sm font-semibold ${
        score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
      }`}>
        {score}%
      </span>
    )}
  </div>
)

export default function TeacherDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api('/api/teacher/analytics')
        setData(res)
      } catch (err) {
        setError(err.message)
        console.error('Failed to fetch teacher analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-64 rounded bg-gray-200"></div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-600">Could not load dashboard data: {error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <p className="text-sm text-gray-600">No analytics data available.</p>
      </div>
    )
  }

  const overview = data.overview || {}
  const courses = data.courses || []
  const recentActivity = data.recentActivity || []
  const templates = data.templates || []
  const teacherInfo = data.teacher || {}

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {teacherInfo.name || 'Teacher'}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your courses, monitor student progress, and create engaging content.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/quiz/templates/create"
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Template
          </Link>
          <Link
            to="/courses/create"
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Course
            <ArrowUpRightIcon className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="My Courses" 
          value={overview.totalCourses} 
          change={overview.totalCourses > 0 ? `+${Math.min(overview.totalCourses, 3)}` : null}
          icon={BookOpenIcon} 
          color="bg-indigo-600" 
        />
        <StatCard 
          title="Total Students" 
          value={overview.totalEnrolled} 
          change={overview.totalEnrolled > 0 ? `+${Math.min(overview.totalEnrolled, 15)}` : null}
          icon={UsersIcon} 
          color="bg-emerald-600" 
        />
        <StatCard 
          title="Avg Enrollment" 
          value={Math.round(overview.averageEnrollment || 0)} 
          change={overview.averageEnrollment > 10 ? '+12%' : null}
          icon={ChartBarIcon} 
          color="bg-purple-600" 
          unit=" per course" 
        />
        <StatCard 
          title="Quiz Templates" 
          value={templates.length} 
          change={templates.length > 0 ? `+${Math.min(templates.length, 2)}` : null}
          icon={DocumentTextIcon} 
          color="bg-sky-600" 
        />
      </div>

      {/* Teaching Performance Banner */}
      {overview.totalCourses > 0 && (
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Teaching Performance Overview
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                You have {overview.totalCourses} active course{overview.totalCourses !== 1 ? 's' : ''} 
                with {overview.totalEnrolled} enrolled student{overview.totalEnrolled !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                {Math.round((overview.averageEnrollment || 0))}
              </div>
              <div className="text-sm text-blue-700">Avg per Course</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* My Courses */}
        <section className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">📚 My Courses</h2>
            <Link
              to="/courses/my-courses"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all →
            </Link>
          </div>
          
          {courses.length > 0 ? (
            <ul className="space-y-4">
              {courses.slice(0, 5).map((course) => (
                <li key={course.courseId} className="flex items-start justify-between rounded-lg border border-gray-100 p-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {course.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Level: <span className="capitalize">{course.difficultyLevel}</span> • 
                      {course.enrolledStudents} enrolled • 
                      Created {course.createdAt ? formatDate(course.createdAt) : 'Recently'}
                    </p>
                    <div className="mt-2 flex gap-2">
                      {course.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      to={`/courses/${course.courseId}`} 
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                    >
                      <EyeIcon className="h-4 w-4 inline mr-1" />
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No courses yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Get started by creating your first course to engage with students.
              </p>
              <Link
                to="/courses/create"
                className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Create First Course
              </Link>
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <aside className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Recent Student Activity</h2>
          
          {recentActivity.length > 0 ? (
            <div className="mt-6 space-y-6">
              {recentActivity.slice(-6).reverse().map((activity, index) => (
                <ActivityItem
                  key={index}
                  title={activity.type === 'quiz' ? `Quiz: ${activity.topic}` : 
                         activity.type === 'enrollment' ? `New Enrollment` :
                         `Activity: ${activity.topic}`}
                  detail={`Student: ${activity.studentName || activity.studentId}`}
                  time={formatDate(activity.submittedAt)}
                  score={activity.score}
                  type={activity.type}
                />
              ))}
              
              <Link
                to="/teacher/student-activity"
                className="mt-4 block text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all activity →
              </Link>
            </div>
          ) : (
            <div className="mt-6 text-center">
              <ClockIcon className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No recent activity</p>
              <p className="text-xs text-gray-400">Student activity will appear here</p>
            </div>
          )}
        </aside>
      </div>

      {/* Quiz Templates Section */}
      {templates.length > 0 && (
        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">🧩 My Quiz Templates</h2>
            <Link
              to="/quiz/templates"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage templates →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.slice(0, 6).map((template) => (
              <div key={template.templateId} className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    template.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{template.topic}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {template.questionCount} questions • {template.difficulty}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/courses/create"
            className="flex items-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <BookOpenIcon className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="font-medium text-gray-900">Create Course</p>
              <p className="text-sm text-gray-500">Start a new course</p>
            </div>
          </Link>
          
          <Link
            to="/quiz/templates/create"
            className="flex items-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <DocumentTextIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="font-medium text-gray-900">Quiz Template</p>
              <p className="text-sm text-gray-500">Create reusable quiz</p>
            </div>
          </Link>
          
          <Link
            to="/teacher/students"
            className="flex items-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <UsersIcon className="h-8 w-8 text-emerald-600" />
            <div className="ml-4">
              <p className="font-medium text-gray-900">View Students</p>
              <p className="text-sm text-gray-500">Monitor progress</p>
            </div>
          </Link>
          
          <Link
            to="/analytics"
            className="flex items-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <ChartBarIcon className="h-8 w-8 text-sky-600" />
            <div className="ml-4">
              <p className="font-medium text-gray-900">Analytics</p>
              <p className="text-sm text-gray-500">Detailed insights</p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  )
}
