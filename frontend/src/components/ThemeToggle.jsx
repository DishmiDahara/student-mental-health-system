import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ showLabel = false, style = {} }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: isDark
          ? 'rgba(255, 255, 255, 0.12)'
          : 'rgba(79, 70, 229, 0.12)',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.22)'
          : '1px solid rgba(79, 70, 229, 0.28)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '50px',
        padding: showLabel ? '8px 16px' : '9px',
        cursor: 'pointer',
        color: isDark ? '#fbbf24' : '#6366f1',
        boxShadow: isDark
          ? '0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
          : '0 4px 14px rgba(99, 102, 241, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        outline: 'none',
        userSelect: 'none',
        ...style
      }}
      className="theme-toggle-btn"
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(360deg) scale(1.05)'
        }}
      >
        {isDark ? (
          /* Sun Icon for switching to Light Mode */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ width: '20px', height: '20px', filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.6))' }}
          >
            <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
          </svg>
        ) : (
          /* Moon Icon for switching to Dark Mode */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ width: '20px', height: '20px', filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.5))' }}
          >
            <path
              fillRule="evenodd"
              d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>

      {showLabel && (
        <span
          style={{
            fontSize: '13px',
            fontWeight: '700',
            fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
            color: isDark ? '#f3f4f6' : '#1e293b'
          }}
        >
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  )
}
