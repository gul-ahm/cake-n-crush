import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePortfolio from '../../hooks/usePortfolio'

gsap.registerPlugin(ScrollTrigger)

// Memoized card component for performance
const ShowcaseCard = memo(({ item }) => {
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
      className="sc-card rounded-lg overflow-hidden border bg-white/70 dark:bg-neutral-900/60 backdrop-blur transition-transform duration-200 hover:scale-105 active:scale-95 md:min-w-[260px] min-w-full sm:min-w-[260px]"
      style={{
        flex: 'auto',
        cursor: 'pointer',
        willChange: 'transform',
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
          <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900" />
        )}
      </div>
      
      <div className="p-2 sm:p-3 text-xs sm:text-sm">
        <div className="font-semibold truncate text-gray-900 dark:text-white">{item.name}</div>
        <div className="text-neutral-600 dark:text-neutral-400 line-clamp-1">Gallery item</div>
      </div>
    </div>
  )
})

export default function Showcase(){
  const { items } = usePortfolio()
  const ref = useRef(null)
  const scrollContainerRef = useRef(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

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
      }, 150)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Optimized animation for desktop (horizontal scroll with pin)
  useEffect(() => {
    // Skip animation on mobile for better performance
    if (isMobile) return
    
    const root = ref.current
    if (!root) return
    const track = root.querySelector('.sc-track')
    if (!track) return
    
    const distance = Math.max(0, track.scrollWidth - root.clientWidth)
    const ctx = gsap.context(() => {
      const cards = root.querySelectorAll('.sc-card')
      // Use requestAnimationFrame for smoother animations
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
          fastScrollEnd: true, // Prevent jank on fast scrolling
        }
      })
    }, root)
    return () => ctx.revert()
  }, [isMobile])

  // Mobile touch scroll handler with debouncing
  const handleTouchScroll = useCallback(() => {
    if (!scrollContainerRef.current) return
    // Debounced scroll updates for performance
    const container = scrollContainerRef.current
    container.scrollLeft = container.scrollLeft // Enable horizontal scroll
  }, [])

  return (
    <section 
      ref={ref} 
      className="my-20 rounded-2xl border bg-animated overflow-hidden min-h-[40vh] md:min-h-[70vh] flex flex-col justify-center"
    >
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <h3 className="font-display text-gradient text-xl sm:text-2xl md:text-3xl">Signature Showcase</h3>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-2">
          {isMobile ? '👆 Tap and drag to explore • 👇 Swipe down for more' : '📜 Scroll to explore highlights'}
        </p>
      </div>
      
      {/* Mobile-optimized dual-scroll container */}
      <div 
        ref={scrollContainerRef}
        className={`relative w-full flex-1 flex flex-col ${
          isMobile 
            ? 'overflow-x-auto overflow-y-auto md:overflow-hidden' 
            : 'overflow-hidden'
        } py-6 sm:py-8 px-4 sm:px-6`}
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch', // Smooth momentum scrolling on iOS
          scrollPaddingLeft: '1rem',
          scrollPaddingRight: '1rem',
        }}
        onScroll={handleTouchScroll}
      >
        <div 
          className={`sc-track flex gap-3 sm:gap-4 will-change-transform ${
            isMobile ? 'flex-col md:flex-row' : 'flex-row'
          }`}
          style={{
            minHeight: isMobile ? 'auto' : '100%',
            display: isMobile ? 'grid' : 'flex',
            gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(200px, 1fr))' : 'unset',
          }}
        >
          {list.map((it) => (
            <ShowcaseCard key={it.id} item={it} />
          ))}
        </div>
      </div>

      {/* Mobile instructions footer */}
      {isMobile && (
        <div className="px-4 sm:px-6 py-3 bg-white/50 dark:bg-black/30 text-center text-xs text-neutral-600 dark:text-neutral-300 border-t">
          💡 Swipe horizontally & vertically to browse all items
        </div>
      )}
    </section>
  )
}
