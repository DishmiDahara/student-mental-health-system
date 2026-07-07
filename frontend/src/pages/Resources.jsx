import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Navbar from '../components/Navbar'

export default function Resources() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [activeArticle, setActiveArticle] = useState(null)
  const [lang, setLang] = useState('en')
  
  // Breathing Coach States
  const [breathingState, setBreathingState] = useState('Idle') // Idle, Inhale, Hold, Exhale
  const [breathTimer, setBreathTimer] = useState(0)
  const [breathIntervalId, setBreathIntervalId] = useState(null)
  const [audioEnabled, setAudioEnabled] = useState(true)

  const audioCtxRef = useRef(null)

  const categories = ['All', 'Stress', 'Anxiety', 'Sleep', 'Mindfulness']

  useEffect(() => {
    fetchResources()
    return () => {
      if (breathIntervalId) clearInterval(breathIntervalId)
    }
  }, [breathIntervalId])

  const fetchResources = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/resources`)
      setArticles(res.data)
    } catch (err) {
      console.error('Error fetching resources:', err)
    } finally {
      setLoading(false)
    }
  }

  // Breathing Guide Loop (Box Breathing: 4s Inhale, 4s Hold, 4s Exhale, 4s Hold)
  const startBreathing = () => {
    if (breathingState !== 'Idle') {
      // Stop
      clearInterval(breathIntervalId)
      setBreathIntervalId(null)
      setBreathingState('Idle')
      setBreathTimer(0)
      return
    }

    setBreathingState('Inhale')
    setBreathTimer(4)

    const interval = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev <= 1) {
          // Switch state
          setBreathingState((currState) => {
            if (currState === 'Inhale') {
              return 'Hold'
            } else if (currState === 'Hold') {
              return 'Exhale'
            } else if (currState === 'Exhale') {
              return 'Rest'
            } else {
              return 'Inhale'
            }
          })
          return 4
        }
        return prev - 1
      })
    }, 1000)

    setBreathIntervalId(interval)
  }

  const getAudioCtx = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
      return audioCtxRef.current
    } catch(e) {
      console.error('AudioContext access failed:', e)
      return null
    }
  }

  const playBreathingChime = (freq) => {
    if (!audioEnabled) return
    try {
      const ctx = getAudioCtx()
      if (!ctx) return

      const playOsc = (f, gainValue, decayTime) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(f, ctx.currentTime)
        gain.gain.setValueAtTime(gainValue, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decayTime)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + decayTime)
      }

      playOsc(freq, 0.12, 2.5)
      playOsc(freq * 1.5, 0.04, 1.5)
      playOsc(freq * 2.0, 0.02, 1.0)
    } catch(e) {}
  }

  const speakInstruction = (text) => {
    if (!audioEnabled) return
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.8
        utterance.pitch = 1.0
        
        const voices = window.speechSynthesis.getVoices()
        const voice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) || 
                      voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
                      voices.find(v => v.lang.startsWith('en'))
        if (voice) {
          utterance.voice = voice
        }
        window.speechSynthesis.speak(utterance)
      }
    } catch(e) {}
  }

  // Audio guide trigger
  useEffect(() => {
    if (breathingState === 'Idle') {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel()
        }
      } catch(e) {}
      return
    }

    if (!audioEnabled) {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel()
        }
      } catch(e) {}
      return
    }

    let freq = 440
    let speechText = ''

    if (breathingState === 'Inhale') {
      freq = 523.25 // C5
      speechText = 'Breathe in'
    } else if (breathingState === 'Hold') {
      freq = 587.33 // D5
      speechText = 'Hold'
    } else if (breathingState === 'Exhale') {
      freq = 392.00 // G4
      speechText = 'Breathe out'
    } else if (breathingState === 'Rest') {
      freq = 329.63 // E4
      speechText = 'Rest'
    }

    playBreathingChime(freq)
    speakInstruction(speechText)
  }, [breathingState, audioEnabled])

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel()
        }
      } catch(e) {}
    }
  }, [])

  const filteredArticles = selectedCategory === 'All'
    ? articles.filter(a => (a.lang || 'en') === lang)
    : articles.filter(a => a.category === selectedCategory && (a.lang || 'en') === lang)

  // CSS for breathing coach animation scaling
  const getCircleStyle = () => {
    let scale = 1
    let bg = 'rgba(79, 70, 229, 0.2)'
    let border = '3px solid #4f46e5'
    
    if (breathingState === 'Inhale') {
      scale = 1.4
      bg = 'rgba(79, 70, 229, 0.4)'
      border = '3px solid #4f46e5'
    } else if (breathingState === 'Hold') {
      scale = 1.4
      bg = 'rgba(16, 185, 129, 0.4)'
      border = '3px solid #10b981'
    } else if (breathingState === 'Exhale') {
      scale = 1.0
      bg = 'rgba(239, 68, 68, 0.4)'
      border = '3px solid #ef4444'
    } else if (breathingState === 'Rest') {
      scale = 1.0
      bg = 'rgba(245, 158, 11, 0.4)'
      border = '3px solid #f59e0b'
    }

    return {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      background: bg,
      border: border,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '0 auto 20px',
      transform: `scale(${scale})`,
      transition: 'transform 4s linear, background 0.5s ease, border 0.5s ease',
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', paddingBottom: '60px' }}>
      
      {/* Navbar */}
      <Navbar />

      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Breathing Exercise Coach Card */}
        <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '24px', padding: '32px', color: 'white', marginBottom: '40px', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '30px' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '12px' }}>🧘 Interactive Breathing Coach</h2>
            <p style={{ opacity: 0.9, lineHeight: '1.6', fontSize: '15px' }}>
              Need a moment to calm down? Box breathing is a simple technique used by athletes and professionals to reduce stress and anxiety. Let our visual guide help you find your focus.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px' }}>
              <button 
                onClick={() => {
                  try {
                    const ctx = getAudioCtx()
                    if (ctx && ctx.state === 'suspended') {
                      ctx.resume()
                    }
                  } catch(e) {}
                  startBreathing();
                }} 
                style={{ padding: '12px 24px', background: 'white', color: '#4f46e5', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}
              >
                {breathingState === 'Idle' ? '⚡ Start Box Breathing' : '⏹️ Stop Coach'}
              </button>

              <button 
                onClick={() => setAudioEnabled(prev => !prev)}
                style={{ 
                  padding: '12px 18px', 
                  background: 'rgba(255,255,255,0.15)', 
                  color: 'white', 
                  border: '1px solid rgba(255,255,255,0.3)', 
                  borderRadius: '12px', 
                  fontSize: '15px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s' 
                }}
              >
                {audioEnabled ? '🔊 Sound On' : '🔇 Muted'}
              </button>
            </div>
          </div>

          <div style={{ flex: '1 1 200px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', width: '220px' }}>
              <div style={getCircleStyle()}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {breathingState === 'Idle' ? '😴' : breathTimer}
                </span>
                <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>
                  {breathingState}
                </span>
              </div>
              <p style={{ fontSize: '13px', opacity: 0.8 }}>
                {breathingState === 'Idle' && 'Press Start to begin'}
                {breathingState === 'Inhale' && 'Breathe in slowly...'}
                {breathingState === 'Hold' && 'Hold your breath...'}
                {breathingState === 'Exhale' && 'Release gently...'}
                {breathingState === 'Rest' && 'Hold empty...'}
              </p>
            </div>
          </div>
        </div>

        {/* Resources Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ color: '#1f2937', margin: 0 }}>📚 Mental Health Resources</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Curated articles and tips for your mental well-being</p>
          </div>

          {/* Language Switcher */}
          <div style={{ display: 'flex', background: '#4f46e5', borderRadius: '10px', padding: '4px', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.15)' }}>
            <button 
              onClick={() => setLang('en')} 
              style={{ 
                padding: '6px 14px', 
                background: lang === 'en' ? 'white' : 'transparent', 
                color: lang === 'en' ? '#4f46e5' : 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontSize: '12px', 
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              English
            </button>
            <button 
              onClick={() => setLang('si')} 
              style={{ 
                padding: '6px 14px', 
                background: lang === 'si' ? 'white' : 'transparent', 
                color: lang === 'si' ? '#4f46e5' : 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontSize: '12px', 
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              සිංහල
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                background: selectedCategory === cat ? '#4f46e5' : 'white',
                color: selectedCategory === cat ? 'white' : '#4b5563',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>⏳ Loading articles...</div>
        ) : filteredArticles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px', color: '#6b7280' }}>
            No articles found in this category.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {filteredArticles.map(art => (
              <div
                key={art._id}
                onClick={() => setActiveArticle(art)}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  border: '1px solid #f3f4f6',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <div>
                  <span style={{
                    background: art.category === 'Stress' ? '#fee2e2' : art.category === 'Anxiety' ? '#fef3c7' : art.category === 'Sleep' ? '#dbeafe' : '#d1fae5',
                    color: art.category === 'Stress' ? '#991b1b' : art.category === 'Anxiety' ? '#92400e' : art.category === 'Sleep' ? '#1e40af' : '#065f46',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {art.category}
                  </span>
                  <h3 style={{ color: '#1f2937', fontSize: '18px', margin: '14px 0 8px', lineHeight: '1.4' }}>{art.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {art.content}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>👤 {art.author}</span>
                  <span style={{ color: '#4f46e5', fontSize: '12px', fontWeight: 'bold' }}>⏱️ {art.readTime} min read</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', maxWidth: '650px', width: '100%', maxHeight: '80vh', overflowY: 'auto', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative' }}>
            
            <button
              onClick={() => setActiveArticle(null)}
              style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', background: '#f3f4f6', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px' }}
            >
              ✕
            </button>

            <span style={{
              background: activeArticle.category === 'Stress' ? '#fee2e2' : activeArticle.category === 'Anxiety' ? '#fef3c7' : activeArticle.category === 'Sleep' ? '#dbeafe' : '#d1fae5',
              color: activeArticle.category === 'Stress' ? '#991b1b' : activeArticle.category === 'Anxiety' ? '#92400e' : activeArticle.category === 'Sleep' ? '#1e40af' : '#065f46',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {activeArticle.category}
            </span>

            <h2 style={{ color: '#1f2937', marginTop: '16px', marginBottom: '8px', fontSize: '24px' }}>{activeArticle.title}</h2>
            <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '24px' }}>
              Written by <strong>{activeArticle.author}</strong> • {activeArticle.readTime} min read
            </div>

            <div style={{ color: '#374151', fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
              {activeArticle.content}
            </div>

            <div style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setActiveArticle(null)}
                style={{ padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Close Article
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
