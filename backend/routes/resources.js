const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Resource = require('../models/Resource')
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

// Get all resources
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 })
    res.json(resources)
  } catch (err) {
    console.error('Fetch resources error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create resource (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' })
    }
    const { title, content, category, readTime, author } = req.body
    if (!title || !content || !category || !readTime) {
      return res.status(400).json({ message: 'Please provide all required fields' })
    }
    const resource = await Resource.create({
      title,
      content,
      category,
      readTime,
      author: author || 'MindSpace Advisor'
    })
    res.status(201).json(resource)
  } catch (err) {
    console.error('Create resource error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete resource (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' })
    }
    const resource = await Resource.findByIdAndDelete(req.params.id)
    if (!resource) return res.status(404).json({ message: 'Resource not found' })
    res.json({ message: 'Resource deleted successfully' })
  } catch (err) {
    console.error('Delete resource error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update resource (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' })
    }
    const { title, content, category, readTime, author } = req.body
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { title, content, category, readTime, author },
      { new: true }
    )
    if (!resource) return res.status(404).json({ message: 'Resource not found' })
    res.json(resource)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
