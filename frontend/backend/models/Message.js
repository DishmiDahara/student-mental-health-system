const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null if system message
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null if broadcast/peer chat
  text: { type: String, required: true },
  room: { type: String, required: true }, // e.g. 'peer-chat', 'admin-support-<userId>'
  senderName: { type: String, default: '' }, // Name or alias (e.g. "Anonymous Hippo" for peer chat)
  isRead: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Message', messageSchema)
