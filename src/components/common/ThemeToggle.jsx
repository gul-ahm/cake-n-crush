import { useEffect, useState } from 'react'
import { getSavedTheme, toggleTheme } from '../../utils/theme'

export default function ThemeToggle(){
  const [theme, setTheme] = useState(getSavedTheme())
  useEffect(()=>{ setTheme(getSavedTheme()) }, [])
  return (
    <button
      className="px-3 py-1.5 rounded border text-sm"
      onClick={()=> setTheme(toggleTheme())}
      title="Toggle theme"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}
