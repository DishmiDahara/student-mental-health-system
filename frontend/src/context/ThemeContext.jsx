import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()
const STORAGE_KEY = 'mindspace_theme_v2'

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    // First visit with the new design: follow the device preference, otherwise Daybreak (light)
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  } catch { /* storage unavailable */ }
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    root.setAttribute('data-theme', theme)

    // Kept for any legacy selectors that still key off these classes
    root.classList.toggle('light-theme', theme === 'light')
    root.classList.toggle('dark-theme', theme === 'dark')
    body.classList.toggle('light-theme', theme === 'light')
    body.classList.toggle('dark-theme', theme === 'dark')

    // Browser UI colour (mobile address bar / Android status bar)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1517' : '#f5f2ea')

    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* ignore */ }
  }, [theme])

  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark: theme === 'dark', isLight: theme === 'light' }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}

export default ThemeContext
