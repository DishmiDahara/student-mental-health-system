import React, { useState } from 'react'

export const MarkdownRenderer = ({ content }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null)

  if (!content) return null

  // Function to copy code blocks
  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedCodeIndex(index)
    setTimeout(() => setCopiedCodeIndex(null), 2000)
  }

  // Basic Markdown & Code Parser
  const parseMarkdown = (text) => {
    const lines = text.split('\n')
    const elements = []
    let inCodeBlock = false
    let codeBuffer = []
    let codeLang = ''

    lines.forEach((line, index) => {
      // Check code block ```
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Close code block
          const codeText = codeBuffer.join('\n')
          const currentIndex = index
          elements.push(
            <div key={`code_${index}`} style={{ margin: '12px 0', background: '#1e293b', borderRadius: '10px', overflow: 'hidden', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: '#0f172a', color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}>
                <span>{codeLang || 'CODE'}</span>
                <button
                  onClick={() => copyToClipboard(codeText, currentIndex)}
                  style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                >
                  {copiedCodeIndex === currentIndex ? '✓ Copied' : '📋 Copy code'}
                </button>
              </div>
              <pre style={{ margin: 0, padding: '12px', color: '#f8fafc', fontSize: '13px', overflowX: 'auto', fontFamily: 'monospace', lineHeight: '1.5' }}>
                <code>{codeText}</code>
              </pre>
            </div>
          )
          codeBuffer = []
          inCodeBlock = false
        } else {
          // Start code block
          inCodeBlock = true
          codeLang = line.trim().replace('```', '')
        }
        return
      }

      if (inCodeBlock) {
        codeBuffer.push(line)
        return
      }

      // Process normal text formatting
      let formattedLine = line

      // Headers (e.g. ### Header)
      if (formattedLine.startsWith('### ')) {
        elements.push(<h4 key={`h3_${index}`} style={{ margin: '10px 0 4px', fontSize: '15px', fontWeight: '700' }}>{formattedLine.replace('### ', '')}</h4>)
        return
      }
      if (formattedLine.startsWith('## ')) {
        elements.push(<h3 key={`h2_${index}`} style={{ margin: '12px 0 6px', fontSize: '16px', fontWeight: '700' }}>{formattedLine.replace('## ', '')}</h3>)
        return
      }
      if (formattedLine.startsWith('# ')) {
        elements.push(<h2 key={`h1_${index}`} style={{ margin: '14px 0 8px', fontSize: '17px', fontWeight: '800' }}>{formattedLine.replace('# ', '')}</h2>)
        return
      }

      // Bullet points
      const isBullet = formattedLine.trim().startsWith('• ') || formattedLine.trim().startsWith('* ') || formattedLine.trim().startsWith('- ')
      const cleanLine = isBullet ? formattedLine.trim().substring(2) : formattedLine

      // Inline Bold formatting **text**
      const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g)
      const parsedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ fontWeight: '700' }}>{part.slice(2, -2)}</strong>
        }
        return part
      })

      if (isBullet) {
        elements.push(
          <li key={`bullet_${index}`} style={{ marginLeft: '16px', marginBottom: '4px', lineHeight: '1.55' }}>
            {parsedParts}
          </li>
        )
      } else if (cleanLine.trim() === '') {
        elements.push(<div key={`empty_${index}`} style={{ height: '6px' }} />)
      } else {
        elements.push(
          <p key={`p_${index}`} style={{ margin: '0 0 6px 0', lineHeight: '1.55' }}>
            {parsedParts}
          </p>
        )
      }
    })

    return elements
  }

  return <div className="markdown-content">{parseMarkdown(content)}</div>
}
