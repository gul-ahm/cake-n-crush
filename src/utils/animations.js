import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function revealStagger(selector, opts = {}){
  const { root = document, y = 20, stagger = 0.08, duration = 0.6 } = opts
  const els = root.querySelectorAll(selector)
  gsap.set(els, { y, opacity: 0 })
  ScrollTrigger.batch(els, {
    onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, stagger, duration, ease: 'power2.out' }),
    onLeave: (batch) => gsap.to(batch, { y: -y, opacity: 0, stagger, duration: 0.3, ease: 'power2.in' }),
    onEnterBack: (batch) => gsap.to(batch, { y: 0, opacity: 1, stagger, duration, ease: 'power2.out' }),
    onLeaveBack: (batch) => gsap.to(batch, { y, opacity: 0, stagger, duration: 0.3, ease: 'power2.in' }),
    start: 'top 85%',
    end: 'bottom 15%'
  })
}

export function heroTimeline(container){
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
  tl.from(container.querySelectorAll('.hero-card'), { y: 30, opacity: 0, stagger: 0.15, duration: 0.8 })
  return tl
}
