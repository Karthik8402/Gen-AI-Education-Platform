import React from 'react'
import { AuthProvider } from './context/AuthContext'      // ✅ Changed
import { ThemeProvider } from './context/ThemeContext'    // ✅ Changed
import Router from './app/router'                     // ✅ Changed

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
          <Router />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
