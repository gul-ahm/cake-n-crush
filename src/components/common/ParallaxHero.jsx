import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ParallaxHero(){
  const ref = useRef(null)
  useEffect(()=>{
    if (!ref.current) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.from('.p-layer-1', { y: 40, opacity: 0, duration: 0.8 }, 0)
        .from('.p-layer-2', { y: 60, opacity: 0, duration: 0.9 }, 0.05)
        .from('.p-layer-3', { y: 80, opacity: 0, duration: 1.0 }, 0.1)
      tl.from(['.fg-1', '.fg-2', '.fg-3'], { y: 24, opacity: 0, rotate: -6, stagger: 0.08, duration: 0.7 }, 0.15)
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: self => {
          gsap.to('.p-layer-1', { y: 20 * self.progress })
          gsap.to('.p-layer-2', { y: 40 * self.progress })
          gsap.to('.p-layer-3', { y: 60 * self.progress })
        }
      })

      const el = ref.current
      const onMove = (e) => {
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width/2
        const cy = r.top + r.height/2
        const dx = (e.clientX - cx) / r.width
        const dy = (e.clientY - cy) / r.height
        const depth = [14, 22, 30]
        ;['.fg-1','.fg-2','.fg-3'].forEach((sel, i) => {
          gsap.to(sel, { x: dx * depth[i], y: dy * depth[i], rotate: dx * 6, duration: 0.2, overwrite: true })
        })
      }
      const onLeave = () => gsap.to(['.fg-1','.fg-2','.fg-3'], { x: 0, y: 0, rotate: 0, duration: 0.3 })
      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
      return () => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      }
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-pink-100 via-white to-amber-50 dark:from-pink-900/20 dark:via-neutral-900 dark:to-amber-900/10">
      <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-pink-300/40 blur-3xl p-layer-1" />
      <div className="absolute -bottom-12 -right-12 w-80 h-80 rounded-full bg-amber-300/40 blur-3xl p-layer-2" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-fuchsia-300/30 blur-3xl p-layer-3" />
      <div className="relative px-6 py-16 md:px-12 md:py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Artful Cakes, Animated Delight</h2>
        <p className="mt-3 text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto">Elevated visuals and motion bringing Cake N Crush to life. Explore designs, order via WhatsApp, and find us with animated geolocation.</p>
        <div className="pointer-events-none">
          <div className="fg-1 absolute left-6 md:left-16 bottom-6 md:bottom-10 w-28 md:w-36 aspect-square rounded-2xl bg-white/80 dark:bg-zinc-900/70 border shadow-lg backdrop-blur flex items-center justify-center text-4xl">🍰</div>
          <div className="fg-2 absolute right-10 md:right-20 bottom-8 md:bottom-16 w-24 md:w-32 aspect-square rounded-full bg-white/80 dark:bg-zinc-900/70 border shadow-lg backdrop-blur flex items-center justify-center text-3xl">🧁</div>
          <div className="fg-3 absolute left-1/2 -translate-x-1/2 -bottom-4 md:-bottom-2 w-32 md:w-40 aspect-[4/3] rounded-2xl bg-white/80 dark:bg-zinc-900/70 border shadow-lg backdrop-blur flex items-center justify-center text-4xl">🎂</div>
        </div>
      </div>
    </div>
  )
}
