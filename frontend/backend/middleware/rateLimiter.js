// In-memory Rate Limiter & Security Input Sanitizer
const rateLimitMap = new Map()

// Clean stale entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now - record.startTime > 10 * 60 * 1000) {
      rateLimitMap.delete(key)
    }
  }
}, 10 * 60 * 1000)

const rateLimiter = (options = { maxRequests: 25, windowMs: 60 * 1000 }) => {
  return (req, res, next) => {
    const identifier = req.user?.id || req.ip || 'anonymous'
    const now = Date.now()

    let record = rateLimitMap.get(identifier)
    if (!record || (now - record.startTime > options.windowMs)) {
      record = { count: 1, startTime: now }
      rateLimitMap.set(identifier, record)
      return next()
    }

    record.count += 1
    if (record.count > options.maxRequests) {
      return res.status(429).json({
        message: 'Too many requests. Please slow down and try again in a minute.',
        retryAfter: Math.ceil((record.startTime + options.windowMs - now) / 1000)
      })
    }

    next()
  }
}

// Sanitization middleware against XSS, script injection, and payload flooding
const sanitizeChatInput = (req, res, next) => {
  if (req.body && req.body.message) {
    let message = req.body.message

    // Reject massive payloads
    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty.' })
    }

    if (message.length > 2500) {
      return res.status(400).json({ message: 'Message is too long. Please keep under 2500 characters.' })
    }

    // Basic XSS & HTML Tag Stripping
    message = message
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')

    req.body.message = message.trim()
  }
  next()
}

module.exports = {
  rateLimiter,
  sanitizeChatInput
}
