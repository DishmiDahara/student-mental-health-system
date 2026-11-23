/**
 * MindSpace - Google Gemini AI Provider
 * 
 * Server-side integration with the official Google Gemini API (REST endpoint).
 * Model: Generally Available (GA) flagship lightweight model: gemini-2.0-flash (default),
 * with support for gemini-1.5-flash via GEMINI_MODEL env var.
 * 
 * Core Principles:
 * - API key kept strictly server-side (GEMINI_API_KEY).
 * - System instructions and boundary enforcement run on the server.
 * - Multi-turn conversation history with strict Gemini turn alternation.
 * - Handles rate limits, timeouts, safety blocks, and network failures with user-friendly messages.
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
    // Only take the last 8-10 turns for context continuity without bloating token payload
    const recent = conversationHistory.slice(-10)

    for (const item of recent) {
      if (!item.message || typeof item.message !== 'string') continue
      const text = item.message.trim()
      if (!text) continue

      // Map roles: 'user' -> 'user', 'assistant'/'model' -> 'model'
      const role = item.role === 'user' ? 'user' : 'model'

      if (turns.length > 0 && turns[turns.length - 1].role === role) {
        // Merge consecutive turns of the same role to satisfy Gemini's turn alternation rule
        turns[turns.length - 1].parts[0].text += `\n\n${text}`
      } else {
        turns.push({
          role,
          parts: [{ text }]
        })
      }
    }
  }

  // Ensure conversation starts with 'user'
  if (turns.length > 0 && turns[0].role === 'model') {
    turns.shift()
  }

  // Ensure current prompt is the final 'user' turn
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
 * Calls Google Gemini API
 * @param {Object} params
 * @param {string} params.prompt - Current user prompt
 * @param {Array} params.conversationHistory - Recent conversation history
 * @returns {Promise<{ reply: string, provider: string }>}
 */
const generateGeminiResponse = async ({ prompt, conversationHistory = [] }) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (
    !apiKey ||
    apiKey.trim() === '' ||
    apiKey.trim() === 'your_actual_key' ||
    apiKey.trim() === 'your_google_gemini_api_key_here'
  ) {
    const err = new Error('GEMINI_API_KEY is not configured with a valid key on the server.')
    err.isConfigError = true
    throw err
  }

  // Desired model name (e.g. gemini-3.8-flash, gemini-2.0-flash, or gemini-1.5-flash)
  let activeModel = (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim()
  let endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(activeModel)}:generateContent?key=${apiKey}`

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

  const maxAttempts = 2
  let attempt = 0

  while (attempt < maxAttempts) {
    attempt++
    try {
      // 18-second timeout using native AbortSignal
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 18000)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        console.warn(`[Gemini Provider] API returned HTTP ${response.status} (attempt ${attempt}/${maxAttempts}): ${errorText.substring(0, 140)}`)

        // If the specified model is not found on Google's v1beta endpoint (HTTP 404),
        // gracefully fall back to the Generally Available workhorse (gemini-2.0-flash or gemini-1.5-flash)
        if (response.status === 404 && activeModel !== 'gemini-2.0-flash' && activeModel !== 'gemini-1.5-flash') {
          console.warn(`[Gemini Provider] Model '${activeModel}' not found (HTTP 404). Automatically falling back to 'gemini-2.0-flash'...`)
          activeModel = 'gemini-2.0-flash'
          endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(activeModel)}:generateContent?key=${apiKey}`
          continue
        }

        if (response.status === 429 && attempt < maxAttempts) {
          // Rate limited: backoff slightly and retry once
          await new Promise(r => setTimeout(r, 1200))
          continue
        }

        const err = new Error(`Gemini API responded with status ${response.status}`)
        err.status = response.status
        throw err
      }

      const data = await response.json()
      const candidate = data.candidates?.[0]

      // Check if blocked by safety filter
      if (candidate?.finishReason === 'SAFETY') {
        return {
          reply: "I want to support you in a safe and healthy way, but I cannot discuss that particular topic. If you are experiencing high distress or need crisis care, please reach out to our emergency helplines like 1926 or a trusted professional.",
          provider: 'gemini',
          isSafetyBlocked: true
        }
      }

      const replyText = candidate?.content?.parts?.[0]?.text

      if (!replyText || typeof replyText !== 'string' || replyText.trim() === '') {
        throw new Error('Gemini API returned an empty text response.')
      }

      return {
        reply: replyText.trim(),
        provider: 'gemini'
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn(`[Gemini Provider] Request timed out on attempt ${attempt}.`)
      }

      if (attempt >= maxAttempts) {
        throw err
      }

      await new Promise(r => setTimeout(r, 800))
    }
  }
}

module.exports = {
  generateGeminiResponse,
  AURA_SYSTEM_INSTRUCTION
}
