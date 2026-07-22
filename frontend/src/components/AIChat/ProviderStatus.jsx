import React from 'react'

export const ProviderStatus = ({ provider = 'gemini', darkMode }) => {
  const getLabel = () => {
    switch (provider?.toLowerCase()) {
      case 'gemini':
        return '✨ Powered by Gemini AI'
      case 'openrouter':
        return '🌐 Powered by OpenRouter'
      case 'free_fallback':
        return '🌿 MindSpace Offline AI'
      case 'crisis_escaper':
        return '🚨 Emergency Safety Guidance'
      default:
        return '🤖 MindSpace Assistant'
    }
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '10.5px',
      fontWeight: '600',
      padding: '2px 8px',
      borderRadius: '12px',
      background: darkMode ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff',
      color: darkMode ? '#818cf8' : '#4338ca',
      letterSpacing: '0.2px'
    }}>
      {getLabel()}
    </div>
  )
}
