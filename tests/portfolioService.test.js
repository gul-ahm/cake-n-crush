import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock image optimization and uuid
vi.mock('../src/utils/imageOptimization', () => ({
  toWebP: vi.fn(async () => 'data:image/webp;base64,TEST')
}))
let idCounter = 0
vi.mock('../src/services/uuid', () => ({
  v4: () => `id-${++idCounter}`
}))

import * as portfolio from '../src/services/portfolioService'

const KEY = 'cnc_portfolio_items_v1'

describe('portfolioService', () => {
  beforeEach(() => {
    localStorage.removeItem(KEY)
    idCounter = 0
  })

  it('adds items with images and returns list', async () => {
    const files = [new Blob(['x'], { type: 'image/png' })]
    const list = await portfolio.add({ name: 'Cake A', category: 'Birthday', priceRange: '₹1-2k', images: files })
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe('id-1')
    expect(list[0].images[0]).toMatch(/^data:image\/webp/)
  })

  it('updates, reorders, removes items', async () => {
    await portfolio.add({ name: 'A' })
    await portfolio.add({ name: 'B' }) // now ids id-1, id-2 with B first
    let list = portfolio.getAll()
    expect(list[0].name).toBe('B')
    list = await portfolio.update('id-1', { name: 'A+' })
    expect(list.find(i=>i.id==='id-1').name).toBe('A+')
    list = await portfolio.reorder(0, 1)
    expect(list[1].id).toBe('id-2')
    list = await portfolio.remove('id-2')
    expect(list.find(i=>i.id==='id-2')).toBeUndefined()
  })
})
