import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import Icon from '../components/ui/Icon'
import { Orb } from '../components/ui/Brand'
import { API_BASE_URL } from '../config'
import { MarkdownRenderer } from '../components/AIChat/MarkdownRenderer'
import { ProviderStatus } from '../components/AIChat/ProviderStatus'

const CRISIS_HELPLINES = [
  { name: 'National Mental Health Helpline', number: '1926', note: '24/7 Toll-Free (NIMH Sri Lanka)', tel: '1926' },
  { name: 'Suwa Seriya Emergency Ambulance', number: '1990', note: '24/7 Free Pre-Hospital Emergency Care', tel: '1990' },
  { name: 'CCCline Emotional Support', number: '1333', note: '24/7 Free Crisis Counseling Hotline', tel: '1333' },
  { name: 'Sumithrayo Suicide Prevention', number: '011 269 6666', note: 'Daily 9:00 AM – 8:00 PM', tel: '+94112696666' }
]

export default function AIChatbot() {
  const location = useLocation()
  const [lang, setLang] = useState('en') // 'en' or 'si'
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState(location.state?.initialPrompt || '')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [activeProvider, setActiveProvider] = useState('gemini')
  const [conversationId, setConversationId] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true)
  const [showHelplineModal, setShowHelplineModal] = useState(false)
  const [speakingId, setSpeakingId] = useState(null)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  // Welcome greeting generator
  const getWelcomeMessage = useCallback((language) => ({
    id: 'welcome_greeting',
    text: language === 'en'
      ? "Hi there! I'm **Aura**, your MindSpace AI mental health and wellbeing companion. 🧠\n\nI'm powered by **Google Gemini** to listen with empathy, offer gentle coping options (like breathing or grounding), and help you reflect. You can chat with me in **English, සිංහල (Sinhala), or Singlish**.\n\n*How are you feeling right now?*"
      : "ආයුබෝවන්! මම **Aura**, ඔබේ MindSpace AI මානසික සුවතා සහකරු. 🧠\n\nමම **Google Gemini** තාක්ෂණයෙන් ඔබට සාවධානව සවන් දෙන්න, සිත සැහැල්ලු කරගන්නා ක්‍රම සහ මගපෙන්වීම ලබාදෙන්න සූදානම්. ඔබට **සිංහල, English, හෝ Singlish** භාෂාවෙන් මා සමඟ කතා කළ හැකියි.\n\n*අද දවසේ ඔබට කොහොමද? ඔබගේ සිතේ තියෙන දේ මා සමඟ බෙදාගන්න කැමතිද?*",
    isUser: false,
    provider: 'gemini',
    timestamp: new Date().toISOString()
  }), [])

  // Fetch persistent chat history from DB on mount
  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await axios.get(`${API_BASE_URL}/api/ai/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.data && res.data.history && res.data.history.length > 0) {
        const formatted = res.data.history.map(item => ({
          id: item._id || `${Date.now()}_${Math.random()}`,
          text: item.message,
          isUser: item.role === 'user',
          provider: item.provider || 'gemini',
          isCrisis: item.isCrisis || false,
          timestamp: item.timestamp
        }))
        setMessages(formatted)
        if (res.data.history[0]?.conversationId) {
          setConversationId(res.data.history[0].conversationId)
        }
      } else {
        setMessages([getWelcomeMessage(lang)])
      }
    } catch (err) {
      console.warn('[AIChatbot] Failed to load history:', err.message)
      setMessages([getWelcomeMessage(lang)])
    }
  }, [lang, getWelcomeMessage])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Send message to Gemini AI backend
  const handleSendMessage = async (textInput) => {
    const textToSend = typeof textInput === 'string' ? textInput : input
    if (!textToSend || !textToSend.trim() || loading) return

    const userText = textToSend.trim()
    const userMsgObj = {
      id: `user_${Date.now()}`,
      text: userText,
      isUser: true,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMsgObj])
    if (typeof textInput !== 'string') setInput('')
    setLoading(true)

    const token = localStorage.getItem('token')

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/ai/chat`,
        { message: userText, conversationId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const data = response.data
      if (data.conversationId) setConversationId(data.conversationId)
      if (data.provider) setActiveProvider(data.provider)

      const aiMsgObj = {
        id: `ai_${Date.now()}`,
        text: data.reply || "I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        provider: data.provider || 'gemini',
        isCrisis: data.isCrisis || false,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMsgObj])
    } catch (err) {
      console.error('[AIChatbot] Send message error:', err)
      const errorMsg = err.response?.data?.reply ||
        "I'm having a little trouble connecting to my AI service right now. Please take a gentle breath and try sending your message again."

      const errorMsgObj = {
        id: `err_${Date.now()}`,
        text: errorMsg,
        isUser: false,
        provider: 'gemini',
        isError: true,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMsgObj])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    handleSendMessage()
  }

  // Clear chat history permanently from DB and state
  const handleConfirmClear = async () => {
    setShowClearConfirm(false)
    const token = localStorage.getItem('token')

    try {
      if (token) {
        await axios.delete(`${API_BASE_URL}/api/ai/history`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (err) {
      console.warn('[AIChatbot] Clear history failed:', err.message)
    }

    setMessages([
      {
        id: `welcome_fresh_${Date.now()}`,
        text: lang === 'en'
          ? "Conversation history cleared. I'm right here whenever you'd like to talk. How can I support you now?"
          : "සංවාද ඉතිහාසය මකා දමන ලදී. මට ඔබට තවදුරටත් උපකාර කරන්නේ කෙසේද?",
        isUser: false,
        provider: 'gemini',
        timestamp: new Date().toISOString()
      }
    ])
    setConversationId(null)
  }

  // Voice Input (SpeechRecognition)
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = lang === 'si' ? 'si-LK' : 'en-US'

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      setIsListening(true)
      recognition.start()

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(prev => (prev ? `${prev} ${transcript}` : transcript))
        setIsListening(false)
      }

      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
    }
  }

  // Text-To-Speech with toggle
  const toggleSpeakText = (text, id) => {
    if (!('speechSynthesis' in window)) return

    if (speakingId === id) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }

    window.speechSynthesis.cancel()
    const clean = text.replace(/[*#_`]/g, '').replace(/https?:\/\/\S+/g, '')
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.lang = lang === 'si' ? 'si-LK' : 'en-US'
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)
    setSpeakingId(id)
    window.speechSynthesis.speak(utterance)
  }

  const prompts = lang === 'en'
    ? [
        { label: '📚 Exam Stress', text: "I'm feeling really stressed about upcoming exams and deadlines." },
        { label: '🌬️ 4-7-8 Breathing', text: "Can you guide me through a calming 4-7-8 breathing exercise?" },
        { label: '💭 Racing Mind', text: "My mind is racing and I can't seem to unwind right now." },
        { label: '🌊 Overwhelmed', text: "I feel overwhelmed and could use a gentle grounding exercise." }
      ]
    : [
        { label: '📚 විභාග ආතතිය', text: "විභාග පීඩනය නිසා මට ලොකු ආතතියක් දැනෙනවා." },
        { label: '🌬️ හුස්ම ගැනීමේ අභ්‍යාස', text: "සිත සන්සුන් කරගන්න හුස්ම ගැනීමේ ව්‍යායාමයක් මට කියාදෙන්න." },
        { label: '🌙 නින්ද නොයාම', text: "මට නින්ද යන්නේ නැහැ, මනස කලබලයි." },
        { label: '💭 සිත සන්සුන් කිරීම', text: "මගේ සිතේ පීඩනය අඩු කරගන්න උපදෙසක් දෙන්න." }
      ]

  return (
    <div className="chat-page">
      <section className="chat-card">
        {/* Header */}
        <header className="chat-head">
          <div className="row grow" style={{ minWidth: 0, gap: 14 }}>
            <div className="chat-avatar">
              <Orb size={54} scale={1}>
                <Icon name="feather" size={20} />
              </Orb>
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="row gap-8" style={{ alignItems: 'baseline' }}>
                <h1 className="serif" style={{ fontSize: 22, margin: 0 }}>Aura</h1>
                <span className="small muted">· Wellbeing Companion</span>
              </div>
              <div className="row gap-8 small muted" style={{ flexWrap: 'wrap', marginTop: 3 }}>
                <span className="row gap-4">
                  <span className="dot" style={{ color: 'var(--success)', width: 7, height: 7 }} />
                  Online · private
                </span>
                <ProviderStatus provider={activeProvider} />
              </div>
            </div>
          </div>

          <div className="row gap-8">
            <button
              className="btn btn-soft btn-sm"
              onClick={() => setShowHelplineModal(true)}
              style={{ color: 'var(--danger-fill)', borderColor: 'var(--danger-soft)' }}
              title="Emergency Helplines"
            >
              <Icon name="alert" size={14} /> Helplines
            </button>

            <div className="seg" role="group" aria-label="Language selection">
              <button
                className={`seg-btn ${lang === 'en' ? 'is-active' : ''}`}
                onClick={() => setLang('en')}
                style={{ minHeight: 34, padding: '0 12px' }}
              >
                EN
              </button>
              <button
                className={`seg-btn ${lang === 'si' ? 'is-active' : ''}`}
                onClick={() => setLang('si')}
                style={{ minHeight: 34, padding: '0 12px' }}
              >
                සිං
              </button>
            </div>

            <button
              className="icon-btn"
              onClick={() => setShowClearConfirm(true)}
              title="Clear chat history"
              aria-label="Clear chat history"
            >
              <Icon name="trash" size={18} />
            </button>
          </div>
        </header>

        {/* Privacy Notice Banner */}
        {showPrivacyNotice && (
          <div
            className="notice notice-primary"
            style={{
              margin: '12px 20px 0',
              padding: '10px 16px',
              borderRadius: 'var(--r-card)',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div className="row gap-8" style={{ minWidth: 0 }}>
              <Icon name="shield" size={16} />
              <span>
                <strong>Privacy Notice:</strong> Messages are securely processed by Google Gemini. MindSpace stores chat history strictly for your account continuity without sending personal mood logs or sleep profiles.
              </span>
            </div>
            <button
              onClick={() => setShowPrivacyNotice(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 4 }}
              aria-label="Dismiss privacy notice"
            >
              <Icon name="x" size={15} />
            </button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="chat-scroll">
          {messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`msg ${msg.isUser ? 'msg-user' : 'msg-ai'} ${msg.isCrisis ? 'msg-crisis' : ''}`}
            >
              {msg.isCrisis && (
                <div className="row gap-8 small strong" style={{ marginBottom: 8, color: 'var(--danger-ink)' }}>
                  <Icon name="alert" size={16} /> Support is available right now. You are never alone.
                </div>
              )}

              {msg.isUser ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
              ) : (
                <>
                  <MarkdownRenderer content={msg.text} />
                  <div className="msg-actions">
                    <button
                      type="button"
                      onClick={() => toggleSpeakText(msg.text, msg.id || index)}
                      style={{ color: speakingId === (msg.id || index) ? 'var(--danger)' : 'var(--primary)' }}
                    >
                      <Icon name="volume" size={14} />
                      {speakingId === (msg.id || index) ? 'Stop audio' : 'Read aloud'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {loading && (
            <div className="msg msg-ai" aria-label="Aura is thinking">
              <div className="bubble-typing" style={{ display: 'inline-flex', gap: 5 }}>
                <i /><i /><i />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="chat-prompts">
          {prompts.map((p, i) => (
            <button
              key={i}
              type="button"
              className="chip chip-outline"
              onClick={() => handleSendMessage(p.text)}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            className="chip chip-danger"
            onClick={() => handleSendMessage(lang === 'en' ? 'I need emergency crisis support.' : 'මට හදිසි උපකාර අවශ්‍යයි.')}
          >
            <Icon name="alert" size={13} /> {lang === 'en' ? '🚨 Emergency Help' : '🚨 හදිසි උපකාර'}
          </button>
        </div>

        {/* Composer */}
        <form className="chat-composer" onSubmit={handleFormSubmit}>
          <button
            type="button"
            className={`icon-btn ${isListening ? 'is-on' : ''}`}
            onClick={toggleSpeechRecognition}
            title={isListening ? 'Stop listening' : 'Voice input'}
            aria-label="Voice input"
            style={isListening ? { animation: 'pulseRing 1.2s infinite', color: 'var(--danger)' } : undefined}
          >
            <Icon name="mic" size={20} />
          </button>

          <input
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              isListening
                ? (lang === 'en' ? 'Listening to your voice…' : 'සවන් දෙමින්…')
                : (lang === 'en' ? "Talk with Aura… (e.g. 'I feel stressed', or ask in Sinhala / Singlish)" : "Aura සමඟ කතා කරන්න… (උදා: 'මට මහන්සියි', 'stress wela')")
            }
            disabled={loading}
          />

          <button
            type="submit"
            className="btn btn-primary btn-icon"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <Icon name="send" size={19} />
          </button>
        </form>

        <p className="tiny muted center chat-foot" style={{ margin: '0 0 10px' }}>
          Aura is an AI companion for emotional reflection, not a doctor or therapist. In an emergency, dial <a href="tel:1926" style={{ color: 'var(--danger-fill)', fontWeight: 'bold' }}>1926</a> (NIMH) or <a href="tel:1990" style={{ color: 'var(--danger-fill)', fontWeight: 'bold' }}>1990</a>.
        </p>
      </section>

      {/* Clear Chat Confirmation Modal */}
      {showClearConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--overlay)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16
          }}
        >
          <div
            className="card rise"
            style={{
              maxWidth: 440,
              width: '100%',
              padding: 24,
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="row gap-10" style={{ alignItems: 'center', marginBottom: 12 }}>
              <span className="tile tile-danger"><Icon name="trash" size={20} /></span>
              <h3 id="clear-dialog-title" className="serif" style={{ margin: 0, fontSize: 19 }}>
                Clear Conversation History?
              </h3>
            </div>
            <p className="small muted" style={{ lineHeight: 1.6, margin: '0 0 20px' }}>
              Are you sure you want to clear your conversation history? This will permanently delete your stored messages from your account. This action cannot be undone.
            </p>
            <div className="row gap-10" style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmClear}
              >
                Yes, Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Helplines Modal */}
      {showHelplineModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="helpline-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--overlay)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16
          }}
        >
          <div
            className="card rise"
            style={{
              maxWidth: 500,
              width: '100%',
              padding: 24,
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="row-between mb-16">
              <div className="row gap-10">
                <span className="tile tile-danger"><Icon name="alert" size={22} /></span>
                <div>
                  <h3 id="helpline-modal-title" className="serif" style={{ margin: 0, fontSize: 19 }}>
                    Emergency Helplines (Sri Lanka)
                  </h3>
                  <p className="small muted" style={{ margin: '2px 0 0' }}>Free, confidential human support available 24/7</p>
                </div>
              </div>
              <button
                className="icon-btn"
                onClick={() => setShowHelplineModal(false)}
                aria-label="Close modal"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="col gap-10 mb-20">
              {CRISIS_HELPLINES.map((h, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--r-card)',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--line)'
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--ink)' }}>{h.name}</strong>
                    <span className="tiny muted">{h.note}</span>
                  </div>
                  <a
                    href={`tel:${h.tel}`}
                    className="btn btn-sm btn-danger"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Icon name="phone" size={14} /> Dial {h.number}
                  </a>
                </div>
              ))}
            </div>

            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => setShowHelplineModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
