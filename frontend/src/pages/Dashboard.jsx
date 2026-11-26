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
  const [breathingPhase, setBreathingPhase] = useState('Inhale') // 'Inhale', 'Hold', 'Exhale'
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

        // Transition phases: Inhale (4s) -> Hold (7s) -> Exhale (8s) -> Inhale
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

  const handlePromptClick = (promptText) => {
    navigate('/chat', { state: { initialPrompt: promptText } })
  }

  const name = user ? user.name.split(' ')[0] : 'there'
  const customRec = user?.customRecommendation

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 280, borderRadius: 28 }} />
        <div className="grid grid-3 mt-24">
          <div className="skeleton" style={{ height: 180 }} />
          <div className="skeleton" style={{ height: 180 }} />
          <div className="skeleton" style={{ height: 180 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="page dashboard-page">
      {/* ----------------- 24/7 Emergency Care Ribbon ----------------- */}
      <div className="emergency-ribbon mb-20 rise">
        <div className="emergency-ribbon-left">
          <span className="emergency-badge"><Icon name="shield" size={15} /> 24/7 Crisis Support</span>
          <span className="emergency-text">
            Immediate mental health assistance is free and confidential across Sri Lanka.
          </span>
        </div>
        <div className="emergency-ribbon-actions">
          <a href="tel:1926" className="emergency-link">
            <Icon name="phone" size={13} /> Call 1926 (NIMH)
          </a>
          <a href="tel:1990" className="emergency-link emergency-link-subtle">
            Call 1990 (Ambulance)
          </a>
        </div>
      </div>

      {/* ----------------- Urgent Counselor Message ----------------- */}
      {supportMessage && (
        <button
          type="button"
          className="notice notice-danger rise mb-20"
          onClick={() => navigate('/anonymous-chat', { state: { defaultTab: 'admin' } })}
        >
          <span className="tile tile-danger"><Icon name="message" size={22} /></span>
          <span className="notice-body">
            <span className="chip chip-danger" style={{ marginBottom: 6 }}>Message from University Counselor</span>
            <strong>Your counselor started a private support session</strong>
            <span className="notice-quote">&ldquo;{supportMessage.text}&rdquo;</span>
          </span>
          <span className="btn btn-danger btn-sm">Reply in Chat <Icon name="arrowRight" size={16} /></span>
        </button>
      )}

      {/* ----------------- Counselor Custom Activity Recommendation ----------------- */}
      {customRec && (customRec.game || customRec.activity) && (
        <div className="notice notice-primary rise mb-20">
          <span className="tile"><Icon name="heart" size={22} /></span>
          <span className="notice-body">
            <span className="chip chip-primary" style={{ marginBottom: 6 }}>Recommended by Your Counselor</span>
            <strong>A personalized coping exercise for your wellbeing</strong>
            <span className="notice-quote">&ldquo;{customRec.activity || 'Take some quiet moments to reflect, breathe, and unwind.'}&rdquo;</span>
            {customRec.game && (
              <span className="small muted" style={{ marginTop: 6 }}>
                Curated exercise: <strong style={{ color: 'var(--ink)' }}>{getGameLabel(customRec.game)}</strong>
              </span>
            )}
          </span>
          {customRec.game && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/mood')}>
              <Icon name="play" size={15} /> Play now
            </button>
          )}
        </div>
      )}

      {/* ----------------- Hero Section ----------------- */}
      <section className="hero hero-elevated rise rise-1">
        <div className="hero-art"><Horizon /></div>
        <div className="hero-body">
          <div className="hero-date-chip">
            <Icon name="calendar" size={14} />
            <span>{getFormattedDate()}</span>
          </div>

          <h1 className="h-display hero-title">
            {getGreeting()},<br />
            <span className="hero-name">{name}.</span>
          </h1>

          <p className="hero-lead">
            Welcome to your personal sanctuary. How is your mind and body feeling right now? Taking a gentle moment to notice your state is the first step toward balance.
          </p>

          <div className="hero-checkin-wrapper">
            <span className="hero-checkin-label">Quick Mood Check-in:</span>
            <div className="hero-moods" role="group" aria-label="Quick mood check-in">
              {[5, 4, 3, 2, 1].map((v) => (
                <button
                  key={v}
                  type="button"
                  className="hero-mood"
                  onClick={() => handleQuickMoodClick(v)}
                  aria-label={`Log feeling ${MOOD_LABELS[v]}`}
                >
                  <MoodFace value={v} size={44} />
                  <span className="hero-mood-text">{MOOD_LABELS[v]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hero-trust-strip">
            <span className="trust-pill"><Icon name="lock" size={13} /> 100% Student Confidential</span>
            <span className="trust-pill"><Icon name="award" size={13} /> 65+ Coping Games &amp; 3D Grounding</span>
            <span className="trust-pill"><Icon name="feather" size={13} /> 24/7 AI &amp; Counselor Care</span>
          </div>
        </div>
      </section>

      {/* ----------------- Section Header: Toolkit ----------------- */}
      <div className="row-between mt-48 mb-24 rise rise-2">
        <div>
          <h2 className="h-section" style={{ margin: 0 }}>Your Wellbeing Toolkit</h2>
          <p className="small muted" style={{ margin: '4px 0 0' }}>
            Evidence-based tools to explore feelings, talk through challenges, and calm your senses.
          </p>
        </div>
      </div>

      {/* ----------------- Bento Grid ----------------- */}
      <div className="bento rise rise-3">
        {/* Card 1: Mood Tracker & Coping Hub (7 cols) */}
        <button
          type="button"
          className="card card-interactive bento-card b-7 bento-card-highlight"
          onClick={() => navigate('/mood')}
        >
          <div className="row-between">
            <div className="row gap-12" style={{ alignItems: 'center' }}>
              <span className="tile tile-lg tile-sun"><Icon name="smile" size={26} /></span>
              <span className="chip chip-primary" style={{ fontWeight: 700 }}>Daily Wellbeing Pulse</span>
            </div>
            <span className="go"><Icon name="arrowRight" size={18} /></span>
          </div>

          <h3 className="card-title serif mt-8">Daily Mood Tracker &amp; Coping Hub</h3>
          <p className="card-sub">
            Log how you feel, discover weekly emotional patterns, and unlock 65+ games &amp; therapeutic interventions tailored to your exact mood.
          </p>

          <div className="bento-visual-moods mt-auto">
            {[5, 4, 3, 2, 1].map((v) => (
              <div key={v} className="bento-face-col">
                <MoodFace value={v} size={36} muted={v !== 4} />
                <span className="bento-face-label">{MOOD_LABELS[v]}</span>
              </div>
            ))}
          </div>

          <div className="bento-footer-strip mt-14">
            <span className="bento-chip">65+ Zen Games</span>
            <span className="bento-chip">Facial AI Scanner</span>
            <span className="bento-chip">Audio Journal</span>
            <span className="bento-action-text">Explore Tracker &rarr;</span>
          </div>
        </button>

        {/* Card 2: Talk to Aura AI (5 cols) */}
        <button
          type="button"
          className="card card-interactive bento-card b-5 bento-aura"
          onClick={() => navigate('/chat')}
        >
          <div className="row-between">
            <div className="row gap-12" style={{ alignItems: 'center' }}>
              <span className="tile tile-lg tile-dusk"><Icon name="feather" size={26} /></span>
              <span className="chip" style={{ background: 'rgba(127,121,209,0.18)', color: 'var(--dusk-ink)', fontWeight: 700 }}>
                &bull; Active 24/7
              </span>
            </div>
            <span className="go"><Icon name="arrowRight" size={18} /></span>
          </div>

          <h3 className="card-title serif mt-8">Talk to Aura AI Companion</h3>
          <p className="card-sub">
            Empathetic, 24/7 confidential listener powered by Google Gemini. Chat comfortably in <strong>English, සිංහල, or Singlish</strong>.
          </p>

          <div className="bento-prompts col gap-6 mt-auto">
            <span className="bento-prompt-label">Quick conversation starters:</span>
            <div className="row flex-wrap gap-6">
              {[
                'Feeling overwhelmed by exams',
                'Help me calm racing thoughts',
                'Can’t sleep tonight'
              ].map((p, idx) => (
                <span
                  key={idx}
                  className="bento-prompt-chip"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePromptClick(p)
                  }}
                >
                  &ldquo;{p}&rdquo;
                </span>
              ))}
            </div>
          </div>

          <div className="bento-footer-strip mt-14">
            <span className="bento-chip">Google Gemini AI</span>
            <span className="bento-chip">Multilingual</span>
            <span className="bento-action-text">Start Chat &rarr;</span>
          </div>
        </button>

        {/* Card 3: Live 1-Minute 4-7-8 Breathing Circle (4 cols) */}
        <div className="card bento-card b-4 bento-breathing-card">
          <div className="row-between">
            <div className="row gap-8" style={{ alignItems: 'center' }}>
              <span className="tile tile-lg tile-success"><Icon name="wind" size={26} /></span>
              <span className="chip chip-success" style={{ fontWeight: 700 }}>Micro-Relaxation</span>
            </div>
            <button
              type="button"
              className="go"
              onClick={() => navigate('/resources')}
              aria-label="Open guided breathing resources"
            >
              <Icon name="arrowRight" size={18} />
            </button>
          </div>

          <h3 className="card-title serif mt-8">1-Minute Calming Breath</h3>
          <p className="card-sub">
            Soothe your autonomic nervous system with the clinically proven 4-7-8 rhythmic breathing technique.
          </p>

          <div className="bento-breathing-interactive mt-auto">
            <div
              className={`breathing-circle breathing-${breathingPhase.toLowerCase()} ${breathingActive ? 'active' : ''}`}
            >
              <span className="breathing-phase-text">{breathingActive ? breathingPhase : 'Relax'}</span>
              <span className="breathing-seconds-text">{breathingActive ? `${breathingSeconds}s` : '4-7-8'}</span>
            </div>

            <button
              type="button"
              className={`btn btn-sm ${breathingActive ? 'btn-soft' : 'btn-primary'}`}
              onClick={() => setBreathingActive(!breathingActive)}
              style={{ marginTop: 12, width: '100%', maxWidth: '200px' }}
            >
              <Icon name={breathingActive ? 'pause' : 'play'} size={14} />
              {breathingActive ? 'Pause Breath' : 'Start 1-Min Cycle'}
            </button>
          </div>

          <div className="bento-footer-strip mt-14">
            <span className="bento-chip">4-7-8 Rhythm</span>
            <button
              type="button"
              className="bento-action-btn"
              onClick={() => navigate('/resources')}
            >
              Explore Audio &rarr;
            </button>
          </div>
        </div>

        {/* Card 4: Book a Counseling Session (4 cols) */}
        <button
          type="button"
          className="card card-interactive bento-card b-4"
          onClick={() => navigate('/booking')}
        >
          <div className="row-between">
            <div className="row gap-8" style={{ alignItems: 'center' }}>
              <span className="tile tile-lg tile-rose"><Icon name="calendar" size={26} /></span>
              <span className="chip" style={{ background: 'color-mix(in srgb, var(--rose) 18%, transparent)', color: 'var(--rose-ink, #c2410c)', fontWeight: 700 }}>1-on-1 Sessions</span>
            </div>
            <span className="go"><Icon name="arrowRight" size={18} /></span>
          </div>

          <h3 className="card-title serif mt-8">Professional Counseling</h3>
          <p className="card-sub">
            Schedule private, 1-on-1 sessions with licensed university counselors and psychologists in person or virtually.
          </p>

          <div className="bento-features-list mt-auto">
            <div className="bento-feat-item"><Icon name="check" size={14} /> 100% Confidential Care</div>
            <div className="bento-feat-item"><Icon name="check" size={14} /> Zero Cost for Students</div>
            <div className="bento-feat-item"><Icon name="check" size={14} /> Flexible Time Slots</div>
          </div>

          <div className="bento-footer-strip mt-14">
            <span className="bento-chip">Licensed Staff</span>
            <span className="bento-action-text">Schedule Session &rarr;</span>
          </div>
        </button>

        {/* Card 5: Anonymous Peer Support (4 cols) */}
        <button
          type="button"
          className="card card-interactive bento-card b-4"
          onClick={() => navigate('/anonymous-chat')}
        >
          <div className="row-between">
            <div className="row gap-8" style={{ alignItems: 'center' }}>
              <span className="tile tile-lg tile-sky"><Icon name="users" size={26} /></span>
              <span className="chip" style={{ background: 'color-mix(in srgb, var(--sky) 18%, transparent)', color: 'var(--sky-ink, #0369a1)', fontWeight: 700 }}>Encrypted Peer Space</span>
            </div>
            <span className="go"><Icon name="arrowRight" size={18} /></span>
          </div>

          <h3 className="card-title serif mt-8">Anonymous Peer Space</h3>
          <p className="card-sub">
            Share what&rsquo;s on your mind safely with fellow students or reach staff privately under an encrypted alias.
          </p>

          <div className="bento-features-list mt-auto">
            <div className="bento-feat-item"><Icon name="shield" size={14} /> Zero Identity Disclosed</div>
            <div className="bento-feat-item"><Icon name="heart" size={14} /> Compassionate Community</div>
            <div className="bento-feat-item"><Icon name="lock" size={14} /> Private Moderated Space</div>
          </div>

          <div className="bento-footer-strip mt-14">
            <span className="bento-chip">Safe Alias</span>
            <span className="bento-action-text">Join Peer Space &rarr;</span>
          </div>
        </button>
      </div>

      {/* ----------------- Daily Mindful Reflection ----------------- */}
      <section className="reminder rise rise-4 mt-56 mb-48">
        <div className="reminder-header">
          <Icon name="sunrise" size={28} />
          <cite>MindSpace Daily Reflection</cite>
        </div>

        <blockquote>&ldquo;{REMINDERS[reminderIdx]}&rdquo;</blockquote>

        <div className="reminder-actions">
          <button
            type="button"
            className="btn btn-soft btn-sm"
            onClick={() => navigate('/resources')}
          >
            <Icon name="wind" size={15} /> Take a mindful breath
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setReminderIdx((prev) => (prev + 1) % REMINDERS.length)}
          >
            <Icon name="refresh" size={14} /> Another thought
          </button>
        </div>
      </section>

      {/* ----------------- Emergency Helplines Safety Net ----------------- */}
      <section className="helpline-section mt-56 rise rise-5">
        <div className="helpline-header">
          <Icon name="phone" size={20} />
          <div>
            <h4 className="helpline-title">Student Wellbeing &amp; Crisis Support Lines</h4>
            <p className="small muted" style={{ margin: 0 }}>
              Free, confidential help is available 24/7 if you or a friend are experiencing a crisis.
            </p>
          </div>
        </div>

        <div className="helpline-grid">
          <div className="helpline-card">
            <span className="helpline-num">1926</span>
            <span className="helpline-name">NIMH Mental Health Hotline</span>
            <span className="helpline-desc">24/7 Toll-Free National Mental Health Helpline</span>
            <a href="tel:1926" className="helpline-dial-btn">
              <Icon name="phone" size={14} /> Call 1926
            </a>
          </div>

          <div className="helpline-card">
            <span className="helpline-num">1990</span>
            <span className="helpline-name">Suwaseriya Emergency Service</span>
            <span className="helpline-desc">24/7 Emergency Ambulance Care</span>
            <a href="tel:1990" className="helpline-dial-btn">
              <Icon name="phone" size={14} /> Call 1990
            </a>
          </div>

          <div className="helpline-card">
            <span className="helpline-num">1333</span>
            <span className="helpline-name">CCCline Sri Lanka</span>
            <span className="helpline-desc">24/7 Toll-Free Crisis &amp; Emotional Counseling</span>
            <a href="tel:1333" className="helpline-dial-btn">
              <Icon name="phone" size={14} /> Call 1333
            </a>
          </div>
        </div>

        <p className="helpline-disclaimer">
          MindSpace is designed for student wellbeing support, emotional reflection, and non-emergency care. In acute medical or psychiatric crises, please contact 1926 or visit your nearest hospital emergency unit.
        </p>
      </section>
    </div>
  )
}
