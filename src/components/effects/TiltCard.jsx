import { useRef } from 'react'

export default function TiltCard({ children, max = 12, className = '' }){
  const cardRef = useRef(null)
  const onMove = (e) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rx = (py - 0.5) * 2 * max
    const ry = (0.5 - px) * 2 * max
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`
  }
  const onLeave = () => {
    const el = cardRef.current
    if (el) el.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)'
  }
  return (
    <div className={`tilt-container ${className}`}>
      <div ref={cardRef} onMouseMove={onMove} onMouseLeave={onLeave} style={{ transformStyle: 'preserve-3d', transition: 'transform 120ms ease-out' }}>
        {children}
      </div>
    </div>
  )
}
