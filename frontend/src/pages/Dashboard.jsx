import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Icon from '../components/ui/Icon'
import { Horizon, MoodFace, MOOD_LABELS } from '../components/ui/Brand'

const REMINDERS = [
  "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, or frustrated.",
  "Your mental health is a priority. Your happiness is an essential. Your self-care is a necessity.",
  "Take a deep breath. It's just a bad day, not a bad life.",
  "Be proud of how far you've come, and have faith in how far you can go.",
  "You are stronger than you think, and you have survived 100% of your worst days so far.",
  "Slow down. Give yourself permission to pause, breathe, and rest.",
  "Small steps in the right direction can turn out to be the biggest steps of your life.",
  "You are enough just as you are. Your worth is not defined by your productivity.",
  "It is okay to ask for help. Strength is knowing when you need a hand.",
  "Self-care is not selfish. You cannot pour from an empty cup.",
  "Healing is not linear. Be patient and kind to yourself as you navigate the ups and downs.",
  "Every day is a fresh start. Take a moment to appreciate the present.",
  "Focus on the step in front of you, not the whole staircase.",
  "Your feelings are valid. You are allowed to feel whatever you are feeling.",
  "Be gentle with yourself. You are doing the best you can.",
  "A bad chapter doesn't mean the end of your story. Keep going.",
  "Believe in yourself and all that you are. There is something inside you that is greater than any obstacle.",
  "You don't need to control everything. Sometimes you just need to breathe, trust, let go, and see what happens.",
  "Talk to yourself like you would to someone you love.",
  "The only way out is through, but you don't have to walk the path alone.",
  "Difficult roads often lead to beautiful destinations.",
  "Allow yourself to grow. You are not the same person you were a year ago, or even yesterday.",
  "Your peace of mind is worth more than any external approval.",
  "Quiet the voice of self-doubt and listen to the voice of your courage.",
  "One day at a time. One step at a time. One breath at a time.",
  "Make time for the things that make your soul happy.",
  "Your mind is a garden. Your thoughts are the seeds. You can grow flowers, or you can grow weeds.",
  "You are worthy of love, care, and understanding—especially from yourself.",
  "Don't compare your behind-the-scenes with everyone else's highlight reel.",
  "Never underestimate the power of a quiet mind and a grateful heart.",
  "You are doing a lot better than you give yourself credit for."
]

const getGameLabel = (code) => {
  if (code === 'bubbles') return 'Zen Bubble Popper'
  if (code === 'memory') return 'Zen Memory Match'
  if (code === 'gratitude') return 'Gratitude Garden'
  if (code === 'whack') return 'Whack-A-Stress'
  if (code === 'breathing') return 'Breathing Balloon'
  return 'Calming Mindfulness Exercise'
}

