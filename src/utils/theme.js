const THEME_KEY = 'cnc_theme_v1'

export function getSavedTheme() {
  const t = localStorage.getItem(THEME_KEY)
  return t === 'dark' ? 'dark' : 'light'
}

export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  localStorage.setItem(THEME_KEY, theme)
}

export function toggleTheme() {
  const next = getSavedTheme() === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  return next
}
