import { useRef, useEffect, useState } from 'react'
import { BackButton, FullscreenButton } from './GameControls'

// Plays self-hosted relaxing HTML5 games directly within MindSpace.
// Features in-app controls: Exit/Back, Restart, Fullscreen, and Responsive Layout.
// Zero external redirects or third-party syndications.
export default function LocalGameModal({ game, onClose }) {
  const frameBoxRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape' && !document.fullscreenElement) onClose()
    }
    window.addEventListener('keydown', onKey)
    // Prevent background scrolling while modal is open
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  if (!game) return null

  const gameSrc = game.launch?.src || game.src || game.url

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={game.title}
      className="lgm-overlay"
    >
      <style>{`
        .lgm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 15, 30, 0.92);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: lgmFadeIn 0.2s ease-out;
        }
        @keyframes lgmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .lgm-window {
          width: 100%;
          max-width: 1020px;
          height: min(90vh, 820px);
          background: #0f172a;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .lgm-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }
        .lgm-title {
          margin: 0;
          flex: 1;
          color: white;
          font-size: 15px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .lgm-restart-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 32px;
          padding: 0 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.18);
          transition: all 0.18s ease;
          touch-action: manipulation;
        }
        .lgm-restart-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          transform: translateY(-1px);
        }
        .lgm-close-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 16px;
          cursor: pointer;
          transition: all 0.18s ease;
          touch-action: manipulation;
        }
        .lgm-close-btn:hover {
          background: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          border-color: rgba(239, 68, 68, 0.5);
        }
        .lgm-content {
          position: relative;
          flex: 1;
          background: #020617;
          overflow: hidden;
        }
        .lgm-loader {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 14px;
          gap: 12px;
          background: #090d16;
          z-index: 2;
          transition: opacity 0.3s ease;
        }
        .lgm-loader-icon {
          font-size: 38px;
          animation: lgmPulse 1.4s ease-in-out infinite;
        }
        @keyframes lgmPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        .lgm-iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: none;
          background: transparent;
        }
        .lgm-footer {
          padding: 8px 18px;
          color: #94a3b8;
          font-size: 12px;
          background: rgba(255, 255, 255, 0.04);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          flex-shrink: 0;
        }
        @media (max-width: 640px) {
          .lgm-overlay {
            padding: 0;
          }
          .lgm-window {
            height: 100%;
            max-height: 100%;
            border-radius: 0;
            border: none;
          }
          .lgm-header {
            padding: 10px 14px;
            gap: 8px;
          }
          .lgm-btn-label {
            display: none;
          }
          .lgm-footer {
            padding: 6px 12px;
            font-size: 11px;
          }
        }
      `}</style>

      <div ref={frameBoxRef} className="lgm-window">
        {/* Header Bar */}
        <div className="lgm-header">
          <BackButton onClick={onClose} variant="dark" />
          
          <h3 className="lgm-title">
            <span aria-hidden="true" style={{ fontSize: '18px' }}>{game.icon}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {game.title}
            </span>
            {game.badge && (
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'rgba(56, 189, 248, 0.18)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                whiteSpace: 'nowrap'
              }}>
                {game.badge}
              </span>
            )}
          </h3>

          {/* Restart Game */}
          <button
            type="button"
            className="lgm-restart-btn"
            onClick={() => {
              setLoaded(false)
              setReloadKey(k => k + 1)
            }}
            aria-label="Restart Game"
            title="Restart Game"
          >
            <span aria-hidden="true">🔄</span>
            <span className="lgm-btn-label">Restart</span>
          </button>

          {/* Fullscreen Toggle */}
          <FullscreenButton variant="dark" targetRef={frameBoxRef} />

          {/* Close X Button */}
          <button
            type="button"
            className="lgm-close-btn"
            onClick={onClose}
            aria-label="Exit Game"
            title="Exit Game"
          >
            ✕
          </button>
        </div>

        {/* Game Canvas Container */}
        <div className="lgm-content">
          {!loaded && (
            <div className="lgm-loader">
              <span className="lgm-loader-icon" aria-hidden="true">{game.icon}</span>
              <span style={{ fontWeight: 600 }}>Loading {game.title}…</span>
            </div>
          )}

          {!gameSrc ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#e2e8f0',
              gap: '12px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '40px' }}>🧘</span>
              <h4 style={{ margin: 0, fontSize: '18px' }}>Exercise Ready</h4>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                This mindful coping exercise runs natively within your MindSpace session.
              </p>
              <button
                type="button"
                className="lgm-restart-btn"
                onClick={onClose}
                style={{ marginTop: '12px' }}
              >
                Return to Exercises
              </button>
            </div>
          ) : (
            <iframe
              key={reloadKey}
              title={game.title}
              src={gameSrc}
              onLoad={() => setLoaded(true)}
              allow="fullscreen; autoplay; screen-wake-lock; clipboard-write; gamepad; accelerometer; gyroscope"
              className="lgm-iframe"
            />
          )}
        </div>

        {/* Footer Bar */}
        <div className="lgm-footer">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🌿</span>
            <span>{game.desc}</span>
          </span>
          <span style={{ opacity: 0.8, fontSize: '11px' }}>
            {game.credit || 'MindSpace In-App Coping Game · 100% Private & Ad-Free'}
          </span>
        </div>
      </div>
    </div>
  )
}
