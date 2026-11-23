import React, { useState } from 'react'

export const MarkdownRenderer = ({ content, isDark = false }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null)

  if (!content) return null

  // Function to copy code blocks
  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedCodeIndex(index)
    setTimeout(() => setCopiedCodeIndex(null), 2000)
  }

  // Parse inline elements (bold, links, code spans)
  const parseInline = (text) => {
    if (!text) return ''

    // Match links [label](url), bold **text**, or code `code`
    const regex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g
    const parts = text.split(regex)

    return parts.map((part, pIdx) => {
      if (!part) return null

      // Link: [label](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (linkMatch) {
        const [, label, url] = linkMatch
        return (
          <a
            key={pIdx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: isDark ? '#93c5fd' : '#2563eb',
              textDecoration: 'underline',
              fontWeight: '600'
            }}
          >
            {label}
          </a>
        )
      }

      // Bold: **text**
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={pIdx} style={{ fontWeight: '700' }}>
            {part.slice(2, -2)}
          </strong>
        )
      }

      // Inline code: `code`
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={pIdx}
            style={{
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '12.5px',
              fontFamily: 'monospace'
            }}
          >
            {part.slice(1, -1)}
          </code>
        )
      }

      return part
    })
  }

  // Parse markdown lines
  const parseMarkdown = (text) => {
    const lines = text.split('\n')
    const elements = []
    let inCodeBlock = false
    let codeBuffer = []
    let codeLang = ''

    lines.forEach((line, index) => {
      // Code block ```
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          const codeText = codeBuffer.join('\n')
          const currentIndex = index
          elements.push(
            <div
              key={`code_${index}`}
              style={{
                margin: '12px 0',
                background: '#0f172a',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}
              >
                <span>{codeLang || 'CODE'}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(codeText, currentIndex)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}
                >
                  {copiedCodeIndex === currentIndex ? '✓ Copied' : '📋 Copy code'}
                </button>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: '12px',
                  color: '#f8fafc',
                  fontSize: '13px',
                  overflowX: 'auto',
                  fontFamily: 'monospace',
                  lineHeight: '1.5'
                }}
              >
                <code>{codeText}</code>
              </pre>
            </div>
          )
          codeBuffer = []
          inCodeBlock = false
        } else {
          inCodeBlock = true
          codeLang = line.trim().replace('```', '')
        }
        return
      }

      if (inCodeBlock) {
        codeBuffer.push(line)
        return
      }

      const formattedLine = line

      // Headers
      if (formattedLine.startsWith('### ')) {
        elements.push(
          <h4
            key={`h3_${index}`}
            style={{
              margin: '12px 0 4px',
              fontSize: '15px',
              fontWeight: '700',
              color: 'inherit'
            }}
          >
            {parseInline(formattedLine.replace('### ', ''))}
          </h4>
        )
        return
      }
      if (formattedLine.startsWith('## ')) {
        elements.push(
          <h3
            key={`h2_${index}`}
            style={{
              margin: '14px 0 6px',
              fontSize: '16px',
              fontWeight: '700',
              color: 'inherit'
            }}
          >
            {parseInline(formattedLine.replace('## ', ''))}
          </h3>
        )
        return
      }
      if (formattedLine.startsWith('# ')) {
        elements.push(
          <h2
            key={`h1_${index}`}
            style={{
              margin: '16px 0 8px',
              fontSize: '18px',
              fontWeight: '800',
              color: 'inherit'
            }}
          >
            {parseInline(formattedLine.replace('# ', ''))}
          </h2>
        )
        return
      }

      // Bullet points
      const isBullet =
        formattedLine.trim().startsWith('• ') ||
        formattedLine.trim().startsWith('* ') ||
        formattedLine.trim().startsWith('- ')
      const cleanLine = isBullet ? formattedLine.trim().substring(2) : formattedLine

      const parsedInline = parseInline(cleanLine)

      if (isBullet) {
        elements.push(
          <li
            key={`bullet_${index}`}
            style={{
              marginLeft: '20px',
              marginBottom: '5px',
              lineHeight: '1.6',
              color: 'inherit'
            }}
          >
            {parsedInline}
          </li>
        )
      } else if (cleanLine.trim() === '') {
        elements.push(<div key={`empty_${index}`} style={{ height: '8px' }} />)
      } else {
        elements.push(
          <p
            key={`p_${index}`}
            style={{
              margin: '0 0 6px 0',
              lineHeight: '1.6',
              color: 'inherit'
            }}
          >
            {parsedInline}
          </p>
        )
      }
    })

    return elements
  }

  return <div className="markdown-content">{parseMarkdown(content)}</div>
}
