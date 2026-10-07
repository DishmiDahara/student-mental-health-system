const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const { rateLimiter, sanitizeChatInput } = require('../middleware/rateLimiter')
const {
  handleSendMessage,
  handleGetHistory,
  handleClearHistory
} = require('../controllers/chatController')

// POST /api/ai/chat - Send message to AI assistant
router.post(
  '/chat',
  authMiddleware,
  rateLimiter({ maxRequests: 25, windowMs: 60 * 1000 }),
  sanitizeChatInput,
  handleSendMessage
)

// GET /api/ai/history - Retrieve persistent chat history
router.get(
  '/history',
  authMiddleware,
  handleGetHistory
)

// DELETE /api/ai/history - Clear persistent chat history
router.delete(
  '/history',
  authMiddleware,
  handleClearHistory
)

module.exports = router
