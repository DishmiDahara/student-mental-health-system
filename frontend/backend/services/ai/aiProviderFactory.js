/**
 * MindSpace - AI Provider Factory
 * 
 * Routes conversational queries to the Google Gemini AI provider.
 * Forgiving resolution: Always routes to Google Gemini, handling any placeholder
 * environment variables gracefully.
 */

const { generateGeminiResponse } = require('./providers/geminiProvider')

/**
 * Generates an AI response using Google Gemini
 * @param {Object} params
 * @param {string} params.prompt
 * @param {Array} params.conversationHistory
 * @returns {Promise<{ reply: string, provider: string }>}
 */
const generateAIResponse = async ({ prompt, conversationHistory = [] }) => {
  try {
    return await generateGeminiResponse({ prompt, conversationHistory })
  } catch (err) {
    console.error('[AI Provider Factory] Gemini request failed:', err.message)

    let userFriendlyMessage = "I'm having a little trouble connecting to my AI service right now. Please take a gentle breath, wait a moment, and try sending your message again."

    if (err.isConfigError) {
      userFriendlyMessage = err.message || "Aura is waiting for a valid GEMINI_API_KEY. In Vercel Project Settings > Environment Variables, please ensure GEMINI_API_KEY is configured for both Production and Preview."
    } else if (err.status === 429) {
      userFriendlyMessage = "I'm receiving a lot of messages right now. Please wait a minute and try again."
    } else if (err.status === 401 || err.status === 403 || err.status === 400) {
      userFriendlyMessage = "Google Gemini reported an invalid or unauthorized API key (HTTP " + (err.status || 400) + "). Please verify your GEMINI_API_KEY in Google AI Studio and ensure it is saved in Vercel for both Production and Preview."
    }

    const friendlyError = new Error(userFriendlyMessage)
    friendlyError.isUserFriendly = true
    friendlyError.provider = 'gemini'
    throw friendlyError
  }
}

module.exports = { generateAIResponse }
