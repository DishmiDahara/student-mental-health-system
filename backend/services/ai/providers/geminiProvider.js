/**
 * Google Gemini AI Provider
 * Uses Gemini REST API with retry, rate limit handling, and system instruction.
 */

const SYSTEM_INSTRUCTION = `
You are MindSpace AI, an empathetic, supportive, friendly, calm, and professional mental wellness assistant.
Your goal is to guide students in understanding their mood reports, improving emotional wellness, and navigating the MindSpace platform.

RULES:
1. NEVER diagnose medical conditions or pretend to be a medical doctor.
2. NEVER prescribe medication.
3. Be warm, empathetic, clear, concise, and encouraging.
4. Use markdown formatting, bullet points, and appropriate emojis to make responses easy to read.
5. Utilize the user's provided mood context (Name, mood score, streak, sleep, triggers) naturally when answering questions like "Why am I stressed?" or "Explain my report".
`

const generateGeminiResponse = async ({ prompt, conversationHistory = [], userContext = {} }) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.')
  }

  // Model endpoints to try (gemini-1.5-flash or gemini-2.0-flash)
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

  // Format context summary
  const contextString = `
[USER CONTEXT]
User Name: ${userContext.userName || 'User'}
Current Mood: ${userContext.latestMood || 'Not logged today'}
Wellness Streak: ${userContext.streak || 1} Day(s)
Average Mood Score: ${userContext.avgScore ? `${userContext.avgScore}/10` : 'N/A'}
Latest Sleep: ${userContext.latestSleep ? `${userContext.latestSleep} hrs` : 'N/A'}
Latest Water: ${userContext.latestWater ? `${userContext.latestWater} L` : 'N/A'}
Recent Triggers: ${userContext.latestTriggers && userContext.latestTriggers.length > 0 ? userContext.latestTriggers.join(', ') : 'None'}
`

  // Format conversation history for Gemini contents array
  const formattedContents = []

  // Add system & context instruction in initial content
  formattedContents.push({
    role: 'user',
    parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${contextString}\n\nUser Question: ${prompt}` }]
  })

  // Add previous conversation turns if available
  if (conversationHistory && conversationHistory.length > 0) {
    const recentTurns = conversationHistory.slice(-6)
    for (const turn of recentTurns) {
      if (turn.role === 'user' || turn.role === 'assistant') {
        formattedContents.push({
          role: turn.role === 'user' ? 'user' : 'model',
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
      temperature: 0.7,
      maxOutputTokens: 900,
      topP: 0.95
    }
  }

  // Fetch with retry logic (up to 2 retries)
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
          // Rate limited, wait 1s then retry
          await new Promise(r => setTimeout(r, 1000))
          continue
        }
        throw new Error(`Gemini API returned status ${response.status}`)
      }

      const data = await response.json()
      const candidate = data.candidates?.[0]
      const text = candidate?.content?.parts?.[0]?.text

      if (!text) {
        throw new Error('Gemini API returned an empty response.')
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
