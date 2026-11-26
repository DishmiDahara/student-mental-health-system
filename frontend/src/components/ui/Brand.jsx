import { useId } from 'react'

/** MindSpace mark — a sun rising over a calm wave. */
export function Logo({ size = 40, className = '' }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`lg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#62bfac" />
          <stop offset="1" stopColor="#276d62" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12.5" fill={`url(#lg${id})`} />
      <circle cx="20" cy="18.5" r="6.6" fill="#fde3cd" />
      <path d="M3 27.2c4.2-3.2 8.4-3.2 13.6-.2 4.6 2.6 7.6 2.6 10.6.4 3.4-2.4 6.4-2.2 9.8.4V40H3z" fill="#ffffff" opacity="0.95" />
      <path d="M3 32.4c4.2-2.6 8.4-2.6 13.6 0 4.6 2.3 7.6 2.3 10.6.2 3.4-2.2 6.4-2 9.8.2" fill="none" stroke="#2e7d72" strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** Theme-aware landscape: a dawn by day, a moonlit night in dark mode. */
export function Horizon({ className = '', style }) {
  const id = useId().replace(/:/g, '')
  const stars = [
    [70, 60, 2], [150, 32, 1.6], [250, 78, 2.2], [340, 40, 1.5], [430, 92, 1.8], [520, 30, 2],
    [610, 70, 1.6], [690, 38, 2.2], [760, 96, 1.5], [200, 120, 1.4], [560, 118, 1.7], [95, 108, 1.6]
  ]
  return (
    <svg className={`scene ${className}`} style={style} viewBox="0 0 800 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--scene-sky-1)' }} />
          <stop offset="1" style={{ stopColor: 'var(--scene-sky-2)' }} />
        </linearGradient>
        <radialGradient id={`glow${id}`}>
          <stop offset="0" style={{ stopColor: 'var(--scene-glow)' }} />
          <stop offset="1" style={{ stopColor: 'var(--scene-glow)', stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <rect width="800" height="460" fill={`url(#sky${id})`} />
      <g style={{ opacity: 'var(--scene-stars)', transition: 'opacity .4s' }}>
        {stars.map(([x, y, r], i) => (
          <circle key={i} className="star" cx={x} cy={y} r={r} fill="#eaf3ef" />
        ))}
      </g>
      <g className="sun-group">
        <circle className="sun-glow" cx="515" cy="215" r="190" fill={`url(#glow${id})`} />
        <circle className="orb sun-orb" cx="515" cy="215" r="52" style={{ fill: 'var(--scene-orb)' }} />
      </g>
      <g className="cloud" style={{ opacity: 'var(--scene-cloud)' }}>
        <ellipse cx="330" cy="82" rx="62" ry="16" fill="#fff" fillOpacity="0.6" />
        <ellipse cx="368" cy="69" rx="38" ry="14" fill="#fff" fillOpacity="0.6" />
      </g>
      <g className="cloud cloud-2" style={{ opacity: 'var(--scene-cloud)' }}>
        <ellipse cx="600" cy="120" rx="50" ry="13" fill="#fff" fillOpacity="0.5" />
        <ellipse cx="630" cy="108" rx="30" ry="12" fill="#fff" fillOpacity="0.5" />
      </g>
      <path d="M0 292c90-34 170-40 260-14s160 18 250-18 190-36 290-4v204H0z" style={{ fill: 'var(--scene-h1)' }} />
      <path d="M0 336c110-46 200-50 300-22s170 16 270-20 160-24 230 0v166H0z" style={{ fill: 'var(--scene-h2)' }} />
      <path d="M0 388c100-34 190-40 290-14s190 14 290-14 150-10 220 8v96H0z" style={{ fill: 'var(--scene-h3)' }} />
      <path d="M0 426c120-20 220-24 320-8s210 10 300-6 130-8 180 2v46H0z" style={{ fill: 'var(--scene-h4)' }} />
      <g style={{ fill: 'var(--scene-h4)' }}>
        <path d="M104 424c0-26 4-44 10-60 6 16 10 34 10 60z" />
        <path d="M128 426c0-18 3-30 7-42 5 12 7 24 7 42z" />
      </g>
      <g className="birds-group" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" style={{ opacity: "var(--scene-cloud)", transition: 'opacity .4s' }}>
        <path d="M560 176q8-8 16 0 8-8 16 0" />
        <path d="M598 150q6-6 12 0 6-6 12 0" />
      </g>
    </svg>
  )
}

/** Breathing orb used by guided breathing. `phase` scales it; `size` in px. */
export function Orb({ size = 180, scale = 1, duration = 4, children }) {
  return (
    <div className="orb-wrap" style={{ width: size, height: size }}>
      <div className="orb-ring" style={{ transform: `scale(${scale * 1.18})`, transition: `transform ${duration}s linear` }} />
      <div className="orb-ring" style={{ transform: `scale(${scale * 1.38})`, transition: `transform ${duration}s linear`, opacity: 0.12 }} />
      <div className="orb-core" style={{ width: size * 0.74, height: size * 0.74, transform: `scale(${scale})`, transition: `transform ${duration}s linear` }}>
        {children}
      </div>
    </div>
  )
}

/** Custom mood faces, 1 (Terrible) → 5 (Great). Colours follow the theme tokens. */
const FACE = {
  5: { fill: 'var(--sun)', label: 'Great' },
  4: { fill: 'var(--success)', label: 'Good' },
  3: { fill: 'var(--sky)', label: 'Okay' },
  2: { fill: 'var(--dusk)', label: 'Bad' },
  1: { fill: 'var(--rose)', label: 'Terrible' }
}

export function MoodFace({ value = 3, size = 48, className = '', style, muted = false }) {
  const f = FACE[value] || FACE[3]
  const ink = '#17302d'
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} style={{ opacity: muted ? 0.55 : 1, transition: 'opacity .2s', ...style }} role="img" aria-label={f.label}>
      <circle cx="24" cy="24" r="22" style={{ fill: f.fill }} />
      <circle cx="24" cy="24" r="22" fill="#fff" fillOpacity="0.18" />
      {value === 5 && (<>
        <path d="M13.5 21c1.2-3 4.8-3 6 0M28.5 21c1.2-3 4.8-3 6 0" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M13 28c2 7.4 20 7.4 22 0z" fill={ink} />
        <path d="M17 31.6c2.4 1.6 11.6 1.6 14 0" fill="#fff" fillOpacity="0.9" />
      </>)}
      {value === 4 && (<>
        <circle cx="17" cy="20.5" r="2.4" fill={ink} /><circle cx="31" cy="20.5" r="2.4" fill={ink} />
        <path d="M15.5 29c3.6 5 13.4 5 17 0" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      </>)}
      {value === 3 && (<>
        <circle cx="17" cy="21" r="2.4" fill={ink} /><circle cx="31" cy="21" r="2.4" fill={ink} />
        <path d="M17 32h14" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      </>)}
      {value === 2 && (<>
        <circle cx="17" cy="22" r="2.4" fill={ink} /><circle cx="31" cy="22" r="2.4" fill={ink} />
        <path d="M13.5 17.4l7-1.6M34.5 17.4l-7-1.6" stroke={ink} strokeWidth="2" strokeLinecap="round" />
        <path d="M17 34c3.4-3.8 10.6-3.8 14 0" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      </>)}
      {value === 1 && (<>
        <path d="M13.5 22c1.2 2.6 4.8 2.6 6 0M28.5 22c1.2 2.6 4.8 2.6 6 0" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" transform="rotate(180 24 22)" />
        <path d="M16 35c4-5 12-5 16 0" fill="none" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M33 27c1.8 3 1.8 4.6 0 6.2-1.8-1.6-1.8-3.2 0-6.2z" style={{ fill: 'var(--sky)' }} />
      </>)}
    </svg>
  )
}

export const MOOD_LABELS = { 5: 'Great', 4: 'Good', 3: 'Okay', 2: 'Bad', 1: 'Terrible' }
export const moodTone = (v) => ({ 5: 'sun', 4: 'success', 3: 'sky', 2: 'dusk', 1: 'rose' }[v] || 'sky')
