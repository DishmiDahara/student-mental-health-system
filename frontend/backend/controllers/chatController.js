const { processUserMessage } = require('../services/ai/chatService')
const ChatHistory = require('../models/ChatHistory')

// POST /api/ai/chat
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
    console.error('Chat Controller Error:', err)
    // Production requirement: Never expose raw API/system errors to user
    return res.status(500).json({
      reply: "I'm having trouble connecting right now. Please try again in a moment.",
      provider: 'error_fallback',
      isError: true
    })
  }
}

// GET /api/ai/history
const handleGetHistory = async (req, res) => {
  try {
    const userId = req.user.id
    const conversationId = req.query.conversationId

    const query = { userId }
    if (conversationId) {
      query.conversationId = conversationId
    }

    const history = await ChatHistory.find(query)
      .sort({ timestamp: 1 })
      .limit(50)

    return res.json({ history })
  } catch (err) {
    console.error('Get History Error:', err)
    return res.status(500).json({ message: 'Error retrieving chat history.' })
  }
}

// DELETE /api/ai/history
const handleClearHistory = async (req, res) => {
  try {
    const userId = req.user.id
    const conversationId = req.query.conversationId

    const query = { userId }
    if (conversationId) {
      query.conversationId = conversationId
    }

    await ChatHistory.deleteMany(query)
    return res.json({ message: 'Chat history cleared successfully.' })
  } catch (err) {
    console.error('Clear History Error:', err)
    return res.status(500).json({ message: 'Error clearing chat history.' })
  }
}

module.exports = {
  handleSendMessage,
  handleGetHistory,
  handleClearHistory
}
