const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  // *** FEEDBACK STATUS EKA METHANA THIYENNE (Default eka 'pending' ebawin PENDING kiyala display wenne) ***
  // (Feedback status is defined here, with default status 'pending')
  status: { type: String, enum: ['pending', 'resolved', 'done'], default: 'pending' }
}, { timestamps: true })

module.exports = mongoose.model('Feedback', feedbackSchema)
