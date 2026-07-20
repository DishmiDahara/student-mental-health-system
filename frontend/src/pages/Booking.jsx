import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import io from 'socket.io-client'
import API_URL from '../config'
import Navbar from '../components/Navbar'

const fallbackCounsellors = [
  { name: 'Dr. Sarah Jenkins', specialty: 'Clinical Psychologist', bio: 'Specializes in student anxiety, academic stress, and cognitive behavioral therapy.' },
  { name: 'Mrs. Ananda Silva', specialty: 'Senior Student Advisor', bio: 'Expert in university adjustment, relationship challenges, and career guidance.' },
  { name: 'Mr. Rohan Perera', specialty: 'Mental Health Counselor', bio: 'Focuses on mindfulness, stress management, and self-esteem building.' }
]

const timeSlots = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM'
]

export default function Booking() {
  const navigate = useNavigate()
  const [selectedCounsellor, setSelectedCounsellor] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [note, setNote] = useState('')
  
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  // Matching wizard states
  const [matchStep, setMatchStep] = useState(0)
  const [matchingAnswers, setMatchingAnswers] = useState({
    country: 'Sri Lanka',
    genderIdentity: '',
    orientation: '',
    age: '20',
    relationshipStatus: '',
    spiritual: '',
    religionImportance: '',
    religion: '',
    therapyBefore: '',
    therapyBetterhelp: ''
  })
  const [matchedCounselors, setMatchedCounselors] = useState([])
  
  // Dynamic Counselor List state
  const [counsellorList, setCounsellorList] = useState([])

  const calculateScoresAndShowResults = (answers) => {
    const counselorsWithScores = counsellorList.map(counselor => {
      let score = 70 // Base score
      const name = counselor.name.toLowerCase()
      const bio = (counselor.bio || '').toLowerCase()
      const specialty = (counselor.specialty || '').toLowerCase()

      // 1. Relationship Status matching
      if (answers.relationshipStatus === 'In a relationship' || answers.relationshipStatus === 'Married') {
        if (bio.includes('relationship') || name.includes('ananda') || name.includes('silva')) {
          score += 15
        }
      } else if (answers.relationshipStatus === 'Single' || answers.relationshipStatus === 'Divorced') {
        if (bio.includes('self-esteem') || bio.includes('anxiety') || name.includes('rohan') || name.includes('sarah')) {
          score += 10
        }
      }

      // 2. Spiritual / Religious matching
      if (answers.spiritual === 'Yes') {
        if (bio.includes('mindfulness') || name.includes('rohan')) {
          score += 12
        }
      }
      if (answers.religionImportance === 'Very important' || answers.religionImportance === 'Important') {
        if (answers.religion === 'Buddhism' && (bio.includes('mindfulness') || name.includes('rohan') || name.includes('ananda'))) {
          score += 10
        }
        if (specialty.includes('clinical') || name.includes('sarah')) {
          score -= 3 // Sarah is more clinical/scientific
        }
      }

      // 3. Previous therapy matching
      if (answers.therapyBefore === 'Yes') {
        if (specialty.includes('clinical') || name.includes('sarah') || name.includes('jenkins')) {
          score += 12 // Clinical psychologist is ideal for repeat therapy
        }
      }

      // 4. Age suitability
      const ageNum = parseInt(answers.age) || 20
      if (ageNum >= 18 && ageNum <= 24) {
        if (bio.includes('student') || bio.includes('university adjustment') || name.includes('ananda') || name.includes('sarah')) {
          score += 8
        }
      } else if (ageNum >= 25) {
        if (specialty.includes('clinical') || name.includes('sarah') || name.includes('rohan')) {
          score += 6
        }
      }

      // Normalize score between 65% and 98%
      const finalScore = Math.max(65, Math.min(98, score))
      return { ...counselor, matchScore: finalScore }
    })

    const sorted = [...counselorsWithScores].sort((a, b) => b.matchScore - a.matchScore)
    setMatchedCounselors(sorted)
    setMatchStep(11) // Match results page
  }

  const nextStep = (updatedAnswers) => {
    const answers = updatedAnswers || matchingAnswers
    if (matchStep === 1) {
      setMatchStep(2)
    } else if (matchStep === 2) {
      setMatchStep(3)
    } else if (matchStep === 3) {
      setMatchStep(4)
    } else if (matchStep === 4) {
      setMatchStep(5)
    } else if (matchStep === 5) {
      setMatchStep(6)
    } else if (matchStep === 6) {
      setMatchStep(7)
    } else if (matchStep === 7) {
      if (answers.religionImportance === 'Not important at all') {
        const nextAnswers = { ...answers, religion: 'N/A' }
        setMatchingAnswers(nextAnswers)
        setMatchStep(9) // Skip Step 8 (religion details)
      } else {
        setMatchStep(8)
      }
    } else if (matchStep === 8) {
      setMatchStep(9)
    } else if (matchStep === 9) {
      if (answers.therapyBefore === 'No') {
        const nextAnswers = { ...answers, therapyBetterhelp: 'N/A' }
        setMatchingAnswers(nextAnswers)
        calculateScoresAndShowResults(nextAnswers)
      } else {
        setMatchStep(10)
      }
    } else if (matchStep === 10) {
      calculateScoresAndShowResults(answers)
    }
  }

  const prevStep = () => {
    if (matchStep === 1) {
      setMatchStep(0) // Back to landing
    } else if (matchStep === 2) {
      setMatchStep(1)
    } else if (matchStep === 3) {
      setMatchStep(2)
    } else if (matchStep === 4) {
      setMatchStep(3)
    } else if (matchStep === 5) {
      setMatchStep(4)
    } else if (matchStep === 6) {
      setMatchStep(5)
    } else if (matchStep === 7) {
      setMatchStep(6)
    } else if (matchStep === 8) {
      setMatchStep(7)
    } else if (matchStep === 9) {
      if (matchingAnswers.religionImportance === 'Not important at all') {
        setMatchStep(7) // Skip back Step 8
      } else {
        setMatchStep(8)
      }
    } else if (matchStep === 10) {
      setMatchStep(9)
    } else if (matchStep === 11) {
      if (matchingAnswers.therapyBefore === 'No') {
        setMatchStep(9) // Skip back Step 10
      } else {
        setMatchStep(10)
      }
    } else if (matchStep === 12) {
      if (matchingAnswers.therapyType || matchingAnswers.country) {
        setMatchStep(11) // Back to matched list
      } else {
        setMatchStep(0)
      }
    }
  }

  const getProgressBarWidth = () => {
    if (matchStep <= 0) return '0%'
    if (matchStep === 11) return '100%'
    const progressMap = {
      1: 10,
      2: 20,
      3: 30,
      4: 40,
      5: 50,
      6: 60,
      7: 70,
      8: 80,
      9: 90,
      10: 95
    }
    return `${progressMap[matchStep] || 0}%`
  }

  // Feedback states
  const [feedbackSubject, setFeedbackSubject] = useState('')
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackStatusMsg, setFeedbackStatusMsg] = useState('')
  const [showFeedbackSuccessModal, setShowFeedbackSuccessModal] = useState(false)

  // Chat States
  const [activeChatBooking, setActiveChatBooking] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInputText, setChatInputText] = useState('')
  const socketRef = useRef(null)
  const chatEndRef = useRef(null)

  // Rejection & Counselor Portal States
  const [currentUser, setCurrentUser] = useState(null)
  const [rejectBookingId, setRejectBookingId] = useState(null)
  const [rejectReasonInput, setRejectReasonInput] = useState('')

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [bookingTempData, setBookingTempData] = useState(null)
  const [paymentCardName, setPaymentCardName] = useState('')
  const [paymentCardNum, setPaymentCardNum] = useState('')
  const [paymentCardExpiry, setPaymentCardExpiry] = useState('')
  const [paymentCardCvc, setPaymentCardCvc] = useState('')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [payingBookingId, setPayingBookingId] = useState(null)

  // Video Conferencing States
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [activeVideoBooking, setActiveVideoBooking] = useState(null)

  const token = localStorage.getItem('token')

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
    fetchBookings()
    fetchCounsellors()
  }, [])

  const fetchCounsellors = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/counsellors`)
      // If db has verified counselors, use them, otherwise use fallback advisors
      if (res.data && res.data.length > 0) {
        setCounsellorList(res.data.map(c => ({
          id: c._id,
          name: c.name,
          specialty: 'Verified Mental Health Counselor',
          bio: `Contact details: ${c.email}. Specialized in student support.`,
          profilePhoto: c.profilePhoto || ''
        })))
      } else {
        setCounsellorList(fallbackCounsellors)
      }
    } catch (err) {
      console.error('Error fetching counselors:', err)
      setCounsellorList(fallbackCounsellors)
    }
  }

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookings(res.data)
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setFetching(false)
    }
  }

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '') // remove non-digits
    val = val.substring(0, 16) // max 16 chars
    const parts = []
    for (let i = 0; i < val.length; i += 4) {
      parts.push(val.substring(i, i + 4))
    }
    setPaymentCardNum(parts.join(' '))
  }

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '') // remove non-digits
    val = val.substring(0, 4) // max 4 digits (MMYY)
    if (val.length > 2) {
      setPaymentCardExpiry(`${val.substring(0, 2)}/${val.substring(2)}`)
    } else {
      setPaymentCardExpiry(val)
    }
  }

  const handleCvcChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 3)
    setPaymentCardCvc(val)
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!selectedCounsellor || !selectedDate || !selectedSlot) {
      setMessage({ text: 'Please fill in all booking fields.', type: 'error' })
      return
    }

    const today = new Date().toISOString().split('T')[0]
    if (selectedDate < today) {
      setMessage({ text: 'Please select a future date.', type: 'error' })
      return
    }

    const chosenCounsellorObj = counsellorList.find(c => c.name === selectedCounsellor)
    const counsellorId = chosenCounsellorObj ? chosenCounsellorObj.id : null

    setPaymentProcessing(true)
    try {
      await axios.post(`${API_URL}/api/bookings`, 
        { 
          counsellorId,
          counsellorName: selectedCounsellor,
          date: selectedDate,
          timeSlot: selectedSlot,
          note,
          paymentStatus: 'unpaid'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage({ text: `📅 Appointment requested successfully! Please wait for Counselor approval. Once approved, you can complete the LKR 1,500 payment.`, type: 'success' })
      
      setSelectedCounsellor('')
      setSelectedDate('')
      setSelectedSlot('')
      setNote('')
      fetchBookings()
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to request appointment.', type: 'error' })
    } finally {
      setPaymentProcessing(false)
    }
  }

  const handleCompletePaymentAndBook = async (e) => {
    e.preventDefault()
    setPaymentError('')

    // Basic Validations
    const cleanNum = paymentCardNum.replace(/\s+/g, '')
    if (cleanNum.length !== 16 || isNaN(cleanNum)) {
      setPaymentError('Card number must be exactly 16 digits.')
      return
    }

    if (!/^\d{2}\/\d{2}$/.test(paymentCardExpiry)) {
      setPaymentError('Expiry date must be in MM/YY format.')
      return
    }

    const [month, year] = paymentCardExpiry.split('/').map(Number)
    if (month < 1 || month > 12) {
      setPaymentError('Invalid month (01-12).')
      return
    }

    if (paymentCardCvc.length !== 3 || isNaN(paymentCardCvc)) {
      setPaymentError('CVC must be a 3-digit number.')
      return
    }

    setPaymentProcessing(true)

    // Simulate 1.5 seconds mock authorization
    setTimeout(async () => {
      try {
        const maskedCard = `•••• •••• •••• ${cleanNum.slice(-4)}`
        const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        
        if (payingBookingId) {
          // Pay for an existing booking
          await axios.put(`${API_URL}/api/bookings/${payingBookingId}/pay`, 
            { 
              paymentDetails: {
                cardHolderName: paymentCardName,
                cardNumberMasked: maskedCard,
                transactionId,
                paidAt: new Date()
              }
            },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          setMessage({ text: `💳 Payment successful (Txn ID: ${transactionId})! Session marked as paid.`, type: 'success' })
          setPayingBookingId(null)
        }
        
        setSelectedCounsellor('')
        setSelectedDate('')
        setSelectedSlot('')
        setNote('')
        setShowPaymentModal(false)
        fetchBookings()
      } catch (err) {
        setPaymentError(err.response?.data?.message || 'Failed to complete transaction.')
      } finally {
        setPaymentProcessing(false)
      }
    }, 1500)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const openBookingChat = async (booking) => {
    setActiveChatBooking(booking)
    setChatMessages([])
    setChatInputText('')
    
    // Fetch chat history
    try {
      const res = await axios.get(`${API_URL}/api/messages/booking/${booking._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setChatMessages(res.data)
    } catch (err) {
      console.error('Error fetching booking chat history:', err)
    }

    // Connect socket
    if (!socketRef.current) {
      socketRef.current = io(API_URL)
    }

    const room = `booking-chat-${booking._id}`
    socketRef.current.emit('join_room', room)

    socketRef.current.off('receive_message')
    socketRef.current.on('receive_message', (msg) => {
      if (msg.room === room) {
        setChatMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      }
    })
  }

  const closeBookingChat = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setActiveChatBooking(null)
  }

  const handleSendBookingMessage = (e) => {
    e.preventDefault()
    if (!chatInputText.trim() || !socketRef.current || !activeChatBooking) return

    const savedUser = localStorage.getItem('user')
    const user = savedUser ? JSON.parse(savedUser) : null
    if (!user) return

    const room = `booking-chat-${activeChatBooking._id}`
    socketRef.current.emit('send_message', {
      sender: user.id || user._id,
      receiver: activeChatBooking.counsellor?._id || activeChatBooking.counsellor,
      text: chatInputText.trim(),
      room,
      senderName: user.name
    })
    setChatInputText('')
  }

  const handleBookingAction = async (bookingId, status, rejectionReason = '') => {
    try {
      await axios.put(`${API_URL}/api/bookings/${bookingId}`, { status, rejectionReason }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert(`Booking status marked as ${status} successfully!`)
      fetchBookings()
    } catch (err) {
      alert('Failed to update booking status')
    }
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    if (!feedbackSubject || !feedbackMsg) return
    setFeedbackLoading(true)
    setFeedbackStatusMsg('')

    try {
      await axios.post(`${API_URL}/api/feedback`, 
        { subject: feedbackSubject, message: feedbackMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setFeedbackStatusMsg('✅ Feedback submitted successfully to Administrators.')
      setShowFeedbackSuccessModal(true)
      setFeedbackSubject('')
      setFeedbackMsg('')
    } catch (err) {
      setFeedbackStatusMsg('Failed to submit feedback. Please try again.')
    } finally {
      setFeedbackLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return { bg: '#d1fae5', text: '#065f46', label: 'Approved' }
      case 'rejected': return { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' }
      case 'cancelled': return { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' }
      default: return { bg: '#fef3c7', text: '#92400e', label: 'Pending' }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', paddingBottom: '60px' }}>
      
      {/* Navbar */}
      <Navbar />      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
        
        {/* Booking Form or Counselor Portal */}
        {currentUser?.role === 'counsellor' ? (
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
            <h2 style={{ color: '#1f2937', marginBottom: '4px' }}>Counselor Portal</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>Manage student appointment bookings and conduct secure chat sessions.</p>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {currentUser.profilePhoto ? (
                  <img src={currentUser.profilePhoto} alt={currentUser.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366f1' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px' }}>
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
                <div>
                  <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: 'bold' }}>{currentUser.name}</h4>
                  <span style={{ fontSize: '11px', background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block', marginTop: '4px' }}>
                    Verified Counselor
                  </span>
                </div>
              </div>
              
              <div style={{ width: '100%', height: '1px', background: '#e2e8f0', margin: '8px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 'bold' }}>PENDING</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d97706', marginTop: '4px' }}>
                    {bookings.filter(b => b.status === 'pending').length}
                  </div>
                </div>
                <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#047857', fontWeight: 'bold' }}>APPROVED</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
                    {bookings.filter(b => b.status === 'approved').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            {matchStep === 0 ? (
              /* --- LANDING STATE --- */
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <h2 style={{ color: '#1f2937', marginBottom: '8px', fontSize: '24px', fontWeight: 'bold' }}>Find Your Perfect Advisor Match</h2>
                <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px', maxWidth: '480px', margin: '0 auto 28px' }}>
                  Answer a few simple questions about your needs and preferences. We will match you with the counselor best suited for you.
                </p>
                
                <button
                  onClick={() => setMatchStep(1)}
                  style={{
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.25)',
                    transition: 'all 0.2s',
                    width: '100%',
                    maxWidth: '280px'
                  }}
                >
                  Find My Advisor
                </button>
                
                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={() => {
                      setMatchStep(12); // Bypass directly to schedule
                      setSelectedCounsellor(''); // clear
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4f46e5',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Bypass matching & choose advisor directly
                  </button>
                </div>
              </div>
            ) : matchStep >= 1 && matchStep <= 10 ? (
              /* --- SURVEY QUESTIONNAIRE STEPS --- */
              <div>
                {/* Progress bar header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <button
                    onClick={prevStep}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4f46e5',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    ◀ Previous
                  </button>
                  <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold' }}>Progress</span>
                </div>
                
                <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', marginBottom: '28px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#10b981', width: getProgressBarWidth(), transition: 'width 0.3s ease' }} />
                </div>

                {matchStep === 1 && (
                  /* STEP 1: Country */
                  <div>
                    <h3 style={{ fontSize: '20px', color: '#1f2937', fontWeight: '800', marginBottom: '20px', textAlign: 'center' }}>
                      Which country are you in?
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <select
                        value={matchingAnswers.country}
                        onChange={e => setMatchingAnswers(prev => ({ ...prev, country: e.target.value }))}
                        style={{ width: '100%', padding: '14px', border: '2px solid #a7f3d0', borderRadius: '16px', outline: 'none', fontSize: '15px', background: '#ecfdf5', color: '#065f46', fontWeight: '600' }}
                      >
                        {['Sri Lanka', 'India', 'United Kingdom', 'United States', 'Canada', 'Australia', 'Other'].map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => nextStep()}
                        style={{
                          padding: '14px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '16px',
                          fontWeight: 'bold',
                          fontSize: '15px',
                          cursor: 'pointer',
                          marginTop: '8px'
                        }}
                      >
                        Next Step ▶
                      </button>
                    </div>
                  </div>
                )}

                {matchStep === 2 && (
                  /* STEP 2: Gender Identity */
                  <div>
                    <h3 style={{ fontSize: '20px', color: '#1f2937', fontWeight: '800', marginBottom: '20px', textAlign: 'center' }}>
                      What is your gender identity?
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {['Woman', 'Man', 'More options'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            const updated = { ...matchingAnswers, genderIdentity: opt }
                            setMatchingAnswers(updated)
                            nextStep(updated)
                          }}
                          style={{
                            padding: '16px 20px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: '16px',
                            color: '#065f46',
                            textAlign: 'left',
                            fontSize: '14.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          className="matching-option-btn"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {matchStep === 3 && (
                  /* STEP 3: How do you identify */
                  <div>
                    <h3 style={{ fontSize: '20px', color: '#1f2937', fontWeight: '800', marginBottom: '20px', textAlign: 'center' }}>
                      How do you identify?
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {['Straight', 'Gay', 'Lesbian', 'Bi or Pan', 'Prefer not to say', 'More options'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            const updated = { ...matchingAnswers, orientation: opt }
                            setMatchingAnswers(updated)
                            nextStep(updated)
                          }}
                          style={{
                            padding: '16px 20px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: '16px',
                            color: '#065f46',
                            textAlign: 'left',
                            fontSize: '14.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          className="matching-option-btn"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {matchStep === 4 && (
                  /* STEP 4: Age Dropdown */
                  <div>
                    <h3 style={{ fontSize: '20px', color: '#1f2937', fontWeight: '800', marginBottom: '20px', textAlign: 'center' }}>
                      How old are you?
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <select
                        value={matchingAnswers.age}
                        onChange={e => setMatchingAnswers(prev => ({ ...prev, age: e.target.value }))}
                        style={{ width: '100%', padding: '14px', border: '2px solid #a7f3d0', borderRadius: '16px', outline: 'none', fontSize: '15px', background: '#ecfdf5', color: '#065f46', fontWeight: '600' }}
                      >
                        {Array.from({ length: 73 }, (_, i) => i + 18).map(ageVal => (
                          <option key={ageVal} value={ageVal}>{ageVal} years old</option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => nextStep()}
                        style={{
                          padding: '14px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '16px',
                          fontWeight: 'bold',
                          fontSize: '15px',
                          cursor: 'pointer',
                          marginTop: '8px'
                        }}
                      >
                        Next Step ▶
                      </button>
                    </div>
                  </div>
                )}

                {matchStep === 5 && (
                  /* STEP 5: Relationship Status */
                  <div>
                    <h3 style={{ fontSize: '20px', color: '#1f2937', fontWeight: '800', marginBottom: '20px', textAlign: 'center' }}>
                      What is your relationship status?
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {['Single', 'In a relationship', 'Married', 'Divorced', 'Widowed', 'Other'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            const updated = { ...matchingAnswers, relationshipStatus: opt }
                            setMatchingAnswers(updated)
                            nextStep(updated)
                          }}
                          style={{
                            padding: '16px 20px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: '16px',
                            color: '#065f46',
                            textAlign: 'left',
                            fontSize: '14.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          className="matching-option-btn"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {matchStep === 6 && (
                  /* STEP 6: Spiritual */
                  <div>
                    <h3 style={{ fontSize: '20px', color: '#1f2937', fontWeight: '800', marginBottom: '20px', textAlign: 'center' }}>
                      Do you consider yourself to be spiritual?
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {['No', 'Yes'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            const updated = { ...matchingAnswers, spiritual: opt }
                            setMatchingAnswers(updated)
                            nextStep(updated)
                          }}
                          style={{
                            padding: '16px 20px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: '16px',
                            color: '#065f46',
                            textAlign: 'left',
                            fontSize: '14.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          className="matching-option-btn"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {matchStep === 7 && (
                  /* STEP 7: Importance of Religion */
                  <div>
                    <h3 style={{ fontSize: '20px', color: '#1f2937', fontWeight: '800', marginBottom: '20px', textAlign: 'center' }}>
                      How important is religion in your life?
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {['Very important', 'Important', 'Somewhat important', 'Not important at all'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            const updated = { ...matchingAnswers, religionImportance: opt }
                            setMatchingAnswers(updated)
                            nextStep(updated)
                          }}
                          style={{
                            padding: '16px 20px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: '16px',
                            color: '#065f46',
                            textAlign: 'left',
                            fontSize: '14.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          className="matching-option-btn"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {matchStep === 8 && (
                  /* STEP 8: Which Religion */
                  <div>
                    <h3 style={{ fontSize: '20px', color: '#1f2937', fontWeight: '800', marginBottom: '20px', textAlign: 'center' }}>
                      Which religion do you identify with?
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {['Christianity', 'Islam', 'Judaism', 'Hinduism', 'Buddhism', 'Other', 'Prefer not to say'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            const updated = { ...matchingAnswers, religion: opt }
                            setMatchingAnswers(updated)
                            nextStep(updated)
                          }}
                          style={{
                            padding: '16px 20px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: '16px',
                            color: '#065f46',
                            textAlign: 'left',
                            fontSize: '14.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          className="matching-option-btn"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {matchStep === 9 && (
                  /* STEP 9: Previous Therapy */
                  <div>
                    <h3 style={{ fontSize: '20px', color: '#1f2937', fontWeight: '800', marginBottom: '20px', textAlign: 'center' }}>
                      Have you ever been in therapy before?
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {['No', 'Yes'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            const updated = { ...matchingAnswers, therapyBefore: opt }
                            setMatchingAnswers(updated)
                            nextStep(updated)
                          }}
                          style={{
                            padding: '16px 20px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: '16px',
                            color: '#065f46',
                            textAlign: 'left',
                            fontSize: '14.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          className="matching-option-btn"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {matchStep === 10 && (
                  /* STEP 10: Therapy Through BetterHelp */
                  <div>
                    <h3 style={{ fontSize: '20px', color: '#1f2937', fontWeight: '800', marginBottom: '20px', textAlign: 'center' }}>
                      Was your previous therapy through Betterhelp?
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {['Yes', 'No'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            const updated = { ...matchingAnswers, therapyBetterhelp: opt }
                            setMatchingAnswers(updated)
                            nextStep(updated)
                          }}
                          style={{
                            padding: '16px 20px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: '16px',
                            color: '#065f46',
                            textAlign: 'left',
                            fontSize: '14.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                          className="matching-option-btn"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : matchStep === 11 ? (
              /* --- MATCH RESULTS STATE --- */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', color: '#1f2937', fontWeight: 'bold', margin: 0 }}>
                    🎯 Your Recommended Advisor Matches
                  </h3>
                  <button
                    onClick={prevStep}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4f46e5',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    ◀ Back to questions
                  </button>
                </div>
                <p style={{ color: '#6b7280', fontSize: '13.5px', marginBottom: '24px' }}>
                  Based on your questionnaire details, we've computed compatibility ratings for our campus counselors.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {matchedCounselors.map(c => {
                    const initial = c.name ? c.name.charAt(0).toUpperCase() : 'C';
                    return (
                      <div 
                        key={c.name}
                        style={{
                          background: '#f8fafc',
                          padding: '20px',
                          borderRadius: '20px',
                          border: '2px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {c.profilePhoto ? (
                            <img src={c.profilePhoto} alt={c.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366f1' }} />
                          ) : (
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px' }}>
                              {initial}
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                              <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: 'bold' }}>{c.name}</h4>
                              <span style={{
                                background: '#d1fae5',
                                color: '#065f46',
                                fontSize: '12px',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                                animation: 'pulseMatch 2s infinite'
                              }}>
                                {c.matchScore}% Match
                              </span>
                            </div>
                            <span style={{ fontSize: '11px', background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block', marginTop: '4px' }}>
                              {c.specialty}
                            </span>
                          </div>
                        </div>

                        <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5', fontStyle: 'italic' }}>
                          "{c.bio || 'Campus verified advisor dedicated to providing student mental wellbeing and adjustment counseling.'}"
                        </p>

                        <button
                          onClick={() => {
                            setSelectedCounsellor(c.name);
                            setMatchStep(12); // Proceed to scheduling
                          }}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)'
                          }}
                          className="matching-select-btn"
                        >
                          Choose Counselor & Book 📅
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* --- SCHEDULING FORM STATE (STEP 12) --- */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ color: '#1f2937', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                    📅 Schedule Appointment details
                  </h2>
                  <button
                    onClick={prevStep}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4f46e5',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    ◀ Back
                  </button>
                </div>
                <p style={{ color: '#6b7280', fontSize: '13.5px', marginBottom: '24px' }}>
                  Select your convenient date, time slot, and provide a short note to finalize booking.
                </p>

                {message.text && (
                  <div style={{
                    background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: message.type === 'success' ? '#047857' : '#b91c1c',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>
                      Counselor:
                    </label>
                    <select 
                      value={selectedCounsellor} 
                      onChange={e => setSelectedCounsellor(e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none', fontSize: '14px' }}
                      required
                    >
                      <option value="">-- Choose a Counselor --</option>
                      {counsellorList.map(c => (
                        <option key={c.name} value={c.name}>{c.name} ({c.specialty})</option>
                      ))}
                    </select>
                  </div>

                  {selectedCounsellor && (() => {
                    const selectedObj = counsellorList.find(c => c.name === selectedCounsellor);
                    if (!selectedObj) return null;
                    const initial = selectedObj.name ? selectedObj.name.charAt(0).toUpperCase() : 'C';
                    return (
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        {selectedObj.profilePhoto ? (
                          <img src={selectedObj.profilePhoto} alt={selectedObj.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366f1' }} />
                        ) : (
                          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
                            {initial}
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 2px 0', color: '#1e293b', fontSize: '14px', fontWeight: 'bold' }}>{selectedObj.name}</h4>
                          <span style={{ fontSize: '10px', background: '#e0e7ff', color: '#4f46e5', padding: '1px 6px', borderRadius: '8px', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block', marginBottom: '4px' }}>
                            {selectedObj.specialty}
                          </span>
                          <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.4', fontStyle: 'italic' }}>
                            {selectedObj.bio}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  <div>
                    <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>
                      Preferred Date:
                    </label>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>
                      Preferred Time Slot:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      {timeSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            padding: '10px 8px',
                            background: selectedSlot === slot ? '#4f46e5' : 'white',
                            color: selectedSlot === slot ? 'white' : '#4b5563',
                            border: `2px solid ${selectedSlot === slot ? '#4f46e5' : '#e5e7eb'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.1s'
                          }}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>
                      Reason / Notes (Optional):
                    </label>
                    <textarea 
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Let the counselor know how they can help you..."
                      style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none', fontSize: '14px', resize: 'none', height: '80px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    {loading ? '⏳ Requesting...' : '🤝 Schedule Appointment'}
                  </button>
                </form>
              </div>
            )}
            
            <style>{`
              .matching-option-btn {
                transition: all 0.2s ease !important;
              }
              .matching-option-btn:hover {
                background-color: #a7f3d0 !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 10px rgba(16, 185, 129, 0.1);
              }
              .matching-select-btn:hover {
                background-color: #059669 !important;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important;
              }
              @keyframes pulseMatch {
                0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
              }
            `}</style>
          </div>
        )}

        {/* Bookings List */}
        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>📋 Your Sessions</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Current list of scheduled sessions and appointment requests.</p>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '450px', paddingRight: '4px' }}>
            {fetching ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>Loading sessions...</p>
            ) : bookings.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 20px', border: '2px dashed #e5e7eb', borderRadius: '16px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📅</div>
                <p>No appointment requests yet. Book a session using the form.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bookings.map(book => {
                  const style = getStatusColor(book.status)
                  const displayTitle = currentUser?.role === 'counsellor' 
                    ? `Student: ${book.student?.name || 'Anonymous User'}`
                    : `Counselor: ${book.counsellorName}`

                  return (
                    <div key={book._id} style={{ border: '1px solid #e5e7eb', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, color: '#1f2937', fontSize: '15px', fontWeight: 'bold' }}>{displayTitle}</h4>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{
                            background: book.paymentStatus === 'paid' ? '#e0e7ff' : '#fee2e2',
                            color: book.paymentStatus === 'paid' ? '#4f46e5' : '#ef4444',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            {book.paymentStatus === 'paid' ? '💳 Paid' : '⚠️ Unpaid'}
                          </span>
                          <span style={{
                            background: style.bg,
                            color: style.text,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            {style.label}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        <div>📅 {book.date}</div>
                        <div style={{ marginTop: '4px' }}>⏰ {book.timeSlot}</div>
                      </div>

                      {book.note && (
                        <div style={{ background: '#f9fafb', padding: '10px', borderRadius: '8px', fontSize: '12px', color: '#4b5563', fontStyle: 'italic', marginTop: '4px' }}>
                          " {book.note} "
                        </div>
                      )}

                      {book.status === 'rejected' && book.rejectionReason && (
                        <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '10px', borderRadius: '8px', fontSize: '12px', color: '#991b1b', marginTop: '4px', fontWeight: '500' }}>
                          <strong>Rejection Reason:</strong> {book.rejectionReason}
                        </div>
                      )}

                      {/* Counselor Actions */}
                      {currentUser?.role === 'counsellor' && book.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button 
                            onClick={() => handleBookingAction(book._id, 'approved')}
                            style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: 'background 0.2s' }}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => setRejectBookingId(book._id)}
                            style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: 'background 0.2s' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {currentUser?.role === 'counsellor' && book.status === 'approved' && book.paymentStatus === 'paid' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', width: '100%' }}>
                          <button 
                            onClick={() => openBookingChat(book)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12.5px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 6px rgba(79, 172, 254, 0.2)'
                            }}
                          >
                            💬 Chat
                          </button>
                          <button 
                            onClick={() => {
                              setActiveVideoBooking(book)
                              setShowVideoModal(true)
                            }}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12.5px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)'
                            }}
                          >
                            🎥 Video Call
                          </button>
                        </div>
                      )}

                      {currentUser?.role === 'counsellor' && book.status === 'approved' && book.paymentStatus === 'unpaid' && (
                        <div style={{ fontSize: '12.5px', color: '#d97706', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', background: '#fffbeb', border: '1px solid #fde68a', padding: '8px 12px', borderRadius: '8px' }}>
                          <span>⏳</span> Awaiting Student Session Payment
                        </div>
                      )}

                      {/* Student Actions */}
                      {currentUser?.role !== 'counsellor' && book.status === 'approved' && book.paymentStatus === 'unpaid' && (
                        <button 
                          onClick={() => {
                            setPayingBookingId(book._id)
                            setBookingTempData({
                              counsellorName: book.counsellorName,
                              date: book.date,
                              timeSlot: book.timeSlot
                            })
                            setPaymentCardName(currentUser?.name || '')
                            setPaymentCardNum('')
                            setPaymentCardExpiry('')
                            setPaymentCardCvc('')
                            setPaymentError('')
                            setShowPaymentModal(true)
                          }}
                          style={{
                            marginTop: '8px',
                            padding: '8px 12px',
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12.5px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)'
                          }}
                        >
                          💳 Pay LKR 1,500 & Start Session
                        </button>
                      )}

                      {currentUser?.role !== 'counsellor' && book.status === 'pending' && book.paymentStatus === 'unpaid' && (
                        <div style={{ fontSize: '12.5px', color: '#4b5563', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: '8px' }}>
                          <span>⏳</span> Counselor review pending. Payment available after approval.
                        </div>
                      )}

                      {currentUser?.role !== 'counsellor' && book.status === 'approved' && book.counsellor && book.paymentStatus === 'paid' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', width: '100%' }}>
                          <button 
                            onClick={() => openBookingChat(book)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12.5px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 6px rgba(79, 172, 254, 0.2)'
                            }}
                          >
                            💬 Chat
                          </button>
                          <button 
                            onClick={() => {
                              setActiveVideoBooking(book)
                              setShowVideoModal(true)
                            }}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12.5px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)'
                            }}
                          >
                            🎥 Video Call
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- STUDENT FEEDBACK & COMPLAINTS SECTION --- */}
      <div style={{ maxWidth: '900px', margin: '32px auto 0', padding: '0 20px' }}>
        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>📋 Submit System Feedback / Complaints</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Do you have any suggestions, complaints, or feedback? Send it to MindSpace Administrators.</p>
          
          {feedbackStatusMsg && (
            <div style={{
              background: feedbackStatusMsg.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
              color: feedbackStatusMsg.startsWith('✅') ? '#047857' : '#b91c1c',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {feedbackStatusMsg}
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>Feedback Subject:</label>
              <input 
                type="text" 
                value={feedbackSubject}
                onChange={e => setFeedbackSubject(e.target.value)}
                placeholder="e.g. Chatbot connection speed, Booking Slot timings"
                style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>Description / Message:</label>
              <textarea 
                value={feedbackMsg}
                onChange={e => setFeedbackMsg(e.target.value)}
                placeholder="Write your feedback details here..."
                style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none', fontSize: '14px', resize: 'none', height: '100px', boxSizing: 'border-box' }}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={feedbackLoading}
              style={{
                padding: '14px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {feedbackLoading ? '⏳ Submitting...' : '✉️ Submit Feedback'}
            </button>
          </form>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {rejectBookingId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '400px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: '#1f2937', marginTop: 0, marginBottom: '8px' }}>❌ Reject Appointment Booking</h3>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>Please specify a reason for rejecting this student request.</p>
            
            <textarea 
              value={rejectReasonInput}
              onChange={e => setRejectReasonInput(e.target.value)}
              placeholder="Enter reason for rejection..."
              style={{ width: '100%', padding: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#1f2937', outline: 'none', height: '100px', resize: 'none', boxSizing: 'border-box', marginBottom: '20px', fontSize: '13.5px' }}
              required
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setRejectBookingId(null)
                  setRejectReasonInput('')
                }}
                style={{ padding: '10px 18px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleBookingAction(rejectBookingId, 'rejected', rejectReasonInput)
                  setRejectBookingId(null)
                  setRejectReasonInput('')
                }}
                disabled={!rejectReasonInput.trim()}
                style={{ padding: '10px 18px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Success Modal */}
      {showFeedbackSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '28px',
            width: '420px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}>
            {/* Circular Green Checkmark Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
              fontSize: '40px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              ✓
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{
                color: '#047857',
                fontSize: '24px',
                fontWeight: '800',
                margin: 0,
                letterSpacing: '-0.5px'
              }}>
                Thank You!
              </h3>
              <p style={{
                color: '#10b981',
                fontSize: '16px',
                fontWeight: '700',
                lineHeight: '1.5',
                margin: 0
              }}>
                Thank you for your feedback
              </p>
              <p style={{
                color: '#64748b',
                fontSize: '13.5px',
                lineHeight: '1.5',
                margin: 0,
                padding: '0 10px'
              }}>
                We highly appreciate your response. Your complaints and feedback help us make the system better.
              </p>
            </div>

            <button
              onClick={() => setShowFeedbackSuccessModal(false)}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {activeChatBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '450px', height: '550px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0' }}>
            
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '20px 24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                  {currentUser?.role === 'counsellor' ? '💬 Chat with Student' : '💬 Chat with Counselor'}
                </h3>
                <span style={{ fontSize: '12px', opacity: 0.85 }}>
                  {currentUser?.role === 'counsellor' 
                    ? `Student: ${activeChatBooking.student?.name || 'Anonymous User'}`
                    : `Counselor: ${activeChatBooking.counsellorName}`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  onClick={() => {
                    setActiveVideoBooking(activeChatBooking)
                    setShowVideoModal(true)
                  }}
                  title="Start Video Call"
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                >
                  🎥
                </button>
                <button 
                  onClick={closeBookingChat} 
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Message List */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                  <p style={{ margin: 0, fontSize: '13.5px' }}>Start the conversation.</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => {
                  const savedUser = localStorage.getItem('user')
                  const currentUser = savedUser ? JSON.parse(savedUser) : null
                  const isOwn = msg.sender?._id === currentUser?.id || msg.sender === currentUser?.id || msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id
                  
                  return (
                    <div 
                      key={msg._id || index}
                      style={{
                        alignSelf: isOwn ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isOwn ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        background: isOwn ? '#4f46e5' : '#e2e8f0',
                        color: isOwn ? 'white' : '#1f2937',
                        padding: '10px 14px',
                        borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        fontSize: '13.5px',
                        lineHeight: '1.4',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        wordBreak: 'break-word'
                      }}>
                        {msg.text}
                      </div>
                      <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', paddingLeft: isOwn ? 0 : '4px', paddingRight: isOwn ? '4px' : 0 }}>
                        {isOwn ? 'You' : msg.senderName || (currentUser?.role === 'counsellor' ? 'Student' : 'Counselor')}
                      </span>
                    </div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendBookingMessage} style={{ display: 'flex', padding: '16px', gap: '10px', borderTop: '1px solid #e2e8f0', background: 'white' }}>
              <input 
                type="text" 
                value={chatInputText} 
                onChange={e => setChatInputText(e.target.value)} 
                placeholder="Type your message..." 
                style={{ flex: 1, padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '13.5px', outline: 'none' }}
              />
              <button 
                type="submit" 
                style={{ padding: '0 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '450px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.3s ease-out' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💳</span> Secure Session Checkout
                </h3>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Provided by MindSpace Secure Payments</span>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                disabled={paymentProcessing}
                style={{ background: '#f3f4f6', border: 'none', color: '#4b5563', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Transaction Summary */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Appointment Details</div>
              <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '14px', marginTop: '6px' }}>{bookingTempData?.counsellorName}</div>
              <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '2px' }}>📅 {bookingTempData?.date} | ⏰ {bookingTempData?.timeSlot}</div>
              
              <div style={{ width: '100%', height: '1px', background: '#e2e8f0', margin: '12px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#4b5563' }}>Session Booking Fee:</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#4f46e5' }}>LKR 1,500.00</span>
              </div>
            </div>

            {/* Error Message */}
            {paymentError && (
              <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '12px', borderRadius: '8px', color: '#991b1b', fontSize: '13px', marginBottom: '18px', fontWeight: '500' }}>
                ⚠️ {paymentError}
              </div>
            )}

            {/* Mock Card Form */}
            <form onSubmit={handleCompletePaymentAndBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Cardholder Name:</label>
                <input 
                  type="text"
                  value={paymentCardName}
                  onChange={e => setPaymentCardName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none', fontSize: '13.5px', boxSizing: 'border-box' }}
                  required
                  disabled={paymentProcessing}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Card Number:</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text"
                    value={paymentCardNum}
                    onChange={handleCardNumberChange}
                    placeholder="4111 2222 3333 4444"
                    style={{ width: '100%', padding: '12px 40px 12px 12px', border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none', fontSize: '13.5px', boxSizing: 'border-box', letterSpacing: '1px' }}
                    required
                    disabled={paymentProcessing}
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>💳</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Expiration Date:</label>
                  <input 
                    type="text"
                    value={paymentCardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none', fontSize: '13.5px', boxSizing: 'border-box', textAlign: 'center' }}
                    required
                    disabled={paymentProcessing}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Security Code (CVC):</label>
                  <input 
                    type="password"
                    value={paymentCardCvc}
                    onChange={handleCvcChange}
                    placeholder="•••"
                    style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none', fontSize: '13.5px', boxSizing: 'border-box', textAlign: 'center' }}
                    required
                    disabled={paymentProcessing}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={paymentProcessing}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: paymentProcessing ? '#9ca3af' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: paymentProcessing ? 'not-allowed' : 'pointer',
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                  transition: 'background 0.2s'
                }}
              >
                {paymentProcessing ? (
                  <>
                    <span>⏳</span> Processing Secure Payment...
                  </>
                ) : (
                  <>
                    <span>🔒</span> Pay LKR 1,500.00 & Confirm Session
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {showVideoModal && activeVideoBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', zIndex: 99999 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '16px 24px', borderBottom: '1px solid #334155', color: 'white' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎥</span> MindSpace Video Counseling
              </h3>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Session with {currentUser?.role === 'counsellor' ? `Student: ${activeVideoBooking.student?.name || 'Anonymous'}` : `Counselor: ${activeVideoBooking.counsellorName}`}
              </span>
            </div>
            <button 
              onClick={() => {
                setShowVideoModal(false)
                setActiveVideoBooking(null)
              }}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
              onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
            >
              Disconnect Call
            </button>
          </div>

          {/* Iframe Area */}
          <div style={{ flex: 1, background: '#0f172a', position: 'relative' }}>
            <iframe
              src={`https://meet.jit.si/mindspace-session-${activeVideoBooking._id}#userInfo.displayName="${currentUser?.name || 'User'}"`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="MindSpace Video Counseling Session"
            />
          </div>
        </div>
      )}
    </div>
  )
}
