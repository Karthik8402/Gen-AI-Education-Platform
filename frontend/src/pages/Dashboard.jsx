// import React from 'react'
// import { Link } from 'react-router-dom'
// import { ArrowUpRightIcon, UserGroupIcon, BookOpenIcon, ChartBarIcon } from '@heroicons/react/24/outline'

// const StatCard = ({ title, value, change, icon: Icon, color }) => (
//   <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
//     <div className="flex items-start justify-between">
//       <div>
//         <p className="text-sm text-gray-500">{title}</p>
//         <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
//         <p className={`mt-2 text-sm ${change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
//           {change} vs last week
//         </p>
//       </div>
//       <div className={`rounded-lg p-3 ${color}`}>
//         <Icon className="h-6 w-6 text-white" />
//       </div>
//     </div>
//   </div>
// )

// const ActivityItem = ({ title, time, detail }) => (
//   <div className="flex items-start gap-4">
//     <div className="h-2.5 w-2.5 translate-y-2 rounded-full bg-indigo-600"></div>
//     <div>
//       <p className="text-sm font-medium text-gray-900">{title}</p>
//       <p className="text-sm text-gray-500">{detail}</p>
//       <p className="mt-1 text-xs text-gray-400">{time}</p>
//     </div>
//   </div>
// )

// const Dashboard = () => {
//   return (
//     <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
//       <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
//           <p className="mt-1 text-sm text-gray-500">Overview of learning progress, quizzes, and recommendations.</p>
//         </div>
//         <Link
//           to="/quiz"
//           className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
//         >
//           Start Quiz
//           <ArrowUpRightIcon className="ml-2 h-4 w-4" />
//         </Link>
//       </div>

//       {/* Stats */}
//       <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//         <StatCard title="Active Courses" value="6" change="+1.2%" icon={BookOpenIcon} color="bg-indigo-600" />
//         <StatCard title="Weekly Study Hrs" value="12.5h" change="+8.4%" icon={ChartBarIcon} color="bg-purple-600" />
//         <StatCard title="Completed Quizzes" value="24" change="+3" icon={UserGroupIcon} color="bg-emerald-600" />
//         <StatCard title="Mastery Score" value="82%" change="+2.5%" icon={ChartBarIcon} color="bg-sky-600" />
//       </div>

//       {/* Grid */}
//       <div className="mt-8 grid gap-6 lg:grid-cols-3">
//         {/* Recommendations */}
//         <section className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900">Recommended next steps</h2>
//           <p className="mt-1 text-sm text-gray-500">Personalized by AI based on recent performance.</p>
//           <ul className="mt-6 space-y-4">
//             <li className="flex items-start justify-between rounded-lg border border-gray-100 p-4">
//               <div>
//                 <p className="font-medium text-gray-900">Revise SQL Joins fundamentals</p>
//                 <p className="text-sm text-gray-500">Focus on INNER vs OUTER joins with practice sets.</p>
//               </div>
//               <Link to="/quiz" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
//                 Practice now →
//               </Link>
//             </li>
//             <li className="flex items-start justify-between rounded-lg border border-gray-100 p-4">
//               <div>
//                 <p className="font-medium text-gray-900">OOP Concepts: Polymorphism</p>
//                 <p className="text-sm text-gray-500">Review examples and attempt scenario-based questions.</p>
//               </div>
//               <Link to="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
//                 View material →
//               </Link>
//             </li>
//             <li className="flex items-start justify-between rounded-lg border border-gray-100 p-4">
//               <div>
//                 <p className="font-medium text-gray-900">Data Structures: Arrays vs Maps</p>
//                 <p className="text-sm text-gray-500">Optimize choices for lookup-heavy tasks.</p>
//               </div>
//               <Link to="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
//                 Read guide →
//               </Link>
//             </li>
//           </ul>
//         </section>

//         {/* Recent activity */}
//         <aside className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
//           <div className="mt-6 space-y-6">
//             <ActivityItem title="Completed Quiz: SQL Joins" detail="Score 9/10 • 6 mins" time="Today, 3:45 PM" />
//             <ActivityItem title="Watched: OOP Inheritance" detail="12 min playlist" time="Yesterday, 8:10 PM" />
//             <ActivityItem title="Created profile" detail="Imported learning preferences" time="Aug 21, 10:02 AM" />
//           </div>
//         </aside>
//       </div>
//     </main>
//   )
// }

// export default Dashboard


import React from 'react'
import { useAuth } from '../context/AuthContext'
import StudentDashboard from '../features/dashboard/StudentDashboard'
import TeacherDashboard from '../features/dashboard/TeacherDashboard'
import AdminDashboard from '../features/dashboard/AdminDashboard'

export default function Dashboard() {
  const { user } = useAuth()

  // Show loading state while user data is being fetched
  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 rounded bg-gray-200 mb-8"></div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />
    case 'teacher':
      return <TeacherDashboard />
    case 'student':
    default:
      return <StudentDashboard />
  }
}
