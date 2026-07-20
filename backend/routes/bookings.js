const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Booking = require('../models/Booking')
const User = require('../models/User')
const Payment = require('../models/Payment')

// Auth middleware
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user) return res.status(401).json({ message: 'User not found' })
    if (user.status === 'deactivated') {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' })
    }
    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// Book a session
router.post('/', auth, async (req, res) => {
  try {
    const { counsellorId, counsellorName, date, timeSlot, note, paymentStatus, paymentDetails } = req.body
    if (!counsellorName || !date || !timeSlot) {
      return res.status(400).json({ message: 'Please provide all required fields' })
    }
    const booking = await Booking.create({
      student: req.user._id,
      counsellor: counsellorId || null,
      counsellorName,
      date,
      timeSlot,
      note,
      paymentStatus: paymentStatus || 'unpaid',
      paymentDetails: paymentDetails || {}
    })
    res.status(201).json(booking)
  } catch (err) {
    console.error('Booking error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get bookings
router.get('/', auth, async (req, res) => {
  try {
    let bookings
    if (req.user.role === 'admin') {
      bookings = await Booking.find()
        .populate('student', 'name email')
        .populate('counsellor', 'name email profilePhoto')
        .sort({ createdAt: -1 })
    } else if (req.user.role === 'counsellor') {
      bookings = await Booking.find({ counsellor: req.user._id })
        .populate('student', 'name email')
        .sort({ createdAt: -1 })
    } else {
      bookings = await Booking.find({ student: req.user._id })
        .populate('counsellor', 'name email profilePhoto')
        .sort({ createdAt: -1 })
    }
    res.json(bookings)
  } catch (err) {
    console.error('Fetch bookings error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update booking status (Only assigned counselor can approve/reject)
router.put('/:id', auth, async (req, res) => {
  try {
    const bookingCheck = await Booking.findById(req.params.id)
    if (!bookingCheck) return res.status(404).json({ message: 'Booking not found' })

    // Enforce that only the assigned counselor has access to update status
    if (req.user.role !== 'counsellor' || bookingCheck.counsellor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: Only the assigned counselor can approve/reject this booking' })
    }

    const { status, rejectionReason } = req.body
    if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const updateData = { status }
    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason || 'No reason provided'
    } else {
      updateData.rejectionReason = ''
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('student', 'name email').populate('counsellor', 'name email profilePhoto')

    // If status is approved, send automated confirmation message and trigger payment creation
    if (status === 'approved') {
      const Message = require('../models/Message')
      await Message.create({
        sender: booking.counsellor ? booking.counsellor._id : null,
        receiver: booking.student._id,
        text: `📅 Hello! Your booking for ${booking.date} at ${booking.timeSlot} has been approved. You can now chat with me here.`,
        room: `booking-chat-${booking._id}`,
        senderName: booking.counsellor ? booking.counsellor.name : 'System'
      })

      // Create or update payment log for Counselor only if the student has paid
      if (booking.counsellor && booking.paymentStatus === 'paid') {
        let payment = await Payment.findOne({ booking: booking._id })
        if (!payment) {
          await Payment.create({
            counsellor: booking.counsellor._id,
            booking: booking._id,
            student: booking.student._id,
            amount: 1500, // Standard payout LKR 1500 per booking
            status: 'pending'
          })
        } else {
          payment.status = 'pending'
          await payment.save()
        }
      }
    }

    // If booking status is changed to cancelled/rejected, mark any pending payout as cancelled
    if (['cancelled', 'rejected'].includes(status)) {
      await Payment.findOneAndUpdate(
        { booking: booking._id, status: 'pending' },
        { status: 'cancelled' }
      )
    }

    res.json(booking)
  } catch (err) {
    console.error('Update booking error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Pay for an unpaid booking (Student pays for existing booking)
router.put('/:id/pay', auth, async (req, res) => {
  try {
    const { paymentDetails } = req.body
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    // Verify that only the student who created the booking can pay for it
    if (booking.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: Unauthorized booking owner' })
    }

    booking.paymentStatus = 'paid'
    booking.paymentDetails = paymentDetails || {}
    await booking.save()

    // If the booking is already approved, trigger counselor payout payment creation
    if (booking.status === 'approved' && booking.counsellor) {
      let payment = await Payment.findOne({ booking: booking._id })
      if (!payment) {
        await Payment.create({
          counsellor: booking.counsellor,
          booking: booking._id,
          student: booking.student,
          amount: 1500,
          status: 'pending'
        })
      } else {
        payment.status = 'pending'
        await payment.save()
      }
    }

    res.json(booking)
  } catch (err) {
    console.error('Pay booking error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
