const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Message = require('../models/Message')
const User = require('../models/User')
const Booking = require('../models/Booking')

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

// Get peer chat messages (limit to last 100, Admin only)
router.get('/peer-chat', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      // Students do not fetch peer chat history since chats are 1-on-1 private real-time sessions
      return res.json([])
    }
    // Admins can see all messages from room 'peer-chat' or any room matching /^peer-room-/
    const messages = await Message.find({
      $or: [
        { room: 'peer-chat' },
        { room: /^peer-room-/ }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(100)
    res.json(messages.reverse()) // Send chronologically
  } catch (err) {
    console.error('Fetch peer chat error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get support messages
router.get('/admin-support', auth, async (req, res) => {
  try {
    let room
    if (req.user.role === 'admin') {
      const { studentId } = req.query
      if (!studentId) {
        // Return latest messages from all students to list active conversations
        // We find all messages belonging to rooms like 'admin-support-*'
        const messages = await Message.find({ room: /^admin-support-/ })
          .sort({ createdAt: -1 })
        
        // Group by room to get unique student support requests
        const conversations = {}
        for (const msg of messages) {
          if (!conversations[msg.room]) {
            conversations[msg.room] = msg
          }
        }
        return res.json(Object.values(conversations))
      }
      room = `admin-support-${studentId}`
    } else {
      room = `admin-support-${req.user._id}`
    }

    const messages = await Message.find({ room })
      .populate('sender', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50)
    
    res.json(messages.reverse())
  } catch (err) {
    console.error('Fetch support messages error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get list of active students who started support chat (Admin only)
router.get('/admin-support/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }
    
    // Find all distinct senders who are not admin
    const adminSupportMessages = await Message.find({ room: /^admin-support-/ })
      .populate('sender', 'name email role')
      .sort({ createdAt: -1 })
    
    const usersMap = {}
    for (const msg of adminSupportMessages) {
      if (msg.sender && msg.sender.role !== 'admin') {
        usersMap[msg.sender._id] = {
          _id: msg.sender._id,
          name: msg.sender.name,
          email: msg.sender.email,
          lastMessage: msg.text,
          updatedAt: msg.createdAt
        }
      }
    }
    
    res.json(Object.values(usersMap))
  } catch (err) {
    console.error('Fetch support users error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Moderate/Delete peer chat message (Admin only)
router.delete('/peer-chat/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' })
    }
    const message = await Message.findByIdAndDelete(req.params.id)
    if (!message) return res.status(404).json({ message: 'Message not found' })
    res.json({ message: 'Message deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Get chat history for a specific booking
router.get('/booking/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    const isStudent = booking.student.toString() === req.user._id.toString()
    const isCounsellor = booking.counsellor && booking.counsellor.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'

    if (!isStudent && !isCounsellor && !isAdmin) {
      return res.status(403).json({ message: 'Access denied to this chat' })
    }

    const messages = await Message.find({ room: `booking-chat-${bookingId}` })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 })
    res.json(messages)
  } catch (err) {
    console.error('Fetch booking chat error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
