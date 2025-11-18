import { v4 as uuidv4 } from './uuid'
import { toWebP } from '../utils/imageOptimization'
import { log as logActivity } from './activityService'

const KEY = 'cnc_portfolio_items_v1'

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

const write = (items) => {
  localStorage.setItem(KEY, JSON.stringify(items))
  return items
}

export const getAll = () => read()

export const add = async (entry) => {
  const items = read()
  const id = uuidv4()
  const images = entry.images ? await Promise.all(entry.images.map(toWebP)) : []
  const newItem = { id, views: 0, createdAt: Date.now(), ...entry, images }
  items.unshift(newItem)
  write(items)
  logActivity('portfolio_add', { id, name: entry.name, category: entry.category })
  return items
}

export const update = async (id, patch) => {
  const items = read().map((it) => it.id === id ? { ...it, ...patch } : it)
  write(items)
  logActivity('portfolio_update', { id })
  return items
}

export const remove = async (id) => {
  const items = read().filter((it) => it.id !== id)
  write(items)
  logActivity('portfolio_remove', { id })
  return items
}

export const reorder = async (sourceIndex, destIndex) => {
  const items = read()
  const [moved] = items.splice(sourceIndex, 1)
  items.splice(destIndex, 0, moved)
  write(items)
  logActivity('portfolio_reorder', { id: moved?.id, from: sourceIndex, to: destIndex })
  return items
}

export const findById = (id) => read().find((it) => it.id === id)
