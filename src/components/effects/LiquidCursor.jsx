import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import secureAuth from '../../services/secureAuth'

export default function LiquidCursor() {
  const location = useLocation()
  const cursorRef = useRef(null)
  const [cursorVariant, setCursorVariant] = useState('default')
  const [currentElement, setCurrentElement] = useState(null)
  const [isDark, setIsDark] = useState(false)
  const [ripples, setRipples] = useState([])
  const [isHovering, setIsHovering] = useState(false)
  
  // Use secure authentication service for admin detection
  const isAdminPage = secureAuth.isAdminRoute(location.pathname)
  
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  
  const springConfig = { damping: 20, stiffness: 400 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  // Create bite sound effect
  const playBiteSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      // Fallback for browsers without Web Audio API
    }
  }

  useEffect(() => {
    // Don't initialize cursor on admin pages
    if (isAdminPage) {
      // Reset cursor to default on admin pages
      document.body.style.cursor = 'auto'
      const existingStyle = document.querySelector('style[data-cursor-style]')
      if (existingStyle) {
        existingStyle.remove()
      }
      return
    }
    // Check theme
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    updateTheme()
    
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    // Hide default cursor
    document.body.style.cursor = 'none'
    const style = document.createElement('style')
    style.setAttribute('data-cursor-style', 'true')
    style.innerHTML = `
      *, *:before, *:after {
        cursor: none !important;
      }
      .magnetic-element {
        display: inline-block;
        transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      }
    `
    document.head.appendChild(style)

    const moveCursor = (e) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      
      // Handle magnetic effect
      if (currentElement) {
        const rect = currentElement.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        const deltaX = e.clientX - centerX
        const deltaY = e.clientY - centerY
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        
        const maxDistance = 120
        const strength = Math.max(0, (maxDistance - distance) / maxDistance)
        
        if (strength > 0) {
          const magneticX = deltaX * strength * 0.25
          const magneticY = deltaY * strength * 0.18
          const scale = 1 + strength * (cursorVariant === 'card' ? 0.08 : 0.15)
          const rotate = deltaX * strength * 0.015
          
          currentElement.style.transform = `translate3d(${magneticX}px, ${magneticY}px, 0) scale(${scale}) rotate(${rotate}deg)`
        }
      }
    }

    // Check if hovering over interactive elements
    const handleMouseOver = (e) => {
      const target = e.target
      const isText = target.matches('p, h1, h2, h3, h4, h5, h6, span, a, button, label') ||
                     target.closest('p, h1, h2, h3, h4, h5, h6, span, a, button, label')
      
      const isCard = target.closest('.portfolio-card, .sc-card, .tilt-container') ||
                     target.matches('.portfolio-card, .sc-card, .tilt-container')
      
      if (isCard || isText) {
        setIsHovering(true)
      }
      
      if (isCard) {
        setCursorVariant('card')
        const cardElement = typeof isCard === 'object' ? isCard : target
        cardElement.classList.add('magnetic-element')
        setCurrentElement(cardElement)
      } else if (isText) {
        setCursorVariant('text')
        const textElement = isText === true ? target : isText
        textElement.classList.add('magnetic-element')
        setCurrentElement(textElement)
      } else {
        setCursorVariant('default')
        setIsHovering(false)
        if (currentElement) {
          currentElement.style.transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)'
          currentElement.classList.remove('magnetic-element')
          setCurrentElement(null)
        }
      }
    }

    const handleMouseOut = (e) => {
      const target = e.target
      if (target === currentElement || target.closest('.magnetic-element') === currentElement) {
        setIsHovering(false)
        setTimeout(() => {
          if (currentElement && currentElement.classList.contains('magnetic-element')) {
            currentElement.style.transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)'
            currentElement.classList.remove('magnetic-element')
            setCurrentElement(null)
          }
        }, 100)
      }
    }

    // Add click sound and ripple effects to all clicks
    const handleClick = (e) => {
      const target = e.target
      
      // Create ripple effect for any click
      const newRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      }
      setRipples(prev => [...prev, newRipple])
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
      }, 1200)
      
      // Play sound for interactive elements
      if (target.matches('button, a, [role="button"]') || target.closest('button, a, [role="button"]')) {
        playBiteSound()
      }
    }
    
    // Handle touch events for mobile
    const handleTouch = (e) => {
      const touch = e.touches[0] || e.changedTouches[0]
      if (touch) {
        const newRipple = {
          id: Date.now() + Math.random(),
          x: touch.clientX,
          y: touch.clientY,
        }
        setRipples(prev => [...prev, newRipple])
        
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
        }, 1200)
      }
    }

    window.addEventListener('mousemove', moveCursor)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    document.addEventListener('click', handleClick)
    document.addEventListener('touchstart', handleTouch)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('touchstart', handleTouch)
      observer.disconnect()
      if (currentElement) {
        currentElement.style.transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)'
        currentElement.classList.remove('magnetic-element')
      }
      document.head.removeChild(style)
      document.body.style.cursor = 'auto'
    }
  }, [cursorX, cursorY, currentElement])

  const arrowColor = isDark ? '#ffffff' : '#000000'
  const arrowSize = cursorVariant === 'text' ? 24 : cursorVariant === 'card' ? 22 : 20
  const circleSize = cursorVariant === 'text' ? 60 : cursorVariant === 'card' ? 80 : 40

  if (typeof window === 'undefined') return null
  
  // Don't render cursor on admin pages
  if (isAdminPage) {
    return null
  }

  return (
    <>
      {/* Circular transparent cursor below arrow */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-49 rounded-full border"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          width: circleSize,
          height: circleSize,
          transform: `translate(-${circleSize/2}px, -${circleSize/2}px)`,
          backgroundColor: cursorVariant === 'card' ? 'rgba(34, 197, 94, 0.1)' : 
                          cursorVariant === 'text' ? 'rgba(59, 130, 246, 0.1)' : 
                          isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          borderColor: cursorVariant === 'card' ? 'rgba(34, 197, 94, 0.3)' : 
                      cursorVariant === 'text' ? 'rgba(59, 130, 246, 0.3)' : 
                      isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          borderWidth: '1px'
        }}
        animate={{
          scale: cursorVariant === 'default' ? 1 : 1.2,
          opacity: cursorVariant === 'default' ? 0.6 : 0.8
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20
        }}
      />
      
      {/* Arrow cursor with magnifying effect */}
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          transform: 'translate(-2px, -2px)',
          zIndex: 99999, // Higher z-index to stay above everything
          backdropFilter: isHovering ? 'blur(1px) brightness(1.1)' : 'none',
          borderRadius: isHovering ? '50%' : '0%',
          background: isHovering ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          padding: isHovering ? '8px' : '0px',
        }}
        animate={{
          scale: isHovering ? 1.5 : (cursorVariant === 'text' ? 1.2 : cursorVariant === 'card' ? 1.1 : 1)
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25
        }}
      >
        <svg 
          width={arrowSize} 
          height={arrowSize} 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <path 
            d="M7.5 3L20.5 16L13 16.5L10.5 21L7.5 3Z" 
            fill={arrowColor}
            stroke={isDark ? '#333333' : '#ffffff'} 
            strokeWidth="0.5"
          />
        </svg>
      </motion.div>
      
      {/* Water Ripple Effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ 
              scale: [0, 1.5, 3], 
              opacity: [0.8, 0.4, 0]
            }}
            exit={{ scale: 3, opacity: 0 }}
            transition={{ 
              duration: 1.2, 
              ease: [0.23, 1, 0.32, 1],
              times: [0, 0.6, 1]
            }}
            style={{
              position: 'fixed',
              left: ripple.x,
              top: ripple.y,
              width: '300px',
              height: '300px',
              marginLeft: '-150px',
              marginTop: '-150px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 105, 180, 0.4)',
              background: 'radial-gradient(circle, rgba(255, 105, 180, 0.1) 0%, rgba(255, 105, 180, 0.05) 50%, transparent 100%)',
              pointerEvents: 'none',
              zIndex: 99998,
              filter: 'blur(0.5px)',
            }}
          />
        ))}
        {/* Secondary ripple effect */}
        {ripples.map((ripple) => (
          <motion.div
            key={`secondary-${ripple.id}`}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ 
              scale: [0, 2, 4], 
              opacity: [0.6, 0.2, 0]
            }}
            exit={{ scale: 4, opacity: 0 }}
            transition={{ 
              duration: 1.5, 
              ease: [0.23, 1, 0.32, 1],
              times: [0, 0.7, 1],
              delay: 0.1
            }}
            style={{
              position: 'fixed',
              left: ripple.x,
              top: ripple.y,
              width: '200px',
              height: '200px',
              marginLeft: '-100px',
              marginTop: '-100px',
              borderRadius: '50%',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 99997,
            }}
          />
        ))}
      </AnimatePresence>
    </>
  )
}