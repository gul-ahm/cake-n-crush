import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import NavBar from './components/common/NavBar'
import Footer from './components/common/Footer'
import LiquidCursor from './components/effects/LiquidCursor'
import FloatingWhatsAppButton from './components/common/FloatingWhatsAppButton'
import SmoothScroll from './components/common/SmoothScroll'
import { SocialProvider } from './contexts/SocialContext'

export default function App() {
  const location = useLocation()

  // Don't show FloatingWhatsAppButton on admin pages
  const isAdminPage = location.pathname.startsWith('/secure-admin') || location.pathname.startsWith('/login') || location.pathname.startsWith('/admin')

  return (
    <SocialProvider>
      <div className="min-h-screen flex flex-col">
        <SmoothScroll />
        <LiquidCursor />
        <NavBar />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />

        {/* Floating WhatsApp Button - hidden on admin pages */}
        {!isAdminPage && <FloatingWhatsAppButton />}
      </div>
    </SocialProvider>
  )
}
