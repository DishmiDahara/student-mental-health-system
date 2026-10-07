const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Feedback = require('../models/Feedback')
const User = require('../models/User')

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

// Submit feedback
router.post('/', auth, async (req, res) => {
  try {
    const { subject, message } = req.body
    if (!subject || !message) {
      return res.status(400).json({ message: 'Please enter all fields' })
    }
    const feedback = await Feedback.create({
      student: req.user._id,
      subject,
      message
    })
    res.status(201).json(feedback)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all feedback (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'counsellor') {
      return res.status(403).json({ message: 'Access denied' })
    }
    const feedbackList = await Feedback.find()
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
    res.json(feedbackList)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Resolve feedback (Admin only)
// *** BACKEND EKE DATABASE EKE STATUS EKA 'resolved' (done) KARANA ROUTE EKA METHANA THIYENNE ***
// (This is the backend API route that updates the status of the feedback to 'resolved' in MongoDB)
router.put('/:id/resolved', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'counsellor') {
      return res.status(403).json({ message: 'Access denied' })
    }
    // *** MEKE THAMAI STATUS EKA 'done' KIYALA UPDATE KARANNE (THIS IS WHERE STATUS IS UPDATED TO DONE) ***
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: 'done' },
      { new: true }
    ).populate('student', 'name email')
    
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' })
    res.json(feedback)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
