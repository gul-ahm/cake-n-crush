import { gradientFor } from '../../utils/categoryColors'

export default function CategoryFilter({ categories = [], active = 'All', onChange }){
  const all = ['All', ...categories]
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {all.map((cat) => {
        const selected = active === cat
        if (cat === 'All') {
          return (
            <button
              key={cat}
              onClick={() => onChange?.('All')}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${selected ? 'bg-black text-white border-black' : 'bg-white/70 dark:bg-zinc-900/70 text-black dark:text-white border-black/10'}`}
            >
              All
            </button>
          )
        }
        return (
          <button
            key={cat}
            onClick={() => onChange?.(cat)}
            className={`px-3 py-1.5 rounded-full text-sm border shadow-sm transition ${selected ? 'text-white' : 'text-black dark:text-white border-black/10'}`}
            style={selected ? { backgroundImage: gradientFor(cat) } : { background: 'transparent' }}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
