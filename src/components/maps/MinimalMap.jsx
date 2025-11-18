import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// Ultra-simple map component that should always work
export default function MinimalMap({ userLocation, shopLocation, onGetDirections }) {
  const [distance, setDistance] = useState(null)

  useEffect(() => {
    if (userLocation && shopLocation) {
      // Calculate distance using simple math
      const lat1 = userLocation.lat * Math.PI / 180
      const lat2 = shopLocation.lat * Math.PI / 180
      const deltaLat = (shopLocation.lat - userLocation.lat) * Math.PI / 180
      const deltaLng = (shopLocation.lng - userLocation.lng) * Math.PI / 180

      const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLng/2) * Math.sin(deltaLng/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const dist = 6371 * c // Earth radius in km

      setDistance(dist)
    }
  }, [userLocation, shopLocation])

  const getDistanceString = (distance) => {
    if (!distance) return ''
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`
    } else {
      return `${Math.round(distance)}km`
    }
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl flex items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="text-center p-8 relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl mb-4"
        >
          🗺️
        </motion.div>
        
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Location Map
        </h3>

        {/* Location Cards */}
        <div className="space-y-4 mb-6 max-w-md mx-auto">
          {/* Shop Location */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 dark:bg-black/40 backdrop-blur rounded-lg p-4 border border-red-200 dark:border-red-800"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎂</span>
              <div className="text-left">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  {shopLocation?.name || 'Cake N Crush'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {shopLocation?.address || 'Bakery Location'}
                </p>
                {shopLocation && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    📍 {shopLocation.lat?.toFixed(4)}, {shopLocation.lng?.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* User Location */}
          {userLocation && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 dark:bg-black/40 backdrop-blur rounded-lg p-4 border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📍</span>
                <div className="text-left">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                    Your Location
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Distance Display */}
          {distance && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4"
            >
              <div className="text-center">
                <span className="text-2xl mr-2">🚗</span>
                <span className="text-xl font-bold">
                  Distance: {getDistanceString(distance)}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Route Visualization */}
        {userLocation && shopLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <svg width="240" height="120" className="mx-auto">
              <motion.path
                d="M 40 90 Q 120 50 200 30"
                stroke="#8B5CF6"
                strokeWidth="3"
                fill="none"
                strokeDasharray="8,4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
              />
              
              <motion.circle
                cx="40"
                cy="90"
                r="8"
                fill="#3B82F6"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <text x="40" y="110" className="text-xs fill-current text-gray-600 dark:text-gray-300" textAnchor="middle">
                You
              </text>
              
              <motion.circle
                cx="200"
                cy="30"
                r="8"
                fill="#EF4444"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <text x="200" y="20" className="text-xs fill-current text-gray-600 dark:text-gray-300" textAnchor="middle">
                Bakery
              </text>
            </svg>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <motion.button
            onClick={onGetDirections}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🧭 Get Directions
          </motion.button>
          
          <motion.button
            onClick={() => {
              const mapUrl = userLocation 
                ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.lat}%2C${userLocation.lng}%3B${shopLocation?.lat}%2C${shopLocation?.lng}`
                : `https://www.openstreetmap.org/?mlat=${shopLocation?.lat}&mlon=${shopLocation?.lng}&zoom=15`
              window.open(mapUrl, '_blank')
            }}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🔍 Open in Maps
          </motion.button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 text-4xl opacity-20 animate-bounce">
        🎂
      </div>
      <div className="absolute bottom-4 left-4 text-3xl opacity-20 animate-pulse">
        📍
      </div>
    </div>
  )
}