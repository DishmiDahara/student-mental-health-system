const mongoose = require('mongoose')

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    default: 'gemini'
  },
  tokenCount: {
    type: Number,
    default: 0
  },
  isCrisis: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

// Index for efficient querying by user & timestamp
chatHistorySchema.index({ userId: 1, timestamp: -1 })

module.exports = mongoose.model('ChatHistory', chatHistorySchema)
