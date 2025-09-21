import React, { useEffect, useState } from 'react'
import { api } from '@/services/api'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api('/api/analytics/overview')
        setData(res)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return null
  if (!data) return <p className="text-sm text-gray-600">Could not load platform analytics.</p>

  const p = data.platform || {}

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat title="Users" value={p.totalUsers} />
        <Stat title="Courses" value={p.totalCourses} />
        <Stat title="Quizzes" value={p.totalQuizzes} />
        <Stat title="Attempts" value={p.totalAttempts} />
        <Stat title="Profiles" value={p.totalProfiles} />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900">ML features</h3>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-gray-700">
          {Object.entries(data.mlFeatures || {}).map(([k, v]) => (
            <li key={k} className={v ? 'text-emerald-700' : 'text-gray-600'}>
              {k}: {v ? 'enabled' : 'disabled'}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Stat({ title, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value ?? 0}</p>
    </div>
  )
}
