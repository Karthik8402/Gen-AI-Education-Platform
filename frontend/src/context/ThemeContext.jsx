// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')
  const [mounted, setMounted] = useState(false)

  // Apply theme function without debug logs
  const applyTheme = (themeToApply) => {
    const root = document.documentElement
    const body = document.body
    
    // Remove ALL theme-related classes first
    root.classList.remove('light', 'dark')
    body.classList.remove('light', 'dark')
    
    // Force a style recalculation
    root.offsetHeight
    
    // Add the correct theme class
    if (themeToApply === 'dark') {
      root.classList.add('dark')
      body.classList.add('dark')
      root.style.colorScheme = 'dark'
      document.body.style.backgroundColor = '#111827'
      document.body.style.color = '#f9fafb'
    } else {
      root.classList.add('light')
      body.classList.add('light')
      root.style.colorScheme = 'light'
      document.body.style.backgroundColor = '#ffffff'
      document.body.style.color = '#111827'
    }
  }

  // Initialize theme on component mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme')
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      
      // Start with light mode by default
      const initialTheme = savedTheme && ['light', 'dark', 'system'].includes(savedTheme) 
        ? savedTheme 
        : 'light'
      
      setTheme(initialTheme)
      
      if (initialTheme === 'system') {
        applyTheme(systemPreference)
      } else {
        applyTheme(initialTheme)
      }
      
      setMounted(true)
    } catch (error) {
      console.error('Theme initialization error:', error)
      setTheme('light')
      applyTheme('light')
      setMounted(true)
    }
  }, [])

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e) => {
      if (theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [theme])

  // Function to change theme
  const changeTheme = (newTheme) => {
    try {
      setTheme(newTheme)
      localStorage.setItem('theme', newTheme)
      
      // Immediate theme application
      if (newTheme === 'system') {
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        applyTheme(systemPreference)
      } else {
        applyTheme(newTheme)
      }
    } catch (error) {
      console.error('Theme change error:', error)
    }
  }

  // Get current effective theme
  const getCurrentTheme = () => {
    if (!mounted) return 'light'
    
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }

  const contextValue = {
    theme,
    currentTheme: getCurrentTheme(),
    changeTheme,
    mounted,
    themes: [
      { value: 'light', label: 'Light', icon: '☀️' },
      { value: 'dark', label: 'Dark', icon: '🌙' },
      { value: 'system', label: 'System', icon: '💻' }
    ]
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}
 
export default ThemeProvider
