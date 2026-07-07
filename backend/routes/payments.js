const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Payment = require('../models/Payment')
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

// Fetch all payment payouts (Admins and Counselors)
router.get('/', auth, async (req, res) => {
  try {
    let payments
    if (req.user.role === 'admin') {
      // Admins see all counselor payouts
      payments = await Payment.find()
        .populate('counsellor', 'name email profilePhoto bankDetails')
        .populate('student', 'name email')
        .populate('booking', 'date timeSlot note status')
        .sort({ createdAt: -1 })
    } else if (req.user.role === 'counsellor') {
      // Counselors only see their own payouts/earnings
      payments = await Payment.find({ counsellor: req.user._id })
        .populate('student', 'name email')
        .populate('booking', 'date timeSlot note status')
        .sort({ createdAt: -1 })
    } else {
      return res.status(403).json({ message: 'Access denied' })
    }
    res.json(payments)
  } catch (err) {
    console.error('Fetch payments error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Mark payment payout as paid (Admin only)
router.put('/:id/pay', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' })
    }

    const payment = await Payment.findById(req.params.id)
    if (!payment) return res.status(404).json({ message: 'Payment payout record not found' })

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: `Cannot pay a payout that is currently in '${payment.status}' status.` })
    }

    payment.status = 'paid'
    payment.paidAt = Date.now()
    await payment.save()

    // Populate details before returning response
    const populatedPayment = await Payment.findById(payment._id)
      .populate('counsellor', 'name email profilePhoto bankDetails')
      .populate('student', 'name email')
      .populate('booking', 'date timeSlot status')

    res.json(populatedPayment)
  } catch (err) {
    console.error('Pay counselor error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update counselor bank account details
router.put('/bank-details', auth, async (req, res) => {
  try {
    if (req.user.role !== 'counsellor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Counselors only' })
    }
    const { bankName, branchName, accountHolderName, accountNumber } = req.body
    if (!bankName || !branchName || !accountHolderName || !accountNumber) {
      return res.status(400).json({ message: 'Please provide all bank account details' })
    }
    
    const user = await User.findById(req.user._id)
    user.bankDetails = { bankName, branchName, accountHolderName, accountNumber }
    await user.save()
    
    res.json({ message: 'Bank account details updated successfully', bankDetails: user.bankDetails })
  } catch (err) {
    console.error('Update bank details error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Run auto-monthly settlement of pending payouts
router.post('/auto-settlement', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' })
    }
    
    // Find all pending payments
    const pendingPayments = await Payment.find({ status: 'pending' }).populate('counsellor')
    
    if (pendingPayments.length === 0) {
      return res.status(200).json({ settledCount: 0, totalAmount: 0, logs: [], message: 'No pending payouts to settle.' })
    }
    
    // Group pending payments by counselor ID
    const groupMap = {}
    pendingPayments.forEach(p => {
      if (!p.counsellor) return
      const cid = p.counsellor._id.toString()
      if (!groupMap[cid]) {
        groupMap[cid] = {
          counsellor: p.counsellor,
          payments: [],
          amount: 0
        }
      }
      groupMap[cid].payments.push(p)
      groupMap[cid].amount += p.amount
    })
    
    const logs = []
    let settledCount = 0
    let totalAmount = 0
    
    for (const cid of Object.keys(groupMap)) {
      const group = groupMap[cid]
      const counselor = group.counsellor
      const bank = counselor.bankDetails
      
      const hasBankDetails = bank && bank.bankName && bank.accountNumber
      const targetBank = hasBankDetails ? bank.bankName : 'Default Settlement Bank (BOC)'
      const targetAcc = hasBankDetails ? bank.accountNumber : 'Mock-Acc-99900012'
      const targetHolder = hasBankDetails ? bank.accountHolderName : counselor.name
      
      // Mark all payments as paid
      for (const pay of group.payments) {
        pay.status = 'paid'
        pay.paidAt = Date.now()
        await pay.save()
      }
      
      settledCount++
      totalAmount += group.amount
      
      logs.push({
        counsellorId: cid,
        counsellorName: counselor.name,
        amount: group.amount,
        bankName: targetBank,
        accountNumber: targetAcc,
        accountHolder: targetHolder,
        status: 'completed',
        transactionId: `TXN-AUTO-${Math.floor(100000 + Math.random() * 900000)}`
      })
    }
    
    res.json({
      settledCount,
      totalAmount,
      logs,
      message: `Successfully executed monthly settlement for ${settledCount} counselors totaling LKR ${totalAmount.toLocaleString()}!`
    })
  } catch (err) {
    console.error('Auto settlement error:', err)
    res.status(500).json({ message: 'Server error during settlement run' })
  }
})

module.exports = router
