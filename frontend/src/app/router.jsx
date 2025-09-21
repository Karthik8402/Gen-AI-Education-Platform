import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from '@/components/ui/Navbar'

// Page components
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'
import Reset from '@/pages/Reset'
import Dashboard from '@/pages/Dashboard'
import Profile from '@/pages/Profile'
import ContentGenerator from '@/pages/ContentGenerator'
import NotFound from '@/pages/NotFound'
import Unauthorized from '@/pages/Unauthorized' // ✅ Add this

// Quiz components
import Quiz from '@/pages/Quiz'
import QuizHistory from '@/features/quiz/QuizHistory'
import QuizResults from '@/features/quiz/QuizResults'
import QuizInterface from '@/features/quiz/QuizInterface'
import PlacementQuiz from '@/features/quiz/PlacementQuiz'

// Dashboard components
import StudentDashboard from '@/features/dashboard/StudentDashboard'
import TeacherDashboard from '@/features/dashboard/TeacherDashboard'
import AdminDashboard from '@/features/dashboard/AdminDashboard'

// Analytics Features
import AnalyticsMe from '../features/Analytics/AnalyticsMe'

// Course
import Courses from '@/pages/Courses'
import CourseList from '@/features/courses/CourseList'
import CourseCard from '@/features/courses/CourseCard'

// Auth component
import PrivateRoute from '@/features/auth/PrivateRoute'

export default function AppRouter() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <Routes>
          {/* ========= PUBLIC ROUTES ========= */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/unauthorized" element={<Unauthorized />} /> {/* ✅ Add this */}

          {/* ========= ROLE-SPECIFIC DASHBOARD ROUTES ========= */}
          <Route
            path="/dashboard/student"
            element={
              <PrivateRoute roles={['student']}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/teacher"
            element={
              <PrivateRoute roles={['teacher', 'admin']}>
                <TeacherDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* ✅ Single dashboard route that auto-redirects based on role */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* ========= PROTECTED ROUTES ========= */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* ========= QUIZ ROUTES ========= */}
          <Route
            path="/quiz"
            element={
              <PrivateRoute>
                <Quiz />
              </PrivateRoute>
            }
          />

          <Route
            path="/quiz/interface"
            element={
              <PrivateRoute>
                <QuizInterface />
              </PrivateRoute>
            }
          />

          <Route
            path="/quiz/history"
            element={
              <PrivateRoute>
                <QuizHistory />
              </PrivateRoute>
            }
          />

          <Route
            path="/quiz/results/:attemptId"
            element={
              <PrivateRoute>
                <QuizResults />
              </PrivateRoute>
            }
          />

          {/* Analytics Routes */}
        <Route 
          path="/analytics" 
          element={
            <PrivateRoute>
              <AnalyticsMe />
            </PrivateRoute>
          } 
        />
          
          <Route
            path="/placement-quiz"
            element={
              <PrivateRoute>
                <PlacementQuiz />
              </PrivateRoute>
            }
          />

          {/* ========= COURSE ROUTES ========= */}
          <Route
            path="/courses"
            element={
              <PrivateRoute>
                <Courses />
              </PrivateRoute>
            }
          />

          <Route
            path="/courses/:courseId"
            element={
              <PrivateRoute>
                <CourseCard />
              </PrivateRoute>
            }
          />

          {/* ========= CONTENT GENERATION ROUTES ========= */}
          <Route
            path="/content"
            element={
              <PrivateRoute>
                <ContentGenerator />
              </PrivateRoute>
            }
          />

          {/* ========= 404 FALLBACK ========= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}
