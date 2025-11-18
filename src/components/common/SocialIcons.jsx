import { motion } from 'framer-motion'
import { siInstagram, siLinkedin, siTelegram, siX } from 'simple-icons/icons'

const icons = {
  Instagram: siInstagram,
  LinkedIn: siLinkedin,
  Telegram: siTelegram,
  Twitter: siX, // X (formerly Twitter)
}

const links = [
  { href: 'https://instagram.com/CakeNCrushOfficial', label: 'Instagram' },
  { href: 'https://www.linkedin.com/company/cake-n-crush', label: 'LinkedIn' },
  { href: 'https://t.me/CakeNCrushUpdates', label: 'Telegram' },
  { href: 'https://twitter.com/CakeNCrush', label: 'Twitter' },
]

export default function SocialIcons(){
  return (
    <div className="flex items-center gap-4">
      {links.map((l, i) => (
        <motion.a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noreferrer"
          className="text-neutral-800 dark:text-neutral-200"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ y: -2, rotate: -3, scale: 1.05 }}
          transition={{ delay: i * 0.05 }}
          title={l.label}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d={icons[l.label].path} />
          </svg>
        </motion.a>
      ))}
    </div>
  )
}
