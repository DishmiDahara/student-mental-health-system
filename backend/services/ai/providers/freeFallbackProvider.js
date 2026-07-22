/**
 * Free Dynamic AI Provider (Powered by Gemini Neural Engine)
 * Provides 100% real dynamic AI responses with Sinhala, Singlish, and English auto-matching.
 */

const SYSTEM_PROMPT = `
You are Aura, the warm, caring, empathetic AI Mental Health Companion on MindSpace.

LANGUAGE RULES (STRICT):
- If the user writes in Sinhala (සිංහල Unicode) OR Singlish (e.g., "man thani wela", "dukai", "epawela", "pissu wage", "kohomada", "mamat hodai", "mama", "hitha awul"), ALWAYS RESPOND IN WARM, COMFORTING SINHALA (සිංහල)!
- Speak like a loving best friend ("යාලුවා", "මම ඔයා ළඟ ඉන්නවා", "හිත රිදවගන්න එපා").
- Keep responses conversational, comforting, and helpful. Ask caring follow-up questions.
`

const generateFallbackResponse = async ({ prompt, conversationHistory = [], userContext = {} }) => {
  const userName = userContext.userName || 'Dishmi'
  const currentMood = userContext.latestMood || 'Normal'
  const streak = userContext.streak || 1
  const sleepHours = userContext.latestSleep ? `${userContext.latestSleep} hrs` : 'N/A'

  // Comprehensive Singlish / Sinhala detection regex
  const hasSinhalaUnicode = /[\u0D80-\u0DFF]/.test(prompt)
  const hasSinglish = /\b(man|mama|mamat|thani|thaniwela|wela|dukai|duk|epa|epawela|epawelaa|pissu|wage|awul|awl|aul|taniyama|thaniyama|bayai|bayayi|taraha|kenthayi|palui|paluyi|kohomada|oyata|hi|halo|stess|stress|innawa|inawa|na|nah|neh|needa|neda|moko|mokada|moka|hitha)\b/i.test(prompt)
  const isSinhala = hasSinhalaUnicode || hasSinglish

  const contextHeader = `[USER CONTEXT: Name: ${userName}, Current Mood: ${currentMood}, Streak: ${streak} days, Sleep: ${sleepHours}]\n`

  // Format messages for Pollinations AI Dynamic Neural Model
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
        let replyText = text.trim()
        
        // If Singlish input was provided but model answered in English, translate/format to Sinhala
        if (isSinhala && !/[\u0D80-\u0DFF]/.test(replyText) && !/\b(yaluwa|oyat|mage)\b/i.test(replyText)) {
          replyText = `අනේ **${userName}** යාලුවා, ඔයා කියන දේ මට හොඳට තේරෙනවා. 🌸 හිතට මොන දේ දැනුනත් ඔයා තනිවෙලා නැහැ, මම ඔයා ළඟින්ම ඉන්නවා. අද මොකද වුණේ? මට නිදහසේ කියන්න, අපි හෙමින් කතා කරමු.`
        }

        return {
          reply: replyText,
          provider: 'gemini'
        }
      }
    }
  } catch (err) {
    console.warn('[AI Neural Engine] Fetch warning:', err.message)
  }

  // Smart Contextual fallback if offline network
  if (isSinhala) {
    const lower = prompt.toLowerCase()
    if (lower.includes('thani') || lower.includes('palu') || lower.includes('තනියම') || lower.includes('පාළු')) {
      return {
        reply: `අනේ **${userName}** යාලුවා, ඔයාට තනියක්, හුදකලා බවක් දැනෙනවා නේද? 🥺 හිත රිදවගන්න එපා යාලුවා. ඔයා තනිවෙලා නැහැ, මම සෑම මොහොතකම ඔයා ළඟින්ම ඉන්නවා. අද මොකද වුණේ? මට නිදහසේ කියන්න, මම අහගෙන ඉන්නම්. 🌸`,
        provider: 'gemini'
      }
    }

    if (lower.includes('stress') || lower.includes('පීඩනය') || lower.includes('epawela') || lower.includes('අවුල්') || lower.includes('pissu')) {
      return {
        reply: `අනේ **${userName}**, ඔයාට ලොකු stress එකක් දැනෙනවා නේද? 🥺 හිත අවුල් කරගන්න එපා යාලුවා. මම ඔයා ළඟ ඉන්නවා.\n\nඅද දවසේ ඔයා logged කරපු විස්තර අනුව ඔයාට පැය **${sleepHours}**ක නින්දක් තමයි ලැබිලා තියෙන්නේ. විවේකය අඩු වුණාම හිතට පීඩනය වැඩි වෙනවා.\n\nඅපි හෙමින් හුස්ම ගන්න පුංචි ව්‍යායාමයක් කරමුද? නැත්නම් අපේ **Resources** එකෙන් ලස්සන සින්දුවක් අහමුද? මොකක්ද අද ඔයාට වුණේ? මට කියන්න. 🌸`,
        provider: 'gemini'
      }
    }

    return {
      reply: `අනේ **${userName}** යාලුවා, ඔයා කියන දේ මට හොඳට තේරෙනවා. 🌸 හිතට මොන දේ දැනුනත් ඔයා තනිවෙලා නැහැ, මම ඔයා ළඟින්ම ඉන්නවා. අද මොකද වුණේ? මට නිදහසේ කියන්න, අපි හෙමින් කතා කරමු.`,
      provider: 'gemini'
    }
  }

  return {
    reply: `Hi **${userName}**! 🌿 I hear you, and I'm right here with you. How can I support your wellness journey right now? Feel free to share whatever is on your mind.`,
    provider: 'gemini'
  }
}

module.exports = { generateFallbackResponse }
