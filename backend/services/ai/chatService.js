/**
 * MindSpace - Chat Service
 * 
 * Coordinates chat processing, multi-turn history scoping, crisis detection,
 * and persistence.
 * 
 * Strict Privacy & Safety Guarantees:
 * - Multi-layered crisis detection triggers verified emergency resources.
 * - Chat history is scoped strictly to the authenticated user and conversation.
 * - Does NOT send private mood logs, sleep logs, or profile details to the AI provider.
 */

const ChatHistory = require('../../models/ChatHistory')
const { generateAIResponse } = require('./aiProviderFactory')
const { detectCrisis } = require('./crisisDetector')
const { CRISIS_RESOURCES, buildCrisisResponse } = require('../../config/crisisResources')

/**
 * Processes an incoming user message
 * @param {Object} params
 * @param {string} params.userId - Authenticated user ObjectId
 * @param {string} params.message - Sanitized message text
 * @param {string} [params.conversationId] - Active conversation UUID or identifier
 * @returns {Promise<{ reply: string, provider: string, conversationId: string, isCrisis: boolean, crisisResources?: Array }>}
 */
const processUserMessage = async ({ userId, message, conversationId }) => {
  const cleanMessage = (message || '').trim()
  const activeConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

  // 1. Multi-layered crisis intent detection
  const crisisEvaluation = detectCrisis(cleanMessage)

  if (crisisEvaluation.isCrisis) {
    const crisisReply = buildCrisisResponse(crisisEvaluation.language)

    // Persist crisis exchange to database with crisis flag
    await ChatHistory.create([
      {
        userId,
        conversationId: activeConversationId,
        role: 'user',
        message: cleanMessage,
        provider: 'gemini',
        isCrisis: true
      },
      {
        userId,
        conversationId: activeConversationId,
        role: 'assistant',
        message: crisisReply,
        provider: 'gemini',
        isCrisis: true
      }
    ])

    return {
      reply: crisisReply,
      provider: 'gemini',
      conversationId: activeConversationId,
      isCrisis: true,
      crisisResources: CRISIS_RESOURCES.sriLanka.resources
    }
  }

  // 2. Fetch scoped recent conversation history (strictly for this user and conversation)
  const historyRecords = await ChatHistory.find({
    userId,
    conversationId: activeConversationId
  })
    .sort({ timestamp: 1 })
    .limit(10)
    .lean()

  // 3. Request response from Google Gemini AI
  // Note: Sensitive mood logs, health metrics, and profile data are NOT transmitted.
  const aiResult = await generateAIResponse({
    prompt: cleanMessage,
    conversationHistory: historyRecords
  })

  // 4. Persist user message and AI response to MongoDB
  await ChatHistory.create([
    {
      userId,
      conversationId: activeConversationId,
      role: 'user',
      message: cleanMessage,
      provider: aiResult.provider || 'gemini',
      isCrisis: false
    },
    {
      userId,
      conversationId: activeConversationId,
      role: 'assistant',
      message: aiResult.reply,
      provider: aiResult.provider || 'gemini',
      isCrisis: false
    }
  ])

  return {
    reply: aiResult.reply,
    provider: aiResult.provider || 'gemini',
    conversationId: activeConversationId,
    isCrisis: false
  }
}

module.exports = {
  processUserMessage
}
