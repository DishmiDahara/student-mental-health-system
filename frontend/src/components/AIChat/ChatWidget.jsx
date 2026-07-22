import React, { useState, useEffect } from 'react'
import { PopupBubble } from './PopupBubble'
import { ChatWindow } from './ChatWindow'
import { useChat } from '../../hooks/useChat'

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [hasToken, setHasToken] = useState(false)

  const useChatProps = useChat()
  const { darkMode, unreadCount } = useChatProps

  // Only show when logged in
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token') || localStorage.getItem('user')
      setHasToken(!!token)
    }

    checkToken()
    window.addEventListener('storage', checkToken)
    return () => window.removeEventListener('storage', checkToken)
  }, [])

  if (!hasToken) return null

  const handleOpenChat = () => {
    setIsOpen(true)
    setIsMinimized(false)
  }

  const handleToggleChat = () => {
    if (isOpen && !isMinimized) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
      setIsMinimized(false)
    }
  }

  return (
    <>
      {/* Floating Popup Invitation Banner */}
      {!isOpen && <PopupBubble onOpenChat={handleOpenChat} darkMode={darkMode} />}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={handleToggleChat}
          title="Open AI Assistant"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4), 0 2px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            zIndex: 99999,
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          🤖

          {/* Unread Badge Counter */}
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }}>
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Main AI Chat Window */}
      <ChatWindow
        isOpen={isOpen && !isMinimized}
        onClose={() => setIsOpen(false)}
        onMinimize={() => setIsMinimized(true)}
        useChatProps={useChatProps}
      />
    </>
  )
}

export default ChatWidget
