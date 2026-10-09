import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Navbar from '../components/Navbar'

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
  }, [navigate])

  const fetchProfileAndData = async () => {
    try {
      // 1. Fetch latest user profile details (includes recommendations, status updates)
      const profileRes = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(profileRes.data)
      
      // Update local storage user details
      localStorage.setItem('user', JSON.stringify(profileRes.data))
    } catch (err) {
      console.error(err)
      // If deactivated or invalid token, log out
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
      // Find the latest message sent by counselor or admin
      const latestSupportMsg = res.data.slice().reverse().find(msg => msg.sender?.role === 'counsellor' || msg.sender?.role === 'admin')
      if (latestSupportMsg) {
        setSupportMessage(latestSupportMsg)
      }
    } catch (err) {
      console.error('Error checking support messages:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const name = user ? user.name.split(' ')[0] : 'Student'
  const isAdmin = user && (user.role === 'admin' || user.role === 'counsellor')
  const customRec = user?.customRecommendation

  const getGameLabel = (code) => {
    if (code === 'bubbles') return 'Bubble Wrap Popper 🫧'
    if (code === 'memory') return 'Zen Memory Match 🧩'
    if (code === 'gratitude') return 'Gratitude Garden 🌸'
    return ''
  }

  const getDailyReminder = () => {
    const reminders = [
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
    ];
    
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const index = dayOfYear % reminders.length;
    return reminders[index];
  }

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }


  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Loading MindSpace Glass Dashboard...</h3>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px', position: 'relative' }}>
      
      {/* Navbar */}
      <Navbar />

      <div style={{ padding: '40px 32px', maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* Urgent Support Message Banner */}
        {supportMessage && (
          <div 
            onClick={() => navigate('/anonymous-chat', { state: { defaultTab: 'admin' } })}
            style={{ 
              background: 'rgba(239, 68, 68, 0.15)', 
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(239, 68, 68, 0.4)', 
              borderLeft: '6px solid #ef4444', 
              borderRadius: '20px', 
              padding: '22px', 
              marginBottom: '28px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              flexWrap: 'wrap',
              gap: '16px'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ flex: '1 1 300px' }}>
              <span style={{ fontSize: '11px', background: '#ef4444', color: 'white', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Urgent Advisor Message</span>
              <h4 style={{ margin: '10px 0 6px', color: '#fca5a5', fontSize: '17px', fontWeight: 'bold' }}>Your counselor initiated a private live support session:</h4>
              <p style={{ margin: 0, fontSize: '15px', color: '#fecaca', fontStyle: 'italic', fontWeight: '500' }}>
                "{supportMessage.text}"
              </p>
            </div>
            <button 
              style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)' }}
            >
              Reply Immediately 💬
            </button>
          </div>
        )}

        {/* Custom Admin Recommendation Banner */}
        {customRec && (customRec.game || customRec.activity) && (
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.15)', 
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(129, 140, 248, 0.35)', 
            borderLeft: '6px solid #6366f1', 
            borderRadius: '20px', 
            padding: '22px', 
            marginBottom: '28px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '16px',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.2)' 
          }}>
            <div style={{ flex: '1 1 300px' }}>
              <span style={{ fontSize: '11px', background: '#6366f1', color: 'white', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Advisor Custom Suggestion</span>
              <h4 style={{ margin: '10px 0 6px', color: '#e0e7ff', fontSize: '16.5px' }}>Your counselor recommended a relaxation exercise:</h4>
              <p style={{ margin: 0, fontSize: '14.5px', color: '#c7d2fe', fontStyle: 'italic' }}>
                "{customRec.activity || 'Take some time out to pop bubbles and calm your thoughts.'}"
              </p>
              {customRec.game && (
                <div style={{ marginTop: '10px', fontSize: '13.5px', color: '#a5b4fc' }}>
                  Recommended Game: <strong>{getGameLabel(customRec.game)}</strong>
                </div>
              )}
            </div>
            {customRec.game && (
              <button 
                onClick={() => navigate('/mood')}
                style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)' }}
              >
                Play Game 🌸
              </button>
            )}
          </div>
        )}

        {/* Hero Welcome Header */}
        <div style={{ marginBottom: '36px' }}>
          <h2 style={{ 
            fontSize: '34px', 
            fontWeight: '800', 
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #ffffff 0%, #c084fc 50%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 10px rgba(192, 132, 252, 0.25))'
          }}>
            Welcome back, {name} 👋
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16.5px', margin: 0 }}>
            How are you feeling today? Check out the tools below for support.
          </p>
        </div>

        {/* Glassmorphism Action Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '22px', marginBottom: '36px' }}>
          
          {/* Card 1: Mood Tracker */}
          <div 
            onClick={() => navigate('/mood')} 
            className="glass-card"
            style={{ 
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.25), rgba(126, 34, 206, 0.35))', 
              padding: '30px 24px', 
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              background: 'rgba(168, 85, 247, 0.3)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '32px', 
              marginBottom: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 16px rgba(168, 85, 247, 0.3)'
            }}>
              😊
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#ffffff', fontWeight: '700' }}>Mood Tracker</h3>
            <p style={{ margin: 0, color: '#e9d5ff', fontSize: '14px', lineHeight: '1.5', opacity: 0.9 }}>
              Track your daily emotions and play relaxation games
            </p>
          </div>

          {/* Card 2: Book Session */}
          <div 
            onClick={() => navigate('/booking')} 
            className="glass-card"
            style={{ 
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(219, 39, 119, 0.35))', 
              padding: '30px 24px', 
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              background: 'rgba(244, 114, 182, 0.3)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '32px', 
              marginBottom: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 16px rgba(244, 114, 182, 0.3)'
            }}>
              📅
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#ffffff', fontWeight: '700' }}>Book Session</h3>
            <p style={{ margin: 0, color: '#fbcfe8', fontSize: '14px', lineHeight: '1.5', opacity: 0.9 }}>
              Schedule a private counselling session
            </p>
          </div>

          {/* Card 3: AI Chatbot Aura */}
          <div 
            onClick={() => navigate('/chat')} 
            className="glass-card"
            style={{ 
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(2, 132, 199, 0.35))', 
              padding: '30px 24px', 
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              background: 'rgba(56, 189, 248, 0.3)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '32px', 
              marginBottom: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 16px rgba(56, 189, 248, 0.3)'
            }}>
              💬
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#ffffff', fontWeight: '700' }}>AI Chatbot Aura</h3>
            <p style={{ margin: 0, color: '#bae6fd', fontSize: '14px', lineHeight: '1.5', opacity: 0.9 }}>
              Talk to our empathetic AI assistant 24/7
            </p>
          </div>

          {/* Card 4: Resources & Breath */}
          <div 
            onClick={() => navigate('/resources')} 
            className="glass-card"
            style={{ 
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(22, 163, 74, 0.35))', 
              padding: '30px 24px', 
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              background: 'rgba(74, 222, 128, 0.3)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '32px', 
              marginBottom: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 16px rgba(74, 222, 128, 0.3)'
            }}>
              📚
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#ffffff', fontWeight: '700' }}>Resources & Breath</h3>
            <p style={{ margin: 0, color: '#bbf7d0', fontSize: '14px', lineHeight: '1.5', opacity: 0.9 }}>
              Mental health articles & breathing guide
            </p>
          </div>

        </div>

        {/* Glass Daily Reminder Quote Box */}
        <div className="glass-container" style={{ 
          padding: '28px 32px', 
          borderLeft: '6px solid #c084fc', 
          position: 'relative',
          overflow: 'hidden'
        }}>
          <p style={{ 
            color: '#e9d5ff', 
            fontStyle: 'italic', 
            fontSize: '17.5px', 
            lineHeight: '1.6', 
            margin: '0 0 12px 0',
            fontWeight: '500' 
          }}>
            "{getDailyReminder()}"
          </p>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px', fontWeight: '600', letterSpacing: '0.3px' }}>
            — Daily Reminder — {getFormattedDate()}
          </p>
        </div>

      </div>
    </div>
  )
}