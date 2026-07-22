/**
 * AI Provider Factory
 * Dynamically resolves provider based on AI_PROVIDER environment variable.
 * Fallback priority:
 * Configured Provider (e.g. Gemini / OpenRouter) -> Alternate Free Provider -> Free Fallback Engine
 */

const { generateGeminiResponse } = require('./providers/geminiProvider')
const { generateOpenRouterResponse } = require('./providers/openrouterProvider')
const { generateFallbackResponse } = require('./providers/freeFallbackProvider')

const generateAIResponse = async ({ prompt, conversationHistory = [], userContext = {} }) => {
  const configuredProvider = (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim()

  console.log(`[AI Provider Factory] Executing provider: '${configuredProvider}'`)

  // 1. Try Configured Provider first
  if (configuredProvider === 'gemini') {
    try {
      return await generateGeminiResponse({ prompt, conversationHistory, userContext })
    } catch (err) {
      console.warn('[AI Factory] Gemini Provider failed:', err.message, '--> Trying fallback.')
    }
  }

  if (configuredProvider === 'openrouter') {
    try {
      return await generateOpenRouterResponse({ prompt, conversationHistory, userContext })
    } catch (err) {
      console.warn('[AI Factory] OpenRouter Provider failed:', err.message, '--> Trying fallback.')
    }
  }

  // 2. Try secondary provider if Gemini failed or OpenRouter failed
  if (process.env.OPENROUTER_API_KEY) {
    try {
      return await generateOpenRouterResponse({ prompt, conversationHistory, userContext })
    } catch (err) {
      console.warn('[AI Factory] Secondary OpenRouter failed:', err.message)
    }
  }

  // 3. Guaranteed Free Fallback Engine (Never fails!)
  console.log('[AI Factory] Using Free Fallback Engine for instant response.')
  return generateFallbackResponse({ prompt, conversationHistory, userContext })
}

module.exports = { generateAIResponse }
