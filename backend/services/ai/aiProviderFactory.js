/**
 * MindSpace - AI Provider Factory
 * 
 * Routes conversational queries to the Google Gemini AI provider.
 * Enforces strict compliance:
 * - Does NOT silently switch to alternate providers upon Gemini failure.
 * - Handles errors with friendly retry messaging without exposing raw system faults.
 */

const { generateGeminiResponse } = require('./providers/geminiProvider')

/**
 * Generates an AI response using the configured provider (default: Google Gemini)
 * @param {Object} params
 * @param {string} params.prompt
 * @param {Array} params.conversationHistory
 * @returns {Promise<{ reply: string, provider: string }>}
 */
const generateAIResponse = async ({ prompt, conversationHistory = [] }) => {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim()

  if (provider === 'gemini') {
    try {
      return await generateGeminiResponse({ prompt, conversationHistory })
    } catch (err) {
      console.error('[AI Provider Factory] Gemini request failed:', err.message)

      // Friendly empathetic message according to requirements
      let userFriendlyMessage = "I'm having a little trouble connecting to my AI service right now. Please take a gentle breath, wait a moment, and try sending your message again."

      if (err.isConfigError) {
        userFriendlyMessage = "Aura's AI service is currently undergoing maintenance. Please check back shortly, or reach out to our emergency support resources if you need immediate care."
      } else if (err.status === 429) {
        userFriendlyMessage = "I'm receiving a lot of messages right now. Please wait a minute and try again."
      }

      const friendlyError = new Error(userFriendlyMessage)
      friendlyError.isUserFriendly = true
      friendlyError.provider = 'gemini'
      throw friendlyError
    }
  }

  // Fallback check: if someone explicitly set another provider, throw clear error
  const err = new Error(`Unsupported AI provider '${provider}'. MindSpace is configured to use Google Gemini.`)
  err.isUserFriendly = true
  err.provider = provider
  throw err
}

module.exports = { generateAIResponse }
