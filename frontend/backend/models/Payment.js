const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  counsellor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, default: 1500 }, // Default LKR 1500 per approved booking session
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  paidAt: { type: Date }
}, { timestamps: true })

module.exports = mongoose.model('Payment', paymentSchema)
