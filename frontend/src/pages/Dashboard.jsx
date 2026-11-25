import { useEffect, useState } from 'react'
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
  if (code === 'bubbles') return 'Bubble Wrap Popper'
  if (code === 'memory') return 'Zen Memory Match'
  if (code === 'gratitude') return 'Gratitude Garden'
  return ''
}

const getDailyReminder = () => {
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000)
  return REMINDERS[dayOfYear % REMINDERS.length]
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

  const fetchProfileAndData = async () => {
    try {
      // Latest profile (includes recommendations & status updates)
      const profileRes = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(profileRes.data)
      localStorage.setItem('user', JSON.stringify(profileRes.data))
    } catch (err) {
      console.error(err)
      // Deactivated account or invalid token → sign out
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
      const latestSupportMsg = res.data.slice().reverse().find(msg => msg.sender?.role === 'counsellor' || msg.sender?.role === 'admin')
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

  const name = user ? user.name.split(' ')[0] : 'there'
  const customRec = user?.customRecommendation

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 260, borderRadius: 30 }} />
        <div className="grid grid-3 mt-24">
          <div className="skeleton" style={{ height: 180 }} /><div className="skeleton" style={{ height: 180 }} /><div className="skeleton" style={{ height: 180 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* Urgent message from staff */}
      {supportMessage && (
        <button
          className="notice notice-danger rise"
          onClick={() => navigate('/anonymous-chat', { state: { defaultTab: 'admin' } })}
        >
          <span className="tile tile-danger"><Icon name="message" size={22} /></span>
          <span className="notice-body">
            <span className="chip chip-danger" style={{ marginBottom: 8 }}>Message from your counselor</span>
            <strong>Your counselor started a private support session</strong>
            <span className="notice-quote">&ldquo;{supportMessage.text}&rdquo;</span>
          </span>
          <span className="btn btn-danger btn-sm">Reply now <Icon name="arrowRight" size={16} /></span>
        </button>
      )}

      {/* Counselor recommendation */}
      {customRec && (customRec.game || customRec.activity) && (
        <div className="notice notice-primary rise">
          <span className="tile"><Icon name="heart" size={22} /></span>
          <span className="notice-body">
            <span className="chip chip-primary" style={{ marginBottom: 8 }}>Suggested by your counselor</span>
            <strong>A relaxation exercise, picked for you</strong>
            <span className="notice-quote">&ldquo;{customRec.activity || 'Take some time out to pop bubbles and calm your thoughts.'}&rdquo;</span>
            {customRec.game && <span className="small muted" style={{ marginTop: 6 }}>Recommended game: <strong style={{ color: 'var(--ink)' }}>{getGameLabel(customRec.game)}</strong></span>}
          </span>
          {customRec.game && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/mood')}>
              <Icon name="play" size={15} /> Play now
            </button>
          )}
        </div>
      )}

      {/* Hero */}
      <section className="hero rise rise-1">
        <div className="hero-art"><Horizon /></div>
        <div className="hero-body">
          <span className="eyebrow">{getFormattedDate()}</span>
          <h1 className="h-display">{getGreeting()},<br />{name}.</h1>
          <p className="lead">How are you feeling right now? A quick check-in helps you notice what&rsquo;s going on.</p>

          <div className="hero-moods" role="group" aria-label="Quick mood check-in">
            {[5, 4, 3, 2, 1].map(v => (
              <button key={v} className="hero-mood" onClick={() => navigate('/mood')} aria-label={MOOD_LABELS[v]}>
                <MoodFace value={v} size={46} />
                <span>{MOOD_LABELS[v]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Toolkit */}
      <div className="row-between mt-32 mb-16 rise rise-2">
        <h2 className="h-section">Your toolkit</h2>
      </div>

      <div className="bento rise rise-3">
        <button className="card card-interactive bento-card b-7" onClick={() => navigate('/mood')}>
          <div className="row-between">
            <span className="tile tile-lg tile-sun"><Icon name="smile" size={26} /></span>
            <span className="go"><Icon name="arrowRight" size={18} /></span>
          </div>
          <h3 className="card-title serif">Mood Tracker</h3>
          <p className="card-sub">Track your daily emotions, see your patterns and unwind with relaxation games.</p>
          <div className="bento-visual">
            {[5, 4, 3, 2, 1].map(v => <MoodFace key={v} value={v} size={34} muted={v !== 4} />)}
          </div>
        </button>

        <button className="card card-interactive bento-card b-5 bento-aura" onClick={() => navigate('/chat')}>
          <div className="row-between">
            <span className="tile tile-lg tile-dusk"><Icon name="feather" size={26} /></span>
            <span className="go"><Icon name="arrowRight" size={18} /></span>
          </div>
          <h3 className="card-title serif">Talk to Aura</h3>
          <p className="card-sub">An empathetic AI companion, available 24/7, in English and Sinhala.</p>
          <div className="bento-visual col gap-8" style={{ alignItems: 'flex-start' }}>
            <span className="bubble">I&rsquo;m here whenever you want to talk.</span>
            <span className="bubble bubble-typing"><i /><i /><i /></span>
          </div>
        </button>

        <button className="card card-interactive bento-card b-4" onClick={() => navigate('/booking')}>
          <div className="row-between">
            <span className="tile tile-lg tile-rose"><Icon name="calendar" size={26} /></span>
            <span className="go"><Icon name="arrowRight" size={18} /></span>
          </div>
          <h3 className="card-title serif">Book a session</h3>
          <p className="card-sub">Schedule a private counselling session with a professional.</p>
        </button>

        <button className="card card-interactive bento-card b-4" onClick={() => navigate('/resources')}>
          <div className="row-between">
            <span className="tile tile-lg tile-success"><Icon name="wind" size={26} /></span>
            <span className="go"><Icon name="arrowRight" size={18} /></span>
          </div>
          <h3 className="card-title serif">Resources &amp; breathing</h3>
          <p className="card-sub">Helpful articles and a guided breathing coach for calmer moments.</p>
        </button>

        <button className="card card-interactive bento-card b-4" onClick={() => navigate('/anonymous-chat')}>
          <div className="row-between">
            <span className="tile tile-lg tile-sky"><Icon name="users" size={26} /></span>
            <span className="go"><Icon name="arrowRight" size={18} /></span>
          </div>
          <h3 className="card-title serif">Peer support</h3>
          <p className="card-sub">Chat anonymously with a supportive peer, or reach our staff.</p>
        </button>
      </div>

      {/* Daily reminder */}
      <section className="reminder rise rise-4">
        <Icon name="sunrise" size={26} />
        <blockquote>{getDailyReminder()}</blockquote>
        <cite>Today&rsquo;s reminder</cite>
        <button className="btn btn-soft btn-sm" onClick={() => navigate('/resources')}>
          <Icon name="wind" size={16} /> Take a mindful breath
        </button>
      </section>
    </div>
  )
}
