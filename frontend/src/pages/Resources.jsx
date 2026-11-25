import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Icon from '../components/ui/Icon'
import { Orb } from '../components/ui/Brand'

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

  const categoryTranslations = {
    en: {
      All: 'All',
      Stress: 'Stress',
      Anxiety: 'Anxiety',
      Sleep: 'Sleep',
      Mindfulness: 'Mindfulness'
    },
    si: {
      All: 'සියල්ල',
      Stress: 'මානසික ආතතිය',
      Anxiety: 'කාංසාව',
      Sleep: 'නින්ද',
      Mindfulness: 'සතිමත්භාවය'
    }
  }

  const articlePairs = {
    '5 Steps to Manage Academic Stress': 'අධ්‍යයන ආතතිය පාලනයට පියවර 5ක්',
    'අධ්‍යයන ආතතිය පාලනයට පියවර 5ක්': '5 Steps to Manage Academic Stress',
    'Understanding and Calming Test Anxiety': 'විභාග කාංසාව තේරුම් ගැනීම සහ එය සන්සුන් කර ගැනීම',
    'විභාග කාංසාව තේරුම් ගැනීම සහ එය සන්සුන් කර ගැනීම': 'Understanding and Calming Test Anxiety',
    'How to Sleep Better During Exam Weeks': 'විභාග සතිවලදී වඩා හොඳින් නිදා ගන්නේ කෙසේද',
    'විභාග සතිවලදී වඩා හොඳින් නිදා ගන්නේ කෙසේද': 'How to Sleep Better During Exam Weeks',
    'Beginners Guide to Mindfulness Meditation': 'මනෝභාවය සන්සුන් කිරීමේ භාවනාව (Mindfulness) පිළිබඳ ආධුනික අත්පොත',
    'මනෝභාවය සන්සුන් කිරීමේ භාවනාව (Mindfulness) පිළිබඳ ආධුනික අත්පොත': 'Beginners Guide to Mindfulness Meditation',
    'WHO Guidelines: Doing What Matters in Times of Stress': 'WHO මාර්ගෝපදේශ: මානසික ආතතිය පවතින අවස්ථාවල වැදගත් දේ කිරීම',
    'WHO මාර්ගෝපදේශ: මානසික ආතතිය පවතින අවස්ථාවල වැදගත් දේ කිරීම': 'WHO Guidelines: Doing What Matters in Times of Stress',
    'Mayo Clinic: Relaxation Techniques for Stress Relief': 'Mayo Clinic: මානසික ආතතිය අඩු කරගැනීමේ ලිහිල් කිරීමේ ක්‍රම',
    'Mayo Clinic: මානසික ආතතිය අඩු කරගැනීමේ ලිහිල් කිරීමේ ක්‍රම': 'Mayo Clinic: Relaxation Techniques for Stress Relief',
    'APA Science-Based Strategies to Manage Daily Stress': 'APA: එදිනෙදා මානසික ආතතිය පාලනයට විද්‍යාත්මක ක්‍රමවේද',
    'APA: එදිනෙදා මානසික ආතතිය පාලනයට විද්‍යාත්මක ක්‍රමවේද': 'APA Science-Based Strategies to Manage Daily Stress',
    'NHS Every Mind Matters: Tips for Better Mental Wellbeing': 'NHS Every Mind Matters: යහපත් මානසික සෞඛ්‍යයක් සඳහා උපදෙස්',
    'NHS Every Mind Matters: යහපත් මානසික සෞඛ්‍යයක් සඳහා උපදෙස්': 'NHS Every Mind Matters: Tips for Better Mental Wellbeing'
  }

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

  const tone = (cat) => ({ Stress: 'rose', Anxiety: 'sun', Sleep: 'sky', Mindfulness: 'success' }[cat] || 'primary')
  const orbScale = breathingState === 'Inhale' || breathingState === 'Hold' ? 1.22 : 1
  const phaseHint = {
    Idle: 'Press start to begin',
    Inhale: 'Breathe in slowly…',
    Hold: 'Hold your breath…',
    Exhale: 'Release gently…',
    Rest: 'Rest, hold empty…'
  }[breathingState]
  const si = lang === 'si'

  return (
    <div className="page">
      {/* Breathing coach */}
      <section className="coach rise">
        <div className="coach-copy">
          <span className="eyebrow">Guided practice</span>
          <h1 className="h-title">Interactive breathing coach</h1>
          <p className="lead mt-8" style={{ fontSize: 16 }}>
            Need a moment to calm down? Box breathing (4 seconds in, hold, out, hold) is a simple technique used to ease stress and anxiety. Follow the orb.
          </p>
          <div className="row-wrap mt-24">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => {
                try {
                  const ctx = getAudioCtx()
                  if (ctx && ctx.state === 'suspended') ctx.resume()
                } catch (e) { /* ignore */ }
                startBreathing()
              }}
            >
              <Icon name={breathingState === 'Idle' ? 'play' : 'pause'} size={18} />
              {breathingState === 'Idle' ? 'Start box breathing' : 'Stop coach'}
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => setAudioEnabled(prev => !prev)} aria-pressed={audioEnabled}>
              <Icon name={audioEnabled ? 'volume' : 'volumeOff'} size={18} />
              {audioEnabled ? 'Sound on' : 'Muted'}
            </button>
          </div>
        </div>
        <div className="coach-orb">
          <Orb size={230} scale={orbScale} duration={breathingState === 'Idle' ? 0.6 : 4}>
            <div>
              <div className="serif" style={{ fontSize: 44, lineHeight: 1 }}>{breathingState === 'Idle' ? <Icon name="wind" size={36} /> : breathTimer}</div>
              <div style={{ fontSize: 11.5, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginTop: 6, opacity: 0.92 }}>{breathingState}</div>
            </div>
          </Orb>
          <p className="small muted center" style={{ minHeight: 22 }}>{phaseHint}</p>
        </div>
      </section>

      {/* Title + language */}
      <div className="page-head mt-32">
        <div>
          <span className="eyebrow">Library</span>
          <h2 className="h-title">{si ? 'මානසික සෞඛ්‍ය සම්පත්' : 'Mental health resources'}</h2>
          <p className="muted mt-8">{si ? 'ඔබේ මානසික යහපැවැත්ම සඳහා තෝරාගත් ලිපි සහ උපදෙස්' : 'Curated articles and tips for your well-being'}</p>
        </div>
        <div className="seg" role="group" aria-label="Language">
          <button className={`seg-btn ${lang === 'en' ? 'is-active' : ''}`} onClick={() => setLang('en')}>English</button>
          <button className={`seg-btn ${lang === 'si' ? 'is-active' : ''}`} onClick={() => setLang('si')}>සිංහල</button>
        </div>
      </div>

      <div className="tabs-scroll" role="tablist">
        {categories.map(cat => (
          <button key={cat} role="tab" aria-selected={selectedCategory === cat} className={`tab ${selectedCategory === cat ? 'is-active' : ''}`} onClick={() => setSelectedCategory(cat)}>
            {categoryTranslations[lang]?.[cat] || cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-auto">{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 22 }} />)}</div>
      ) : filteredArticles.length === 0 ? (
        <div className="empty">
          <div className="tile tile-lg" style={{ margin: '0 auto 14px' }}><Icon name="book" size={26} /></div>
          {si ? 'මෙම කාණ්ඩය යටතේ ලිපි කිසිවක් හමු නොවීය.' : 'No articles found in this category.'}
        </div>
      ) : (
        <div className="grid grid-auto">
          {filteredArticles.map(art => (
            <article key={art._id} className="card card-interactive article" onClick={() => setActiveArticle(art)} tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') setActiveArticle(art) }}>
              <span className={`chip chip-${tone(art.category)}`} style={{ alignSelf: 'flex-start' }}>
                {categoryTranslations[lang]?.[art.category] || art.category}
              </span>
              <h3 className="article-title">{art.title}</h3>
              <p className="article-excerpt">{art.content}</p>
              <div className="row-between article-meta">
                <span className="small muted">{si ? 'කර්තෘ: ' : 'By '}{art.author}</span>
                <span className="small strong" style={{ color: 'var(--primary)' }}>
                  <Icon name="clock" size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                  {art.readTime} {si ? 'min කියවීම' : 'min read'}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Article reader */}
      {activeArticle && (
        <div className="overlay" onClick={() => setActiveArticle(null)}>
          <div className="modal modal-lg reader" onClick={e => e.stopPropagation()} role="dialog" aria-label={activeArticle.title}>
            <button className="modal-close" onClick={() => setActiveArticle(null)} aria-label="Close"><Icon name="x" size={18} /></button>

            <div className="row-wrap" style={{ paddingRight: 48 }}>
              <span className={`chip chip-${tone(activeArticle.category)}`}>{categoryTranslations[lang]?.[activeArticle.category] || activeArticle.category}</span>
              {articlePairs[activeArticle.title] && (
                <button
                  className="chip chip-outline"
                  onClick={() => {
                    const counterpart = articles.find(a => a.title === articlePairs[activeArticle.title])
                    if (counterpart) setActiveArticle(counterpart)
                  }}
                >
                  <Icon name="globe" size={13} /> {activeArticle.lang === 'si' ? 'Read in English' : 'සිංහලෙන් කියවන්න'}
                </button>
              )}
            </div>

            <h2 className="h-title mt-16" style={{ lineHeight: 1.25 }}>{activeArticle.title}</h2>
            <div className="small muted mt-8">
              {si ? 'කර්තෘ: ' : 'Written by '}<strong style={{ color: 'var(--ink-2)' }}>{activeArticle.author}</strong> · {activeArticle.readTime} {si ? 'min කියවීම' : 'min read'}
            </div>
            <hr className="divider" />
            <div className="reader-body">{activeArticle.content}</div>

            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 28 }}>
              <button className="btn btn-primary" onClick={() => setActiveArticle(null)}>{si ? 'ලිපිය වසන්න' : 'Close article'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
