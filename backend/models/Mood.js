const mongoose = require('mongoose')

const moodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emoji: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: Number, required: true },
  note: { type: String, default: '' },
  trigger: { type: String, default: '' },
  isCustomTrigger: { type: Boolean, default: false },
  activities: { type: [String], default: [] },
  sleepHours: { type: Number, default: 0 },
  waterIntake: { type: Number, default: 0 }, // in ml
  screenTime: { type: Number, default: 0 }, // in hours
  exerciseDuration: { type: Number, default: 0 }, // in minutes
  energyLevel: { type: Number, default: 3 }, // 1-5 scale
  voiceNote: { type: String, default: '' }, // base64 audio URL
  photo: { type: String, default: '' }, // base64 photo URL
  weather: { type: String, default: '' }, // weather state
  music: { type: String, default: '' }, // music genre
  isExamPeriod: { type: Boolean, default: false },
  color: { type: String, default: '' }, // custom selected color hex
  whatHelped: { type: [String], default: [] }, // tags of what helped
  aiSentiment: {
    score: { type: Number, default: 0 },
    label: { type: String, default: 'Neutral' },
    suggestions: { type: [String], default: [] }
  },
  recommendations: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { timestamps: true })

module.exports = mongoose.model('Mood', moodSchema)