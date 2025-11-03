import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import ThemeToggle from './ThemeToggle'

const ThemeSettings = () => {
  const { theme, currentTheme } = useTheme()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Appearance Settings
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme Preference
          </label>
          <ThemeToggle variant="tabs" />
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Current theme: <span className="font-medium">{currentTheme}</span>
          {theme === 'system' && ' (following system preference)'}
        </div>
      </div>
    </div>
  )
}

export default ThemeSettings
