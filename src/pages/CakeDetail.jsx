import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { findById, update } from '../services/portfolioService'
import WhatsAppButton from '../components/ordering/WhatsAppButton'
import { gradientFor } from '../utils/categoryColors'

export default function CakeDetail(){
  const { id } = useParams()
  const item = findById(id)
  useEffect(()=>{
    if (item) {
      update(item.id, { views: (item.views || 0) + 1 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
  if (!item) return <div className="max-w-6xl mx-auto px-4 py-8">Not found</div>
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div
        className="rounded-2xl p-0.5"
        style={{ backgroundImage: gradientFor(item.category) }}
      >
        <div className="rounded-[14px] bg-white/80 dark:bg-zinc-900/70 backdrop-blur border border-black/5 p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <span
              className="shrink-0 px-3 py-1 rounded-full text-xs text-white"
              style={{ backgroundImage: gradientFor(item.category) }}
            >
              {item.category}
            </span>
          </div>
          <div className="text-neutral-600 mb-4">{item.priceRange}</div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {(item.images||[]).map((src,i)=>(
                <img key={i} src={src} alt={item.name} className="w-full rounded-xl border" />
              ))}
            </div>
            <div className="space-y-4">
              {item.description && <p className="text-neutral-700 dark:text-neutral-300">{item.description}</p>}
              <WhatsAppButton item={item} />
            </div>
          </div>
        </div>
      </div>
      {/* Floating WhatsApp button for mobile */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <WhatsAppButton item={item} variant="fab" />
      </div>
    </div>
  )
}
