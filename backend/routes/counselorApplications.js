const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const CounselorApplication = require('../models/CounselorApplication')
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

// Submit Counselor Application
router.post('/', auth, async (req, res) => {
  try {
    // Check if there is already a pending application
    const pendingApp = await CounselorApplication.findOne({ user: req.user._id, status: 'pending' })
    if (pendingApp) {
      return res.status(400).json({ message: 'You already have a pending counselor application.' })
    }

    const { 
      fullName, nic, profilePhoto, email, phone, 
      qualifications, licenseNumber, membership, 
      experienceYears, experienceInstitutions, specialization,
      counsellorIdFront, counsellorIdBack
    } = req.body

    if (!fullName || !nic || !profilePhoto || !email || !phone || !qualifications || !experienceYears || !experienceInstitutions || !specialization || !counsellorIdFront || !counsellorIdBack) {
      return res.status(400).json({ message: 'Please fill in all required fields and upload both ID card sides.' })
    }

    const application = await CounselorApplication.create({
      user: req.user._id,
      fullName,
      nic,
      profilePhoto,
      email,
      phone,
      qualifications,
      licenseNumber,
      membership,
      experienceYears,
      experienceInstitutions,
      specialization,
      counsellorIdFront,
      counsellorIdBack
    })

    // Emit Socket event to notify counselor/admin dashboard in real time
    const populatedApp = await CounselorApplication.findById(application._id)
      .populate('user', 'name email status role')
    const io = req.app.get('io')
    if (io) {
      io.emit('new_counselor_application', populatedApp)
    }

    res.status(201).json(application)
  } catch (err) {
    console.error('Submit application error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Fetch logged-in user's latest application status
router.get('/me', auth, async (req, res) => {
  try {
    // Fetch latest application by sorting descending by createdAt
    const application = await CounselorApplication.findOne({ user: req.user._id })
      .sort({ createdAt: -1 })
    res.json(application)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// List all applications (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'counsellor') {
      return res.status(403).json({ message: 'Access denied' })
    }
    const applications = await CounselorApplication.find()
      .populate('user', 'name email status role')
      .sort({ createdAt: -1 })
    res.json(applications)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Approve/Reject Application (Admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' })
    }
    const { status } = req.body
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const application = await CounselorApplication.findById(req.params.id)
    if (!application) return res.status(404).json({ message: 'Application not found' })

    application.status = status
    await application.save()

    // If approved, update the User's role to 'counsellor' and save their profile photo
    if (status === 'approved') {
      await User.findByIdAndUpdate(application.user, { 
        role: 'counsellor',
        profilePhoto: application.profilePhoto
      })
    }

    res.json(application)
  } catch (err) {
    console.error('Update application status error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
