const mongoose = require('mongoose')

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  targetRole: { type: String, enum: ['all', 'student', 'counsellor'], default: 'all' }
}, { timestamps: true })

module.exports = mongoose.model('Announcement', announcementSchema)
