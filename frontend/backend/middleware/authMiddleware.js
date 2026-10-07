const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.headers['x-auth-token']

    if (!token) {
      return res.status(401).json({ message: 'Authorization denied. No token provided.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey123')
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({ message: 'User not found or token invalid.' })
    }

    if (user.status === 'deactivated') {
      return res.status(403).json({ message: 'Your account has been deactivated.' })
    }

    req.user = user
    next()
  } catch (err) {
    console.error('Auth Middleware Error:', err.message)
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

module.exports = authMiddleware
