import { useEffect, useRef } from 'react'

export default function MouseGlow(){
  const ref = useRef(null)
  useEffect(()=>{
    const el = ref.current
    if (!el) return
    const onMove = (e) => {
      const x = e.clientX - 150
      const y = e.clientY - 150
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 w-[300px] h-[300px] rounded-full opacity-40 mix-blend-screen blur-3xl z-40"
      style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.6) 0%, rgba(251,191,36,0.35) 60%, rgba(255,255,255,0) 70%)' }}
    />
  )
}
