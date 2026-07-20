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
      <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h3>Loading MindSpace Dashboard...</h3>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', paddingBottom: '60px' }}>
      
      {/* Navbar */}
      <Navbar />

      <div style={{ padding: '40px 32px', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Urgent Support Message Banner */}
        {supportMessage && (
          <div 
            onClick={() => navigate('/anonymous-chat', { state: { defaultTab: 'admin' } })}
            style={{ 
              background: 'linear-gradient(135deg, #fee2e2, #fecaca)', 
              borderLeft: '6px solid #ef4444', 
              borderRadius: '16px', 
              padding: '20px', 
              marginBottom: '24px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
              transition: 'transform 0.2s',
              flexWrap: 'wrap',
              gap: '16px'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ flex: '1 1 300px' }}>
              <span style={{ fontSize: '11px', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Urgent Advisor Message</span>
              <h4 style={{ margin: '8px 0 4px', color: '#7f1d1d', fontSize: '16.5px', fontWeight: 'bold' }}>Your counselor initiated a private live support session:</h4>
              <p style={{ margin: 0, fontSize: '14.5px', color: '#991b1b', fontStyle: 'italic', fontWeight: '500' }}>
                "{supportMessage.text}"
              </p>
            </div>
            <button 
              style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 2px 6px rgba(239, 68, 68, 0.2)' }}
            >
              Reply Immediately 💬
            </button>
          </div>
        )}

        {/* Custom Admin Recommendation Banner */}
        {customRec && (customRec.game || customRec.activity) && (
          <div style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', borderLeft: '6px solid #4f46e5', borderRadius: '16px', padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <span style={{ fontSize: '11px', background: '#4f46e5', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Advisor Custom Suggestion</span>
              <h4 style={{ margin: '8px 0 4px', color: '#1e1b4b', fontSize: '16px' }}>Your counselor recommended a relaxation exercise:</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#312e81', fontStyle: 'italic' }}>
                "{customRec.activity || 'Take some time out to pop bubbles and calm your thoughts.'}"
              </p>
              {customRec.game && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#1e1b4b' }}>
                  Recommended Game: <strong>{getGameLabel(customRec.game)}</strong>
                </div>
              )}
            </div>
            {customRec.game && (
              <button 
                onClick={() => navigate('/mood')}
                style={{ padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                Play Game
              </button>
            )}
          </div>
        )}


        <h2 style={{ color: '#1f2937', marginBottom: '8px', fontSize: '28px' }}>Welcome back, {name} 👋</h2>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>How are you feeling today? Check out the tools below for support.</p>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          
          <div onClick={() => navigate('/mood')} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '28px', borderRadius: '16px', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)', transition: 'transform 0.2s' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>😊</div>
            <h3 style={{ marginBottom: '6px' }}>Mood Tracker</h3>
            <p style={{ opacity: 0.85, fontSize: '14px' }}>Track your daily emotions and play relaxation games</p>
          </div>

          <div onClick={() => navigate('/booking')} style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)', padding: '28px', borderRadius: '16px', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(240, 147, 251, 0.2)', transition: 'transform 0.2s' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📅</div>
            <h3 style={{ marginBottom: '6px' }}>Book Session</h3>
            <p style={{ opacity: 0.85, fontSize: '14px' }}>Schedule a private counselling session</p>
          </div>

          <div onClick={() => navigate('/chat')} style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)', padding: '28px', borderRadius: '16px', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 172, 254, 0.2)', transition: 'transform 0.2s' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
            <h3 style={{ marginBottom: '6px' }}>AI Chatbot Aura</h3>
            <p style={{ opacity: 0.85, fontSize: '14px' }}>Talk to our empathetic AI assistant 24/7</p>
          </div>

          <div onClick={() => navigate('/resources')} style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)', padding: '28px', borderRadius: '16px', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(67, 233, 123, 0.2)', transition: 'transform 0.2s' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📚</div>
            <h3 style={{ marginBottom: '6px' }}>Resources & Breath</h3>
            <p style={{ opacity: 0.85, fontSize: '14px' }}>Mental health articles & breathing guide</p>
          </div>

        </div>

        {/* Quote */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', borderLeft: '4px solid #4f46e5', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <p style={{ color: '#4f46e5', fontStyle: 'italic', fontSize: '16.5px', lineHeight: '1.5', margin: '0 0 10px 0' }}>"{getDailyReminder()}"</p>
          <p style={{ color: '#9ca3af', margin: 0, fontSize: '13.5px', fontWeight: '500' }}>— Daily Reminder —      {getFormattedDate()}</p>
        </div>

      </div>
    </div>
  )
}