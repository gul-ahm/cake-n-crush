import { Link, useSearchParams } from 'react-router-dom'
import usePortfolio from '../hooks/usePortfolio'
import { useEffect, useMemo, useRef, useState } from 'react'
import { revealStagger } from '../utils/animations'
import WhatsAppButton from '../components/ordering/WhatsAppButton'
import ParallaxHeader from '../components/common/ParallaxHeader'
import { gradientFor } from '../utils/categoryColors'
import CategoryFilter from '../components/portfolio/CategoryFilter'

export default function Portfolio() {
  const { items } = usePortfolio()
  const [searchParams, setSearchParams] = useSearchParams()
  const categories = useMemo(() => Array.from(new Set(items.map(i => i.category))).filter(Boolean), [items])
  const [active, setActive] = useState(() => searchParams.get('category') || localStorage.getItem('pf_category') || 'All')
  const [query, setQuery] = useState(() => searchParams.get('q') || localStorage.getItem('pf_q') || '')
  const [debouncedQuery, setDebouncedQuery] = useState(() => (searchParams.get('q') || localStorage.getItem('pf_q') || ''))
  const searchRef = useRef(null)

  // Ensure active is valid when items/categories load
  useEffect(() => {
    if (active !== 'All' && !categories.includes(active)) setActive('All')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length])

  // Debounce the search query for filtering/URL/localStorage
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 200)
    return () => clearTimeout(id)
  }, [query])

  // Sync filters to URL
  useEffect(() => {
    const next = {}
    if (active && active !== 'All') next.category = active
    if (debouncedQuery) next.q = debouncedQuery
    setSearchParams(next, { replace: true })
  }, [active, debouncedQuery, setSearchParams])

  // Persist to localStorage
  useEffect(() => { try { localStorage.setItem('pf_category', active) } catch { } }, [active])
  useEffect(() => { try { localStorage.setItem('pf_q', debouncedQuery) } catch { } }, [debouncedQuery])

  // '/' keyboard shortcut to focus search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target
      const tag = t?.tagName?.toLowerCase()
      const isTyping = tag === 'input' || tag === 'textarea' || t?.isContentEditable
      if (isTyping) return
      e.preventDefault()
      searchRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  const shown = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    const base = active === 'All' ? items : items.filter(i => i.category === active)
    if (!q) return base
    return base.filter(i => i.name?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q))
  }, [items, active, debouncedQuery])
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    revealStagger('.portfolio-card', { root: ref.current, y: 16, stagger: 0.06 })
  }, [])
  return (
    <div ref={ref} className="max-w-6xl mx-auto px-4 py-8">
      <ParallaxHeader title="Portfolio" subtitle="Browse categories, tap for details, and order instantly." />
      {items.length === 0 && <p className="text-neutral-600">No items yet. Admin can upload cakes from the dashboard.</p>}
      {items.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search cakes..."
                className="w-full rounded-lg border px-3 py-2 bg-white/70 dark:bg-zinc-900/70 backdrop-blur"
                aria-label="Search cakes by name or description"
              />
              {query && (
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-neutral-600" onClick={() => setQuery('')}>Clear</button>
              )}
            </div>
            <span className="hidden md:inline text-xs text-neutral-500 dark:text-neutral-400">Press <kbd className="px-1 py-0.5 border rounded bg-white/60 dark:bg-zinc-800/60">/</kbd> to search</span>
            <div className="text-sm text-neutral-600 dark:text-neutral-300 shrink-0">
              Showing {shown.length}{(active !== 'All' || query) && ` of ${items.length}`}
            </div>
          </div>
          <CategoryFilter categories={categories} active={active} onChange={setActive} />
        </>
      )}
      {shown.length === 0 && items.length > 0 && (
        <div className="text-center text-neutral-600 py-16">
          <p>No results. Try a different category or search term.</p>
          <button className="mt-3 px-3 py-1.5 rounded border" onClick={() => { setActive('All'); setQuery('') }}>Reset filters</button>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {shown.map((it) => (
          <div key={it.id} className="portfolio-card transition-transform hover:-translate-y-1 duration-300">
            <div
              className="group rounded-2xl relative h-full"
              style={{ backgroundImage: gradientFor(it.category), padding: 2 }}
            >
              <div className="rounded-[14px] overflow-hidden bg-white/70 dark:bg-zinc-900/70 backdrop-blur shadow-lg border border-black/5 relative h-full flex flex-col">
                <div className="aspect-[4/5] bg-neutral-100 dark:bg-zinc-800 relative">
                  {it.images?.[0] && <img src={it.images[0]} alt={it.name} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-3 text-sm flex-1 flex flex-col">
                  <div className="font-semibold truncate">{it.name}</div>
                  <div className="text-neutral-600 dark:text-neutral-300">{it.category} · {it.priceRange}</div>
                  <div className="mt-auto pt-4 flex gap-2 relative z-20">
                    <Link
                      to={`/portfolio/${it.id}`}
                      className="flex-1 text-center py-2 px-3 rounded-lg bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700 text-sm font-medium transition-colors"
                    >
                      Details
                    </Link>
                    <WhatsAppButton
                      item={it}
                      variant="solid"
                      className="flex-1 !w-auto !rounded-lg !shadow-none justify-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
