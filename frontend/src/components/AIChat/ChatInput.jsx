import React, { useState, useRef, useEffect } from 'react'

export const ChatInput = ({ onSendMessage, isLoading, darkMode, suggestedQuestions = [] }) => {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input)
      setInput('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }
  }

  // Voice Input via Web Speech API (if supported)
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

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

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }
    }
  }

  const defaultChips = [
    'Why am I stressed?',
    'Explain my mood report',
    'How can I improve my mood?',
    'Where can I see my history?'
  ]

  const activeChips = suggestedQuestions.length > 0 ? suggestedQuestions : defaultChips

  return (
    <div style={{
      padding: '12px 14px',
      borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
      background: darkMode ? 'rgba(15, 23, 42, 0.95)' : '#ffffff'
    }}>
      {/* Quick Reply Chips */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '4px',
        scrollbarWidth: 'none'
      }}>
        {activeChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(chip)}
            disabled={isLoading}
            style={{
              padding: '5px 10px',
              borderRadius: '16px',
              background: darkMode ? 'rgba(99, 102, 241, 0.15)' : '#f1f5f9',
              color: darkMode ? '#a5b4fc' : '#475569',
              border: darkMode ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid #cbd5e1',
              fontSize: '11.5px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            💬 {chip}
          </button>
        ))}
      </div>

      {/* Textarea Input Container */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: darkMode ? '#1e293b' : '#f8fafc',
        borderRadius: '16px',
        padding: '6px 12px',
        border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1'
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask MindSpace AI anything... (Press Enter to send)"
          rows={1}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: darkMode ? '#f8fafc' : '#0f172a',
            fontSize: '13.5px',
            resize: 'none',
            maxHeight: '120px',
            fontFamily: 'inherit',
            lineHeight: '1.4'
          }}
        />

        {/* Mic Speech Button */}
        <button
          onClick={toggleSpeechRecognition}
          type="button"
          title="Voice input"
          style={{
            background: isListening ? '#ef4444' : 'transparent',
            color: isListening ? '#ffffff' : (darkMode ? '#94a3b8' : '#64748b'),
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          🎤
        </button>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          type="button"
          style={{
            background: input.trim() && !isLoading ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : (darkMode ? '#334155' : '#cbd5e1'),
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '8px 14px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            boxShadow: input.trim() && !isLoading ? '0 2px 8px rgba(79, 70, 229, 0.3)' : 'none'
          }}
        >
          {isLoading ? '...' : 'Send 🚀'}
        </button>
      </div>
    </div>
  )
}
