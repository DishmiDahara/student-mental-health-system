const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Announcement = require('../models/Announcement')
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

// Post announcement (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' })
    }
    const { title, content, targetRole } = req.body
    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide title and content' })
    }
    const announcement = await Announcement.create({
      title,
      content,
      targetRole: targetRole || 'all'
    })
    res.status(201).json(announcement)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all announcements
router.get('/', auth, async (req, res) => {
  try {
    // Return all announcements for admin, otherwise match targetRole
    const query = req.user.role === 'admin'
      ? {}
      : { targetRole: { $in: ['all', req.user.role] } }

    const announcements = await Announcement.find(query).sort({ createdAt: -1 })
    res.json(announcements)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete announcement (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' })
    }
    const announcement = await Announcement.findByIdAndDelete(req.params.id)
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }
    res.json({ message: 'Announcement deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
