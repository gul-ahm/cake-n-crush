import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePortfolio from '../../hooks/usePortfolio'
import { playSwipeSound, playCardFlipSound } from '../../utils/soundEffects'

gsap.registerPlugin(ScrollTrigger)

// Lightbox Modal Component
const ImageLightbox = memo(({ image, title, isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      style={{
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      
      <div
        className="relative max-w-4xl max-h-screen w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'scaleIn 0.3s ease-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 z-10 text-white hover:text-gray-300 transition-colors"
          aria-label="Close lightbox"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image container */}
        <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
          <img
            src={image}
            alt={title}
            className="w-full h-auto max-h-screen object-contain"
            onClick={onClose}
          />
        </div>

        {/* Image title */}
        <div className="mt-4 text-center text-white/90 text-lg font-semibold">
          {title}
        </div>
      </div>
    </div>
  )
})

ImageLightbox.displayName = 'ImageLightbox'

// Memoized card component for performance
const ShowcaseCard = memo(({ item, index, total, onImageClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const imgRef = useRef(null)

  // Use Intersection Observer for lazy image loading
  useEffect(() => {
    if (!imgRef.current) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = entry.target
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.onload = () => setImageLoaded(true)
            observer.unobserve(img)
          }
        }
      },
      { rootMargin: '50px' }
    )
    
    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [])

  const handleImageClick = () => {
    if (item.images?.[0]) {
      onImageClick(item.images[0], item.name)
    }
  }

  return (
    <div 
      className="rounded-xl overflow-hidden border-2 border-white/40 shadow-2xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur h-full cursor-pointer transition-transform hover:scale-105"
      onClick={handleImageClick}
      style={{
        willChange: 'transform, filter',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
      }}
    >
      <div 
        className="w-full h-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center relative"
        style={{ 
          contain: 'layout style paint',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {item.images?.[0] ? (
          <>
            <img 
              ref={imgRef}
              data-src={item.images[0]}
              alt={item.name}
              decoding="async"
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ 
                willChange: imageLoaded ? 'auto' : 'opacity',
                WebkitBackfaceVisibility: 'hidden',
              }}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
              <svg className="w-12 h-12 text-white opacity-0 hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center">
            <span className="text-5xl opacity-50">🍰</span>
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4 text-center bg-gradient-to-t from-black/30 to-transparent">
        <div className="font-semibold text-white text-sm sm:text-base truncate">{item.name}</div>
        <div className="text-white/80 text-xs sm:text-sm mt-1">{index + 1} of {total}</div>
      </div>
    </div>
  )
})

ShowcaseCard.displayName = 'ShowcaseCard'

export default function Showcase(){
  const { items } = usePortfolio()
  const ref = useRef(null)
  const scrollContainerRef = useRef(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [focusedCardIndex, setFocusedCardIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchStartY, setTouchStartY] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [lightboxTitle, setLightboxTitle] = useState('')
  const audioContextRef = useRef(null)
  const lastSwipeTime = useRef(0)
  const containerRef = useRef(null)
  const velocityRef = useRef(0)
  const lastTimeRef = useRef(0)

  // Memoize list to avoid re-renders
  const list = useMemo(() => 
    items.length ? items : Array.from({ length: 8 }).map((_,i)=>({ id:`ph-${i}`, name:`Signature ${i+1}`, images:[] }))
  , [items])

  // Handle image click to open lightbox
  const handleImageClick = useCallback((image, title) => {
    setLightboxImage(image)
    setLightboxTitle(title)
    setLightboxOpen(true)
  }, [])

  // Close lightbox and escape key handler
  const handleCloseLightbox = useCallback(() => {
    setLightboxOpen(false)
    setLightboxImage(null)
    setLightboxTitle('')
  }, [])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && lightboxOpen) {
        handleCloseLightbox()
      }
    }
    
    if (lightboxOpen) {
      window.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      return () => {
        window.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    }
  }, [lightboxOpen, handleCloseLightbox])

  // Detect mobile resize with debouncing
  useEffect(() => {
    let resizeTimeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        setIsMobile(window.innerWidth < 768)
        setFocusedCardIndex(0)
      }, 150)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Initialize audio context for sound
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      } catch (e) {
        return null
      }
    }
    return audioContextRef.current
  }, [])

  // Play swipe sound with better audio (optimized for Android)
  const playSwipeSoundEffect = useCallback(() => {
    try {
      const ctx = initAudioContext()
      if (!ctx) return
      
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
      
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.frequency.setValueAtTime(500, now)
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.1)
      
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
      
      osc.start(now)
      osc.stop(now + 0.1)
    } catch (e) {
      // Silent fail
    }
  }, [initAudioContext])

  // Desktop horizontal scroll animation with sound
  useEffect(() => {
    if (isMobile) return
    
    const root = ref.current
    if (!root) return
    const track = root.querySelector('.sc-track')
    if (!track) return
    
    const distance = Math.max(0, track.scrollWidth - root.clientWidth)
    const ctx = gsap.context(() => {
      const cards = root.querySelectorAll('.sc-card')
      gsap.from(cards, {
        opacity: 0,
        y: 20,
        scale: 0.95,
        duration: 0.4,
        stagger: 0.04,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: root,
          start: 'center center',
          toggleActions: 'restart pause reverse pause',
        }
      })
      gsap.to(track, {
        x: () => -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'center center',
          end: () => `+=${Math.max(500, distance)}`,
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
          pinSpacing: true,
          fastScrollEnd: true,
          onUpdate: (self) => {
            const progress = Math.floor(self.progress * 5) / 5
            if (progress > 0 && progress % 0.2 === 0) {
              playSwipeSoundEffect()
            }
          }
        }
      })
    }, root)
    return () => ctx.revert()
  }, [isMobile, playSwipeSoundEffect])

  // Mobile swipe handlers with velocity detection for smoother Android experience
  const handleTouchStart = useCallback((e) => {
    if (!isMobile || isAnimating) return
    
    const touch = e.touches[0]
    setTouchStart(touch.clientX)
    setTouchStartY(touch.clientY)
    lastTimeRef.current = Date.now()
    velocityRef.current = 0
  }, [isMobile, isAnimating])

  const handleTouchEnd = useCallback((e) => {
    if (!isMobile || isAnimating) return
    
    const now = Date.now()
    if (now - lastSwipeTime.current < 350) return // Reduced throttle for faster feedback
    lastSwipeTime.current = now

    const touchEnd = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStart - touchEnd
    const diffY = Math.abs(touchEndY - touchStartY)
    
    // Must be mostly horizontal swipe
    if (diffY > Math.abs(diff)) return
    
    const threshold = 30 // Even lower threshold for sensitivity
    
    if (Math.abs(diff) < threshold) return

    setIsAnimating(true)
    
    // Calculate velocity for natural swipe feel
    const timeDiff = Math.max(1, now - lastTimeRef.current)
    velocityRef.current = Math.abs(diff) / timeDiff
    
    // Swipe left: show next card
    if (diff > threshold && focusedCardIndex < list.length - 1) {
      setFocusedCardIndex(focusedCardIndex + 1)
      playSwipeSoundEffect()
    }
    // Swipe right: show previous card
    else if (diff < -threshold && focusedCardIndex > 0) {
      setFocusedCardIndex(focusedCardIndex - 1)
      playSwipeSoundEffect()
    }
    
    // Reset animation flag faster on Android
    setTimeout(() => setIsAnimating(false), 350)
  }, [isMobile, focusedCardIndex, list.length, touchStart, touchStartY, playSwipeSoundEffect, isAnimating])

  return (
    <section 
      ref={ref} 
      className="my-20 rounded-2xl border bg-animated overflow-hidden min-h-[40vh] md:min-h-[70vh] flex flex-col justify-center"
      style={{ isolation: 'isolate' }}
    >
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <h3 className="font-display text-gradient text-xl sm:text-2xl md:text-3xl">Signature Showcase</h3>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-2">
          {isMobile 
            ? `👆 Swipe to browse • Card ${focusedCardIndex + 1}/${list.length} ♪` 
            : '📜 Scroll to explore • Sound enabled ♪'}
        </p>
      </div>
      
      {isMobile ? (
        // MOBILE: 3D Stacked card swipe effect (optimized for Android)
        <div 
          ref={containerRef}
          className="relative w-full flex-1 flex items-center justify-center py-8 px-0 sm:px-6 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            perspective: '1600px', // Increased perspective for better fan depth effect
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)',
            touchAction: 'none',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
        >
          {/* Safe area padding wrapper */}
          <div className="w-full max-w-xs px-4 sm:px-0">
            {/* 3D Stacked cards container - FIXED WIDTH to prevent overflow */}
            <div 
              className="relative w-full h-96"
              style={{
                transformStyle: 'preserve-3d',
                willChange: 'transform',
              }}
            >
              {/* Render all cards in a stack, with progressive transformations */}
              {list.map((item, idx) => {
                const positionFromFront = idx - focusedCardIndex
                
                // Only show cards within reasonable distance
                if (positionFromFront < -2 || positionFromFront > 2) return null
                
                // FAN EFFECT: Cards arranged in a semi-circle/fan pattern
                // Front card (positionFromFront = 0) is center
                // Behind cards rotate outward with increasing angle
                const baseScale = 0.95
                const scale = baseScale + Math.max(0, -positionFromFront) * 0.06 // Back cards slightly larger
                
                // Fan rotation angle (degrees) - creates the semi-circular spread
                const rotationAngle = positionFromFront * 12 // Each card rotates 12 degrees
                
                // Stacking depth with perspective
                const zOffset = -positionFromFront * 40 // Negative = behind, positive = in front
                const yOffset = Math.abs(positionFromFront) * 8 // Cards move down as they go back
                
                // Blur: Only blur when card is NOT in focus (positionFromFront !== 0)
                // Front card (0) is always sharp, background cards blur increases with distance
                const blur = positionFromFront === 0 ? 0 : Math.max(0, Math.abs(positionFromFront) * 5)
                const opacity = positionFromFront === 0 ? 1 : Math.max(0.5, 1 - Math.abs(positionFromFront) * 0.3)
                
                return (
                  <div
                    key={item.id}
                    className="absolute inset-0 w-full h-full"
                    style={{
                      // Fan effect: rotateZ creates the spread, translateZ adds depth
                      transform: `rotateZ(${rotationAngle}deg) translateY(${yOffset}px) translateZ(${zOffset}px) scale(${scale})`,
                      transition: !isAnimating && (positionFromFront === 0 || positionFromFront === 1 || positionFromFront === -1 || positionFromFront === 2 || positionFromFront === -2)
                        ? 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' // Smooth spring-like easing for fan effect
                        : 'none',
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'center center',
                      filter: blur > 0 ? `blur(${blur}px)` : 'none',
                      opacity: opacity,
                      pointerEvents: positionFromFront === 0 ? 'auto' : 'none',
                      WebkitFontSmoothing: 'antialiased',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                  >
                    <ShowcaseCard 
                      item={item}
                      index={idx}
                      total={list.length}
                      onImageClick={handleImageClick}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Swipe instructions */}
          <div className="absolute top-4 left-0 right-0 px-4 text-xs text-white/60 pointer-events-none text-center">
            ← Swipe to explore →
          </div>
        </div>
      ) : (
        // DESKTOP: Horizontal scroll with sound
        <div 
          ref={scrollContainerRef}
          className="relative w-full flex-1 overflow-hidden py-8 px-6"
        >
          <div 
            className="sc-track flex gap-4 will-change-transform"
            style={{
              minHeight: '100%',
              display: 'flex',
            }}
          >
            {list.map((it, idx) => (
              <div 
                key={it.id} 
                className="sc-card flex-shrink-0"
                style={{
                  width: '320px',
                  height: '380px',
                  minWidth: '320px',
                }}
              >
                <ShowcaseCard item={it} index={idx} total={list.length} onImageClick={handleImageClick} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile hint footer */}
      {isMobile && (
        <div className="px-4 sm:px-6 py-3 bg-white/50 dark:bg-black/30 text-center text-xs text-neutral-600 dark:text-neutral-300 border-t">
          👆 Swipe smoothly for best effect
        </div>
      )}

      {/* Image Lightbox Modal */}
      <ImageLightbox 
        image={lightboxImage}
        title={lightboxTitle}
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
      />
    </section>
  )
}
