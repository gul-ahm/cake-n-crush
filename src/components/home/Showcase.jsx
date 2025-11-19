import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePortfolio from '../../hooks/usePortfolio'
import { playSwipeSound, playCardFlipSound } from '../../utils/soundEffects'

gsap.registerPlugin(ScrollTrigger)

// Memoized card component for performance
const ShowcaseCard = memo(({ item, isFocused, index, total }) => {
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
      className="rounded-lg overflow-hidden border bg-white/70 dark:bg-neutral-900/60 backdrop-blur md:min-w-[260px] min-w-full sm:min-w-[260px] transition-all duration-300"
      style={{
        flex: 'auto',
        cursor: 'pointer',
        willChange: 'transform, filter',
        // Mobile swipe card styling
        ...(typeof isFocused !== 'undefined' && {
          opacity: isFocused ? 1 : 0.6,
          transform: isFocused ? 'scale(1)' : 'scale(0.85)',
          filter: isFocused ? 'blur(0px)' : 'blur(8px)',
        }),
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
            <span className="text-3xl opacity-50">🍰</span>
          </div>
        )}
      </div>
      
      <div className="p-2 sm:p-3 text-xs sm:text-sm">
        <div className="font-semibold truncate text-gray-900 dark:text-white">{item.name}</div>
        <div className="text-neutral-600 dark:text-neutral-400 line-clamp-1">{index + 1} of {total}</div>
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
              playSwipeSound()
            }
          }
        }
      })
    }, root)
    return () => ctx.revert()
  }, [isMobile])

  // Mobile swipe handlers
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return
    setTouchStart(e.touches[0].clientX)
  }, [isMobile])

  const handleTouchEnd = useCallback((e) => {
    if (!isMobile) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd
    const threshold = 50

    if (Math.abs(diff) < threshold) return

    // Swipe left: show next card
    if (diff > threshold && focusedCardIndex < list.length - 1) {
      setFocusedCardIndex(focusedCardIndex + 1)
      playCardFlipSound()
    }
    // Swipe right: show previous card
    else if (diff < -threshold && focusedCardIndex > 0) {
      setFocusedCardIndex(focusedCardIndex - 1)
      playCardFlipSound()
    }
  }, [isMobile, focusedCardIndex, list.length, touchStart])

  return (
    <section 
      ref={ref} 
      className="my-20 rounded-2xl border bg-animated overflow-hidden min-h-[40vh] md:min-h-[70vh] flex flex-col justify-center"
    >
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <h3 className="font-display text-gradient text-xl sm:text-2xl md:text-3xl">Signature Showcase</h3>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-2">
          {isMobile 
            ? `👆 Swipe to browse • Card ${focusedCardIndex + 1} of ${list.length} ♪` 
            : '📜 Scroll to explore • Sound enabled ♪'}
        </p>
      </div>
      
      {isMobile ? (
        // MOBILE: Swipe-focused card view with blur background and sound
        <div 
          className="relative w-full flex-1 flex items-center justify-center py-8 px-4 sm:px-6 perspective"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Background blur effect with stacked cards */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Far back cards (most blurred) */}
            {list.slice(Math.max(0, focusedCardIndex - 2), focusedCardIndex).map((item, idx) => (
              <div
                key={`bg-${item.id}`}
                className="absolute rounded-lg overflow-hidden border bg-white/30 dark:bg-neutral-900/30 backdrop-blur-xl"
                style={{
                  width: '85%',
                  maxWidth: '300px',
                  aspectRatio: '4/5',
                  transform: `translateY(${(idx - 1) * 20}px)`,
                  opacity: 0.4,
                  filter: 'blur(12px)',
                  zIndex: 1 + idx,
                }}
              >
                {item.images?.[0] && (
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover opacity-50" />
                )}
              </div>
            ))}
          </div>

          {/* Focused card (front) */}
          <div className="relative z-50 w-full max-w-xs">
            {list[focusedCardIndex] && (
              <ShowcaseCard 
                item={list[focusedCardIndex]} 
                isFocused={true}
                index={focusedCardIndex}
                total={list.length}
              />
            )}
          </div>

          {/* Navigation dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {list.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setFocusedCardIndex(idx)
                  playCardFlipSound()
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === focusedCardIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to card ${idx + 1}`}
              />
            ))}
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
            {list.map((it) => (
              <div key={it.id} className="sc-card">
                <ShowcaseCard item={it} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile hint footer */}
      {isMobile && (
        <div className="px-4 sm:px-6 py-3 bg-white/50 dark:bg-black/30 text-center text-xs text-neutral-600 dark:text-neutral-300 border-t">
          💡 Swipe left/right to browse • Dots to jump
        </div>
      )}
    </section>
  )
}
