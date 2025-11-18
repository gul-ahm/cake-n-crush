export function timeAgo(ts) {
  const seconds = Math.floor((Date.now() - ts) / 1000)
  const intervals = [
    ['y', 31536000],
    ['mo', 2592000],
    ['w', 604800],
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
    ['s', 1],
  ]
  for (const [unit, sec] of intervals) {
    const count = Math.floor(seconds / sec)
    if (count >= 1) return `${count}${unit} ago`
  }
  return 'just now'
}
