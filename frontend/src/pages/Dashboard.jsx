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
        <div className="skeleton" style={{ height: 420, borderRadius: 24 }} />
        <div className="skeleton mt-24" style={{ height: 120, borderRadius: 20 }} />
        <div className="grid grid-3 mt-24">
          <div className="skeleton" style={{ height: 180 }} />
          <div className="skeleton" style={{ height: 180 }} />
          <div className="skeleton" style={{ height: 180 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="page cey-page">
      <style>{`
        /* =========================================================================
           MindSpace Institutional Home Dashboard
           Inspired by clean, high-quality, professional corporate portals (CEYPETCO)
           - Prominent Grand Hero Section
           - Daily Reminder directly below Hero Section
           - Clean, symmetrical horizontal card rows across available page width
           - Limited, dignified, consistent palette (Teal / Slate / White)
           ========================================================================= */
        .cey-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
          max-width: 1240px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        /* ----------------- Top Crisis Ribbon (Slim & Authoritative) ----------------- */
        .cey-crisis-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 10px 22px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--surface) 92%, var(--danger-soft));
          border: 1px solid color-mix(in srgb, var(--line) 75%, var(--danger));
          font-size: 13px;
          flex-wrap: wrap;
        }
        .cey-crisis-info {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--ink-2);
          font-weight: 550;
        }
        .cey-crisis-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 999px;
          background: var(--danger);
          color: #fff;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: .02em;
          text-transform: uppercase;
        }
        .cey-crisis-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cey-crisis-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 999px;
          background: var(--surface);
          border: 1px solid var(--line-strong);
          color: var(--danger);
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .cey-crisis-link:hover {
          background: var(--danger);
          color: #fff;
          border-color: var(--danger);
        }

        /* ----------------- Urgent Counselor Notice (Conditional) ----------------- */
        .cey-notice-banner {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 18px 24px;
          border-radius: 20px;
          background: var(--danger-soft);
          border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
          color: var(--danger-ink);
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cey-notice-banner:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        /* ----------------- 1. Grand Hero Section (Large, Visual, Prominent) ----------------- */
        .cey-hero {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          border-radius: 28px;
          border: 1px solid var(--line);
          background: var(--scene-sky-1);
          box-shadow: 0 12px 36px -8px rgba(0, 0, 0, 0.07);
          min-height: 440px;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .cey-hero-art {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .cey-hero-art .scene {
          width: 100%;
          height: 100%;
        }
        .cey-hero-content {
          position: relative;
          z-index: 2;
          padding: 48px 56px;
          max-width: 680px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .cey-hero-date-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--surface) 88%, transparent);
          border: 1px solid color-mix(in srgb, var(--line) 75%, transparent);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          align-self: flex-start;
          letter-spacing: .01em;
        }
        .cey-hero-title {
          margin: 0;
          font-size: clamp(34px, 4.2vw, 48px);
          font-weight: 800;
          line-height: 1.15;
          color: var(--ink);
          font-family: var(--font-display);
          letter-spacing: -0.02em;
        }
        .cey-hero-name {
          color: var(--primary);
          font-style: italic;
        }
        .cey-hero-sub {
          margin: 0;
          font-size: clamp(15px, 1.25vw, 17px);
          color: var(--ink-2);
          line-height: 1.6;
          max-width: 580px;
        }

        /* Hero Quick Mood Check-in Strip */
        .cey-hero-checkin {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 6px;
        }
        .cey-hero-checkin-label {
          font-size: 11.5px;
          font-weight: 750;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--ink-3);
        }
        .cey-hero-moods-row {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
          max-width: 500px;
          width: 100%;
        }
        .cey-hero-mood-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 6px 10px;
          border-radius: 20px;
          border: 1px solid color-mix(in srgb, var(--surface) 75%, transparent);
          background: color-mix(in srgb, var(--surface) 86%, transparent);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s ease, border-color 0.2s ease;
          touch-action: manipulation;
        }
        .cey-hero-mood-btn:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          box-shadow: 0 8px 20px -4px rgba(46, 125, 114, 0.25);
        }
        .cey-hero-mood-btn:active {
          transform: scale(0.96);
        }
        .cey-hero-mood-text {
          font-size: 12px;
          font-weight: 700;
          color: var(--ink-2);
        }
        .cey-hero-trust {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          padding-top: 10px;
        }
        .cey-trust-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-3);
        }

        /* ----------------- 2. Daily Mindful Reminder (Prominent Position Below Hero) ----------------- */
        .cey-reminder-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          padding: 26px 36px;
          border-radius: 24px;
          background: linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--surface) 90%, var(--primary-soft)));
          border: 1px solid var(--line);
          border-left: 6px solid var(--primary);
          box-shadow: 0 4px 18px -4px rgba(0, 0, 0, 0.05);
          position: relative;
        }
        .cey-reminder-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cey-reminder-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          font-weight: 750;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--primary);
        }
        .cey-reminder-quote {
          margin: 0;
          font-family: var(--font-display);
          font-style: italic;
          font-size: clamp(17px, 1.8vw, 21px);
          line-height: 1.5;
          color: var(--ink);
        }
        .cey-reminder-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .cey-reminder-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s ease;
          touch-action: manipulation;
        }

        /* ----------------- 3. Section Titles ----------------- */
        .cey-section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--line);
          margin-top: 10px;
        }
        .cey-section-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--ink);
          margin: 0 0 4px;
          font-family: var(--font-display);
          letter-spacing: -0.01em;
        }
        .cey-section-sub {
          font-size: 13.5px;
          color: var(--ink-3);
          margin: 0;
        }

        /* ----------------- 4. Symmetrical Horizontal Card Rows Across Page Width ----------------- */
        .cey-row-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          width: 100%;
        }
        .cey-card {
          display: flex;
          flex-direction: column;
          padding: 28px 26px 24px;
          border-radius: 22px;
          background: var(--surface);
          border: 1px solid var(--line);
          box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.04);
          text-align: left;
          font: inherit;
          color: inherit;
          cursor: pointer;
          min-height: 205px;
          position: relative;
          overflow: hidden;
          transition: transform 0.22s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.22s ease, border-color 0.22s ease;
          touch-action: manipulation;
        }
        .cey-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          box-shadow: 0 14px 30px -8px rgba(46, 125, 114, 0.15);
        }
        .cey-card:active {
          transform: translateY(-1px);
        }
        .cey-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .cey-card-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: var(--primary-soft);
          color: var(--primary);
          border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
          flex-shrink: 0;
        }
        .cey-card-badge {
          font-size: 11px;
          font-weight: 750;
          padding: 4px 12px;
          border-radius: 999px;
          background: var(--surface-2);
          color: var(--ink-2);
          border: 1px solid var(--line);
          letter-spacing: .02em;
        }
        .cey-card-title {
          font-size: 17.5px;
          font-weight: 800;
          color: var(--ink);
          margin: 0 0 8px;
          line-height: 1.3;
        }
        .cey-card-desc {
          font-size: 13px;
          color: var(--ink-3);
          margin: 0 0 18px;
          line-height: 1.55;
          flex: 1;
        }
        .cey-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid var(--line);
          margin-top: auto;
          font-size: 13px;
          font-weight: 750;
          color: var(--primary);
          transition: color 0.18s ease;
        }
        .cey-card:hover .cey-card-footer {
          color: var(--primary-ink);
        }

        /* ----------------- 5. Full-Width Interactive 1-Minute Breathing Section ----------------- */
        .cey-breathing-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 36px;
          padding: 32px 40px;
          border-radius: 26px;
          background: linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--surface) 94%, var(--primary-soft)));
          border: 1px solid var(--line);
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04);
        }
        .cey-breathing-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cey-breathing-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: var(--primary-soft);
          color: var(--primary);
          font-size: 11.5px;
          font-weight: 750;
          align-self: flex-start;
          letter-spacing: .02em;
        }
        .cey-breathing-title {
          font-size: 21px;
          font-weight: 800;
          color: var(--ink);
          margin: 0;
          font-family: var(--font-display);
        }
        .cey-breathing-desc {
          font-size: 14px;
          color: var(--ink-2);
          margin: 0;
          line-height: 1.55;
          max-width: 540px;
        }
        .cey-breathing-widget {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-shrink: 0;
        }
        .cey-circle {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle, var(--primary-soft), color-mix(in srgb, var(--surface) 80%, var(--primary)));
          border: 2px solid var(--primary);
          box-shadow: 0 0 20px -4px rgba(46, 125, 114, 0.3);
          transition: transform 4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cey-circle.active.inhale { transform: scale(1.24); }
        .cey-circle.active.hold {
          transform: scale(1.24);
          border-color: #d97706;
          background: radial-gradient(circle, rgba(217,119,6,0.15), color-mix(in srgb, var(--surface) 80%, #d97706));
        }
        .cey-circle.active.exhale { transform: scale(0.96); }
        .cey-circle-phase {
          font-size: 13px;
          font-weight: 800;
          color: var(--ink);
        }
        .cey-circle-sec {
          font-size: 11.5px;
          font-weight: 650;
          color: var(--ink-3);
        }

        /* ----------------- 6. Institutional Crisis Helpline Banner ----------------- */
        .cey-helpline-panel {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 22px 32px;
          border-radius: 22px;
          background: var(--surface-2);
          border: 1px solid var(--line);
          font-size: 13px;
          flex-wrap: wrap;
        }
        .cey-helpline-copy {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--ink-2);
        }
        .cey-helpline-copy strong {
          color: var(--ink);
          font-weight: 750;
        }
        .cey-helpline-badges {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .cey-helpline-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          background: var(--surface);
          border: 1px solid var(--line-strong);
          color: var(--primary);
          font-weight: 750;
          text-decoration: none;
          font-size: 12.5px;
          transition: all 0.18s ease;
        }
        .cey-helpline-link:hover {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
        }

        /* =========================================================================
           Responsive Breakpoints (Desktop, Laptop, Tablet, Mobile)
           ========================================================================= */
        @media (max-width: 1100px) {
          .cey-row-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }
          .cey-hero-content {
            padding: 36px 40px;
          }
        }

        @media (max-width: 820px) {
          .cey-page {
            gap: 24px;
          }
          .cey-hero {
            min-height: 380px;
            border-radius: 24px;
          }
          .cey-hero-content {
            padding: 30px 24px;
            max-width: 100%;
          }
          .cey-reminder-banner {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            padding: 22px 24px;
          }
          .cey-reminder-actions {
            align-self: flex-start;
          }
          .cey-breathing-strip {
            flex-direction: column;
            align-items: stretch;
            padding: 24px 22px;
            gap: 20px;
          }
          .cey-breathing-widget {
            justify-content: center;
          }
          .cey-helpline-panel {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
            padding: 18px 20px;
          }
        }

        @media (max-width: 580px) {
          .cey-row-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .cey-hero-moods-row {
            gap: 8px;
          }
          .cey-hero-mood-btn {
            padding: 8px 2px 6px;
            border-radius: 14px;
          }
          .cey-card {
            padding: 20px 18px 18px;
            min-height: auto;
          }
          .cey-card-icon {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>

      {/* ----------------- Top 24/7 Crisis Support Bar ----------------- */}
      <div className="cey-crisis-bar">
        <div className="cey-crisis-info">
          <span className="cey-crisis-badge"><Icon name="shield" size={13} /> 24/7 Crisis Support</span>
          <span>National mental health assistance is free, confidential, and available at all times.</span>
        </div>
        <div className="cey-crisis-actions">
          <a href="tel:1926" className="cey-crisis-link" title="National Institute of Mental Health Hotline">
            <Icon name="phone" size={12} /> Call 1926 (NIMH)
          </a>
          <a href="tel:1990" className="cey-crisis-link" style={{ color: 'var(--ink-2)' }} title="Suwaseriya Emergency Service">
            Call 1990
          </a>
        </div>
      </div>

      {/* ----------------- Urgent Counselor Notice (Rendered conditionally) ----------------- */}
      {supportMessage && (
        <button
          type="button"
          className="cey-notice-banner"
          onClick={() => navigate('/anonymous-chat', { state: { defaultTab: 'admin' } })}
        >
          <span className="tile tile-danger"><Icon name="message" size={24} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="chip chip-danger" style={{ marginBottom: 4, fontSize: '11px' }}>Counselor Session Active</span>
            <strong style={{ display: 'block', fontSize: '15px', color: 'var(--ink)' }}>Your counselor started a private session</strong>
            <span style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--ink-2)' }}>&ldquo;{supportMessage.text}&rdquo;</span>
          </div>
          <span className="btn btn-danger btn-sm" style={{ padding: '7px 16px', fontSize: '12.5px' }}>
            Reply in Chat <Icon name="arrowRight" size={14} />
          </span>
        </button>
      )}

      {/* ----------------- Counselor Custom Activity (Rendered conditionally) ----------------- */}
      {customRec && (customRec.game || customRec.activity) && (
        <div className="notice notice-primary" style={{ borderRadius: '22px', padding: '18px 24px', margin: 0 }}>
          <span className="tile"><Icon name="heart" size={24} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="chip chip-primary" style={{ marginBottom: 4, fontSize: '11px' }}>Counselor Recommendation</span>
            <strong style={{ display: 'block', fontSize: '15px', color: 'var(--ink)' }}>A personalized coping activity for your wellbeing</strong>
            <span style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--ink-2)' }}>&ldquo;{customRec.activity || 'Take some quiet moments to reflect, breathe, and unwind.'}&rdquo;</span>
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

      {/* ----------------- 1. Large, Visually Attractive Hero Section ----------------- */}
      <section className="cey-hero">
        <div className="cey-hero-art"><Horizon /></div>
        <div className="cey-hero-content">
          <div className="cey-hero-date-pill">
            <Icon name="calendar" size={13} />
            <span>{getFormattedDate()}</span>
          </div>

          <h1 className="cey-hero-title">
            {getGreeting()}, <br />
            <span className="cey-hero-name">{name}.</span>
          </h1>

          <p className="cey-hero-sub">
            Welcome to your personal sanctuary. Take a gentle moment to notice your state—pausing to reflect is the foundation of mental clarity and emotional balance.
          </p>

          <div className="cey-hero-checkin">
            <span className="cey-hero-checkin-label">Quick Mood Check-in:</span>
            <div className="cey-hero-moods-row" role="group" aria-label="Quick mood check-in">
              {[5, 4, 3, 2, 1].map((v) => (
                <button
                  key={v}
                  type="button"
                  className="cey-hero-mood-btn"
                  onClick={() => handleQuickMoodClick(v)}
                  aria-label={`Log feeling ${MOOD_LABELS[v]}`}
                >
                  <MoodFace value={v} size={42} />
                  <span className="cey-hero-mood-text">{MOOD_LABELS[v]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="cey-hero-trust">
            <span className="cey-trust-item"><Icon name="lock" size={13} /> 100% Student Confidential</span>
            <span className="cey-trust-item"><Icon name="award" size={13} /> 65+ In-App Coping Games</span>
            <span className="cey-trust-item"><Icon name="feather" size={13} /> 24/7 AI &amp; Counselor Care</span>
          </div>
        </div>
      </section>

      {/* ----------------- 2. Daily Mindful Reminder (Directly Below Hero Section) ----------------- */}
      <section className="cey-reminder-banner" aria-labelledby="cey-reminder-title">
        <div className="cey-reminder-left">
          <div className="cey-reminder-meta" id="cey-reminder-title">
            <Icon name="sun" size={15} />
            <span>Daily Mindful Reflection</span>
          </div>
          <blockquote className="cey-reminder-quote">
            &ldquo;{REMINDERS[reminderIdx]}&rdquo;
          </blockquote>
        </div>

        <div className="cey-reminder-actions">
          <button
            type="button"
            className="cey-reminder-btn btn btn-outline btn-sm"
            onClick={() => setReminderIdx((prev) => (prev + 1) % REMINDERS.length)}
            aria-label="Cycle reflection thought"
          >
            <Icon name="refresh" size={13} /> New Thought
          </button>
          <button
            type="button"
            className="cey-reminder-btn btn btn-primary btn-sm"
            onClick={() => navigate('/resources')}
            aria-label="Explore mindful audio"
          >
            <Icon name="wind" size={13} /> Audio Guide
          </button>
        </div>
      </section>

      {/* ----------------- 3. Core Clinical & Emotional Services (Horizontal Row) ----------------- */}
      <div className="cey-section-head">
        <div>
          <h2 className="cey-section-title">Core Wellbeing Services</h2>
          <p className="cey-section-sub">Evidence-based assessment, conversational support, and professional counseling.</p>
        </div>
      </div>

      <div className="cey-row-grid">
        {/* Card 1: Daily Mood Tracker & Check-in */}
        <button
          type="button"
          className="cey-card"
          onClick={() => navigate('/mood')}
        >
          <div className="cey-card-top">
            <span className="cey-card-icon"><Icon name="smile" size={24} /></span>
            <span className="cey-card-badge">Daily Pulse</span>
          </div>
          <h3 className="cey-card-title">Mood Tracker &amp; Assessment</h3>
          <p className="cey-card-desc">
            Log daily emotional states, track weekly trends, and access personalized coping activities tailored to your mood.
          </p>
          <div className="cey-card-footer">
            <span>Open Tracker</span>
            <Icon name="arrowRight" size={16} />
          </div>
        </button>

        {/* Card 2: Talk to Aura AI */}
        <button
          type="button"
          className="cey-card"
          onClick={() => navigate('/chat')}
        >
          <div className="cey-card-top">
            <span className="cey-card-icon"><Icon name="feather" size={24} /></span>
            <span className="cey-card-badge">24/7 AI Companion</span>
          </div>
          <h3 className="cey-card-title">Talk to Aura AI</h3>
          <p className="cey-card-desc">
            Empathetic, confidential conversational listener available day and night to help process stress, anxiety, or study pressure.
          </p>
          <div className="cey-card-footer">
            <span>Start Chat</span>
            <Icon name="arrowRight" size={16} />
          </div>
        </button>

        {/* Card 3: Professional Counseling */}
        <button
          type="button"
          className="cey-card"
          onClick={() => navigate('/booking')}
        >
          <div className="cey-card-top">
            <span className="cey-card-icon"><Icon name="calendar" size={24} /></span>
            <span className="cey-card-badge">1-on-1 Sessions</span>
          </div>
          <h3 className="cey-card-title">Professional Counseling</h3>
          <p className="cey-card-desc">
            Schedule private, free 1-on-1 consultations with certified university counselors and psychologists in person or virtually.
          </p>
          <div className="cey-card-footer">
            <span>Book Appointment</span>
            <Icon name="arrowRight" size={16} />
          </div>
        </button>
      </div>

      {/* ----------------- 4. Coping Interventions & Community (Horizontal Row) ----------------- */}
      <div className="cey-section-head">
        <div>
          <h2 className="cey-section-title">Therapeutic Coping &amp; Community</h2>
          <p className="cey-section-sub">Interactive grounding tools, distress tolerance exercises, and anonymous peer sharing.</p>
        </div>
      </div>

      <div className="cey-row-grid">
        {/* Card 4: Relaxation Games */}
        <button
          type="button"
          className="cey-card"
          onClick={() => navigate('/mood', { state: { tab: 'log', scrollTo: 'sec-3d' } })}
        >
          <div className="cey-card-top">
            <span className="cey-card-icon"><Icon name="award" size={24} /></span>
            <span className="cey-card-badge">65+ In-App Games</span>
          </div>
          <h3 className="cey-card-title">Relaxing Games &amp; 3D</h3>
          <p className="cey-card-desc">
            Play Pop-It fidgets, Zen Sand Garden, Water Color Sort, and explore interactive 3D WebGL sensory grounding environments.
          </p>
          <div className="cey-card-footer">
            <span>Launch Games</span>
            <Icon name="arrowRight" size={16} />
          </div>
        </button>

        {/* Card 5: Therapeutic Exercise Library */}
        <button
          type="button"
          className="cey-card"
          onClick={() => navigate('/mood', { state: { tab: 'log', scrollTo: 'sec-library' } })}
        >
          <div className="cey-card-top">
            <span className="cey-card-icon"><Icon name="compass" size={24} /></span>
            <span className="cey-card-badge">Evidence-Based</span>
          </div>
          <h3 className="cey-card-title">Therapeutic Exercises</h3>
          <p className="cey-card-desc">
            Access evidence-based sensory grounding techniques, guided breathing routines, and mindful reframing exercises.
          </p>
          <div className="cey-card-footer">
            <span>Browse Library</span>
            <Icon name="arrowRight" size={16} />
          </div>
        </button>

        {/* Card 6: Anonymous Peer Space */}
        <button
          type="button"
          className="cey-card"
          onClick={() => navigate('/anonymous-chat')}
        >
          <div className="cey-card-top">
            <span className="cey-card-icon"><Icon name="users" size={24} /></span>
            <span className="cey-card-badge">Safe Alias</span>
          </div>
          <h3 className="cey-card-title">Anonymous Peer Space</h3>
          <p className="cey-card-desc">
            Share student challenges and find mutual encouragement with peers safely under an encrypted, privacy-first alias.
          </p>
          <div className="cey-card-footer">
            <span>Join Peer Space</span>
            <Icon name="arrowRight" size={16} />
          </div>
        </button>
      </div>

      {/* ----------------- 5. Full-Width Interactive 1-Minute Calming Breath ----------------- */}
      <section className="cey-breathing-strip">
        <div className="cey-breathing-left">
          <span className="cey-breathing-badge">
            <Icon name="wind" size={13} /> Quick Calming Rhythm
          </span>
          <h3 className="cey-breathing-title">1-Minute Rhythmic Breath</h3>
          <p className="cey-breathing-desc">
            Soothe your autonomic nervous system with the clinically proven 4-7-8 breathing technique. Inhale deeply, hold gently, and exhale fully to reset your heart rate.
          </p>
        </div>

        <div className="cey-breathing-widget">
          <div className={`cey-circle ${breathingActive ? `active ${breathingPhase.toLowerCase()}` : ''}`}>
            <span className="cey-circle-phase">{breathingActive ? breathingPhase : 'Relax'}</span>
            <span className="cey-circle-sec">{breathingActive ? `${breathingSeconds}s` : '4-7-8'}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              className={`btn btn-sm ${breathingActive ? 'btn-soft' : 'btn-primary'}`}
              onClick={() => setBreathingActive(!breathingActive)}
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              <Icon name={breathingActive ? 'pause' : 'play'} size={14} />
              {breathingActive ? 'Pause Breath' : 'Start Cycle'}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/resources')}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              Full Audio Guide &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* ----------------- 6. Institutional Emergency Crisis Helplines Panel ----------------- */}
      <section className="cey-helpline-panel">
        <div className="cey-helpline-copy">
          <Icon name="phone" size={20} style={{ color: 'var(--primary)' }} />
          <div>
            <strong>24/7 National Emergency &amp; Crisis Support Lines</strong>
            <div style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: 2 }}>
              Immediate, confidential assistance across Sri Lanka. Free toll-free access from any mobile or landline.
            </div>
          </div>
        </div>

        <div className="cey-helpline-badges">
          <a href="tel:1926" className="cey-helpline-link" title="National Mental Health Helpline (NIMH)">
            <Icon name="phone" size={12} /> 1926 NIMH Mental Health
          </a>
          <a href="tel:1990" className="cey-helpline-link" title="Suwaseriya National Emergency Ambulance Service">
            1990 Emergency Ambulance
          </a>
          <a href="tel:1333" className="cey-helpline-link" title="CCCline 24/7 Crisis & Emotional Counseling">
            1333 CCCline Counseling
          </a>
        </div>
      </section>
    </div>
  )
}
