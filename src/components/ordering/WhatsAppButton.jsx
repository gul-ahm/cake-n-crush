import { motion, useMotionValue } from 'framer-motion'
import { buildWhatsAppLink } from '../../utils/whatsappUtils'
import { siWhatsapp } from 'simple-icons/icons'
import { useSocial } from '../../contexts/SocialContext'

import { log as logActivity } from '../../services/activityService'
import { useEffect, useRef } from 'react'

export default function WhatsAppButton({ item, size = 'md', variant = 'solid', className = '' }) {
  const { socials } = useSocial()
  const href = buildWhatsAppLink(item, socials?.main?.whatsapp)
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-5 py-2.5 text-lg'
  }
  if (variant === 'fab') {
    const ref = useRef(null)
    const mx = useMotionValue(0)
    const my = useMotionValue(0)
    useEffect(() => {
      const el = ref.current
      if (!el) return
      const card = el.closest('.group') || el.parentElement
      if (!card) return
      const onMove = (e) => {
        const cr = el.getBoundingClientRect()
        const cx = cr.left + cr.width / 2
        const cy = cr.top + cr.height / 2
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const limit = 16
        const k = 0.12
        const tx = Math.max(-limit, Math.min(limit, dx * k))
        const ty = Math.max(-limit, Math.min(limit, dy * k))
        mx.set(tx)
        my.set(ty)
      }
      const onLeave = () => { mx.set(0); my.set(0) }
      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseleave', onLeave)
      return () => {
        card.removeEventListener('mousemove', onMove)
        card.removeEventListener('mouseleave', onLeave)
      }
    }, [mx, my])

    return (
      <motion.a
        ref={ref}
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label="Order via WhatsApp"
        className={`inline-flex items-center justify-center rounded-full bg-whatsapp text-white shadow-lg w-12 h-12 ${className}`}
        onClick={() => logActivity('order_click', { id: item?.id, name: item?.name })}
        style={{ x: mx, y: my }}
        initial={{ opacity: 0, y: 12, scale: 0.6 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-20% 0px' }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d={siWhatsapp.path} />
        </svg>
      </motion.a>
    )
  }

  const cls = sizes[size] || sizes.md
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 rounded-md bg-whatsapp text-white ${cls} ${className}`}
      onClick={() => {
        try { logActivity('order_click', { id: item?.id, name: item?.name }) } catch (e) { console.error(e) }
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <span>WhatsApp</span>
      <span aria-hidden>✉️</span>
    </motion.a>
  )
}
