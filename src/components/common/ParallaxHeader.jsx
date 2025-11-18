import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ParallaxHeader({ title = 'Portfolio', subtitle = 'Curated creations for every occasion.' }){
  const ref = useRef(null)
  useEffect(()=>{
    if (!ref.current) return
    const ctx = gsap.context(() => {
      const el = ref.current
      gsap.from(el.querySelector('.ph-title'), { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' })
      gsap.from(el.querySelector('.ph-sub'), { y: 24, opacity: 0, duration: 0.6, delay: 0.1, ease: 'power2.out' })
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: self => {
          gsap.to(el.querySelector('.ph-l1'), { y: 20 * self.progress })
          gsap.to(el.querySelector('.ph-l2'), { y: 35 * self.progress })
        }
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="relative overflow-hidden rounded-2xl border mb-8 bg-gradient-to-br from-rose-100 via-white to-amber-50 dark:from-rose-900/20 dark:via-neutral-900 dark:to-amber-900/10">
      <div className="absolute -top-8 left-4 w-40 h-40 rounded-full bg-rose-300/40 blur-3xl ph-l1" />
      <div className="absolute -bottom-10 right-4 w-52 h-52 rounded-full bg-amber-300/40 blur-3xl ph-l2" />
      <div className="relative px-6 py-12 md:px-10 md:py-16 text-center">
        <h2 className="ph-title text-2xl md:text-4xl font-extrabold tracking-tight">{title}</h2>
        <p className="ph-sub mt-2 text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </div>
  )
}
