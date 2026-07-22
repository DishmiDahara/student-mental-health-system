/**
 * Free Dynamic AI Provider (Powered by Pollinations AI & Dynamic NLP)
 * Provides 100% real dynamic AI responses in Sinhala, Singlish, and English
 * without requiring any paid API key!
 */

const SYSTEM_PROMPT = `
You are Aura, the warm, caring, empathetic AI Mental Health Companion on MindSpace.
- If the user messages in Sinhala (සිංහල Unicode) or Singlish (e.g., "dukai", "epawela", "pissu wage", "kohomada", "mamat hodai"), ALWAYS RESPOND IN WARM, COMFORTING SINHALA (සිංහල)!
- Speak like a close, loving friend ("යාලුවා", "මම ඔයා ළඟ ඉන්නවා").
- Keep responses conversational, concise, and helpful. Ask caring follow-up questions.
- Never give medical diagnoses.
`

const generateFallbackResponse = async ({ prompt, conversationHistory = [], userContext = {} }) => {
  const userName = userContext.userName || 'යාලුවා'
  const currentMood = userContext.latestMood || 'Normal'
  const streak = userContext.streak || 1
  const sleepHours = userContext.latestSleep ? `${userContext.latestSleep} hrs` : 'N/A'

  const contextHeader = `[USER CONTEXT: Name: ${userName}, Current Mood: ${currentMood}, Streak: ${streak} days, Sleep: ${sleepHours}]\n`

  // Format messages array for Pollinations AI
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT + '\n' + contextHeader }
  ]

  if (conversationHistory && conversationHistory.length > 0) {
    const recent = conversationHistory.slice(-6)
    for (const msg of recent) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.message })
      }
    }
  }

  messages.push({ role: 'user', content: prompt })

  try {
    // Try Pollinations AI Free Dynamic Text API first
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages,
        model: 'openai',
        seed: Math.floor(Math.random() * 1000)
      })
    })

    if (response.ok) {
      const text = await response.text()
      if (text && text.trim().length > 0) {
        return {
          reply: text.trim(),
          provider: 'dynamic_ai'
        }
      }
    }
  } catch (err) {
    console.warn('[Dynamic AI Fallback] Pollinations fetch error:', err.message)
  }

  // Smart Contextual fallback if offline network
  const hasSinhalaUnicode = /[\u0D80-\u0DFF]/.test(prompt)
  const hasSinglish = /\b(dukai|duk|epa|epawela|epawelaa|pissu|wage|awul|awl|aul|taniyama|thaniyama|bayai|bayayi|taraha|kenthayi|palui|paluyi|kohomada|oyata|mamat|mama|hi|halo|stess|stress)\b/i.test(prompt)
  const isSinhala = hasSinhalaUnicode || hasSinglish

  if (isSinhala) {
    return {
      reply: `අනේ **${userName}** යාලුවා, ඔයා කියන දේ මට හොඳට තේරෙනවා. 🌸 හිතට මොන දේ දැනුනත් ඔයා තනිවෙලා නැහැ, මම ඔයා ළඟ ඉන්නවා. අද දවසේ මොකක්ද ඔයාගේ සිතට බලපෑවේ? මට නිදහසේ කියන්න, අපි හෙමින් කතා කරමු.`,
      provider: 'free_fallback'
    }
  }

  return {
    reply: `Hi **${userName}**! 🌿 I hear you, and I'm right here with you. How can I support your wellness journey right now? Feel free to share whatever is on your mind.`,
    provider: 'free_fallback'
  }
}

module.exports = { generateFallbackResponse }
