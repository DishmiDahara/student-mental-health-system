import { useState, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { API_BASE_URL } from '../config'
import { MarkdownRenderer } from '../components/AIChat/MarkdownRenderer'
import { ProviderStatus } from '../components/AIChat/ProviderStatus'
import { useTheme } from '../context/ThemeContext'

export default function AIChatbot() {
  const { isDark } = useTheme()
  const [lang, setLang] = useState('en') // 'en' or 'si'
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [activeProvider, setActiveProvider] = useState('gemini')
  const [conversationId, setConversationId] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true)
  const [speakingIndex, setSpeakingIndex] = useState(null)
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
      const errorMsgObj = {
        id: `err_${Date.now()}`,
        text: err.response?.data?.reply || "I'm having a little trouble connecting right now. Please take a gentle breath and try sending your message again in a moment.",
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Confirm and Clear Chat History
  const handleConfirmClearHistory = async () => {
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
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
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
  const toggleSpeakText = (text, index) => {
    if (!('speechSynthesis' in window)) return

    if (speakingIndex === index) {
      window.speechSynthesis.cancel()
      setSpeakingIndex(null)
      return
    }

    window.speechSynthesis.cancel()
    const clean = text.replace(/[*#_`]/g, '').replace(/https?:\/\/\S+/g, '')
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.lang = lang === 'si' ? 'si-LK' : 'en-US'
    utterance.onend = () => setSpeakingIndex(null)
    utterance.onerror = () => setSpeakingIndex(null)
    setSpeakingIndex(index)
    window.speechSynthesis.speak(utterance)
  }

  // Verified crisis hotline click-to-dial trigger
  const handleDial = (telUrl) => {
    window.location.href = telUrl
  }

  // UI Theme tokens
  const colors = {
    pageBg: isDark ? '#090d16' : '#f8fafc',
    cardBg: isDark ? '#0f172a' : '#ffffff',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
    chatBg: isDark ? '#0a0f1d' : '#f8fafc',
    aiMsgBg: isDark ? '#1e293b' : '#ffffff',
    aiMsgBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    aiMsgText: isDark ? '#f1f5f9' : '#1e293b',
    userMsgBg: 'linear-gradient(135deg, #4f46e5, #6366f1)',
    userMsgText: '#ffffff',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
    inputText: isDark ? '#f8fafc' : '#0f172a',
    metaText: isDark ? '#94a3b8' : '#64748b',
    chipBg: isDark ? '#1e293b' : '#ffffff',
    chipBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
    chipText: isDark ? '#cbd5e1' : '#475569',
    chipHover: isDark ? '#334155' : '#f1f5f9'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: colors.pageBg, color: colors.inputText, transition: 'background-color 0.25s ease' }}>
      
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
        <div style={{
          background: colors.cardBg,
          borderRadius: '24px',
          maxWidth: '1050px',
          width: '100%',
          boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.06)',
          border: `1px solid ${colors.cardBorder}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: 'calc(100vh - 110px)',
          minHeight: '560px'
        }}>

          {/* Header Banner */}
          <header style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            padding: '16px 22px',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Title & Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                fontSize: '26px',
                background: 'rgba(255,255,255,0.2)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                🧠
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ color: 'white', fontSize: '19px', margin: 0, fontWeight: '800' }}>Aura</h1>
                  <ProviderStatus provider={activeProvider} darkMode={true} />
                </div>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.92, fontWeight: '500' }}>
                  MindSpace AI Wellbeing Companion · Sinhala, English & Singlish
                </p>
              </div>
            </div>

            {/* Top Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Clear Chat Button */}
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                title="Clear conversation history"
                aria-label="Clear chat history"
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '10px',
                  color: 'white',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'background 0.2s'
                }}
              >
                🗑️ {lang === 'en' ? 'Clear Chat' : 'මකන්න'}
              </button>

              {/* Language Switcher */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.18)', borderRadius: '10px', padding: '3px' }}>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  aria-pressed={lang === 'en'}
                  style={{
                    padding: '5px 12px',
                    background: lang === 'en' ? 'white' : 'transparent',
                    color: lang === 'en' ? '#4f46e5' : 'white',
                    border: 'none',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang('si')}
                  aria-pressed={lang === 'si'}
                  style={{
                    padding: '5px 12px',
                    background: lang === 'si' ? 'white' : 'transparent',
                    color: lang === 'si' ? '#4f46e5' : 'white',
                    border: 'none',
                    borderRadius: '7px',
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
          </header>

          {/* Responsible Mental Health Boundary Banner */}
          <aside aria-label="Crisis disclaimer" style={{
            background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#f1f5f9',
            borderBottom: `1px solid ${colors.cardBorder}`,
            padding: '8px 18px',
            fontSize: '11.5px',
            color: colors.metaText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🛡️</span>
              <span>
                <strong>General Wellbeing Companion:</strong> Aura is an AI supportive listener, not a therapist or doctor. In immediate crisis, dial <strong>1926</strong> (NIMH) or <strong>1990</strong> (Ambulance).
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleSendMessage(lang === 'en' ? "I need emergency crisis support contacts." : "මට හදිසි උපකාරක සේවා අංක ලබාදෙන්න.")}
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '3px 9px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🚨 Helplines
            </button>
          </aside>

          {/* Privacy Notice Banner */}
          {showPrivacyNotice && (
            <div style={{
              background: isDark ? 'rgba(59, 130, 246, 0.12)' : '#eff6ff',
              borderBottom: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.25)' : '#bfdbfe'}`,
              padding: '8px 18px',
              fontSize: '11.5px',
              color: isDark ? '#93c5fd' : '#1e40af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🔒</span>
                <span>
                  <strong>Privacy Notice:</strong> Messages are processed by Google Gemini AI. MindSpace securely stores your chat history for continuity. We never transmit your private mood logs or profile details to Gemini.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyNotice(false)}
                title="Dismiss privacy notice"
                aria-label="Dismiss privacy notice"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isDark ? '#93c5fd' : '#1e40af',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div
            role="log"
            aria-live="polite"
            aria-label="Conversation messages"
            style={{
              flex: 1,
              padding: '20px 22px',
              overflowY: 'auto',
              background: colors.chatBg,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                style={{
                  alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '84%',
                  background: msg.isUser
                    ? colors.userMsgBg
                    : msg.isCrisis
                      ? (isDark ? '#3b1212' : '#fef2f2')
                      : colors.aiMsgBg,
                  color: msg.isUser
                    ? colors.userMsgText
                    : msg.isCrisis
                      ? (isDark ? '#fecaca' : '#991b1b')
                      : colors.aiMsgText,
                  padding: '14px 18px',
                  borderRadius: msg.isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  boxShadow: msg.isUser
                    ? '0 4px 14px rgba(79, 70, 229, 0.25)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                  border: msg.isUser
                    ? 'none'
                    : msg.isCrisis
                      ? '1.5px solid #ef4444'
                      : `1px solid ${colors.aiMsgBorder}`
                }}
              >
                {msg.isUser ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                ) : (
                  <div>
                    <MarkdownRenderer content={msg.text} isDark={isDark} />

                    {/* Verified Crisis Helpline Action Card */}
                    {msg.isCrisis && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: isDark ? '#f87171' : '#b91c1c' }}>
                          ⚡ Quick Call Sri Lanka Helplines (Toll-Free):
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleDial('tel:1926')}
                            style={{
                              padding: '6px 12px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            📞 Call 1926 (NIMH)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDial('tel:1990')}
                            style={{
                              padding: '6px 12px',
                              background: '#ea580c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            🚑 Call 1990 (Ambulance)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDial('tel:1333')}
                            style={{
                              padding: '6px 12px',
                              background: '#0284c7',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            🤝 Call 1333 (CCCline)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDial('tel:0112696666')}
                            style={{
                              padding: '6px 12px',
                              background: '#4b5563',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            🫂 Call 011 269 6666 (Sumithrayo)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Bottom message controls (Read aloud, timestamp) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '8px',
                      paddingTop: '6px',
                      borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
                      fontSize: '11px',
                      color: colors.metaText
                    }}>
                      <button
                        type="button"
                        onClick={() => toggleSpeakText(msg.text, index)}
                        aria-label={speakingIndex === index ? 'Stop reading message' : 'Read message aloud'}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isDark ? '#818cf8' : '#4f46e5',
                          cursor: 'pointer',
                          fontWeight: '600',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {speakingIndex === index ? '⏹️ Stop Voice' : '🔊 Read Aloud'}
                      </button>
                      <span>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div
                aria-live="polite"
                aria-busy="true"
                style={{
                  alignSelf: 'flex-start',
                  background: colors.aiMsgBg,
                  padding: '12px 18px',
                  borderRadius: '20px 20px 20px 4px',
                  border: `1px solid ${colors.aiMsgBorder}`,
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '12.5px', color: colors.metaText, fontWeight: '600' }}>
                  Aura is thinking…
                </span>
                <div style={{ width: '6px', height: '6px', background: '#6366f1', borderRadius: '50%', animation: 'auraDot 1.4s infinite ease-in-out both' }}></div>
                <div style={{ width: '6px', height: '6px', background: '#8b5cf6', borderRadius: '50%', animation: 'auraDot 1.4s infinite ease-in-out both 0.2s' }}></div>
                <div style={{ width: '6px', height: '6px', background: '#ec4899', borderRadius: '50%', animation: 'auraDot 1.4s infinite ease-in-out both 0.4s' }}></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Empty-State Suggestions & Quick Prompts */}
          <div style={{
            padding: '10px 20px',
            background: isDark ? '#0c1222' : '#f8fafc',
            borderTop: `1px solid ${colors.cardBorder}`,
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}>
            {lang === 'en' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSendMessage("I'm feeling really stressed about upcoming exams")}
                  style={{
                    padding: '6px 14px',
                    background: colors.chipBg,
                    border: `1px solid ${colors.chipBorder}`,
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: colors.chipText,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: '600'
                  }}
                >
                  📚 Exam Stress
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("Can you guide me through a 4-7-8 breathing exercise?")}
                  style={{
                    padding: '6px 14px',
                    background: colors.chipBg,
                    border: `1px solid ${colors.chipBorder}`,
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: colors.chipText,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: '600'
                  }}
                >
                  🌬️ 4-7-8 Breathing
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("My mind won't stop racing tonight and I can't sleep")}
                  style={{
                    padding: '6px 14px',
                    background: colors.chipBg,
                    border: `1px solid ${colors.chipBorder}`,
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: colors.chipText,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: '600'
                  }}
                >
                  🌙 Racing Mind
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("I feel overwhelmed and don't know where to start")}
                  style={{
                    padding: '6px 14px',
                    background: colors.chipBg,
                    border: `1px solid ${colors.chipBorder}`,
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: colors.chipText,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: '600'
                  }}
                >
                  💭 Feeling Overwhelmed
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("I need emergency crisis support contacts.")}
                  style={{
                    padding: '6px 14px',
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: '#b91c1c',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold'
                  }}
                >
                  🚨 Emergency Help
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSendMessage("විභාග පීඩනය නිසා මට ලොකු ආතතියක් දැනෙනවා")}
                  style={{
                    padding: '6px 14px',
                    background: colors.chipBg,
                    border: `1px solid ${colors.chipBorder}`,
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: colors.chipText,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: '600'
                  }}
                >
                  📚 විභාග ආතතිය
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("සිත සන්සුන් කරගන්න හුස්ම ගැනීමේ ව්‍යායාමයක් මට කියාදෙන්න")}
                  style={{
                    padding: '6px 14px',
                    background: colors.chipBg,
                    border: `1px solid ${colors.chipBorder}`,
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: colors.chipText,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: '600'
                  }}
                >
                  🌬️ හුස්ම ගැනීමේ අභ්‍යාස
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("මට නින්ද යන්නේ නැහැ, මනස කලබලයි")}
                  style={{
                    padding: '6px 14px',
                    background: colors.chipBg,
                    border: `1px solid ${colors.chipBorder}`,
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: colors.chipText,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: '600'
                  }}
                >
                  🌙 නින්ද නොයාම
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("මට හදිසි උපකාරක සේවා අංක ලබාදෙන්න.")}
                  style={{
                    padding: '6px 14px',
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: '#b91c1c',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold'
                  }}
                >
                  🚨 හදිසි උපකාර
                </button>
              </>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleFormSubmit}
            style={{
              display: 'flex',
              padding: '14px 20px',
              gap: '10px',
              borderTop: `1px solid ${colors.cardBorder}`,
              background: colors.cardBg,
              alignItems: 'center'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={2000}
              aria-label="Type your message to Aura"
              placeholder={
                lang === 'en'
                  ? "Talk with Aura... (e.g. 'I feel stressed', or ask in Sinhala / Singlish)"
                  : "Aura සමඟ කතා කරන්න... (උදා: 'මට මහන්සියි', 'stress wela')"
              }
              style={{
                flex: 1,
                padding: '12px 16px',
                border: `2px solid ${colors.inputBorder}`,
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none',
                background: colors.inputBg,
                color: colors.inputText,
                transition: 'border-color 0.2s'
              }}
            />

            {/* Speech Mic Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title={isListening ? 'Stop listening' : 'Voice input'}
              aria-label={isListening ? 'Stop listening' : 'Voice input'}
              style={{
                background: isListening ? '#ef4444' : (isDark ? '#1e293b' : '#f1f5f9'),
                color: isListening ? 'white' : colors.metaText,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: '12px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '17px',
                transition: 'all 0.2s'
              }}
            >
              🎤
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              style={{
                padding: '0 20px',
                height: '44px',
                background: input.trim() && !loading ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : (isDark ? '#334155' : '#cbd5e1'),
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{lang === 'en' ? 'Send' : 'යවන්න'}</span>
              <span>🚀</span>
            </button>
          </form>

        </div>
      </main>

      {/* Confirmation Modal for Clearing Chat History */}
      {showClearConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '16px'
          }}
        >
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <h3 id="clear-title" style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.inputText }}>
              🗑️ Clear Chat History?
            </h3>
            <p style={{ margin: 0, fontSize: '13.5px', color: colors.metaText, lineHeight: '1.5' }}>
              Are you sure you want to clear your conversation history? This will permanently delete your stored messages from your account. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                style={{
                  padding: '9px 16px',
                  background: isDark ? '#334155' : '#f1f5f9',
                  color: colors.inputText,
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearHistory}
                style={{
                  padding: '9px 18px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Yes, Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes auraDot {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1.0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
