import { NavLink } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import ThemeToggle from './ThemeToggle'

export default function NavBar() {
  const { scrollY } = useScroll()
  const bg = useTransform(scrollY, [0, 200], ['rgba(255,255,255,0.60)', 'rgba(255,255,255,0.88)'])
  const shadow = useTransform(scrollY, [0, 200], ['0 0 0 rgba(0,0,0,0)', '0 10px 30px rgba(0,0,0,0.08)'])
  const blur = useTransform(scrollY, [0, 200], ['blur(10px)', 'blur(16px)'])

  return (
    <motion.header className="sticky top-0 z-40 border-b dark:border-white/10" style={{ backgroundColor: bg, boxShadow: shadow, backdropFilter: blur }}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2">
          <span className="text-2xl">🎂</span>
          <NavLink to="/" className="font-bold text-xl tracking-tight">Cake N Crush</NavLink>
        </motion.div>
        <nav className="flex items-center gap-6 text-sm">
          <NavLink to="/portfolio" className={({isActive}) => isActive ? 'font-semibold' : 'text-neutral-700'}>Portfolio</NavLink>
          <NavLink to="/find-us" className={({isActive}) => isActive ? 'font-semibold' : 'text-neutral-700'}>Find Us</NavLink>
          <ThemeToggle />
        </nav>
      </div>
    </motion.header>
  )
}
