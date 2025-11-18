import { motion } from 'framer-motion'

export default function AnimatedText({ text, delay = 0 }) {
  const letters = Array.from(text)
  return (
    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
      {letters.map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: '1em', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: delay + i * 0.03, type: 'spring', stiffness: 200, damping: 20 }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </h1>
  )
}
