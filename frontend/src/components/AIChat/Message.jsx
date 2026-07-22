import React, { useState } from 'react'
import { MarkdownRenderer } from './MarkdownRenderer'
import { useTypingAnimation } from '../../hooks/useTypingAnimation'

export const Message = ({ message, darkMode, onSpeak, isLatestAi }) => {
  const [copied, setCopied] = useState(false)
  const isUser = message.sender === 'user'

  // Apply typing streaming effect to the latest AI message
  const { displayedText } = useTypingAnimation(
    message.text,
    10,
    !isUser && isLatestAi && !message.isCrisis
  )

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const textToRender = isUser ? message.text : (isLatestAi && !message.isCrisis ? displayedText : message.text)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      margin: '10px 0',
      width: '100%'
    }}>
      {/* Sender Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '4px',
        fontSize: '11px',
        fontWeight: '600',
        color: darkMode ? '#94a3b8' : '#64748b'
      }}>
        {!isUser && (
          <span style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: message.isCrisis ? '#ef4444' : 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'white'
          }}>
            {message.isCrisis ? '🚨' : '🤖'}
          </span>
        )}
        <span>{isUser ? 'You' : 'MindSpace AI'}</span>
        <span style={{ fontSize: '10px', opacity: 0.7 }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Message Bubble Container */}
      <div style={{
        maxWidth: '85%',
        padding: '12px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser
          ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
          : message.isCrisis
            ? (darkMode ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2')
            : (darkMode ? 'rgba(30, 41, 59, 0.85)' : '#ffffff'),
        color: isUser
          ? '#ffffff'
          : message.isCrisis
            ? (darkMode ? '#fca5a5' : '#991b1b')
            : (darkMode ? '#f8fafc' : '#1e293b'),
        border: isUser
          ? 'none'
          : message.isCrisis
            ? '1.5px solid #ef4444'
            : (darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0'),
        boxShadow: isUser
          ? '0 4px 12px rgba(79, 70, 229, 0.25)'
          : '0 2px 10px rgba(0,0,0,0.04)',
        fontSize: '13.5px',
        wordBreak: 'break-word'
      }}>
        {isUser ? (
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{message.text}</div>
        ) : (
          <MarkdownRenderer content={textToRender} />
        )}

        {/* Action Toolbar for AI Responses */}
        {!isUser && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '8px',
            paddingTop: '6px',
            borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f1f5f9',
            fontSize: '11px'
          }}>
            <button
              onClick={handleCopy}
              style={{
                background: 'transparent',
                border: 'none',
                color: darkMode ? '#94a3b8' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: 0
              }}
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>

            {onSpeak && (
              <button
                onClick={() => onSpeak(message.text)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: 0
                }}
              >
                🔊 Read
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
