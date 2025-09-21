// src/hooks/useWindowSize.js
import { useEffect, useState } from 'react'

const getSize = () => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 }
  }
  return { width: window.innerWidth, height: window.innerHeight }
}

export default function useWindowSize() {
  const [{ width, height }, setSize] = useState(getSize())

  useEffect(() => {
    const onResize = () => setSize(getSize())
    window.addEventListener('resize', onResize)
    // Call once in case component mounted after a resize
    onResize()
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const isMobile = width < 640   // ~sm
  const isTablet = width >= 640 && width < 1024 // sm..lg
  const isDesktop = width >= 1024 // lg+

  return { width, height, isMobile, isTablet, isDesktop }
}
