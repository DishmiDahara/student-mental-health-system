import { useState, useEffect } from 'react'

export const useTypingAnimation = (fullText, speed = 12, enabled = true) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!enabled || !fullText) {
      setDisplayedText(fullText || '')
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    let index = 0
    setDisplayedText('')

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(prev => prev + fullText.charAt(index))
        index++
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [fullText, speed, enabled])

  return { displayedText, isTyping }
}
