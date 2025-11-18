import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function MagneticButton({ className = '', children, strength = 0.25, to, href, as = 'button', ...rest }){
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 300, damping: 20 })
  const sy = useSpring(my, { stiffness: 300, damping: 20 })

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    mx.set(dx * strength)
    my.set(dy * strength)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  const baseProps = {
    ref,
    className: `relative inline-flex items-center justify-center rounded-md px-6 py-3 bg-black shadow-lg font-medium z-10 ${className}`,
    style: { x: sx, y: sy },
    onMouseMove: onMove,
    onMouseLeave: onLeave,
    ...rest,
  }

  if (to) {
    const MotionLink = motion(Link)
    return (
      <MotionLink to={to} {...baseProps}>
        {children}
      </MotionLink>
    )
  }
  if (href) {
    return (
      <motion.a href={href} {...baseProps}>
        {children}
      </motion.a>
    )
  }
  return <motion.button {...baseProps}>{children}</motion.button>
}
