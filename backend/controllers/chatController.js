const { processUserMessage } = require('../services/ai/chatService')
const ChatHistory = require('../models/ChatHistory')

// POST /api/ai/chat - Process user message with Google Gemini AI
const handleSendMessage = async (req, res) => {
  try {
    const userId = req.user.id
    const { message, conversationId } = req.body

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ message: 'Please provide a valid message.' })
    }

    const result = await processUserMessage({
      userId,
      message: message.trim(),
      conversationId
    })

    return res.json(result)
  } catch (err) {
    // Log system error category without logging private message content
    console.error('[Chat Controller] Request processing error:', err.message || 'Unknown error')

    const friendlyReply = err.isUserFriendly
      ? err.message
      : "I'm having a little trouble connecting to my AI service right now. Please wait a moment and try sending your message again."

    return res.status(503).json({
      reply: friendlyReply,
      provider: 'gemini',
      isError: true
    })
  }
}

// GET /api/ai/history - Retrieve user's conversation history
const handleGetHistory = async (req, res) => {
  try {
    const userId = req.user.id
    const conversationId = req.query.conversationId

    // Strictly scoped to the authenticated user
    const query = { userId }
    if (conversationId && typeof conversationId === 'string') {
      query.conversationId = conversationId.trim()
    }

    const history = await ChatHistory.find(query)
      .sort({ timestamp: 1 })
      .limit(60)
      .lean()

    return res.json({ history })
  } catch (err) {
    console.error('[Chat Controller] Get history error:', err.message || 'Unknown error')
    return res.status(500).json({ message: 'Unable to retrieve chat history at this time.' })
  }
}

// DELETE /api/ai/history - Permanently clear conversation history
const handleClearHistory = async (req, res) => {
  try {
    const userId = req.user.id
    const conversationId = req.query.conversationId

    // Strictly scoped to the authenticated user
    const query = { userId }
    if (conversationId && typeof conversationId === 'string') {
      query.conversationId = conversationId.trim()
    }

    const deleteResult = await ChatHistory.deleteMany(query)
    return res.json({
      message: 'Chat history cleared successfully.',
      deletedCount: deleteResult.deletedCount
    })
  } catch (err) {
    console.error('[Chat Controller] Clear history error:', err.message || 'Unknown error')
    return res.status(500).json({ message: 'Unable to clear chat history at this time.' })
  }
}

module.exports = {
  handleSendMessage,
  handleGetHistory,
  handleClearHistory
}
