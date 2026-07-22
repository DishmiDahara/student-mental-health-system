import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { API_BASE_URL } from '../config'
import { MarkdownRenderer } from '../components/AIChat/MarkdownRenderer'
import { ProviderStatus } from '../components/AIChat/ProviderStatus'

export default function AIChatbot() {
  const navigate = useNavigate()
  const [lang, setLang] = useState('en') // 'en' or 'si'
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [activeProvider, setActiveProvider] = useState('gemini')
  const [conversationId, setConversationId] = useState(null)
  const chatEndRef = useRef(null)

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
          id: item._id || Math.random(),
          text: item.message,
          isUser: item.role === 'user',
          provider: item.provider || 'gemini',
          isCrisis: item.isCrisis || false,
          timestamp: item.timestamp
        }))
        setMessages(formatted)
        if (res.data.history[0].conversationId) {
          setConversationId(res.data.history[0].conversationId)
        }
      } else {
        // Default welcome greeting
        setMessages([
          {
            id: 'welcome_1',
            text: lang === 'en'
              ? "Hi! I'm **Aura**, your MindSpace AI mental health companion. 🧠\n\nI'm powered by **Gemini AI** to listen, offer personalized relaxation tips, and guide you through your mood reports. How are you feeling today?"
              : "හෙලෝ! මම **Aura**, ඔබේ MindSpace AI මානසික සෞඛ්‍ය සහකරු. 🧠\n\nමම Gemini AI බලගැන්වීමෙන් ඔබට සවන් දෙන්න, මානසික සුවතාවයට උපදෙස් දෙන්න සූදානම්. අද දවසේ ඔබට කොහොමද?",
            isUser: false,
            provider: 'gemini',
            timestamp: new Date().toISOString()
          }
        ])
      }
    } catch (err) {
      console.warn('Failed to load history:', err.message)
      setMessages([
        {
          id: 'welcome_1',
          text: "Hi! I'm **Aura**, your MindSpace AI companion. How are you feeling today?",
          isUser: false,
          provider: 'gemini',
          timestamp: new Date().toISOString()
        }
      ])
    }
  }, [lang])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Send user message to Gemini AI backend
  const handleSendMessage = async (textInput) => {
    const textToSend = textInput || input
    if (!textToSend || !textToSend.trim() || loading) return

    const userText = textToSend.trim()
    const userMsgObj = {
      id: Date.now(),
      text: userText,
      isUser: true,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMsgObj])
    if (!textInput) setInput('')
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
        id: Date.now() + 1,
        text: data.reply || "I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        provider: data.provider || 'gemini',
        isCrisis: data.isCrisis || false,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMsgObj])
    } catch (err) {
      console.error('Send message error:', err)
      const errorMsgObj = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        provider: 'error_fallback',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMsgObj])
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    handleSendMessage()
  }

  // Clear Chat History
  const handleClearHistory = async () => {
    setMessages([])
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await axios.delete(`${API_BASE_URL}/api/ai/history`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (err) {
        console.warn('Clear history failed:', err)
      }
    }
    setMessages([
      {
        id: 'welcome_fresh',
        text: lang === 'en'
          ? "Chat history cleared. How can Aura help you now?"
          : "සංවාද ඉතිහාසය මකා දමන ලදී. මට ඔබට තවදුරටත් උපකාර කරන්නේ කෙසේද?",
        isUser: false,
        provider: 'gemini',
        timestamp: new Date().toISOString()
      }
    ])
  }

  // Voice Input (SpeechRecognition)
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.')
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

  // Text-To-Speech
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const clean = text.replace(/[*#_`]/g, '')
      const utterance = new SpeechSynthesisUtterance(clean)
      utterance.lang = lang === 'si' ? 'si-LK' : 'en-US'
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '24px 16px', boxSizing: 'border-box' }}>
        <div style={{ background: 'white', borderRadius: '24px', maxWidth: '850px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 'calc(100vh - 120px)', minHeight: '550px' }}>
          
          {/* Header Banner */}
          <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '18px 24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            
            {/* Title & Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '24px', background: 'rgba(255,255,255,0.2)', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                🧠
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ color: 'white', fontSize: '20px', margin: 0, fontWeight: '800' }}>Aura</h2>
                  <ProviderStatus provider={activeProvider} darkMode={true} />
                </div>
                <span style={{ fontSize: '12.5px', opacity: 0.9 }}>AI Mental Health Companion & Wellness Advisor</span>
              </div>
            </div>

            {/* Language Switcher & Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Clear Chat Button */}
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                style={{ background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '10px', color: 'white', padding: '7px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                🗑️ {lang === 'en' ? 'Clear' : 'මකන්න'}
              </button>

              {/* Language Switch Buttons */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.18)', borderRadius: '10px', padding: '3px' }}>
                <button 
                  onClick={() => setLang('en')} 
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
                  onClick={() => setLang('si')} 
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

          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', background: '#fafbfc', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.map((msg, index) => (
              <div 
                key={msg.id || index}
                style={{
                  alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  background: msg.isUser 
                    ? 'linear-gradient(135deg, #4f46e5, #6366f1)' 
                    : msg.isCrisis ? '#fef2f2' : '#ffffff',
                  color: msg.isUser ? 'white' : msg.isCrisis ? '#991b1b' : '#1f2937',
                  padding: '14px 18px',
                  borderRadius: msg.isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  boxShadow: msg.isUser ? '0 4px 12px rgba(79, 70, 229, 0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                  border: msg.isUser ? 'none' : msg.isCrisis ? '1.5px solid #ef4444' : '1px solid #e5e7eb'
                }}
              >
                {msg.isUser ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                ) : (
                  <>
                    <MarkdownRenderer content={msg.text} />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9', fontSize: '11px', color: '#64748b' }}>
                      <button
                        onClick={() => speakText(msg.text)}
                        style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: '600', padding: 0 }}
                      >
                        🔊 Read Aloud
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: 'flex-start', background: '#ffffff', padding: '12px 18px', borderRadius: '20px 20px 20px 4px', border: '1px solid #e5e7eb', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Aura is thinking</span>
                <div style={{ width: '6px', height: '6px', background: '#6366f1', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                <div style={{ width: '6px', height: '6px', background: '#8b5cf6', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.2s' }}></div>
                <div style={{ width: '6px', height: '6px', background: '#ec4899', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.4s' }}></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Support Suggestions */}
          <div style={{ padding: '10px 24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {lang === 'en' ? (
              <>
                <button onClick={() => handleSendMessage("Why am I stressed?")} style={{ padding: '6px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '20px', fontSize: '12px', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600' }}>💬 Why am I stressed?</button>
                <button onClick={() => handleSendMessage("Explain my mood report.")} style={{ padding: '6px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '20px', fontSize: '12px', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600' }}>📊 Explain my mood report</button>
                <button onClick={() => handleSendMessage("How can I improve my mood?")} style={{ padding: '6px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '20px', fontSize: '12px', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600' }}>🌿 Improve my mood</button>
                <button onClick={() => handleSendMessage("I need emergency crisis support.")} style={{ padding: '6px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '20px', fontSize: '12px', color: '#b91c1c', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 'bold' }}>🚨 Emergency Help</button>
              </>
            ) : (
              <>
                <button onClick={() => handleSendMessage("මට ලොකු පීඩනයක් දැනෙන්නේ ඇයි?")} style={{ padding: '6px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '20px', fontSize: '12px', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600' }}>💬 මට පීඩනයක් ඇයි?</button>
                <button onClick={() => handleSendMessage("මගේ මනෝභාව වාර්තාව පැහැදිලි කරන්න.")} style={{ padding: '6px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '20px', fontSize: '12px', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600' }}>📊 වාර්තාව පැහැදිලි කරන්න</button>
                <button onClick={() => handleSendMessage("මගේ සිත සැහැල්ලු කරගන්නේ කෙසේද?")} style={{ padding: '6px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '20px', fontSize: '12px', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600' }}>🌿 සිත සැහැල්ලු කරගන්න</button>
                <button onClick={() => handleSendMessage("මට හදිසි උපකාර අවශ්‍යයි.")} style={{ padding: '6px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '20px', fontSize: '12px', color: '#b91c1c', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 'bold' }}>🚨 හදිසි සහය</button>
              </>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', padding: '14px 24px', gap: '10px', borderTop: '1px solid #f3f4f6', alignItems: 'center' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={lang === 'en' ? "Talk to Aura... (e.g. 'Why am I stressed?')" : "Aura සමඟ කතා කරන්න... (උදා: 'මට දුකයි')"}
              style={{ flex: 1, padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
            />

            {/* Speech Mic Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title="Voice input"
              style={{
                background: isListening ? '#ef4444' : '#f1f5f9',
                color: isListening ? 'white' : '#475569',
                border: 'none',
                borderRadius: '12px',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🎤
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                padding: '0 22px',
                height: '42px',
                background: input.trim() && !loading ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#cbd5e1',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14.5px',
                fontWeight: 'bold',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              {lang === 'en' ? 'Send 🚀' : 'යවන්න 🚀'}
            </button>
          </form>

        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>

    </div>
  )
}
