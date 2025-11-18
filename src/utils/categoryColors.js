export const CATEGORY_COLORS = {
  Birthday: ['#f472b6', '#f59e0b'],
  Wedding: ['#a78bfa', '#60a5fa'],
  Custom: ['#34d399', '#22d3ee'],
  Seasonal: ['#f97316', '#ef4444'],
}

export function gradientFor(category) {
  const [a, b] = CATEGORY_COLORS[category] || ['#d1d5db', '#9ca3af']
  return `linear-gradient(135deg, ${a}, ${b})`
}
