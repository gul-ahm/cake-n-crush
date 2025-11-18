import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function PortfolioGrid({ items, onRemove, onReorder }){
  const [dragIndex, setDragIndex] = useState(null)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((it, idx) => (
        <div
          key={it.id}
          className="rounded-xl overflow-hidden border bg-white/70 backdrop-blur"
          draggable
          onDragStart={()=>setDragIndex(idx)}
          onDragOver={(e)=>e.preventDefault()}
          onDrop={()=>{ if(dragIndex!==null && dragIndex!==idx){ onReorder(dragIndex, idx); setDragIndex(null) } }}
        >
          <div className="aspect-square bg-neutral-100">
            {it.images?.[0] && <img src={it.images[0]} alt={it.name} className="w-full h-full object-cover" />}
          </div>
          <div className="p-3 text-sm">
            <div className="font-semibold truncate">{it.name}</div>
            <div className="text-neutral-600">{it.category} · {it.priceRange}</div>
            <div className="flex justify-between mt-2">
              <Link to={`/portfolio/${it.id}`} className="underline">View</Link>
              <button className="text-red-600" onClick={()=>onRemove(it.id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
