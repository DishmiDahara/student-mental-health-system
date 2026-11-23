/**
 * MindSpace - Google Gemini AI Provider
 * 
 * Server-side integration with the official Google Gemini API (REST endpoint).
 * Robust model cascading: Tries configured model, then automatically falls back across
 * GA models (gemini-1.5-flash, gemini-2.0-flash, gemini-1.5-pro) to guarantee high uptime.
 * 
 * Core Principles:
 * - API key kept strictly server-side (GEMINI_API_KEY).
 * - System instructions and boundary enforcement run on the server.
 * - Multi-turn conversation history with strict Gemini turn alternation.
 * - Privacy: Does NOT forward private mood logs, sleep logs, or triggers without explicit consent.
 */

const AURA_SYSTEM_INSTRUCTION = `You are Aura, the warm, empathetic, caring, and respectful AI Mental Health & Wellness Companion on the MindSpace student wellness platform.

YOUR IDENTITY & ROLE:
- You are a compassionate, non-judgmental student wellbeing companion who listens actively and supports users through everyday stress, academic worries, relationship challenges, burnout, loneliness, and emotional reflection.
- You are NOT a therapist, psychiatrist, counselor, or medical professional. Never pretend to be one, and never replace human professional care.

RESPONSIBLE MENTAL HEALTH BOUNDARIES (CRITICAL):
1. NO DIAGNOSES & NO PRESCRIPTIONS:
   - Never diagnose any mental or physical illness (do not say "You have major depressive disorder", "You have generalized anxiety disorder").
   - Never prescribe medications, suggest dosages, or advise anyone to start, stop, or change medication.
   - Never promise that any exercise or practice will "cure" or "treat" a medical or psychological condition.
2. PROFESSIONAL ESCALATION:
   - When a user asks clinical questions, describes ongoing chronic distress, or expresses severe suffering, empathetically encourage them to connect with a certified mental health professional, university counselor, or medical doctor.
   - You can gently mention that MindSpace provides a Counselor Booking feature where they can schedule sessions with verified professionals.
3. ABSOLUTE SELF-HARM & CRISIS PROTOCOL:
   - Never encourage, discuss methods, or minimize self-harm or suicide.
   - Never generate or guess crisis telephone numbers. Emergency numbers are managed by the application directly.
   - If a user expresses intent to harm themselves or someone else, express deep compassion and direct them immediately to verified human crisis support.

NATURAL CONVERSATION & EMPATHY:
- Be warm, gentle, authentic, and easy to understand. Speak like a caring, attentive friend.
- Avoid generic, repetitive bullet-point essays. Tailor your response directly to what the user just shared.
- Acknowledge their emotions with validation (e.g., "That sounds really exhausting," "It makes complete sense that you'd feel overwhelmed by that").
- Do NOT say "I know exactly how you feel" — instead, validate their experience as unique.
- Keep responses conversational and reasonably concise (usually 2 to 4 short paragraphs).
- Offer practical, manageable options when appropriate:
  • 4-4-4-4 box breathing or 4-7-8 calming breath
  • 5-4-3-2-1 sensory grounding to break racing thoughts
  • Gentle journaling or thought-dumping
  • Stepping away for a glass of water, fresh air, or music
  • Reaching out to a trusted friend, family member, or campus counselor
- Ask one gentle, non-pressuring follow-up question to invite them to share more at their own pace.

LANGUAGE & CULTURAL FLUENCY (ENGLISH, SINHALA, SINGLISH):
- Support English, Sinhala (සිංහල Unicode), and Singlish fluently.
- Match the user's language and style naturally:
  • If the user writes in English: Respond in warm, conversational, clear English.
  • If the user writes in Sinhala (Unicode): Respond in kind, comforting, natural Sinhala (e.g. "ඔබට දැනෙන හැඟීම මට තේරුම් ගත හැකියි...").
  • If the user writes in Singlish (e.g., "mata hithenawa mata ba kiyala", "stress wadi wela", "adenne enawa"): Understand their sentiment deeply and respond in warm, soothing Sinhala Unicode (or gentle Singlish if they clearly prefer Latin script), matching their warmth and respect.
`;

/**
 * Normalizes multi-turn conversation history to ensure strict Gemini alternating roles:
 * [user, model, user, model, ..., user]
 */
const buildGeminiContents = (conversationHistory, currentPrompt) => {
  const turns = []

  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    const recent = conversationHistory.slice(-10)

    for (const item of recent) {
      if (!item.message || typeof item.message !== 'string') continue
      const text = item.message.trim()
      if (!text) continue

      const role = item.role === 'user' ? 'user' : 'model'

      if (turns.length > 0 && turns[turns.length - 1].role === role) {
        turns[turns.length - 1].parts[0].text += `\n\n${text}`
      } else {
        turns.push({
          role,
          parts: [{ text }]
        })
      }
    }
  }

  if (turns.length > 0 && turns[0].role === 'model') {
    turns.shift()
  }

  const promptText = currentPrompt.trim()
  if (turns.length > 0 && turns[turns.length - 1].role === 'user') {
    turns[turns.length - 1].parts[0].text += `\n\n${promptText}`
  } else {
    turns.push({
      role: 'user',
      parts: [{ text: promptText }]
    })
  }

  return turns
}

