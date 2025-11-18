import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { motion } from 'framer-motion'
import L from 'leaflet'

// Import Leaflet CSS directly in component to avoid build issues
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  className: 'user-location-marker'
})

const shopIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#EF4444"/>
      <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">🎂</text>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
})

// Component to fit map bounds when locations change
function MapController({ userLocation, shopLocation }) {
  const map = useMap()

  useEffect(() => {
    if (userLocation && shopLocation) {
      // Fit bounds to show both user and shop
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        [shopLocation.lat, shopLocation.lng]
      ])
      map.fitBounds(bounds, { padding: [20, 20] })
    } else if (shopLocation) {
      // Center on shop
      map.setView([shopLocation.lat, shopLocation.lng], 15)
    }
  }, [map, userLocation, shopLocation])

  return null
}

// Route line component
function RouteDisplay({ userLocation, shopLocation }) {
  if (!userLocation || !shopLocation) return null

  const positions = [
    [userLocation.lat, userLocation.lng],
    [shopLocation.lat, shopLocation.lng]
  ]

  return (
    <Polyline 
      positions={positions} 
      color="#8B5CF6" 
      weight={4}
      opacity={0.8}
      dashArray="10, 10"
    />
  )
}

export default function OpenStreetMap({ userLocation, shopLocation, onGetDirections, onError }) {
  const [distance, setDistance] = useState(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    // Check if Leaflet is available
    try {
      if (!L || typeof L.Map === 'undefined') {
        console.warn('Leaflet not properly loaded')
        setMapError(true)
        onError && onError()
        return
      }
    } catch (error) {
      console.warn('Leaflet not available, showing fallback map:', error)
      setMapError(true)
      onError && onError()
      return
    }

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

  // Default center (shop location or fallback)
  const center = shopLocation 
    ? [shopLocation.lat, shopLocation.lng]
    : [26.9124, 75.7873] // Default to Jaipur

  // If there's an error with Leaflet, show fallback
  if (mapError) {
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
        <div className="text-center text-gray-700 dark:text-gray-300 p-6">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
          {userLocation && shopLocation ? (
            <div className="space-y-2">
              <p className="text-sm opacity-75">
                Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
              <p className="text-sm opacity-75">
                Shop location: {shopLocation.lat.toFixed(4)}, {shopLocation.lng.toFixed(4)}
              </p>
              {distance && (
                <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  Distance: ~{getDistanceString(distance)}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm opacity-75">
                Shop: {shopLocation?.name || 'Cake N Crush'}
              </p>
              <p className="text-sm opacity-75">
                {shopLocation?.address || 'Location details available in contact section'}
              </p>
            </div>
          )}
          <button
            onClick={onGetDirections}
            className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Open Directions
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full z-0"
        whenReady={() => setMapReady(true)}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map controller for auto-fitting bounds */}
        <MapController userLocation={userLocation} shopLocation={shopLocation} />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <strong>📍 Your Location</strong>
                <br />
                <small>{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Shop location marker */}
        {shopLocation && (
          <Marker position={[shopLocation.lat, shopLocation.lng]} icon={shopIcon}>
            <Popup>
              <div className="text-center">
                <strong>🎂 {shopLocation.name || 'Cake N Crush'}</strong>
                <br />
                <small>{shopLocation.address}</small>
                <br />
                {distance && <span className="text-purple-600 font-semibold">~{getDistanceString(distance)} away</span>}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route line */}
        <RouteDisplay userLocation={userLocation} shopLocation={shopLocation} />
      </MapContainer>

      {/* Overlays */}
      {mapReady && (
        <>
          {/* Route Status Overlay */}
          {userLocation && shopLocation && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 bg-green-50/95 dark:bg-green-900/95 backdrop-blur px-3 py-2 rounded-lg shadow-lg border border-green-200 dark:border-green-800 z-10"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Route Active • {getDistanceString(distance)}
                </span>
              </div>
            </motion.div>
          )}

          {/* Shop Marker Overlay */}
          <div className="absolute top-4 right-4 bg-red-50/95 dark:bg-red-900/95 backdrop-blur px-3 py-2 rounded-lg shadow-lg border border-red-200 dark:border-red-800 z-10">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                🎂 {shopLocation?.name || 'Cake N Crush'}
              </span>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="absolute bottom-4 right-4 space-y-2 z-10">
            <motion.button
              onClick={onGetDirections}
              className="bg-blue-500/95 backdrop-blur p-3 rounded-lg shadow-lg hover:shadow-xl transition-all text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Get Turn-by-Turn Directions"
            >
              <span className="text-lg">🧭</span>
            </motion.button>
            
            <motion.button
              onClick={() => {
                const mapUrl = userLocation 
                  ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.lat}%2C${userLocation.lng}%3B${shopLocation?.lat}%2C${shopLocation?.lng}`
                  : `https://www.openstreetmap.org/?mlat=${shopLocation?.lat}&mlon=${shopLocation?.lng}&zoom=15`
                window.open(mapUrl, '_blank')
              }}
              className="bg-purple-500/95 backdrop-blur p-3 rounded-lg shadow-lg hover:shadow-xl transition-all text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Open in OpenStreetMap"
            >
              <span className="text-lg">🔍</span>
            </motion.button>

            {!userLocation && (
              <motion.button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        window.location.reload()
                      },
                      (error) => {
                        alert('Please enable location access to see route')
                      }
                    )
                  }
                }}
                className="bg-orange-500/95 backdrop-blur p-3 rounded-lg shadow-lg hover:shadow-xl transition-all text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Enable Location for Route"
              >
                <span className="text-lg">📍</span>
              </motion.button>
            )}
          </div>

          {/* Attribution - OpenStreetMap */}
          <div className="absolute bottom-2 left-2 text-xs text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-black/80 px-2 py-1 rounded z-10">
            Map data © OpenStreetMap
          </div>
        </>
      )}
    </div>
  )
}