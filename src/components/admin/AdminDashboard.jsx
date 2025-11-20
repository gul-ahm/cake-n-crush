import { useState, useMemo, useDeferredValue, Suspense, lazy } from 'react'
import usePortfolio from '../../hooks/usePortfolio'
import useMobilePerfMode from '../../hooks/useMobilePerfMode'
import { list as listActivity, countByType } from '../../services/activityService'
import ImageUpload from './ImageUpload'
import PortfolioGrid from './PortfolioGrid'
import RecentActivity from './RecentActivity'
import ShowcaseManager from './ShowcaseManager'
import FindUsManager from './FindUsManager'
import SocialMediaManager from './SocialMediaManager'

export default function AdminDashboard(){
  const perfMode = useMobilePerfMode()
  const { items, add, update, remove, reorder, categories } = usePortfolio()
  const deferredItems = useDeferredValue(items)
  const [showUpload, setShowUpload] = useState(false)
  const [activeTab, setActiveTab] = useState('portfolio')
  const activity = listActivity(10)

  const stats = useMemo(() => ({
    total: deferredItems.length,
    views: deferredItems.reduce((a,b)=>a+(b.views||0),0),
    orders: countByType('order_click')
  }), [deferredItems])

  const tabs = [
    { id: 'portfolio', label: 'Portfolio', icon: '🖼️' },
    { id: 'showcase', label: 'Signature Showcase', icon: '✨' },
    { id: 'findus', label: 'Find Us', icon: '📍' },
    { id: 'social', label: 'Social Media', icon: '📱' },
    { id: 'activity', label: 'Activity', icon: '📊' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Header with Tabs */}
      <div className="bg-white/80 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Cakes" value={stats.total} gradient="from-blue-500 to-blue-600" />
          <StatCard label="Total Views" value={stats.views} gradient="from-green-500 to-green-600" />
          <StatCard label="Orders" value={stats.orders} gradient="from-purple-500 to-purple-600" />
        </div>
      </div>

      {/* Tab Content */}
      <div className={`rounded-2xl border border-white/20 p-6 ${perfMode ? 'bg-white dark:bg-gray-900' : 'bg-white/80 dark:bg-black/20 backdrop-blur-xl'}`}>        
        <Suspense fallback={<div className="py-12 text-center text-sm text-gray-500">Loading...</div>}>
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Portfolio Management</h2>
                <button
                  onClick={() => setShowUpload(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <span>✨</span>
                  <span>Add New Cake</span>
                </button>
              </div>
              <PortfolioGrid items={deferredItems} onRemove={remove} onReorder={reorder} perfMode={perfMode} />
            </div>
          )}

          {activeTab === 'showcase' && <ShowcaseManager perfMode={perfMode} />}
          {activeTab === 'findus' && <FindUsManager perfMode={perfMode} />}
          {activeTab === 'social' && <SocialMediaManager perfMode={perfMode} />}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Recent Activity</h2>
              <RecentActivity items={activity} perfMode={perfMode} />
            </div>
          )}
        </Suspense>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <ImageUpload
          categories={categories}
          onClose={() => setShowUpload(false)}
          onSave={async (entry) => {
            await add(entry)
            setShowUpload(false)
          }}
          perfMode={perfMode}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, gradient = "from-gray-500 to-gray-600" }){
  return (
    <div className={`bg-gradient-to-r ${gradient} p-4 rounded-xl text-white shadow-lg`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-white/80">{label}</div>
    </div>
  )
}
