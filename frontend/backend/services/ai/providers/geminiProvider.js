/**
 * Google Gemini AI Provider
 * Supports multi-turn friendly conversation, dynamic language auto-matching (Sinhala / Singlish / English),
 * system instruction, and fallback error handling.
 */

const SYSTEM_INSTRUCTION = `
You are Aura, the warm, caring, empathetic, and friendly AI Mental Health Companion on the MindSpace platform.

CRITICAL INSTRUCTIONS:
1. LANGUAGE MATCHING RULE (STRICT):
   - If the user writes in Sinhala (සිංහල Unicode) OR Singlish (Sinhala written in English alphabet, e.g. "dukai", "epawela", "pissu wage", "kohomada", "mata stress"), ALWAYS RESPOND IN WARM, COMFORTING SINHALA (සිංහල)!
   - If the user writes in English, respond in English.
   - Match the user's language naturally.

2. CONVERSATIONAL & FRIENDLY PERSONALITY:
   - Speak like a close, caring friend ("යාලුවා", "මම ඔයා ළඟ ඉන්නවා", "හිත සැහැල්ලු කරගමු").
   - Don't give rigid robotic essays. Chat naturally like a human companion!
   - Ask caring follow-up questions to keep the conversation going smoothly.

3. MEDICAL & CRISIS BOUNDARIES:
   - NEVER diagnose medical conditions or prescribe drugs.
   - If the user expresses self-harm or severe crisis, express deep care and provide emergency helpline numbers (1926 NIMH Sri Lanka Helpline, Sumithrayo 011 268 2535, 1990 Ambulance).

4. CONTEXT INTEGRATION:
   - Naturally mention the user's name and mood context (e.g. sleep hours, streak, logged mood) when helpful, but keep it natural and comforting.
`

const generateGeminiResponse = async ({ prompt, conversationHistory = [], userContext = {} }) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.')
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

  const contextString = `
[USER CONTEXT]
User Name: ${userContext.userName || 'Friend'}
Current Mood: ${userContext.latestMood || 'Normal'}
Wellness Streak: ${userContext.streak || 1} Day(s)
Average Score: ${userContext.avgScore ? `${userContext.avgScore}/10` : 'N/A'}
Sleep Hours: ${userContext.latestSleep ? `${userContext.latestSleep} hrs` : 'N/A'}
Water Intake: ${userContext.latestWater ? `${userContext.latestWater} L` : 'N/A'}
Triggers: ${userContext.latestTriggers && userContext.latestTriggers.length > 0 ? userContext.latestTriggers.join(', ') : 'None'}
`

  // Build proper multi-turn Gemini conversation structure
  const formattedContents = []

  // Add initial System Prompt & Context
  formattedContents.push({
    role: 'user',
    parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${contextString}\n\nUser Message: ${prompt}` }]
  })

  // Append recent conversation history turns
  if (conversationHistory && conversationHistory.length > 0) {
    const recentTurns = conversationHistory.slice(-8)
    for (const turn of recentTurns) {
      if (turn.role === 'user') {
        formattedContents.push({
          role: 'user',
          parts: [{ text: turn.message }]
        })
      } else if (turn.role === 'assistant') {
        formattedContents.push({
          role: 'model',
          parts: [{ text: turn.message }]
        })
      }
    }
    // Re-append current prompt
    formattedContents.push({
      role: 'user',
      parts: [{ text: prompt }]
    })
  }

  const payload = {
    contents: formattedContents,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 850,
      topP: 0.95
    }
  }

  let attempts = 0
  const maxAttempts = 2

  while (attempts < maxAttempts) {
    try {
      attempts++
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.warn(`Gemini API Warning (Attempt ${attempts}): Status ${response.status} - ${errorText.substring(0, 150)}`)

        if (response.status === 429 && attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 1000))
          continue
        }
        throw new Error(`Gemini API returned status ${response.status}`)
      }

      const data = await response.json()
      const candidate = data.candidates?.[0]
      const text = candidate?.content?.parts?.[0]?.text

      if (!text) {
        throw new Error('Gemini API returned empty response.')
      }

      return {
        reply: text.trim(),
        provider: 'gemini'
      }
    } catch (err) {
      if (attempts >= maxAttempts) {
        throw err
      }
      await new Promise(r => setTimeout(r, 800))
    }
  }
}

module.exports = { generateGeminiResponse }
