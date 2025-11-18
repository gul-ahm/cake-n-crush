// Google Maps utility functions and API integration
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

// Default location (Jaipur, India - you can update this)
export const DEFAULT_LOCATION = {
  lat: 26.9124,
  lng: 75.7873,
  name: 'Cake N Crush',
  address: '123 Sweet Street, Jaipur, Rajasthan, India'
}

// Generate Google Maps embed URL
export function generateMapEmbedUrl(lat, lng, zoom = 15) {
  const baseUrl = 'https://www.google.com/maps/embed/v1/place'
  
  if (GOOGLE_MAPS_API_KEY) {
    // Use API key for better functionality
    return `${baseUrl}?key=${GOOGLE_MAPS_API_KEY}&q=${lat},${lng}&zoom=${zoom}`
  } else {
    // Fallback to basic embed without API key
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3560.102957339249!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!5e0!3m2!1sen!2s!4v1234567890123`
  }
}

// Generate directions URL
export function generateDirectionsUrl(originLat, originLng, destLat, destLng) {
  const origin = originLat && originLng ? `${originLat},${originLng}` : 'Current+Location'
  const destination = `${destLat},${destLng}`
  return `https://www.google.com/maps/dir/${origin}/${destination}`
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
           Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
           Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in kilometers
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

// Get user-friendly distance string
export function getDistanceString(distance) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`
  } else {
    return `${Math.round(distance)}km`
  }
}

// Check if Google Maps API is available
export function isGoogleMapsApiAvailable() {
  return Boolean(GOOGLE_MAPS_API_KEY)
}

// Fallback map image URL (using OpenStreetMap static API)
export function generateFallbackMapUrl(lat, lng, zoom = 15) {
  const width = 400
  const height = 300
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-cake+ff0000(${lng},${lat})/${lng},${lat},${zoom}/${width}x${height}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA`
}

// Map styles for different themes
export const MAP_STYLES = {
  light: 'roadmap',
  dark: 'dark',
  satellite: 'satellite',
  terrain: 'terrain'
}