import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { heroTimeline } from '../utils/animations'
import AnimatedText from '../components/common/AnimatedText'
import ParallaxHero from '../components/common/ParallaxHero'
import MouseGlow from '../components/effects/MouseGlow'
import MagneticButton from '../components/common/MagneticButton'
import Showcase from '../components/home/Showcase'

export default function Home(){
  const heroRef = useRef(null)
  const [findUsData, setFindUsData] = useState(null)
  
  useEffect(() => {
    if (!heroRef.current) return
    const ctx = gsap.context(() => { heroTimeline(heroRef.current) }, heroRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    // Load find us data for preview section
    const stored = localStorage.getItem('findus_data')
    if (stored) {
      setFindUsData(JSON.parse(stored))
    } else {
      // Default data
      setFindUsData({
        location: {
          name: 'Cake N Crush',
          address: '123 Sweet Street, Cake City, CC 12345',
          phone: '+1 (555) 123-CAKE',
          email: 'info@cakencrush.com',
        }
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <MouseGlow />
      <ParallaxHero />
      
      <div ref={heroRef} className="w-full">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <AnimatedText text="Cake N Crush" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-4 -right-4 text-4xl sm:text-6xl opacity-20"
                >
                  🎂
                </motion.div>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg sm:text-xl lg:text-2xl text-neutral-600 dark:text-neutral-300 max-w-4xl mx-auto leading-relaxed"
              >
                Exquisite custom cakes by Chef Tamanna Arzoo — crafted with love, artistry, and a sprinkle of magic. 
                Explore the portfolio and order via WhatsApp with one tap.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 max-w-lg mx-auto"
              >
                <MagneticButton 
                  to="/portfolio" 
                  className="hero-card shadow-glow font-semibold text-white px-8 py-4 text-lg"
                >
                  View Portfolio
                </MagneticButton>
                <MagneticButton 
                  to="/find-us" 
                  className="hero-card bg-white dark:bg-gray-800 text-black dark:text-white border border-black/20 dark:border-white/20 shadow-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 px-8 py-4 text-lg"
                >
                  Find Us
                </MagneticButton>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Signature Showcase Section */}
        <section className="relative py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent"
            >
              Signature Showcase
            </motion.h2>
            <Showcase />
          </div>
        </section>

        {/* Find Us Preview Section */}
        <section className="relative py-16 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Visit Our Bakery
              </h2>
              <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
                Experience the magic in person! Visit our cozy bakery for fresh treats, custom consultations, and the warmest welcome.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Location Info */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                    <span className="text-3xl mr-3">📍</span>
                    {findUsData?.location?.name || 'Cake N Crush'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-xl mt-1">🏠</span>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Address</p>
                        <p className="text-gray-600 dark:text-gray-300">
                          {findUsData?.location?.address || '123 Sweet Street, Cake City'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <span className="text-xl mt-1">📞</span>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Phone</p>
                        <p className="text-gray-600 dark:text-gray-300">
                          {findUsData?.location?.phone || '+1 (555) 123-CAKE'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <span className="text-xl mt-1">📧</span>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Email</p>
                        <p className="text-gray-600 dark:text-gray-300">
                          {findUsData?.location?.email || 'info@cakencrush.com'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <MagneticButton 
                      to="/find-us" 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 text-center block"
                    >
                      Get Directions & Full Details
                    </MagneticButton>
                  </div>
                </div>
              </motion.div>

              {/* Map Preview */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl overflow-hidden relative group cursor-pointer">
                    {/* Map placeholder with interactive preview */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                          🗺️
                        </div>
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Interactive Map
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to view full map with directions
                        </p>
                      </div>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-4 left-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                    </div>
                    
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-white/90 dark:bg-black/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                        📍 Cake N Crush
                      </div>
                    </div>

                    {/* Click overlay */}
                    <Link to="/find-us" className="absolute inset-0 z-10"></Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="relative py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white shadow-2xl"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Ready to Create Something Sweet?
              </h2>
              <p className="text-lg sm:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Let's bring your dream cake to life! Browse our portfolio for inspiration or contact us directly to discuss your custom creation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton 
                  to="/portfolio" 
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold shadow-lg"
                >
                  Browse Portfolio
                </MagneticButton>
                <MagneticButton 
                  to="/find-us" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-xl font-semibold"
                >
                  Contact Us
                </MagneticButton>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}
