import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function SocialMediaManager({ perfMode }) {
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    youtube: '',
    linkedin: '',
    whatsapp: '+1234567890',
    telegram: ''
  })
  
  const [customLinks, setCustomLinks] = useState([])
  const [newCustomLink, setNewCustomLink] = useState({ name: '', url: '', icon: '🌐' })

  useEffect(() => {
    // Load social links from localStorage
    const stored = localStorage.getItem('social_links')
    if (stored) {
      setSocialLinks({ ...socialLinks, ...JSON.parse(stored) })
    }

    const customStored = localStorage.getItem('custom_social_links')
    if (customStored) {
      setCustomLinks(JSON.parse(customStored))
    }
  }, [])

  const saveSocialLinks = (links) => {
    localStorage.setItem('social_links', JSON.stringify(links))
    setSocialLinks(links)
  }

  const saveCustomLinks = (links) => {
    localStorage.setItem('custom_social_links', JSON.stringify(links))
    setCustomLinks(links)
  }

  const handleSocialChange = (platform, value) => {
    const newLinks = { ...socialLinks, [platform]: value }
    saveSocialLinks(newLinks)
  }

  const addCustomLink = () => {
    if (!newCustomLink.name || !newCustomLink.url) return
    
    const link = {
      id: Date.now(),
      ...newCustomLink
    }
    
    const updatedLinks = [...customLinks, link]
    saveCustomLinks(updatedLinks)
    setNewCustomLink({ name: '', url: '', icon: '🌐' })
  }

  const removeCustomLink = (id) => {
    const updatedLinks = customLinks.filter(link => link.id !== id)
    saveCustomLinks(updatedLinks)
  }

  const socialPlatforms = [
    { key: 'facebook', name: 'Facebook', icon: '📘', placeholder: 'https://facebook.com/cakencrush' },
    { key: 'instagram', name: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/cakencrush' },
    { key: 'twitter', name: 'Twitter/X', icon: '🐦', placeholder: 'https://twitter.com/cakencrush' },
    { key: 'tiktok', name: 'TikTok', icon: '🎵', placeholder: 'https://tiktok.com/@cakencrush' },
    { key: 'youtube', name: 'YouTube', icon: '📺', placeholder: 'https://youtube.com/@cakencrush' },
    { key: 'linkedin', name: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/company/cakencrush' },
    { key: 'whatsapp', name: 'WhatsApp', icon: '📱', placeholder: '+1234567890' },
    { key: 'telegram', name: 'Telegram', icon: '✈️', placeholder: 'https://t.me/cakencrush' }
  ]

  const validateUrl = (url, platform) => {
    if (!url) return true
    if (platform === 'whatsapp') {
      return /^[\+]?[0-9\s\-\(\)]+$/.test(url)
    }
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const getDisplayUrl = (url, platform) => {
    if (platform === 'whatsapp' && url && !url.startsWith('http')) {
      return `https://wa.me/${url.replace(/[^0-9]/g, '')}`
    }
    return url
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Social Media Manager</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">Manage all social links</div>
      </div>

      {/* Main Social Platforms */}
      {perfMode ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">📱 Main Platforms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialPlatforms.map((platform) => (
              <div key={platform.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center space-x-2">
                    <span>{platform.icon}</span>
                    <span>{platform.name}</span>
                    {!validateUrl(socialLinks[platform.key], platform.key) && (
                      <span className="text-red-500 text-xs">❌ Invalid</span>
                    )}
                    {socialLinks[platform.key] && validateUrl(socialLinks[platform.key], platform.key) && (
                      <span className="text-green-500 text-xs">✅ Valid</span>
                    )}
                  </span>
                </label>
                <input
                  type={platform.key === 'whatsapp' ? 'tel' : 'url'}
                  value={socialLinks[platform.key]}
                  onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                  className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    !validateUrl(socialLinks[platform.key], platform.key)
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={platform.placeholder}
                />
                {socialLinks[platform.key] && (
                  <a
                    href={getDisplayUrl(socialLinks[platform.key], platform.key)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1 inline-block"
                  >
                    🔗 Test Link
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">📱 Main Platforms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialPlatforms.map((platform) => (
              <div key={platform.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center space-x-2">
                    <span>{platform.icon}</span>
                    <span>{platform.name}</span>
                    {!validateUrl(socialLinks[platform.key], platform.key) && (
                      <span className="text-red-500 text-xs">❌ Invalid</span>
                    )}
                    {socialLinks[platform.key] && validateUrl(socialLinks[platform.key], platform.key) && (
                      <span className="text-green-500 text-xs">✅ Valid</span>
                    )}
                  </span>
                </label>
                <input
                  type={platform.key === 'whatsapp' ? 'tel' : 'url'}
                  value={socialLinks[platform.key]}
                  onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                  className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    !validateUrl(socialLinks[platform.key], platform.key)
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={platform.placeholder}
                />
                {socialLinks[platform.key] && (
                  <a
                    href={getDisplayUrl(socialLinks[platform.key], platform.key)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1 inline-block"
                  >
                    🔗 Test Link
                  </a>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Custom Social Links */}
      {perfMode ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">🔗 Custom Links</h3>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-800 dark:text-white mb-3">Add Custom Platform</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input type="text" value={newCustomLink.name} onChange={(e) => setNewCustomLink(prev => ({ ...prev, name: e.target.value }))} className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Platform name" />
              <input type="url" value={newCustomLink.url} onChange={(e) => setNewCustomLink(prev => ({ ...prev, url: e.target.value }))} className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="URL" />
              <input type="text" value={newCustomLink.icon} onChange={(e) => setNewCustomLink(prev => ({ ...prev, icon: e.target.value }))} className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Icon (emoji)" maxLength={2} />
              <button onClick={addCustomLink} disabled={!newCustomLink.name || !newCustomLink.url} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200">➕ Add</button>
            </div>
          </div>
          {customLinks.length > 0 ? (
            <div className="space-y-3">
              {customLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{link.icon}</span>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">{link.name}</div>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">{link.url}</a>
                    </div>
                  </div>
                  <button onClick={() => removeCustomLink(link.id)} className="text-red-500 hover:text-red-700 p-2">🗑️</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400"><div className="text-4xl mb-2">🔗</div><p>No custom links added yet</p></div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">🔗 Custom Links</h3>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-gray-800 dark:text-white mb-3">Add Custom Platform</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input type="text" value={newCustomLink.name} onChange={(e) => setNewCustomLink(prev => ({ ...prev, name: e.target.value }))} className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Platform name" />
              <input type="url" value={newCustomLink.url} onChange={(e) => setNewCustomLink(prev => ({ ...prev, url: e.target.value }))} className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="URL" />
              <input type="text" value={newCustomLink.icon} onChange={(e) => setNewCustomLink(prev => ({ ...prev, icon: e.target.value }))} className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Icon (emoji)" maxLength={2} />
              <button onClick={addCustomLink} disabled={!newCustomLink.name || !newCustomLink.url} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200">➕ Add</button>
            </div>
          </div>
          {customLinks.length > 0 ? (
            <div className="space-y-3">
              {customLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{link.icon}</span>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">{link.name}</div>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">{link.url}</a>
                    </div>
                  </div>
                  <button onClick={() => removeCustomLink(link.id)} className="text-red-500 hover:text-red-700 p-2">🗑️</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400"><div className="text-4xl mb-2">🔗</div><p>No custom links added yet</p></div>
          )}
        </motion.div>
      )}

      {/* Preview Section */}
      {perfMode ? (
        <div className="p-6 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">👀 Public Display Preview</h3>
          <div className="flex flex-wrap gap-3">
            {socialPlatforms.filter(p => socialLinks[p.key] && validateUrl(socialLinks[p.key], p.key)).map(p => (
              <a key={p.key} href={getDisplayUrl(socialLinks[p.key], p.key)} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                <span>{p.icon}</span><span className="text-sm">{p.name}</span>
              </a>
            ))}
            {customLinks.map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                <span>{link.icon}</span><span className="text-sm">{link.name}</span>
              </a>
            ))}
          </div>
          {Object.values(socialLinks).filter(Boolean).length === 0 && customLinks.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400">Add social links above to see the preview</p>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">👀 Public Display Preview</h3>
          <div className="flex flex-wrap gap-3">
            {socialPlatforms.filter(p => socialLinks[p.key] && validateUrl(socialLinks[p.key], p.key)).map(p => (
              <a key={p.key} href={getDisplayUrl(socialLinks[p.key], p.key)} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                <span>{p.icon}</span><span className="text-sm">{p.name}</span>
              </a>
            ))}
            {customLinks.map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                <span>{link.icon}</span><span className="text-sm">{link.name}</span>
              </a>
            ))}
          </div>
          {Object.values(socialLinks).filter(Boolean).length === 0 && customLinks.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400">Add social links above to see the preview</p>
          )}
        </motion.div>
      )}
    </div>
  )
}