import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'

export const useChat = () => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [activeProvider, setActiveProvider] = useState('gemini')
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ai_chat_theme')
    return saved ? saved === 'dark' : false
  })
  const [unreadCount, setUnreadCount] = useState(0)

  // Toggle Dark / Light Theme
  const toggleTheme = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev
      localStorage.setItem('ai_chat_theme', next ? 'dark' : 'light')
      return next
    })
  }, [])

  // Load persistent chat history from DB
  const fetchChatHistory = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await axios.get(`${API_BASE_URL}/api/ai/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data && res.data.history && res.data.history.length > 0) {
        const formatted = res.data.history.map(item => ({
          id: item._id || Date.now() + Math.random(),
          sender: item.role === 'user' ? 'user' : 'ai',
          text: item.message,
          timestamp: item.timestamp,
          provider: item.provider || 'gemini',
          isCrisis: item.isCrisis || false
        }))
        setMessages(formatted)
        if (res.data.history[0].conversationId) {
          setConversationId(res.data.history[0].conversationId)
        }
      } else {
        // Welcome message if fresh history
        setMessages([
          {
            id: 'welcome_1',
            sender: 'ai',
            text: "👋 Hi there! I'm your **MindSpace AI Assistant**.\n\nI can help you understand your mood reports, analyze stress triggers, and suggest evidence-based wellness tips. How can I support you today?",
            timestamp: new Date().toISOString(),
            provider: 'gemini'
          }
        ])
      }
    } catch (err) {
      console.warn('Failed to load DB history:', err.message)
      // Fallback welcome message
      setMessages([
        {
          id: 'welcome_1',
          sender: 'ai',
          text: "👋 Hi there! I'm your **MindSpace AI Assistant**.\n\nHow can I help you with your mental wellness today?",
          timestamp: new Date().toISOString(),
          provider: 'gemini'
        }
      ])
    }
  }, [])

  useEffect(() => {
    fetchChatHistory()
  }, [fetchChatHistory])

  // Send message to AI endpoint
  const sendMessage = async (textInput) => {
    const trimmed = textInput ? textInput.trim() : ''
    if (!trimmed || isLoading) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    const token = localStorage.getItem('token')

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/ai/chat`,
        { message: trimmed, conversationId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const data = response.data
      if (data.conversationId) setConversationId(data.conversationId)
      if (data.provider) setActiveProvider(data.provider)

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.reply || "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        provider: data.provider || 'gemini',
        isCrisis: data.isCrisis || false,
        suggestedQuestions: data.suggestedQuestions || []
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      console.error('Send AI Message error:', err)
      setError("I'm having trouble connecting right now. Please try again in a moment.")
      
      const fallbackAiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        provider: 'error_fallback',
        isError: true
      }
      setMessages(prev => [...prev, fallbackAiMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Regenerate last AI response
  const regenerateLastResponse = async () => {
    const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user')
    if (lastUserMessage && !isLoading) {
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last && last.sender === 'ai') {
          return prev.slice(0, -1)
        }
        return prev
      })
      await sendMessage(lastUserMessage.text)
    }
  }

  // Clear Chat History
  const clearChat = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await axios.delete(`${API_BASE_URL}/api/ai/history`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (err) {
        console.warn('Clear chat DB failed:', err.message)
      }
    }
    setMessages([
      {
        id: 'welcome_fresh',
        sender: 'ai',
        text: 'Chat history cleared. How can I help you now?',
        timestamp: new Date().toISOString(),
        provider: 'gemini'
      }
    ])
  }

  // Export Chat to Text File
  const exportChat = () => {
    const content = messages.map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.sender.toUpperCase()}: ${m.text}`).join('\n\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `MindSpace_AI_Chat_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Text-To-Speech (SpeechSynthesis)
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const clean = text.replace(/[*#_`]/g, '')
      const utterance = new SpeechSynthesisUtterance(clean)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  return {
    messages,
    isLoading,
    error,
    activeProvider,
    darkMode,
    unreadCount,
    setUnreadCount,
    sendMessage,
    clearChat,
    exportChat,
    toggleTheme,
    speakText,
    regenerateLastResponse
  }
}
