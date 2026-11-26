import { useRef, useEffect, useState } from 'react'
import { BackButton, FullscreenButton } from './GameControls'

// Plays one of the authorized relaxing HTML5 games (commercial webmaster syndications
// or locally hosted open-source games). It runs in an iframe inside MindSpace,
// allowing users to play directly without leaving the application.
export default function LocalGameModal({ game, onClose }) {
  const frameBoxRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape' && !document.fullscreenElement) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!game) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={game.title}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(8px)',
        zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
      }}
    >
      <div
        ref={frameBoxRef}
        style={{
          width: '100%', maxWidth: '960px', height: 'min(88vh, 780px)', background: '#0f172a',
          borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <BackButton onClick={onClose} variant="dark" />
          <h3 style={{ margin: 0, flex: 1, color: 'white', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span aria-hidden="true">{game.icon}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{game.title}</span>
            {game.badge && (
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: 'rgba(255,255,255,0.15)', color: '#e2e8f0' }}>
                {game.badge}
              </span>
            )}
          </h3>
          <FullscreenButton variant="dark" targetRef={frameBoxRef} />
        </div>

        <div style={{ position: 'relative', flex: 1, background: '#000' }}>
          {!loaded && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px', gap: '8px' }}>
              <span style={{ fontSize: '28px' }}>{game.icon}</span>
              <span>Loading {game.title}…</span>
            </div>
          )}
          <iframe
            title={game.title}
            src={game.launch?.src || game.src || game.url}
            onLoad={() => setLoaded(true)}
            allow="fullscreen; autoplay; screen-wake-lock; clipboard-write; gamepad; accelerometer; gyroscope"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', background: game.id === 'floodit' ? '#f5f7fb' : '#000' }}
          />
        </div>

        <div style={{ padding: '8px 16px', color: '#94a3b8', fontSize: '11.5px', background: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <span>{game.desc}</span>
          {game.credit && <span>{game.credit}</span>}
        </div>
      </div>
    </div>
  )
}

