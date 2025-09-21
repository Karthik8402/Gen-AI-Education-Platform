import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Page not found</h1>
      <p className="mt-2 text-sm text-gray-600">
        The page being requested doesn’t exist or was moved. Check the URL or return to the homepage.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Go back home
        </Link>
      </div>
    </main>
  )
}

export default NotFound
