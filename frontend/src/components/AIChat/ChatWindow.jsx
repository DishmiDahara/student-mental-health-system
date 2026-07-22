import React, { useState } from 'react'
import { Message } from './Message'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { ProviderStatus } from './ProviderStatus'
import { useAutoScroll } from '../../hooks/useAutoScroll'

export const ChatWindow = ({
  isOpen,
  onClose,
  onMinimize,
  useChatProps
}) => {
  const [isMaximized, setIsMaximized] = useState(false)

  const {
    messages,
    isLoading,
    activeProvider,
    darkMode,
    sendMessage,
    clearChat,
    exportChat,
    toggleTheme,
    speakText
  } = useChatProps

  const scrollRef = useAutoScroll(messages.length + (isLoading ? 1 : 0))

  if (!isOpen) return null

  const latestAiIndex = messages.reduce((acc, m, idx) => m.sender === 'ai' ? idx : acc, -1)

  return (
    <div style={{
      position: 'fixed',
      bottom: isMaximized ? '0' : '24px',
      right: isMaximized ? '0' : '24px',
      top: isMaximized ? '0' : 'auto',
      left: isMaximized ? '0' : 'auto',
      width: isMaximized ? '100vw' : '390px',
      height: isMaximized ? '100vh' : '580px',
      maxWidth: isMaximized ? '100vw' : 'calc(100vw - 32px)',
      maxHeight: isMaximized ? '100vh' : 'calc(100vh - 40px)',
      background: darkMode ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: isMaximized ? '0' : '24px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.1)',
      border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 999999,
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      animation: 'chatWindowAppear 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      {/* --- HEADER --- */}
      <div style={{
        padding: '12px 18px',
        borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
        background: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(248, 250, 252, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none'
      }}>
        {/* Left Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}>
            🤖
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '14.5px', color: darkMode ? '#f8fafc' : '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              MindSpace AI
              <ProviderStatus provider={activeProvider} darkMode={darkMode} />
            </div>
            <div style={{ fontSize: '11px', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '500' }}>
              Mental Wellness Assistant
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', padding: '4px' }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Export Chat */}
          <button
            onClick={exportChat}
            title="Export Chat History"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', padding: '4px' }}
          >
            📥
          </button>

          {/* Clear Chat */}
          <button
            onClick={clearChat}
            title="Clear Chat History"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', padding: '4px' }}
          >
            🗑️
          </button>

          {/* Minimize */}
          <button
            onClick={onMinimize}
            title="Minimize"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', color: darkMode ? '#cbd5e1' : '#475569', padding: '4px' }}
          >
            ➖
          </button>

          {/* Maximize / Restore */}
          <button
            onClick={() => setIsMaximized(prev => !prev)}
            title={isMaximized ? 'Restore Window' : 'Maximize Window'}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: darkMode ? '#cbd5e1' : '#475569', padding: '4px' }}
          >
            {isMaximized ? '🗗' : '🗖'}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            title="Close Chat"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#cbd5e1' : '#475569', padding: '4px' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* --- CHAT MESSAGES CONTAINER --- */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          background: darkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.4)'
        }}
      >
        {messages.map((msg, index) => (
          <Message
            key={msg.id || index}
            message={msg}
            darkMode={darkMode}
            onSpeak={speakText}
            isLatestAi={index === latestAiIndex}
          />
        ))}

        {isLoading && <TypingIndicator darkMode={darkMode} />}
      </div>

      {/* --- FOOTER INPUT --- */}
      <ChatInput
        onSendMessage={sendMessage}
        isLoading={isLoading}
        darkMode={darkMode}
        suggestedQuestions={messages[messages.length - 1]?.suggestedQuestions || []}
      />

      <style>{`
        @keyframes chatWindowAppear {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
