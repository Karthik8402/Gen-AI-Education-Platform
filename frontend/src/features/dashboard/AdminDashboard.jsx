import React, { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { useTheme } from '@/context/ThemeContext'
import { 
  Users, BookOpen, FileQuestion, ClipboardCheck, UserCircle, 
  TrendingUp, TrendingDown, Award, Target, Clock, Calendar,
  Activity, Zap, CheckCircle, AlertCircle, Download, RefreshCw
} from 'lucide-react'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts'

export default function AdminDashboard() {
  const { currentTheme } = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      setRefreshing(true)
      const res = await api('/api/analytics/overview')
      setData(res)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen transition-all duration-300 flex items-center justify-center ${
        currentTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="text-center">
          <div className="relative">
            <div className={`w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4 transition-colors duration-300 ${
              currentTheme === 'dark'
                ? 'border-indigo-800 border-t-indigo-400'
                : 'border-indigo-200 border-t-indigo-600'
            }`}></div>
            <Activity className={`w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
          </div>
          <p className={`text-lg font-medium mb-2 transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>Loading Analytics Dashboard...</p>
          <p className={`transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>Gathering platform insights...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen transition-all duration-300 p-8 ${
        currentTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className={`max-w-lg mx-auto rounded-2xl border-2 p-6 transition-colors duration-300 ${
          currentTheme === 'dark'
            ? 'bg-red-900/20 border-red-800'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className={`w-8 h-8 ${
              currentTheme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`} />
            <h3 className={`text-lg font-bold ${
              currentTheme === 'dark' ? 'text-red-300' : 'text-red-900'
            }`}>Error Loading Dashboard</h3>
          </div>
          <p className={`mb-4 ${
            currentTheme === 'dark' ? 'text-red-300' : 'text-red-700'
          }`}>{error}</p>
          <button 
            onClick={loadData}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentTheme === 'dark'
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={`text-center py-8 ${
        currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        No data available
      </div>
    )
  }

  const p = data.platform || {}
  const engagement = data.engagement || {}
  const health = data.systemHealth || {}
  const skillDist = data.skillDistribution || {}
  const topStudents = data.topStudents || []
  const popularTopics = data.popularTopics || []

  // Chart data
  const skillDistData = [
    { name: 'Beginner', value: skillDist.beginner || 0, color: '#10b981' },
    { name: 'Intermediate', value: skillDist.intermediate || 0, color: '#3b82f6' },
    { name: 'Advanced', value: skillDist.advanced || 0, color: '#8b5cf6' },
    { name: 'Expert', value: skillDist.expert || 0, color: '#f59e0b' }
  ]

  const userRoleData = [
    { name: 'Students', value: p.usersByRole?.students || 0, color: '#3b82f6' },
    { name: 'Teachers', value: p.usersByRole?.teachers || 0, color: '#10b981' },
    { name: 'Admins', value: p.usersByRole?.admins || 0, color: '#8b5cf6' }
  ]

  const topicData = popularTopics.slice(0, 5).map(t => ({
    name: t.topic?.substring(0, 15) || 'Unknown',
    attempts: t.attempts || 0
  }))

  return (
    <div className={`min-h-screen transition-all duration-300 p-6 ${
      currentTheme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-4xl font-bold mb-2 transition-all duration-300 ${
              currentTheme === 'dark'
                ? 'bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'
            }`}>
              Admin Dashboard
            </h1>
            <p className={`text-xl transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Platform-wide analytics and insights</p>
          </div>
          <button
            onClick={loadData}
            disabled={refreshing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 ${
              currentTheme === 'dark'
                ? 'bg-gray-800 border-2 border-gray-700 text-indigo-400 hover:bg-gray-700'
                : 'bg-white border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Key Metrics */}
        <section>
          <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            <TrendingUp className="w-6 h-6 text-indigo-500" />
            Platform Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard 
              title="Total Users" 
              value={p.totalUsers} 
              icon={Users} 
              color="blue"
              trend="+12%"
              subtitle={`${p.usersByRole?.students || 0} students`}
              currentTheme={currentTheme}
            />
            <MetricCard 
              title="Active Users" 
              value={engagement.activeUsers} 
              icon={Activity} 
              color="green"
              subtitle="Have taken quizzes"
              currentTheme={currentTheme}
            />
            <MetricCard 
              title="Total Attempts" 
              value={p.totalAttempts} 
              icon={ClipboardCheck} 
              color="orange"
              trend="+8%"
              subtitle={`${engagement.recentAttempts7d || 0} this week`}
              currentTheme={currentTheme}
            />
            <MetricCard 
              title="Avg Score" 
              value={`${engagement.platformAvgScore}%`} 
              icon={Award} 
              color="purple"
              subtitle="Platform-wide"
              currentTheme={currentTheme}
            />
            <MetricCard 
              title="Courses" 
              value={p.totalCourses} 
              icon={BookOpen} 
              color="indigo"
              subtitle={`${p.courseStats?.active || 0} active`}
              currentTheme={currentTheme}
            />
          </div>
        </section>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Skill Distribution Pie Chart */}
          <ChartCard title="Skill Level Distribution" icon={Target} currentTheme={currentTheme}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={skillDistData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {skillDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: currentTheme === 'dark' ? '#1f2937' : '#ffffff',
                    border: `2px solid ${currentTheme === 'dark' ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: currentTheme === 'dark' ? '#f3f4f6' : '#111827'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {skillDistData.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className={currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* User Role Distribution */}
          <ChartCard title="User Role Distribution" icon={Users} currentTheme={currentTheme}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: currentTheme === 'dark' ? '#1f2937' : '#ffffff',
                    border: `2px solid ${currentTheme === 'dark' ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: currentTheme === 'dark' ? '#f3f4f6' : '#111827'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {userRoleData.map(item => (
                <div key={item.name} className={`text-center p-2 rounded-lg ${
                  currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className={`text-2xl font-bold ${
                    currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>{item.value}</div>
                  <div className={`text-xs ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{item.name}</div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Popular Topics Bar Chart */}
          <ChartCard title="Most Popular Topics" icon={TrendingUp} currentTheme={currentTheme}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={currentTheme === 'dark' ? '#374151' : '#e5e7eb'} 
                />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: currentTheme === 'dark' ? '#9ca3af' : '#6b7280' }} 
                />
                <YAxis tick={{ fill: currentTheme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: currentTheme === 'dark' ? '#1f2937' : '#ffffff',
                    border: `2px solid ${currentTheme === 'dark' ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: currentTheme === 'dark' ? '#f3f4f6' : '#111827'
                  }}
                />
                <Bar dataKey="attempts" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Engagement Metrics */}
          <ChartCard title="Engagement Overview" icon={Activity} currentTheme={currentTheme}>
            <div className="space-y-4 p-4">
              <EngagementBar 
                label="Active Users" 
                value={engagement.activeUsers || 0} 
                max={p.totalUsers || 1}
                color="bg-green-500"
                currentTheme={currentTheme}
              />
              <EngagementBar 
                label="Avg Quizzes per User" 
                value={engagement.avgQuizzesPerUser || 0} 
                max={10}
                color="bg-blue-500"
                currentTheme={currentTheme}
              />
              <EngagementBar 
                label="Platform Avg Score" 
                value={engagement.platformAvgScore || 0} 
                max={100}
                color="bg-purple-500"
                suffix="%"
                currentTheme={currentTheme}
              />
              <EngagementBar 
                label="Complete Profiles" 
                value={p.profileStats?.complete || 0} 
                max={p.totalProfiles || 1}
                color="bg-indigo-500"
                currentTheme={currentTheme}
              />
            </div>
          </ChartCard>
        </div>

        {/* Top Students Leaderboard */}
        {topStudents.length > 0 && (
          <ChartCard title="🏆 Top Performing Students" icon={Award} currentTheme={currentTheme}>
            <div className="space-y-3">
              {topStudents.map((student, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${
                    currentTheme === 'dark'
                      ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600'
                      : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' : 'bg-indigo-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className={`font-semibold ${
                        currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>{student.name}</div>
                      <div className={`text-sm ${
                        currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {student.totalQuizzes} quizzes • {student.skillLevel}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-500">
                      {student.avgScore}%
                    </div>
                    <div className={`text-xs ${
                      currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Avg Score</div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        )}

        {/* System Health & ML Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* System Health */}
          <div className={`rounded-2xl border-2 p-6 shadow-lg transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
              <CheckCircle className="w-5 h-5 text-green-500" />
              System Health
            </h3>
            <div className="space-y-3">
              <HealthIndicator label="Database" status={health.database} currentTheme={currentTheme} />
              <HealthIndicator label="AI API" status={health.aiApi} currentTheme={currentTheme} />
              <HealthIndicator label="Overall Status" status={health.overall} currentTheme={currentTheme} />
            </div>
          </div>

          {/* ML Features */}
          <div className={`rounded-2xl border-2 p-6 shadow-lg transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
              <Zap className="w-5 h-5 text-yellow-500" />
              ML Features
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(data.mlFeatures || {}).map(([k, v]) => (
                <div key={k} className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${v ? 'bg-green-500' : 'bg-red-400'}`} />
                  <span className={`text-sm ${
                    v 
                      ? currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      : currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {k.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton icon={Download} label="Export Report" />
            <ActionButton icon={Users} label="Manage Users" />
            <ActionButton icon={BookOpen} label="Create Course" />
          </div>
        </div>

      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// Component: Metric Card
// ═══════════════════════════════════════════════════════

function MetricCard({ title, value, icon: Icon, color, trend, subtitle, currentTheme }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    indigo: 'bg-indigo-500'
  }

  return (
    <div className={`rounded-2xl border-2 p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 ${
      currentTheme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
            {trend}
          </span>
        )}
      </div>
      <p className={`text-sm mb-1 transition-colors duration-300 ${
        currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>{title}</p>
      <p className={`text-3xl font-bold transition-colors duration-300 ${
        currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
      }`}>{value ?? 0}</p>
      {subtitle && (
        <p className={`text-xs mt-2 transition-colors duration-300 ${
          currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>{subtitle}</p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// Component: Chart Card
// ═══════════════════════════════════════════════════════

function ChartCard({ title, icon: Icon, children, currentTheme }) {
  return (
    <div className={`rounded-2xl border-2 p-6 shadow-lg transition-colors duration-300 ${
      currentTheme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${
        currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
      }`}>
        {Icon && <Icon className="w-5 h-5 text-indigo-500" />}
        {title}
      </h3>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// Component: Engagement Bar
// ═══════════════════════════════════════════════════════

function EngagementBar({ label, value, max, color, suffix = '', currentTheme }) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className={`font-medium transition-colors duration-300 ${
          currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>{label}</span>
        <span className={`font-bold transition-colors duration-300 ${
          currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>{value}{suffix}</span>
      </div>
      <div className={`w-full rounded-full h-3 overflow-hidden transition-colors duration-300 ${
        currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// Component: Health Indicator
// ═══════════════════════════════════════════════════════

function HealthIndicator({ label, status, currentTheme }) {
  const statusConfig = {
    healthy: { color: 'bg-green-500', text: 'Healthy', textColor: 'text-green-500' },
    degraded: { color: 'bg-yellow-500', text: 'Degraded', textColor: 'text-yellow-500' },
    unhealthy: { color: 'bg-red-500', text: 'Unhealthy', textColor: 'text-red-500' },
    'not configured': { color: 'bg-gray-400', text: 'Not Configured', textColor: 'text-gray-500' }
  }

  const config = statusConfig[status] || statusConfig.unhealthy

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl transition-colors duration-300 ${
      currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
    }`}>
      <span className={`text-sm font-medium transition-colors duration-300 ${
        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>{label}</span>
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${config.color} animate-pulse`} />
        <span className={`text-sm font-semibold ${config.textColor}`}>
          {config.text}
        </span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// Component: Action Button
// ═══════════════════════════════════════════════════════

function ActionButton({ icon: Icon, label }) {
  return (
    <button className="flex items-center gap-3 p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-all border-2 border-white/30">
      <Icon className="w-5 h-5" />
      <span className="font-semibold">{label}</span>
    </button>
  )
}
