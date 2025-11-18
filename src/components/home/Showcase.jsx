import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import usePortfolio from '../../hooks/usePortfolio'

gsap.registerPlugin(ScrollTrigger)

export default function Showcase(){
  const { items } = usePortfolio()
  const ref = useRef(null)

  useEffect(()=>{
    const root = ref.current
    if (!root) return
    const track = root.querySelector('.sc-track')
    const distance = Math.max(0, track.scrollWidth - root.clientWidth)
    const ctx = gsap.context(() => {
      const cards = root.querySelectorAll('.sc-card')
      gsap.from(cards, {
        opacity: 0,
        y: 24,
        scale: 0.96,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power2.out',
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
          end: () => `+=${Math.max(700, distance)}`,
          scrub: true,
          pin: true,
          anticipatePin: 1,
          pinSpacing: true,
        }
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const list = items.length ? items : Array.from({ length: 8 }).map((_,i)=>({ id:`ph-${i}`, name:`Signature ${i+1}`, images:[] }))

  return (
    <section ref={ref} className="my-20 rounded-2xl border bg-animated overflow-hidden min-h-[70vh] flex flex-col justify-center">
      <div className="px-6 py-8">
        <h3 className="font-display text-gradient text-2xl md:text-3xl">Signature Showcase</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">Scroll to explore highlights with a smooth horizontal gallery.</p>
      </div>
      <div className="relative w-full overflow-hidden py-8 flex items-center">
        <div className="sc-track flex gap-4 px-6 will-change-transform">
          {list.map((it,i)=> (
            <div key={it.id} className="sc-card min-w-[260px] rounded-xl overflow-hidden border bg-white/70 dark:bg-neutral-900/60 backdrop-blur">
              <div className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-800"/>
              <div className="p-3 text-sm">
                <div className="font-semibold truncate">{it.name}</div>
                <div className="text-neutral-600 dark:text-neutral-400">Animated gallery card</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
