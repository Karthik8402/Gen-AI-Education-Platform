import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '../components/ui/Navbar'             // ✅ Changed

// Page components
import Home from '../pages/Home'                          // ✅ Changed
import Login from '../pages/Login'
import SignUp from '../pages/SignUp'
import Reset from '../pages/Reset'
import Dashboard from '../pages/Dashboard'
import Profile from '../pages/Profile'
import ContentGenerator from '../pages/ContentGenerator'
import NotFound from '../pages/NotFound'
import Unauthorized from '../pages/Unauthorized'

// Quiz components
import Quiz from '../pages/Quiz'
import QuizHistory from '../features/quiz/QuizHistory'
import QuizResults from '../features/quiz/QuizResults'
import QuizInterface from '../features/quiz/QuizInterface'
import PlacementQuiz from '../features/quiz/PlacementQuiz'

// Dashboard components
import StudentDashboard from '../features/dashboard/StudentDashboard'
import TeacherDashboard from '../features/dashboard/TeacherDashboard'
import AdminDashboard from '../features/dashboard/AdminDashboard'

// Analytics
import AnalyticsMe from '../features/Analytics/AnalyticsMe'

// Courses
import Courses from '../pages/Courses'
import CourseCard from '../features/courses/CourseCard'

// Auth
import PrivateRoute from '../features/auth/PrivateRoute'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* DASHBOARDS */}
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
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* PROTECTED ROUTES */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* QUIZ ROUTES */}
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
          <Route
            path="/placement-quiz"
            element={
              <PrivateRoute>
                <PlacementQuiz />
              </PrivateRoute>
            }
          />

          {/* ANALYTICS */}
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <AnalyticsMe />
              </PrivateRoute>
            }
          />

          {/* COURSES */}
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

          {/* CONTENT GENERATION */}
          <Route
            path="/content"
            element={
              <PrivateRoute>
                <ContentGenerator />
              </PrivateRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
