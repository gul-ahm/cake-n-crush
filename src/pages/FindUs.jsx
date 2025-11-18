import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import MinimalMap from '../components/maps/MinimalMap'

export default function FindUs(){
  const [findUsData, setFindUsData] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load find us data from localStorage (from admin panel)
    const stored = localStorage.getItem('findus_data')
    if (stored) {
      setFindUsData(JSON.parse(stored))
    } else {
      // Default data
      setFindUsData({
        location: {
          name: 'Cake N Crush',
          address: '123 Sweet Street, Cake City, CC 12345',
          lat: 26.9124,
          lng: 75.7873,
          phone: '+1 (555) 123-CAKE',
          email: 'info@cakencrush.com',
          hours: {
            monday: '9:00 AM - 8:00 PM',
            tuesday: '9:00 AM - 8:00 PM',
            wednesday: '9:00 AM - 8:00 PM',
            thursday: '9:00 AM - 8:00 PM',
            friday: '9:00 AM - 10:00 PM',
            saturday: '8:00 AM - 10:00 PM',
            sunday: '10:00 AM - 6:00 PM'
          }
        },
        description: 'Visit our cozy bakery for the finest custom cakes and delightful treats!',
        customMapImage: ''
      })
    }
    setIsLoading(false)

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          setLocationError('Unable to get your location')
        }
      )
    } else {
      setLocationError('Geolocation not supported')
    }
  }, [])

  const openDirections = () => {
    if (!findUsData) return
    
    const { lat, lng } = findUsData.location
    
    if (userLocation) {
      // Open OpenStreetMap directions
      const directionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.lat}%2C${userLocation.lng}%3B${lat}%2C${lng}`
      window.open(directionsUrl, '_blank')
    } else {
      // Just open the location
      window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`, '_blank')
    }
  }

  const callPhone = () => {
    if (findUsData?.location?.phone) {
      window.open(`tel:${findUsData.location.phone}`)
    }
  }

  const sendEmail = () => {
    if (findUsData?.location?.email) {
      window.open(`mailto:${findUsData.location.email}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading location...</p>
        </div>
      </div>
    )
  }

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const todayHours = findUsData?.location?.hours?.[currentDay]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
            >
              Find Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl sm:text-2xl text-purple-100 max-w-3xl mx-auto"
            >
              {findUsData?.description || 'Visit our cozy bakery for the finest custom cakes and delightful treats!'}
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Location Card */}
            <div className="bg-white/80 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">📍</span>
                Our Location
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {findUsData?.location?.name || 'Cake N Crush'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {findUsData?.location?.address || '123 Sweet Street, Cake City'}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <motion.button
                    onClick={callPhone}
                    className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">📞</span>
                    <div className="text-left">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Call Us</div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {findUsData?.location?.phone || '+1 (555) 123-CAKE'}
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={sendEmail}
                    className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">📧</span>
                    <div className="text-left">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Email Us</div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {findUsData?.location?.email || 'info@cakencrush.com'}
                      </div>
                    </div>
                  </motion.button>
                </div>

                <motion.button
                  onClick={openDirections}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>🗺️</span>
                  <span>Open Directions</span>
                </motion.button>
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-white/80 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">🕒</span>
                Business Hours
              </h2>
              
              <div className="space-y-3">
                {Object.entries(findUsData?.location?.hours || {}).map(([day, hours]) => (
                  <div
                    key={day}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      day === currentDay
                        ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                        : 'bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    <span className={`font-medium capitalize ${
                      day === currentDay ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {day}
                      {day === currentDay && <span className="ml-2 text-sm">(Today)</span>}
                    </span>
                    <span className={`${
                      day === currentDay ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {hours}
                    </span>
                  </div>
                ))}
              </div>

              {todayHours && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-center text-green-700 dark:text-green-300 font-medium">
                    📅 Today's Hours: {todayHours}
                  </div>
                </div>
              )}
            </div>

            {/* Your Location Status */}
            <div className="bg-white/80 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🧭</span>
                Your Location
              </h2>
              
              {userLocation ? (
                <div className="text-green-600 dark:text-green-400">
                  <p className="flex items-center">
                    <span className="mr-2">✅</span>
                    Location detected successfully
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
                  </p>
                </div>
              ) : locationError ? (
                <div className="text-orange-600 dark:text-orange-400">
                  <p className="flex items-center">
                    <span className="mr-2">⚠️</span>
                    {locationError}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    You can still get directions by allowing location access
                  </p>
                </div>
              ) : (
                <div className="text-gray-600 dark:text-gray-400">
                  <p className="flex items-center">
                    <span className="mr-2 animate-spin">⏳</span>
                    Detecting your location...
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-8"
          >
            <div className="bg-white/80 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg h-full min-h-[600px]">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">🗺️</span>
                Interactive Map
              </h2>
              
              {findUsData?.customMapImage ? (
                <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                  <img
                    src={findUsData.customMapImage}
                    alt="Store location map"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden relative">
                  {/* Minimal Map that always works */}
                  <MinimalMap 
                    userLocation={userLocation}
                    shopLocation={findUsData?.location}
                    onGetDirections={openDirections}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
