const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  counsellor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  counsellorName: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  timeSlot: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  note: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  paymentDetails: {
    cardHolderName: { type: String, default: '' },
    cardNumberMasked: { type: String, default: '' },
    transactionId: { type: String, default: '' },
    paidAt: { type: Date }
  }
}, { timestamps: true })

module.exports = mongoose.model('Booking', bookingSchema)
