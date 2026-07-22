import React, { useState, useEffect } from 'react'

export const PopupBubble = ({ onOpenChat, darkMode }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if user dismissed popup in this session
    const dismissed = sessionStorage.getItem('ai_popup_dismissed')
    if (dismissed) return

    // Show popup after 6 seconds delay
    const timer = setTimeout(() => {
      setVisible(true)
    }, 6000)

    return () => clearTimeout(timer)
  }, [])

  // Auto-hide popup after 20 seconds
  useEffect(() => {
    if (visible) {
      const autoHideTimer = setTimeout(() => {
        handleDismiss()
      }, 20000)
      return () => clearTimeout(autoHideTimer)
    }
  }, [visible])

  const handleDismiss = () => {
    setVisible(false)
    sessionStorage.setItem('ai_popup_dismissed', 'true')
  }

  const handleChatNow = () => {
    handleDismiss()
    onOpenChat()
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      right: '24px',
      maxWidth: '320px',
      width: 'calc(100vw - 48px)',
      background: darkMode ? 'rgba(30, 41, 59, 0.92)' : 'rgba(255, 255, 255, 0.94)',
      backdropFilter: 'blur(16px)',
      borderRadius: '20px',
      padding: '16px',
      boxShadow: '0 12px 32px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)',
      border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.8)',
      zIndex: 99999,
      animation: 'popupSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '14px', color: darkMode ? '#f8fafc' : '#0f172a' }}>
          <span style={{ fontSize: '18px' }}>👋</span> Hi there!
        </div>
        <button
          onClick={handleDismiss}
          style={{ background: 'transparent', border: 'none', color: darkMode ? '#94a3b8' : '#64748b', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <p style={{ margin: '0 0 14px 0', fontSize: '12.5px', color: darkMode ? '#cbd5e1' : '#475569', lineHeight: '1.5' }}>
        I'm your **MindSpace AI Assistant**. I'm here to help you understand your mood reports, answer questions, and guide you through the app.
        <br /><br />
        <strong>Need anything?</strong>
      </p>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleChatNow}
          style={{
            flex: 1,
            padding: '9px',
            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '12.5px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}
        >
          Chat Now 🚀
        </button>
        <button
          onClick={handleDismiss}
          style={{
            padding: '9px 14px',
            background: darkMode ? '#334155' : '#f1f5f9',
            color: darkMode ? '#cbd5e1' : '#475569',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '12.5px',
            cursor: 'pointer'
          }}
        >
          Later
        </button>
      </div>

      <style>{`
        @keyframes popupSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
