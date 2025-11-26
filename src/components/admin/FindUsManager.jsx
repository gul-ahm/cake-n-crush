import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getContent, saveContent, uploadFile } from '../../services/contentService';

const Container = ({ children, motionProps, className, perfMode }) => (
  perfMode ? (
    <div className={className}>{children}</div>
  ) : (
    <motion.div {...motionProps} className={className}>
      {children}
    </motion.div>
  )
);

export default function FindUsManager({ perfMode }) {
  const [findUsData, setFindUsData] = useState({
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
        sunday: '10:00 AM - 6:00 PM',
      },
    },
    mapSettings: {
      zoom: 15,
      style: 'roadmap',
      showTraffic: false,
      showTransit: false,
    },
    customMapImage: '',
    description: 'Visit our cozy bakery for the finest custom cakes and delightful treats!',
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getContent('findus');
      if (data && Object.keys(data).length > 0) {
        setFindUsData((prev) => ({ ...prev, ...data }));
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await saveContent('findus', findUsData);
    setHasUnsavedChanges(false);
    setIsSaving(false);

    // Show success confetti
    try {
      const mod = await import('canvas-confetti');
      const confetti = mod.default || mod;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch { }
  };

  const updateLocalState = (newData) => {
    setFindUsData(newData);
    setHasUnsavedChanges(true);
  };

  const handleLocationChange = (field, value) => {
    updateLocalState({
      ...findUsData,
      location: { ...findUsData.location, [field]: value },
    });
  };

  const handleHoursChange = (day, value) => {
    updateLocalState({
      ...findUsData,
      location: {
        ...findUsData.location,
        hours: { ...findUsData.location.hours, [day]: value },
      },
    });
  };

  const handleMapSettingsChange = (field, value) => {
    updateLocalState({
      ...findUsData,
      mapSettings: { ...findUsData.mapSettings, [field]: value },
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await uploadFile(file);
    if (url) {
      updateLocalState({ ...findUsData, customMapImage: url });
    }
  };

  const generateGoogleMapsUrl = () => {
    const { lat, lng } = findUsData.location;
    const { zoom, style } = findUsData.mapSettings;
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${lat},${lng}&zoom=${zoom}&maptype=${style}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur py-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Find Us Manager</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">Location & Contact Management</div>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges || isSaving}
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${hasUnsavedChanges
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
        >
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          {hasUnsavedChanges && !isSaving && <span className="animate-pulse">●</span>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Container
          perfMode={perfMode}
          motionProps={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } }}
          className={`rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${perfMode ? 'bg-white dark:bg-gray-800' : 'bg-white dark:bg-gray-800 shadow-lg'}`}
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">📍 Location Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Name</label>
              <input
                type="text"
                value={findUsData.location.name}
                onChange={(e) => handleLocationChange('name', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
              <textarea
                value={findUsData.location.address}
                onChange={(e) => handleLocationChange('address', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={findUsData.location.lat}
                  onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={findUsData.location.lng}
                  onChange={(e) => handleLocationChange('lng', parseFloat(e.target.value))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={findUsData.location.phone}
                  onChange={(e) => handleLocationChange('phone', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={findUsData.location.email}
                  onChange={(e) => handleLocationChange('email', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                value={findUsData.description}
                onChange={(e) => updateLocalState({ ...findUsData, description: e.target.value })}
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Brief description for the Find Us page"
              />
            </div>
          </div>
        </Container>

        <Container
          perfMode={perfMode}
          motionProps={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 } }}
          className={`rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${perfMode ? 'bg-white dark:bg-gray-800' : 'bg-white dark:bg-gray-800 shadow-lg'}`}
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">🕒 Business Hours</h3>
          <div className="space-y-3">
            {Object.entries(findUsData.location.hours).map(([day, time]) => (
              <div key={day} className="flex items-center space-x-3">
                <label className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{day}:</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => handleHoursChange(day, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 9:00 AM - 8:00 PM"
                />
              </div>
            ))}
          </div>
        </Container>
      </div>

      <Container
        perfMode={perfMode}
        motionProps={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
        className={`rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${perfMode ? 'bg-white dark:bg-gray-800' : 'bg-white dark:bg-gray-800 shadow-lg'}`}
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">🗺️ Map Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zoom Level</label>
            <input
              type="range"
              min="10"
              max="20"
              value={findUsData.mapSettings.zoom}
              onChange={(e) => handleMapSettingsChange('zoom', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500 mt-1">{findUsData.mapSettings.zoom}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Map Style</label>
            <select
              value={findUsData.mapSettings.style}
              onChange={(e) => handleMapSettingsChange('style', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="roadmap">Roadmap</option>
              <option value="satellite">Satellite</option>
              <option value="hybrid">Hybrid</option>
              <option value="terrain">Terrain</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={findUsData.mapSettings.showTraffic}
                onChange={(e) => handleMapSettingsChange('showTraffic', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show Traffic</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={findUsData.mapSettings.showTransit}
                onChange={(e) => handleMapSettingsChange('showTransit', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show Transit</span>
            </label>
          </div>
        </div>
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Map Image (Alternative to Google Maps)</label>
          <div className="flex space-x-4">
            <input
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              id="map-image"
            />
            <label
              htmlFor="map-image"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              📁 Upload Map Image
            </label>
            {findUsData.customMapImage && (
              <button
                onClick={() => updateLocalState({ ...findUsData, customMapImage: '' })}
                className="px-4 py-2 bg-red-200 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-300 dark:hover:bg-red-800 transition-colors"
              >
                🗑️ Remove Custom Image
              </button>
            )}
          </div>
          {findUsData.customMapImage && (
            <div className="mt-4">
              <img
                src={findUsData.customMapImage}
                alt="Custom map"
                className="max-w-md h-48 object-cover rounded border"
              />
            </div>
          )}
        </div>
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Google Maps Embed URL:</h4>
          <code className="text-xs bg-white dark:bg-gray-800 p-2 rounded block overflow-x-auto text-gray-600 dark:text-gray-400">
            {generateGoogleMapsUrl()}
          </code>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Note: You'll need a Google Maps API key for the map to work properly on the public site.
          </p>
        </div>
      </Container>
    </div>
  );
}