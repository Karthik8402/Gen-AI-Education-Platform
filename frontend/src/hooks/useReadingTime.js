// src/hooks/useReadingTime.js
import { useEffect, useRef } from 'react'
import { api } from '@/services/api'

export function useReadingTime(contentId, contentType) {
  const startTime = useRef(Date.now())
  const isVisible = useRef(true)
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden
      if (!isVisible.current) {
        // Page hidden - record reading time
        recordReadingTime()
      } else {
        // Page visible again - restart timer
        startTime.current = Date.now()
      }
    }
    
    const recordReadingTime = async () => {
      const timeSpent = Date.now() - startTime.current
      if (timeSpent > 5000) { // Only record if > 5 seconds
        try {
          await api('/api/analytics/reading-time', {
            method: 'POST',
            body: {
              contentId,
              contentType,
              timeSpent,
              timestamp: new Date().toISOString()
            }
          })
        } catch (error) {
          console.error('Failed to record reading time:', error)
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', recordReadingTime)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', recordReadingTime)
      recordReadingTime() // Record time on component unmount
    }
  }, [contentId, contentType])
}
