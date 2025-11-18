import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function SimpleMap({ userLocation, shopLocation, onGetDirections }) {
  const [distance, setDistance] = useState(null)

  useEffect(() => {
    if (userLocation && shopLocation) {
      // Calculate distance
      const dist = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        shopLocation.lat, 
        shopLocation.lng
      )
      setDistance(dist)
    }
  }, [userLocation, shopLocation])

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1)
    const dLng = toRadians(lng2 - lng1)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
             Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
             Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const toRadians = (degrees) => {
    return degrees * (Math.PI / 180)
  }

  const getDistanceString = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`
    } else {
      return `${Math.round(distance)}km`
    }
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
      {/* Simple Map Representation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-gray-700 dark:text-gray-300 p-6">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold mb-4">Location Map</h3>
          
          {/* Location Info */}
          <div className="space-y-4 mb-6">
            <div className="bg-white/80 dark:bg-black/40 rounded-lg p-4">
              <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                🎂 {shopLocation?.name || 'Cake N Crush'}
              </h4>
              <p className="text-sm opacity-75">
                {shopLocation?.address || 'Bakery Location'}
              </p>
              <p className="text-xs opacity-60 mt-1">
                {shopLocation?.lat?.toFixed(4)}, {shopLocation?.lng?.toFixed(4)}
              </p>
            </div>

            {userLocation && (
              <div className="bg-white/80 dark:bg-black/40 rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  📍 Your Location
                </h4>
                <p className="text-xs opacity-60">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
                {distance && (
                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-400 mt-2">
                    Distance: ~{getDistanceString(distance)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Visual Route Representation */}
          {userLocation && shopLocation && (
            <div className="mb-6">
              <svg width="200" height="120" className="mx-auto">
                {/* Route line */}
                <motion.path
                  d="M 30 90 Q 100 60 170 30"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                />
                
                {/* User location */}
                <motion.circle
                  cx="30"
                  cy="90"
                  r="8"
                  fill="#3B82F6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
                <text x="30" y="110" className="text-xs fill-current" textAnchor="middle">
                  You
                </text>
                
                {/* Shop location */}
                <motion.circle
                  cx="170"
                  cy="30"
                  r="8"
                  fill="#EF4444"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
                <text x="170" y="20" className="text-xs fill-current" textAnchor="middle">
                  Bakery
                </text>
              </svg>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onGetDirections}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              🧭 Get Directions
            </button>
            
            <button
              onClick={() => {
                const mapUrl = userLocation 
                  ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.lat}%2C${userLocation.lng}%3B${shopLocation?.lat}%2C${shopLocation?.lng}`
                  : `https://www.openstreetmap.org/?mlat=${shopLocation?.lat}&mlon=${shopLocation?.lng}&zoom=15`
                window.open(mapUrl, '_blank')
              }}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              🔍 Open in Maps
            </button>
          </div>
        </div>
      </div>

      {/* Status Overlays */}
      {userLocation && shopLocation && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 bg-green-50/95 dark:bg-green-900/95 backdrop-blur px-3 py-2 rounded-lg shadow-lg border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Route Found • {getDistanceString(distance)}
            </span>
          </div>
        </motion.div>
      )}

      {/* Shop Marker */}
      <div className="absolute top-4 right-4 bg-red-50/95 dark:bg-red-900/95 backdrop-blur px-3 py-2 rounded-lg shadow-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-red-700 dark:text-red-300">
            🎂 {shopLocation?.name || 'Bakery'}
          </span>
        </div>
      </div>
    </div>
  )
}