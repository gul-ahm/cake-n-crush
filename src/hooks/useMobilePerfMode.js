import { useEffect, useState } from 'react'

// Detect Android / low-power mobile context and user reduced motion preference
export default function useMobilePerfMode() {
  const [perfMode, setPerfMode] = useState(false)

  useEffect(() => {
    try {
      const ua = navigator.userAgent || ''
      const isAndroid = /Android/i.test(ua)
      const isSmall = window.matchMedia('(max-width: 640px)').matches
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      // Enable perf mode if Android OR small screen OR reduced motion preference
      setPerfMode(isAndroid || isSmall || prefersReduced)
    } catch {
      setPerfMode(false)
    }
  }, [])

  return perfMode
}