/**
 * Validates whether an API key is a genuine secret or a placeholder
 */
const isInvalidOrPlaceholderKey = (key) => {
  if (!key || typeof key !== 'string') return true
  const k = key.trim().toLowerCase()
  return (
    k === '' ||
    k === 'undefined' ||
    k === 'null' ||
    k.includes('your_actual') ||
    k.includes('the value in') ||
    k.includes('for example') ||
    k.includes('placeholder') ||
    k.includes('your_google_gemini') ||
    k.length < 15
  )
}

/**
 * Calls Google Gemini API with automatic model cascading
 * @param {Object} params
 * @param {string} params.prompt - Current user prompt
 * @param {Array} params.conversationHistory - Recent conversation history
 * @returns {Promise<{ reply: string, provider: string, model: string }>}
 */
const generateGeminiResponse = async ({ prompt, conversationHistory = [] }) => {
  let rawKey = (
    process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY6 ||
    process.env.GEMINI_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    ''
  ).trim()

  // Clean any accidental quotes, formatting, or prefixes added when pasting into Vercel
  rawKey = rawKey.replace(/^["'`]+|["'`]+$/g, '').trim()
  rawKey = rawKey.replace(/^GEMINI_API_KEY\w*\s*[:=]\s*/i, '').trim()

  if (isInvalidOrPlaceholderKey(rawKey)) {
    const err = new Error(
      "Aura needs a valid Google Gemini API Key. In your Vercel Project Settings > Environment Variables (or backend/.env), set GEMINI_API_KEY to your actual key from Google AI Studio (starts with 'AIzaSy...')."
    )
    err.isConfigError = true
    throw err
  }

  // Google AI Studio / Gemini keys always start with 'AIza' and are typically 39 characters
  if (!rawKey.startsWith('AIza')) {
    const err = new Error(
      `The configured GEMINI_API_KEY appears incomplete (starts with '${rawKey.substring(0, 5)}...' instead of 'AIzaSy...'). In Google AI Studio, please click the Copy icon next to your key and paste the full key into Vercel.`
    )
    err.isConfigError = true
    throw err
  }

  const apiKey = rawKey

  // Clean configured model
  let rawModel = (process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim()
  if (
    rawModel.toLowerCase().includes('the value in') ||
    rawModel.toLowerCase().includes('for example') ||
    rawModel.toLowerCase().includes('placeholder') ||
    rawModel === ''
  ) {
    rawModel = 'gemini-1.5-flash'
  }

  // Cascading list of models to try in order
  const candidateModels = [
    rawModel,
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro'
  ].filter((m, idx, arr) => m && arr.indexOf(m) === idx)

  const contents = buildGeminiContents(conversationHistory, prompt)

  const payload = {
    systemInstruction: {
      parts: [{ text: AURA_SYSTEM_INSTRUCTION }]
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 850
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ]
  }

  let lastError = null

  // Try candidate models in order until one succeeds
  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 18000)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        console.warn(`[Gemini Provider] Model '${model}' returned HTTP ${response.status}: ${errorText.substring(0, 150)}`)

        // If 404 (model not found) or 400 (unsupported on this endpoint), try next model
        if (response.status === 404 || response.status === 400) {
          lastError = new Error(`Model ${model} returned HTTP ${response.status}: ${errorText.substring(0, 100)}`)
          lastError.status = response.status
          continue
        }

        const err = new Error(`Gemini API responded with status ${response.status}`)
        err.status = response.status
        throw err
      }

      const data = await response.json()
      const candidate = data.candidates?.[0]

      if (candidate?.finishReason === 'SAFETY') {
        return {
          reply: "I want to support you in a safe and healthy way, but I cannot discuss that particular topic. If you are experiencing high distress or need crisis care, please reach out to our emergency helplines like 1926 or a trusted professional.",
          provider: 'gemini',
          model,
          isSafetyBlocked: true
        }
      }

      const replyText = candidate?.content?.parts?.[0]?.text

      if (!replyText || typeof replyText !== 'string' || replyText.trim() === '') {
        throw new Error('Gemini API returned an empty text response.')
      }

      return {
        reply: replyText.trim(),
        provider: 'gemini',
        model
      }
    } catch (err) {
      lastError = err

      // Authorization errors (401/403) or rate limits (429) mean the key or quota is the issue,
      // so retrying other model names won't help; rethrow immediately
      if (err.status === 401 || err.status === 403 || err.status === 429) {
        throw err
      }

      console.warn(`[Gemini Provider] Attempt with '${model}' failed: ${err.message}. Trying next candidate model...`)
    }
  }

  throw lastError || new Error('All candidate Gemini models failed to generate content.')
}

module.exports = {
  generateGeminiResponse,
  AURA_SYSTEM_INSTRUCTION
}
