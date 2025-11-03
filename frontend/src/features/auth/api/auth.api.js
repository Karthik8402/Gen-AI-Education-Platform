// src/feature/auth/api/auth.api.js
import { api } from '../services/api'

/**
 * login
 * POST /api/auth/login
 * body: { email, password }
 * response: { token, user: { email, username, role } }
 */
export async function login(email, password) {
  if (!email || !password) throw new Error('Email and password are required')
  const res = await api('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
  // Normalize
  return {
    token: res.token,
    user: {
      email: res.user?.email,
      username: res.user?.username,
      role: res.user?.role || 'student',
    },
    raw: res,
  }
}

/**
 * register
 * POST /api/auth/signup
 * body: { username, email, password }
 * response: { token, user: { email, username, role } }
 */
export async function register(username, email, password) {
  if (!username || !email || !password) throw new Error('Username, email, and password are required')
  const res = await api('/api/auth/signup', {
    method: 'POST',
    body: { username, email, password },
  })
  return {
    token: res.token,
    user: {
      email: res.user?.email,
      username: res.user?.username,
      role: res.user?.role || 'student',
    },
    raw: res,
  }
}

/**
 * me
 * GET /api/auth/me
 * response: { user: {...}, stats: {...} }
 */
export async function me() {
  const res = await api('/api/auth/me', { method: 'GET' })
  return {
    user: res.user,     // { uid, email, role, ... }
    stats: res.stats,   // { quizzesCreated, attemptsCompleted, memberSince, skillLevel }
    raw: res,
  }
}

/**
 * createStudentProfile
 * POST /api/student/profile
 * body requires: { name, email, age, learningStyle }
 * optional: { skillLevel, subjects, educationLevel, ... }
 * response: { status, profileId, studentId }
 */
export async function createStudentProfile(payload) {
  const required = ['name', 'email', 'age', 'learningStyle']
  const missing = required.filter((k) => !payload?.[k] && payload?.[k] !== 0)
  if (missing.length) throw new Error(`Missing fields: ${missing.join(', ')}`)

  const res = await api('/api/student/profile', {
    method: 'POST',
    body: {
      name: payload.name,
      email: payload.email,
      age: Number(payload.age),
      learningStyle: payload.learningStyle,
      skillLevel: payload.skillLevel || 'beginner',
      subjects: payload.subjects || ['programming'],
      educationLevel: payload.educationLevel || 'undergraduate',
    },
  })
  return {
    ok: res.status === 'success',
    profileId: res.profileId,
    studentId: res.studentId,
    raw: res,
  }
}

/**
 * debug: elevate roles (only if backend debug endpoints are enabled)
 * POST /api/debug/make-admin { email }
 * POST /api/debug/make-teacher { email }
 */
export async function makeAdmin(email) {
  const res = await api('/api/debug/make-admin', {
    method: 'POST',
    body: { email },
  })
  return res
}
export async function makeTeacher(email) {
  const res = await api('/api/debug/make-teacher', {
    method: 'POST',
    body: { email },
  })
  return res
}
