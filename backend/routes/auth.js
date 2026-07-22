const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' })
    }
    const normalizedEmail = email.toLowerCase().trim()
    let user = await User.findOne({ email: normalizedEmail })

    if (user) {
      return res.status(400).json({ message: 'An account with this email address already exists. Please log in.' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const role = normalizedEmail.includes('admin') ? 'admin' : 'student'
    user = await User.create({
      name: name?.trim() || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      password: hashed,
      role: role
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'mysecretkey123', { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role || 'student', status: user.status || 'active', profilePhoto: user.profilePhoto || '' } })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Server error during registration' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password' })
    }
    const normalizedEmail = email.toLowerCase().trim()
    let user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return res.status(400).json({ message: 'No account found with this email address. Please register first.' })
    }

    if (user.status === 'deactivated') {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact an administrator.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password. Please check your credentials.' })
    }

    user.loginCount = (user.loginCount || 0) + 1
    await user.save()

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'mysecretkey123', { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role || 'student', status: user.status || 'active', customRecommendation: user.customRecommendation, profilePhoto: user.profilePhoto || '' } })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error during login' })
  }
})

// Get current user profile (Authenticated)
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    // Check if deactivated while logged in
    if (user.status === 'deactivated') {
      return res.status(403).json({ message: 'Deactivated' })
    }
    
    res.json(user)
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
})

// Update current user profile photo (Authenticated)
router.put('/me/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { profilePhoto } = req.body
    
    const user = await User.findByIdAndUpdate(
      decoded.id,
      { profilePhoto },
      { new: true }
    ).select('-password')
    
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
})

// Get all verified counselors
router.get('/counsellors', async (req, res) => {
  try {
    const list = await User.find({ role: 'counsellor', status: 'active' }, 'name email profilePhoto')
    res.json(list)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin check middleware
const adminAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user || (user.role !== 'admin' && user.role !== 'counsellor')) {
      return res.status(403).json({ message: 'Access denied: Administrative access only' })
    }
    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid/expired token' })
  }
}

// Get all users (Admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update user role (Admin only)
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body
    if (!['student', 'counsellor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete user (Admin only)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'User deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update user status (Admin only)
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body
    if (!['active', 'deactivated'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Assign custom recommendation (Admin only)
router.put('/users/:id/recommendation', adminAuth, async (req, res) => {
  try {
    const { game, activity } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { customRecommendation: { game: game || '', activity: activity || '' } },
      { new: true }
    ).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Forgot Password (Mock verification code delivery)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'No account registered with this email address' })

    // Return mock OTP code (123456)
    res.json({ message: 'Mock verification OTP sent to email', email, code: '123456' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Reset Password (Verify OTP code and update password)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' })
    }

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (code !== '123456') {
      return res.status(400).json({ message: 'Invalid verification code' })
    }

    // Hash new password and save
    const hashed = await bcrypt.hash(newPassword, 10)
    user.password = hashed
    await user.save()

    res.json({ message: 'Password reset successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router