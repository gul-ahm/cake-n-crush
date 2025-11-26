import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getContent, saveContent, uploadFile } from '../../services/contentService'

export default function ShowcaseManager({ perfMode }) {
  const [showcaseItems, setShowcaseItems] = useState([])
  const [newItem, setNewItem] = useState({ title: '', type: 'image', url: '', description: '' })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    // Load showcase items from server
    const load = async () => {
      const data = await getContent('showcase')
      if (data) setShowcaseItems(data)
    }
    load()
  }, [])

  const saveToStorage = async (items) => {
    await saveContent('showcase', items)
    setShowcaseItems(items)
  }

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.url) return

    setIsUploading(true)

    const item = {
      id: Date.now(),
      ...newItem,
      createdAt: new Date().toISOString()
    }

    const updatedItems = [...showcaseItems, item]
    await saveToStorage(updatedItems)

    setNewItem({ title: '', type: 'image', url: '', description: '' })
    setIsUploading(false)
  }

  const handleRemoveItem = async (id) => {
    const updatedItems = showcaseItems.filter(item => item.id !== id)
    await saveToStorage(updatedItems)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    const url = await uploadFile(file)
    setIsUploading(false)

    if (url) {
      setNewItem(prev => ({ ...prev, url }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Signature Showcase Manager</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {showcaseItems.length} items
        </div>
      </div>

      {/* Add New Item Form */}
      {perfMode ? (
        <div className="p-6 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Add New Showcase Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter showcase title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="gif">GIF</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter description"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {newItem.type === 'video' ? 'Video URL or Upload' : 'Image/File Upload'}
            </label>
            <div className="flex space-x-4">
              <input
                type="url"
                value={newItem.url}
                onChange={(e) => setNewItem(prev => ({ ...prev, url: e.target.value }))}
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter URL or upload file below"
              />
              <input
                type="file"
                onChange={handleFileUpload}
                accept={newItem.type === 'video' ? 'video/*' : 'image/*,video/*'}
                className="hidden"
                id="showcase-file"
              />
              <label
                htmlFor="showcase-file"
                className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                📁 Upload
              </label>
            </div>
          </div>
          <button
            onClick={handleAddItem}
            disabled={isUploading || !newItem.title || !newItem.url}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
          >
            {isUploading ? '⏳ Adding...' : '✨ Add to Showcase'}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Add New Showcase Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter showcase title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="gif">GIF</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter description"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {newItem.type === 'video' ? 'Video URL or Upload' : 'Image/File Upload'}
            </label>
            <div className="flex space-x-4">
              <input
                type="url"
                value={newItem.url}
                onChange={(e) => setNewItem(prev => ({ ...prev, url: e.target.value }))}
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter URL or upload file below"
              />
              <input
                type="file"
                onChange={handleFileUpload}
                accept={newItem.type === 'video' ? 'video/*' : 'image/*,video/*'}
                className="hidden"
                id="showcase-file"
              />
              <label
                htmlFor="showcase-file"
                className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                📁 Upload
              </label>
            </div>
          </div>
          <button
            onClick={handleAddItem}
            disabled={isUploading || !newItem.title || !newItem.url}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
          >
            {isUploading ? '⏳ Adding...' : '✨ Add to Showcase'}
          </button>
        </motion.div>
      )}

      {/* Current Showcase Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={perfMode ? { contain: 'content' } : undefined}>
        {showcaseItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 ${perfMode ? 'bg-white dark:bg-gray-800' : 'bg-white dark:bg-gray-800 shadow-lg'} will-change-transform`}
          >
            <div className="aspect-video bg-gray-100 dark:bg-gray-900 relative">
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  controls
                  muted
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg'
                  }}
                />
              )}
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {item.type}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showcaseItems.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">✨</div>
          <p>No showcase items yet. Add your first signature piece above!</p>
        </div>
      )}
    </div>
  )
}