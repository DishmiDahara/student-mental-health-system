const mongoose = require('mongoose')

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['Stress', 'Anxiety', 'Sleep', 'Mindfulness'], required: true },
  readTime: { type: Number, required: true }, // in minutes
  author: { type: String, default: 'MindSpace Advisor' },
  lang: { type: String, enum: ['en', 'si'], default: 'en' }
}, { timestamps: true })

module.exports = mongoose.model('Resource', resourceSchema)
