const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  status: { type: String, enum: ['active', 'deactivated'], default: 'active' },
  customRecommendation: {
    game: { type: String, default: '' },
    activity: { type: String, default: '' }
  },
  profilePhoto: { type: String, default: '' },
  loginCount: { type: Number, default: 0 },
  streakCount: { type: Number, default: 0 },
  lastLoggedDate: { type: String, default: '' },
  badges: { type: [String], default: [] },
  monthlyGoalLogs: { type: Number, default: 0 },
  bankDetails: {
    bankName: { type: String, default: '' },
    branchName: { type: String, default: '' },
    accountHolderName: { type: String, default: '' },
    accountNumber: { type: String, default: '' }
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)