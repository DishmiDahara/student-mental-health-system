import { useEffect, useState, useCallback } from 'react'

const getFullscreenElement = () =>
  document.fullscreenElement || document.webkitFullscreenElement || null

const canFullscreen = () =>
  typeof document !== 'undefined' &&
  !!(document.fullscreenEnabled || document.webkitFullscreenEnabled)

// Shared hook: tracks fullscreen state and toggles it for a given element
// (defaults to the whole page, which also covers every fixed game overlay).
function useFullscreen(targetRef) {
  const [isFullscreen, setIsFullscreen] = useState(!!getFullscreenElement())
  const supported = canFullscreen()

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!getFullscreenElement())
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  const toggle = useCallback(() => {
    if (getFullscreenElement()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen
      if (exit) exit.call(document)
      return
    }
    const el = (targetRef && targetRef.current) || document.documentElement
    const request = el.requestFullscreen || el.webkitRequestFullscreen
    if (request) {
      const result = request.call(el)
      if (result && typeof result.catch === 'function') result.catch(() => {})
    }
  }, [targetRef])

  return { isFullscreen, supported, toggle }
}

const palettes = {
  dark: { background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' },
  light: { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }
}

const baseButton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  height: '32px',
  padding: '0 12px',
  borderRadius: '999px',
  fontSize: '12.5px',
  fontWeight: 700,
  cursor: 'pointer',
  touchAction: 'manipulation',
  lineHeight: 1,
  whiteSpace: 'nowrap'
}

// "Back" button shown in every game window.
export function BackButton({ onClick, variant = 'light' }) {
  return (
    <button
      type="button"
      className="mg-ctrl-btn"
      onClick={onClick}
      aria-label="Back to games"
      title="Back to games"
      style={{ ...baseButton, ...palettes[variant] }}
    >
      <span aria-hidden="true">←</span> Back
    </button>
  )
}

// Fullscreen toggle. Hidden automatically on browsers without the Fullscreen API
// (for example iPhone Safari).
export function FullscreenButton({ variant = 'light', targetRef }) {
  const { isFullscreen, supported, toggle } = useFullscreen(targetRef)
  if (!supported) return null
  return (
    <>
    <style>{`@media (max-width: 520px) { .mg-ctrl-label { display: none; } } .mg-ctrl-btn:hover { filter: brightness(1.08); }`}</style>
    <button
      type="button"
      className="mg-ctrl-btn"
      onClick={toggle}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      style={{ ...baseButton, ...palettes[variant], padding: '0 10px' }}
    >
      <span aria-hidden="true">{isFullscreen ? '🗗' : '⛶'}</span>
      <span className="mg-ctrl-label">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
    </button>
    </>
  )
}

