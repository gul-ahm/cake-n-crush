import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePortfolio from '../../hooks/usePortfolio'
import { playSwipeSound, playCardFlipSound } from '../../utils/soundEffects'

gsap.registerPlugin(ScrollTrigger)

// Memoized card component for performance
const ShowcaseCard = memo(({ item, index, total }) => {
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

  return (
    <div 
      className="rounded-xl overflow-hidden border-2 border-white/40 shadow-2xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur"
      style={{
        cursor: 'pointer',
        willChange: 'transform, filter',
      }}
    >
      <div 
        className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-800 overflow-hidden"
        style={{ contain: 'layout style paint' }}
      >
        {item.images?.[0] ? (
          <img 
            ref={imgRef}
            data-src={item.images[0]}
            alt={item.name}
            decoding="async"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ willChange: imageLoaded ? 'auto' : 'opacity' }}
          />
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
  const audioContextRef = useRef(null)
  let lastSwipeTime = useRef(0)

  // Memoize list to avoid re-renders
  const list = useMemo(() => 
    items.length ? items : Array.from({ length: 8 }).map((_,i)=>({ id:`ph-${i}`, name:`Signature ${i+1}`, images:[] }))
  , [items])

  // Detect mobile resize with debouncing
  useEffect(() => {
    let resizeTimeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        setIsMobile(window.innerWidth < 768)
        setFocusedCardIndex(0) // Reset to first card on resize
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
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  // Play swipe sound with better audio
  const playSwipeSoundEffect = useCallback(() => {
    try {
      const ctx = initAudioContext()
      const now = ctx.currentTime
      
      // Create oscillator for swipe sound
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      // Frequency sweep (whoosh effect)
      osc.frequency.setValueAtTime(600, now)
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.15)
      
      // Volume envelope
      gain.gain.setValueAtTime(0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
      
      osc.start(now)
      osc.stop(now + 0.15)
    } catch (e) {
      console.log('Audio unavailable')
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
            // Play scroll sound every 20% of scroll
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

  // Mobile swipe handlers with throttling
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return
    setTouchStart(e.touches[0].clientX)
  }, [isMobile])

  const handleTouchEnd = useCallback((e) => {
    if (!isMobile) return
    
    const now = Date.now()
    if (now - lastSwipeTime.current < 300) return // Throttle swipes
    lastSwipeTime.current = now

    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd
    const threshold = 40

    if (Math.abs(diff) < threshold) return

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
  }, [isMobile, focusedCardIndex, list.length, touchStart, playSwipeSoundEffect])

  return (
    <section 
      ref={ref} 
      className="my-20 rounded-2xl border bg-animated overflow-hidden min-h-[40vh] md:min-h-[70vh] flex flex-col justify-center"
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
        // MOBILE: 3D Stacked card swipe effect (like reference image)
        <div 
          className="relative w-full flex-1 flex items-center justify-center py-8 px-4 sm:px-6"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            perspective: '1200px',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)',
          }}
        >
          {/* 3D Stacked cards container */}
          <div 
            className="relative w-full max-w-sm h-96"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Render all cards in a stack, with progressive transformations */}
            {list.map((item, idx) => {
              const positionFromFront = idx - focusedCardIndex
              
              // Only show cards within reasonable distance
              if (positionFromFront < -1 || positionFromFront > 3) return null
              
              // REVERSE: Front card is SMALL, back cards are BIG and BLURRED
              const scale = 1 + Math.abs(positionFromFront) * 0.12 // 1.0, 1.12, 1.24, 1.36
              const yOffset = -positionFromFront * 20 // Offset changes
              const zOffset = positionFromFront * 60 // Push back cards further
              const blur = Math.max(0, Math.abs(positionFromFront) * 5) // More blur
              const opacity = positionFromFront === 0 ? 1 : 0.7
              
              return (
                <div
                  key={item.id}
                  className="absolute inset-0 w-full h-full"
                  style={{
                    transform: `translateY(${yOffset}px) translateZ(${zOffset}px) scale(${scale})`,
                    transition: positionFromFront === 0 || positionFromFront === 1 || positionFromFront === -1 
                      ? 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                      : 'none',
                    transformStyle: 'preserve-3d',
                    filter: blur > 0 ? `blur(${blur}px)` : 'none',
                    opacity: opacity,
                    pointerEvents: positionFromFront === 0 ? 'auto' : 'none',
                  }}
                >
                  <ShowcaseCard 
                    item={item}
                    index={idx}
                    total={list.length}
                  />
                </div>
              )
            })}
          </div>

          {/* Swipe instructions */}
          <div className="absolute top-4 left-4 right-4 text-xs text-white/60 pointer-events-none text-center">
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
              <div key={it.id} className="sc-card">
                <ShowcaseCard item={it} index={idx} total={list.length} />
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
    </section>
  )
}
