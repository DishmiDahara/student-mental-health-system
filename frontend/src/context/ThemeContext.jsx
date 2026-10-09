import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem('mindspace_theme')
    if (savedTheme) {
      return savedTheme
    }
    // Default to dark mode as MindSpace's signature design aesthetic
    return 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    root.setAttribute('data-theme', theme)
    
    if (theme === 'light') {
      root.classList.add('light-theme')
      root.classList.remove('dark-theme')
      body.classList.add('light-theme')
      body.classList.remove('dark-theme')
    } else {
      root.classList.add('dark-theme')
      root.classList.remove('light-theme')
      body.classList.add('dark-theme')
      body.classList.remove('light-theme')
    }

    localStorage.setItem('mindspace_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setThemeState((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
  }

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark: theme === 'dark', isLight: theme === 'light' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