const getFormattedDate = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 5) return 'Still up'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [supportMessage, setSupportMessage] = useState(null)

  // Daily mindful reminder index
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000)
  const [reminderIdx, setReminderIdx] = useState(dayOfYear % REMINDERS.length)

  // Interactive 4-7-8 Breathing Mini-Coach state
  const [breathingActive, setBreathingActive] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState('Inhale')
  const [breathingSeconds, setBreathingSeconds] = useState(4)
  const breathingTimerRef = useRef(null)

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }
    fetchProfileAndData()
    checkSupportMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  // 4-7-8 Breathing Loop
  useEffect(() => {
    if (!breathingActive) {
      clearInterval(breathingTimerRef.current)
      setBreathingPhase('Inhale')
      setBreathingSeconds(4)
      return
    }

    breathingTimerRef.current = setInterval(() => {
      setBreathingSeconds((prevSec) => {
        if (prevSec > 1) return prevSec - 1

        setBreathingPhase((prevPhase) => {
          if (prevPhase === 'Inhale') {
            setBreathingSeconds(7)
            return 'Hold'
          } else if (prevPhase === 'Hold') {
            setBreathingSeconds(8)
            return 'Exhale'
          } else {
            setBreathingSeconds(4)
            return 'Inhale'
          }
        })
        return 4
      })
    }, 1000)

    return () => clearInterval(breathingTimerRef.current)
  }, [breathingActive])

  const fetchProfileAndData = async () => {
    try {
      const profileRes = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(profileRes.data)
      localStorage.setItem('user', JSON.stringify(profileRes.data))
    } catch (err) {
      console.error('Error fetching profile:', err)
      handleLogout()
    } finally {
      setLoading(false)
    }
  }

  const checkSupportMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/messages/admin-support`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const latestSupportMsg = res.data
        .slice()
        .reverse()
        .find(msg => msg.sender?.role === 'counsellor' || msg.sender?.role === 'admin')
      if (latestSupportMsg) setSupportMessage(latestSupportMsg)
    } catch (err) {
      console.error('Error checking support messages:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleQuickMoodClick = (moodValue) => {
    navigate('/mood', { state: { quickMood: moodValue } })
  }

  const name = user ? user.name.split(' ')[0] : 'there'
  const customRec = user?.customRecommendation

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 260, borderRadius: 24 }} />
        <div className="grid grid-3 mt-24">
          <div className="skeleton" style={{ height: 160 }} />
          <div className="skeleton" style={{ height: 160 }} />
          <div className="skeleton" style={{ height: 160 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="page db-page">
      <style>{`
        /* =========================================================================
           MindSpace Unified & Clean Dashboard Styles
           Clean, clear, modern layout with high readability across all devices
           ========================================================================= */
        .db-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        /* 1. Slim Reassuring Crisis Ribbon */
        .db-crisis-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 18px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--surface) 90%, var(--danger-soft));
          border: 1px solid color-mix(in srgb, var(--line) 75%, var(--danger));
          font-size: 12.5px;
          flex-wrap: wrap;
        }
        .db-crisis-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--ink-2);
          font-weight: 550;
        }
        .db-crisis-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 9px;
          border-radius: 999px;
          background: var(--danger);
          color: #fff;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: .02em;
        }
        .db-crisis-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .db-crisis-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 999px;
          background: var(--surface);
          border: 1px solid var(--line-strong);
          color: var(--danger);
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.18s ease;
        }
        .db-crisis-btn:hover {
          background: var(--danger);
          color: #fff;
          border-color: var(--danger);
        }

        /* 2. Urgent Notices */
        .db-notice-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          border-radius: 20px;
          border: 1px solid transparent;
          background: var(--danger-soft);
          color: var(--danger-ink);
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .db-notice-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        /* 3. Sanctuary Hero Section */
        .db-hero {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          border-radius: 28px;
          border: 1px solid var(--line);
          background: var(--scene-sky-1);
          box-shadow: var(--shadow-sm);
          min-height: 290px;
          display: flex;
          align-items: center;
        }
        .db-hero-art {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .db-hero-art .scene {
          width: 100%;
          height: 100%;
        }
        .db-hero-body {
          position: relative;
          z-index: 2;
          padding: 36px 44px;
          max-width: 620px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .db-date-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--surface) 85%, transparent);
          border: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-2);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          align-self: flex-start;
        }
        .db-greeting-title {
          margin: 0;
          font-size: clamp(26px, 3.4vw, 38px);
          font-weight: 800;
          line-height: 1.18;
          color: var(--ink);
          font-family: var(--font-display);
        }
        .db-greeting-name {
          color: var(--primary);
          font-style: italic;
        }
        .db-greeting-lead {
          margin: 0;
          font-size: clamp(13.5px, 1.1vw, 15px);
          color: var(--ink-2);
          line-height: 1.55;
          max-width: 520px;
        }

        /* Hero Quick Mood Buttons */
        .db-mood-checkin {
          margin-top: 6px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .db-mood-label {
          font-size: 11.5px;
          font-weight: 750;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--ink-3);
        }
        .db-mood-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
          max-width: 440px;
          width: 100%;
        }
        .db-mood-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          padding: 10px 4px 8px;
          border-radius: 18px;
          border: 1px solid color-mix(in srgb, var(--surface) 70%, transparent);
          background: color-mix(in srgb, var(--surface) 82%, transparent);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          touch-action: manipulation;
        }
        .db-mood-btn:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-sm);
          border-color: var(--primary);
        }
        .db-mood-btn:active {
          transform: scale(0.96);
        }
        .db-mood-text {
          font-size: 11px;
          font-weight: 700;
          color: var(--ink-2);
        }

        /* 4. Section Headers */
        .db-section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: 8px;
          margin-bottom: 2px;
        }
        .db-section-title {
          font-size: 19px;
          font-weight: 800;
          color: var(--ink);
          margin: 0 0 3px;
          letter-spacing: -0.01em;
        }
        .db-section-sub {
          font-size: 13px;
          color: var(--ink-3);
          margin: 0;
        }

        /* 5. Core Pillars Grid (Clean, Balanced & Modern) */
        .db-pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .db-card {
          display: flex;
          flex-direction: column;
          padding: 22px 20px 18px;
          border-radius: 22px;
          background: var(--surface);
          border: 1px solid var(--line);
          box-shadow: var(--shadow-xs);
          text-align: left;
          font: inherit;
          color: inherit;
          cursor: pointer;
          min-height: 180px;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          touch-action: manipulation;
        }
        .db-card:hover {
          transform: translateY(-3px);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }
        .db-card:active {
          transform: translateY(-1px);
        }
        .db-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .db-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .db-card-chip {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 999px;
          background: var(--surface-2);
          color: var(--ink-2);
          border: 1px solid var(--line);
          letter-spacing: .01em;
        }
        .db-card-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--ink);
          margin: 0 0 6px;
          line-height: 1.3;
        }
        .db-card-desc {
          font-size: 12.5px;
          color: var(--ink-3);
          margin: 0 0 14px;
          line-height: 1.48;
          flex: 1;
        }
        .db-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid var(--line);
          margin-top: auto;
          font-size: 12px;
          font-weight: 750;
          color: var(--primary);
        }
        .db-card:hover .db-card-footer {
          color: var(--primary-ink);
        }

        /* 6. Interactive 1-Minute Breathing Section */
        .db-breathing-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 24px 28px;
          border-radius: 24px;
          background: linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--surface) 92%, var(--primary-soft)));
          border: 1px solid var(--line);
          box-shadow: var(--shadow-xs);
        }
        .db-breathing-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .db-breathing-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 999px;
          background: var(--success-soft);
          color: var(--success-ink);
          font-size: 11px;
          font-weight: 700;
          align-self: flex-start;
        }
        .db-breathing-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--ink);
          margin: 0;
        }
        .db-breathing-desc {
          font-size: 13px;
          color: var(--ink-2);
          margin: 0;
          line-height: 1.45;
          max-width: 480px;
        }
        .db-breathing-widget {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-shrink: 0;
        }
        .db-circle {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle, var(--success-soft), color-mix(in srgb, var(--surface) 85%, var(--success)));
          border: 2px solid var(--success);
          box-shadow: 0 0 16px -4px rgba(46,125,114,.3);
          transition: transform 4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .db-circle.active.inhale { transform: scale(1.22); }
        .db-circle.active.hold {
          transform: scale(1.22);
          border-color: var(--sun);
          background: radial-gradient(circle, var(--sun-soft), color-mix(in srgb, var(--surface) 85%, var(--sun)));
        }
        .db-circle.active.exhale { transform: scale(0.96); }
        .db-circle-phase {
          font-size: 12px;
          font-weight: 800;
          color: var(--ink);
        }
        .db-circle-sec {
          font-size: 11px;
          font-weight: 600;
          color: var(--ink-3);
        }

        /* 7. Daily Mindful Reflection */
        .db-reflection-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          padding: 28px 24px;
          border-radius: 24px;
          background: var(--surface);
          border: 1px solid var(--line);
          box-shadow: var(--shadow-xs);
        }
        .db-reflection-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: var(--sun-ink, var(--primary));
        }
        .db-reflection-quote {
          margin: 0;
          max-width: 680px;
          font-family: var(--font-display);
          font-style: italic;
          font-size: clamp(17px, 2vw, 22px);
          line-height: 1.45;
          color: var(--ink);
        }
        .db-reflection-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* 8. Reassuring Crisis Helplines Footer */
        .db-helpline-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 16px 22px;
          border-radius: 20px;
          background: var(--surface-2);
          border: 1px solid var(--line);
          font-size: 12.5px;
          flex-wrap: wrap;
        }
        .db-helpline-left {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--ink-2);
        }
        .db-helpline-left strong {
          color: var(--ink);
        }
        .db-helpline-grid {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .db-helpline-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          background: var(--surface);
          border: 1px solid var(--line);
          color: var(--primary);
          font-weight: 750;
          text-decoration: none;
          font-size: 12px;
          transition: all 0.18s ease;
        }
        .db-helpline-chip:hover {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
        }

        /* =========================================================================
           Responsive Breakpoints (Desktop, Tablet, Mobile)
           ========================================================================= */
        @media (max-width: 1024px) {
          .db-pillars-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }
          .db-hero-body {
            padding: 28px 32px;
          }
        }

        @media (max-width: 768px) {
          .db-page {
            gap: 18px;
          }
          .db-hero {
            min-height: auto;
            border-radius: 22px;
          }
          .db-hero-body {
            padding: 24px 20px;
            max-width: 100%;
          }
          .db-mood-grid {
            gap: 8px;
            max-width: 100%;
          }
          .db-mood-btn {
            padding: 8px 2px 6px;
            border-radius: 14px;
          }
          .db-pillars-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .db-card {
            padding: 16px 14px 14px;
            min-height: 145px;
            border-radius: 18px;
          }
          .db-card-icon {
            width: 38px;
            height: 38px;
            border-radius: 12px;
          }
          .db-card-title {
            font-size: 14.5px;
          }
          .db-card-desc {
            font-size: 11.5px;
            margin-bottom: 8px;
          }
          .db-breathing-card {
            flex-direction: column;
            align-items: stretch;
            padding: 20px 18px;
            gap: 16px;
          }
          .db-breathing-widget {
            justify-content: center;
          }
          .db-helpline-box {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 14px 16px;
          }
        }

        @media (max-width: 440px) {
          .db-pillars-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* 1. Reassuring Crisis Ribbon (Non-intrusive Top Safety Net) */}
      <div className="db-crisis-bar">
        <div className="db-crisis-info">
          <span className="db-crisis-badge"><Icon name="shield" size={13} /> 24/7 Crisis Help</span>
          <span>Free, confidential support is available across Sri Lanka.</span>
        </div>
        <div className="db-crisis-links">
          <a href="tel:1926" className="db-crisis-btn">
            <Icon name="phone" size={12} /> Call 1926 (NIMH)
          </a>
          <a href="tel:1990" className="db-crisis-btn" style={{ color: 'var(--ink-2)' }}>
            Call 1990
          </a>
        </div>
      </div>

      {/* 2. Counselor Message Notification (Conditional) */}
      {supportMessage && (
        <button
          type="button"
          className="db-notice-btn"
          onClick={() => navigate('/anonymous-chat', { state: { defaultTab: 'admin' } })}
        >
          <span className="tile tile-danger"><Icon name="message" size={22} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="chip chip-danger" style={{ marginBottom: 4, fontSize: '11px' }}>Counselor Message</span>
            <strong style={{ display: 'block', fontSize: '14.5px', color: 'var(--ink)' }}>Your counselor started a private session</strong>
            <span style={{ fontSize: '12.5px', fontStyle: 'italic', color: 'var(--ink-2)' }}>&ldquo;{supportMessage.text}&rdquo;</span>
          </div>
          <span className="btn btn-danger btn-sm" style={{ padding: '6px 14px', fontSize: '12px' }}>
            Reply <Icon name="arrowRight" size={14} />
          </span>
        </button>
      )}

      {/* 3. Counselor Personalized Coping Recommendation (Conditional) */}
      {customRec && (customRec.game || customRec.activity) && (
        <div className="notice notice-primary" style={{ borderRadius: '20px', padding: '16px 20px', margin: 0 }}>
          <span className="tile"><Icon name="heart" size={22} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="chip chip-primary" style={{ marginBottom: 4, fontSize: '11px' }}>Personal Recommendation</span>
            <strong style={{ display: 'block', fontSize: '14.5px', color: 'var(--ink)' }}>Curated coping exercise</strong>
            <span style={{ fontSize: '12.5px', fontStyle: 'italic', color: 'var(--ink-2)' }}>&ldquo;{customRec.activity || 'Take some quiet moments to reflect, breathe, and unwind.'}&rdquo;</span>
            {customRec.game && (
              <span className="small muted" style={{ display: 'block', marginTop: 4 }}>
                Recommended game: <strong>{getGameLabel(customRec.game)}</strong>
              </span>
            )}
          </div>
          {customRec.game && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/mood')}>
              <Icon name="play" size={14} /> Play Now
            </button>
          )}
        </div>
      )}

      {/* 4. Sanctuary Hero Section */}
      <section className="db-hero">
        <div className="db-hero-art"><Horizon /></div>
        <div className="db-hero-body">
          <div className="db-date-chip">
            <Icon name="calendar" size={13} />
            <span>{getFormattedDate()}</span>
          </div>

          <h1 className="db-greeting-title">
            {getGreeting()}, <span className="db-greeting-name">{name}.</span>
          </h1>

          <p className="db-greeting-lead">
            Welcome to your personal sanctuary. Taking a gentle moment to notice how you are feeling is the first step toward balance.
          </p>

          <div className="db-mood-checkin">
            <span className="db-mood-label">Quick Mood Check-in:</span>
            <div className="db-mood-grid" role="group" aria-label="Quick mood check-in">
              {[5, 4, 3, 2, 1].map((v) => (
                <button
                  key={v}
                  type="button"
                  className="db-mood-btn"
                  onClick={() => handleQuickMoodClick(v)}
                  aria-label={`Log feeling ${MOOD_LABELS[v]}`}
                >
                  <MoodFace value={v} size={38} />
                  <span className="db-mood-text">{MOOD_LABELS[v]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Wellbeing Pillars Header */}
      <div className="db-section-header">
        <div>
          <h2 className="db-section-title">Core Wellbeing Tools</h2>
          <p className="db-section-sub">Select a tool to explore feelings, talk through challenges, or relax your mind.</p>
        </div>
      </div>

      {/* 6. Core Wellbeing Pillars Grid (6 Balanced Cards) */}
      <div className="db-pillars-grid">
        {/* Card 1: Daily Mood Tracker & Assessment */}
        <button
          type="button"
          className="db-card"
          onClick={() => navigate('/mood')}
        >
          <div className="db-card-top">
            <span className="db-card-icon tile-sun"><Icon name="smile" size={24} /></span>
            <span className="db-card-chip">Daily Pulse</span>
          </div>
          <h3 className="db-card-title">Mood Tracker &amp; Check-in</h3>
          <p className="db-card-desc">Log your daily emotions, discover weekly patterns, and get personalized insights.</p>
          <div className="db-card-footer">
            <span>Check In</span>
            <Icon name="arrowRight" size={15} />
          </div>
        </button>

        {/* Card 2: Aura AI Chatbot */}
        <button
          type="button"
          className="db-card"
          onClick={() => navigate('/chat')}
        >
          <div className="db-card-top">
            <span className="db-card-icon tile-dusk"><Icon name="feather" size={24} /></span>
            <span className="db-card-chip">24/7 AI</span>
          </div>
          <h3 className="db-card-title">Talk to Aura AI</h3>
          <p className="db-card-desc">Empathetic, confidential conversational listener available day and night to talk through worries.</p>
          <div className="db-card-footer">
            <span>Chat Now</span>
            <Icon name="arrowRight" size={15} />
          </div>
        </button>

        {/* Card 3: Relaxation Games */}
        <button
          type="button"
          className="db-card"
          onClick={() => navigate('/mood', { state: { tab: 'log', scrollTo: 'sec-3d' } })}
        >
          <div className="db-card-top">
            <span className="db-card-icon tile-rose"><Icon name="award" size={24} /></span>
            <span className="db-card-chip">65+ Games</span>
          </div>
          <h3 className="db-card-title">Relaxing Games</h3>
          <p className="db-card-desc">Play Pop-It, Zen Sand Garden, Water Color Sort, and explore interactive 3D calming worlds.</p>
          <div className="db-card-footer">
            <span>Play Now</span>
            <Icon name="arrowRight" size={15} />
          </div>
        </button>

        {/* Card 4: Therapeutic Exercise Library */}
        <button
          type="button"
          className="db-card"
          onClick={() => navigate('/mood', { state: { tab: 'log', scrollTo: 'sec-library' } })}
        >
          <div className="db-card-top">
            <span className="db-card-icon tile-success"><Icon name="compass" size={24} /></span>
            <span className="db-card-chip">Evidence-Based</span>
          </div>
          <h3 className="db-card-title">Therapeutic Exercises</h3>
          <p className="db-card-desc">Evidence-based grounding techniques, box breathing, and coping strategies tailored to your mood.</p>
          <div className="db-card-footer">
            <span>Explore Exercises</span>
            <Icon name="arrowRight" size={15} />
          </div>
        </button>

        {/* Card 5: Professional Counseling */}
        <button
          type="button"
          className="db-card"
          onClick={() => navigate('/booking')}
        >
          <div className="db-card-top">
            <span className="db-card-icon tile-sky"><Icon name="calendar" size={24} /></span>
            <span className="db-card-chip">1-on-1 Sessions</span>
          </div>
          <h3 className="db-card-title">Professional Counseling</h3>
          <p className="db-card-desc">Schedule private, 100% confidential sessions with licensed university counselors at zero cost.</p>
          <div className="db-card-footer">
            <span>Book Session</span>
            <Icon name="arrowRight" size={15} />
          </div>
        </button>

        {/* Card 6: Anonymous Peer Space */}
        <button
          type="button"
          className="db-card"
          onClick={() => navigate('/anonymous-chat')}
        >
          <div className="db-card-top">
            <span className="db-card-icon tile-primary"><Icon name="users" size={24} /></span>
            <span className="db-card-chip">Safe Alias</span>
          </div>
          <h3 className="db-card-title">Anonymous Peer Space</h3>
          <p className="db-card-desc">Connect safely with fellow university students under an encrypted alias in a supportive community.</p>
          <div className="db-card-footer">
            <span>Join Space</span>
            <Icon name="arrowRight" size={15} />
          </div>
        </button>
      </div>

      {/* 7. Interactive 1-Minute Calming Breath (Micro-Relaxation) */}
      <div className="db-breathing-card">
        <div className="db-breathing-info">
          <span className="db-breathing-badge">
            <Icon name="wind" size={12} /> Quick Calming Rhythm
          </span>
          <h3 className="db-breathing-title">1-Minute Mindful Breath</h3>
          <p className="db-breathing-desc">
            Soothe your autonomic nervous system with the clinically proven 4-7-8 rhythmic breathing technique.
          </p>
        </div>

        <div className="db-breathing-widget">
          <div className={`db-circle ${breathingActive ? `active ${breathingPhase.toLowerCase()}` : ''}`}>
            <span className="db-circle-phase">{breathingActive ? breathingPhase : 'Relax'}</span>
            <span className="db-circle-sec">{breathingActive ? `${breathingSeconds}s` : '4-7-8'}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              className={`btn btn-sm ${breathingActive ? 'btn-soft' : 'btn-primary'}`}
              onClick={() => setBreathingActive(!breathingActive)}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <Icon name={breathingActive ? 'pause' : 'play'} size={14} />
              {breathingActive ? 'Pause' : 'Start Breath'}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/resources')}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Audio Guide &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 8. Daily Mindful Reflection */}
      <section className="db-reflection-card">
        <span className="db-reflection-tag">
          <Icon name="sun" size={14} /> MindSpace Daily Reflection
        </span>
        <blockquote className="db-reflection-quote">
          &ldquo;{REMINDERS[reminderIdx]}&rdquo;
        </blockquote>
        <div className="db-reflection-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setReminderIdx((prev) => (prev + 1) % REMINDERS.length)}
          >
            <Icon name="refresh" size={13} /> New Thought
          </button>
          <button
            type="button"
            className="btn btn-soft btn-sm"
            onClick={() => navigate('/resources')}
          >
            <Icon name="wind" size={13} /> Mindful Audio
          </button>
        </div>
      </section>

      {/* 9. Reassuring Crisis Helplines Footer */}
      <div className="db-helpline-box">
        <div className="db-helpline-left">
          <Icon name="phone" size={18} />
          <span><strong>24/7 Crisis Support:</strong> Immediate free &amp; confidential assistance across Sri Lanka</span>
        </div>
        <div className="db-helpline-grid">
          <a href="tel:1926" className="db-helpline-chip" title="National Mental Health Helpline">
            <Icon name="phone" size={12} /> 1926 (NIMH)
          </a>
          <a href="tel:1990" className="db-helpline-chip" title="Suwaseriya Emergency Ambulance">
            1990 (Ambulance)
          </a>
          <a href="tel:1333" className="db-helpline-chip" title="CCCline Emotional Support">
            1333 (CCCline)
          </a>
        </div>
      </div>
    </div>
  )
}
