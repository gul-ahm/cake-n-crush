const KEY = 'cnc_activity_v1'

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

const write = (items) => {
  localStorage.setItem(KEY, JSON.stringify(items))
  return items
}

export function log(type, payload) {
  const items = read()
  const entry = { id: crypto.randomUUID?.() || String(Date.now()), type, payload, ts: Date.now() }
  items.unshift(entry)
  write(items.slice(0, 200))
}

export function list(limit = 20) {
  return read().slice(0, limit)
}

export function countByType(type) {
  return read().filter(e => e.type === type).length
}
