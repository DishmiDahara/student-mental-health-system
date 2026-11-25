import { useTheme } from '../context/ThemeContext'
import Icon from './ui/Icon'

/**
 * Light / dark switch. Same props as before:
 *  - showLabel: show the text next to the icon
 *  - style: extra inline styles
 */
export default function ThemeToggle({ showLabel = false, style = {}, className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Light mode' : 'Dark mode'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${label.toLowerCase()}`}
      className={`${showLabel ? 'btn btn-outline btn-sm' : 'icon-btn'} theme-toggle-btn ${className}`}
      style={style}
    >
      <span style={{ display: 'inline-flex', transition: 'transform .5s var(--ease)', transform: isDark ? 'rotate(0)' : 'rotate(-20deg)' }}>
        <Icon name={isDark ? 'sun' : 'moon'} size={showLabel ? 17 : 20} />
      </span>
      {showLabel && <span>{label}</span>}
    </button>
  )
}
