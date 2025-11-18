import { useState } from 'react'
import { timeAgo } from '../../utils/time'
import { list as listActivity } from '../../services/activityService'

export default function RecentActivity({ items }){
  const [page, setPage] = useState(1)
  const pageSize = 10
  const visible = listActivity(page * pageSize)
  if (!visible?.length) return <p className="text-sm text-neutral-600">No recent activity yet.</p>
  return (
    <div className="space-y-3">
      <ul className="divide-y rounded-xl border bg-white/60 backdrop-blur">
        {visible.map((e) => (
          <li key={e.id} className="px-4 py-2 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: dotColor(e.type) }} />
            <span className="font-medium">{label(e)}</span>
            <span className="ml-auto text-neutral-500">{timeAgo(e.ts)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-center">
        <button className="px-3 py-1.5 text-sm rounded border" onClick={()=>setPage(p=>p+1)}>Load more</button>
      </div>
    </div>
  )
}

function label(e){
  switch(e.type){
    case 'portfolio_add': return `Added “${e.payload?.name || e.payload?.id}”`
    case 'portfolio_update': return `Updated #${e.payload?.id}`
    case 'portfolio_remove': return `Removed #${e.payload?.id}`
    case 'portfolio_reorder': return `Reordered #${e.payload?.id} (${e.payload?.from}→${e.payload?.to})`
    case 'order_click': return `Order inquiry for “${e.payload?.name || e.payload?.id}”`
    default: return e.type
  }
}

function dotColor(type){
  if (type.startsWith('portfolio')) return '#3b82f6'
  if (type === 'order_click') return '#22c55e'
  return '#6b7280'
}
