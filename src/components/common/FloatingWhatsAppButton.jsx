import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FloatingWhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState("Click me to order, let's connect us on whatsapp")
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    // Show button after 3 seconds
    const showTimer = setTimeout(() => setIsVisible(true), 3000)
    
    // Cycle through different messages
    const messages = [
      "Click me to order, let's connect us on whatsapp",
      "🎂 Order your dream cake now!",
      "💬 Let's chat about your sweet ideas!",
      "✨ Custom cakes just a click away!",
      "🍰 Ready to create something amazing?"
    ]
    
    const messageTimer = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)])
    }, 5000)

    return () => {
      clearTimeout(showTimer)
      clearInterval(messageTimer)
    }
  }, [])

  const handleClick = () => {
    // Get WhatsApp number from localStorage or use default
    const socialLinks = JSON.parse(localStorage.getItem('social_links') || '{}')
    const whatsappNumber = socialLinks.whatsapp || '+1234567890'
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '')
    
    const defaultMessage = encodeURIComponent("Hi! I'd like to order a custom cake from Cake N Crush. Can you help me with the details?")
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${defaultMessage}`
    
    window.open(whatsappUrl, '_blank')
  }

  const toggleMinimize = (e) => {
    e.stopPropagation()
    setIsMinimized(!isMinimized)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0, x: 100 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0, x: 100 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="relative">
          {/* Message Bubble */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                className="absolute bottom-16 right-0 mb-2 mr-2"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-xs">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                      🎂
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800 dark:text-white mb-1">
                        Cake N Crush
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {message}
                      </div>
                    </div>
                    <button
                      onClick={toggleMinimize}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  {/* Speech bubble arrow */}
                  <div className="absolute bottom-0 right-4 transform translate-y-1/2">
                    <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white dark:border-t-gray-800"></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* WhatsApp Button */}
          <motion.button
            onClick={handleClick}
            onDoubleClick={toggleMinimize}
            className="relative w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              rotate: {
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }
            }}
          >
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75 group-hover:animate-none"></div>
            
            {/* WhatsApp Icon */}
            <svg
              className="relative z-10 w-8 h-8"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.507"/>
            </svg>

            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-bounce">
              !
            </div>
          </motion.button>

          {/* Minimize hint */}
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
            >
              Double tap to hide
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}