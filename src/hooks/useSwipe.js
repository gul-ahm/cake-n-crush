import { useRef, useEffect, useCallback } from 'react'

export default function useSwipe(onSwipeLeft, onSwipeRight) {
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isSwiping = useRef(false)

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isSwiping.current = true
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (!isSwiping.current) return

    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    
    const deltaX = touchEndX - touchStartX.current
    const deltaY = Math.abs(touchEndY - touchStartY.current)
    
    // Only register swipe if horizontal movement > vertical
    if (Math.abs(deltaX) > 50 && deltaY < 50) {
      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    }
    isSwiping.current = false
  }, [onSwipeLeft, onSwipeRight])

  return { handleTouchStart, handleTouchEnd }
}
