/**
 * OpenRouter AI Provider
 * Supports free models on OpenRouter (e.g. meta-llama/llama-3.2-11b-vision-instruct:free, google/gemini-2.5-flash:free)
 */

const generateOpenRouterResponse = async ({ prompt, conversationHistory = [], userContext = {} }) => {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured in environment variables.')
  }

  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-11b-vision-instruct:free'

  const messages = [
    {
      role: 'system',
      content: `You are MindSpace AI, an empathetic mental wellness assistant. User: ${userContext.userName || 'Friend'}. Current Mood: ${userContext.latestMood || 'Normal'}. Streak: ${userContext.streak || 1} day(s). Provide supportive, calm, non-medical advice with markdown formatting.`
    }
  ]

  if (conversationHistory && conversationHistory.length > 0) {
    const recent = conversationHistory.slice(-4)
    for (const msg of recent) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.message })
      }
    }
  }

  messages.push({ role: 'user', content: prompt })

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mindspace.app',
      'X-Title': 'MindSpace AI'
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 800
    })
  })

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`)
  }

  const data = await response.json()
  const reply = data.choices?.[0]?.message?.content

  if (!reply) {
    throw new Error('OpenRouter returned empty response.')
  }

  return {
    reply: reply.trim(),
    provider: 'openrouter'
  }
}

module.exports = { generateOpenRouterResponse }
