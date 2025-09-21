// src/components/ui/ThemeToggle.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext' // ✅ Make sure this path is correct
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react'

const ThemeToggle = ({ variant = 'simple' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  
  // Use try-catch to handle theme context errors
  let themeData
  try {
    themeData = useTheme()
  } catch (error) {
    console.error('ThemeToggle error:', error)
    // Fallback if context is not available
    return (
      <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <Sun className="w-5 h-5 text-gray-400" />
      </div>
    )
  }
  
  const { theme, currentTheme, changeTheme, themes, mounted } = themeData

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg flex items-center justify-center">
        <Sun className="w-5 h-5 text-gray-400" />
      </div>
    )
  }

  const getIcon = (themeValue, size = 'w-4 h-4') => {
    switch (themeValue) {
      case 'light':
        return <Sun className={size} />
      case 'dark':
        return <Moon className={size} />
      case 'system':
        return <Monitor className={size} />
      default:
        return <Sun className={size} />
    }
  }

  if (variant === 'simple') {
    return (
      <button
        onClick={() => {
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
          changeTheme(newTheme)
        }}
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        title={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {currentTheme === 'dark' ? (
          <Sun className="w-5 h-5 text-yellow-500 transform transition-transform hover:rotate-12" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400 transform transition-transform hover:-rotate-12" />
        )}
      </button>
    )
  }

  if (variant === 'tabs') {
    return (
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {themes.map((themeOption) => (
          <button
            key={themeOption.value}
            onClick={() => {
              console.log(`📑 Tab toggle: ${theme} → ${themeOption.value}`) // Debug log
              changeTheme(themeOption.value)
            }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              theme === themeOption.value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            {getIcon(themeOption.value)}
            <span className="hidden sm:inline">{themeOption.label}</span>
          </button>
        ))}
      </div>
    )
  }

  // Default dropdown variant
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-label="Theme selector"
        aria-expanded={isOpen}
      >
        {getIcon(theme)}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
          {themes.find(t => t.value === theme)?.label}
        </span>
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => {
                console.log(`📋 Dropdown toggle: ${theme} → ${themeOption.value}`) // Debug log
                changeTheme(themeOption.value)
                setIsOpen(false)
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-left text-sm transition-colors duration-200 ${
                theme === themeOption.value
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {getIcon(themeOption.value)}
              <div className="flex-1">
                <div className="font-medium">{themeOption.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {themeOption.value === 'system' 
                    ? `Follows system preference`
                    : `Always ${themeOption.value} theme`
                  }
                </div>
              </div>
              {theme === themeOption.value && (
                <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ThemeToggle
