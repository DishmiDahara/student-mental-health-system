import React from 'react'

export const TypingIndicator = ({ darkMode }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '10px 14px',
      background: darkMode ? 'rgba(30, 41, 59, 0.75)' : '#f1f5f9',
      borderRadius: '16px 16px 16px 4px',
      width: 'fit-content',
      margin: '6px 0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      <span style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '600', marginRight: '4px' }}>Thinking</span>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', animation: 'typingDot 1.4s infinite ease-in-out 0s' }} />
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6', animation: 'typingDot 1.4s infinite ease-in-out 0.2s' }} />
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ec4899', animation: 'typingDot 1.4s infinite ease-in-out 0.4s' }} />

      <style>{`
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
