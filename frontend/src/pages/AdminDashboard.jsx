import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import io from 'socket.io-client'
import API_URL from '../config'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('analytics')
  const [currentUser, setCurrentUser] = useState(null)
  
  // Data lists
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [peerMessages, setPeerMessages] = useState([])
  const [moodLogs, setMoodLogs] = useState([])
  const [counselorApps, setCounselorApps] = useState([]) // Counselor applications list
  const [notifications, setNotifications] = useState([])
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [payments, setPayments] = useState([])
  
  // Chat Sidebar / support lists
  const [chatUsers, setChatUsers] = useState([])
  const [activeStudentId, setActiveStudentId] = useState(null)
  const [activeStudentName, setActiveStudentName] = useState('')
  const [supportMessages, setSupportMessages] = useState([])
  const [chatInput, setChatInput] = useState('')

  // Edit Resource modal state
  const [editResource, setEditResource] = useState(null)
  
  // Active Counselor Application under review modal
  const [activeAppReview, setActiveAppReview] = useState(null)

  // New Resource Form
  const [resTitle, setResTitle] = useState('')
  const [resContent, setResContent] = useState('')
  const [resCategory, setResCategory] = useState('Stress')
  const [resReadTime, setResReadTime] = useState(5)
  const [resMessage, setResMessage] = useState('')

  // Recommendation curation form
  const [recUser, setRecUser] = useState('')
  const [recGame, setRecGame] = useState('bubbles')
  const [recActivity, setRecActivity] = useState('')
  
  // Announcement form
  const [announceTitle, setAnnounceTitle] = useState('')
  const [announceContent, setAnnounceContent] = useState('')
  const [announceTarget, setAnnounceTarget] = useState('all')
  const [announceMessage, setAnnounceMessage] = useState('')

  // Report sections selection state
  const [selectedReportSections, setSelectedReportSections] = useState({
    mood: true,
    booking: true,
    usage: true
  })

  // Selected student mental health report for Counselor/Admin view
  const [selectedStudentReport, setSelectedStudentReport] = useState(null)
  const [loadingReport, setLoadingReport] = useState(false)

  // Bank Account details form states for Counselor
  const [bankName, setBankName] = useState('')
  const [bankBranch, setBankBranch] = useState('')
  const [bankHolder, setBankHolder] = useState('')
  const [bankAccNum, setBankAccNum] = useState('')
  const [bankUpdateMsg, setBankUpdateMsg] = useState('')

  // Monthly settlement states for Admin
  const [autoSettleLogs, setAutoSettleLogs] = useState(null)
  const [settlementSuccessMsg, setSettlementSuccessMsg] = useState('')

  // Rejection modal state
  const [rejectBookingId, setRejectBookingId] = useState(null)
  const [rejectReasonInput, setRejectReasonInput] = useState('')

  // Counselor Booking Private Chat states
  const [activeChatBooking, setActiveChatBooking] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInputText, setChatInputText] = useState('')
  const bookingSocketRef = useRef(null)
  const bookingChatEndRef = useRef(null)

  // Video Conferencing States
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [activeVideoBooking, setActiveVideoBooking] = useState(null)

  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [studentCounselData, setStudentCounselData] = useState(null)
  const [loadingStudentData, setLoadingStudentData] = useState(false)
  const [counselGame, setCounselGame] = useState('bubbles')
  const [counselActivity, setCounselActivity] = useState('')
  const [counselMessage, setCounselMessage] = useState('')

  const handleStudentSelect = async (studentId) => {
    setSelectedStudentId(studentId)
    if (!studentId) {
      setStudentCounselData(null)
      return
    }
    setLoadingStudentData(true)
    try {
      const res = await axios.get(`${API_URL}/api/mood/counselor-view/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudentCounselData(res.data)
    } catch (err) {
      console.error('Error loading student counselor data:', err)
    } finally {
      setLoadingStudentData(false)
    }
  }

  const handleCounselAssignRecommendation = async (studentId) => {
    try {
      await axios.put(`${API_URL}/api/auth/users/${studentId}/recommendation`, 
        { game: counselGame, activity: counselActivity },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCounselMessage('🎯 Custom recommendation assigned successfully!')
      setCounselActivity('')
      // Reload student details to refresh local state
      const res = await axios.get(`${API_URL}/api/mood/counselor-view/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudentCounselData(res.data)
      setTimeout(() => setCounselMessage(''), 3000)
    } catch (err) {
      alert('Failed to assign recommendation')
    }
  }

  const socketRef = useRef(null)
  const chatEndRef = useRef(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      navigate('/')
      return
    }
    const parsedUser = JSON.parse(savedUser)
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'counsellor') {
      alert('Access Denied: Administrative Console')
      navigate('/dashboard')
      return
    }
    setCurrentUser(parsedUser)

    // Load common data for both admin and counsellor
    fetchUsers()
    fetchBookings()
    fetchStudentMoodHistory()
    fetchPayments()
    fetchAnnouncements()

    // Load admin-only data
    if (parsedUser.role === 'admin') {
      fetchResources()
      fetchFeedbacks()
      fetchPeerChatHistory()
      fetchCounselorApplications()
    }

    // Socket Setup
    socketRef.current = io(`${API_URL}`)

    if (parsedUser.role === 'admin') {
      socketRef.current.on('new_counselor_application', (newApp) => {
        // Update counselorApps list in real-time
        setCounselorApps(prev => {
          if (prev.some(app => app._id === newApp._id)) return prev
          return [newApp, ...prev]
        })

        // Add real-time Toast notification
        const toastId = Date.now()
        setNotifications(prev => [
          ...prev,
          {
            id: toastId,
            title: 'New Counselor Application',
            message: `Applicant: ${newApp.fullName} (${newApp.email}) has applied.`,
            type: 'info'
          }
        ])
        // Auto dismiss after 6 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== toastId))
        }, 6000)
      })
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect()
    }
  }, [])

  // Join private support chat room
  useEffect(() => {
    if (socketRef.current && activeStudentId) {
      const room = `admin-support-${activeStudentId}`
      socketRef.current.emit('join_room', room)
      socketRef.current.off('receive_message')
      
      socketRef.current.on('receive_message', (msg) => {
        if (msg.room === room) {
          setSupportMessages(prev => {
            if (prev.some(m => m._id === msg._id)) return prev
            return [...prev, msg]
          })
          fetchSupportUsers() // refresh sidebar
        }
      })
    }
  }, [activeStudentId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [supportMessages])

  // --- API Handlers ---
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookings(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchResources = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/resources`)
      setResources(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFeedbacks(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAnnouncements(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchPeerChatHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/messages/peer-chat`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPeerMessages(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchStudentMoodHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/mood/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const mapped = res.data.map(log => ({
        id: log._id,
        userId: log.user?._id || log.user?.id || '',
        name: log.user?.name || 'Anonymous Student',
        email: log.user?.email || 'N/A',
        emoji: log.emoji,
        label: log.label,
        value: log.value,
        note: log.note,
        date: new Date(log.createdAt).toLocaleDateString()
      }))
      setMoodLogs(mapped)
      fetchSupportUsers()
    } catch (err) {
      console.error('Error loading student mood history:', err)
    }
  }

  const fetchSupportUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/messages/admin-support/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setChatUsers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchCounselorApplications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/counselor-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCounselorApps(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPayments(res.data)
    } catch (err) {
      console.error('Error fetching payments:', err)
    }
  }

  const handleMarkAsPaid = async (paymentId) => {
    if (!window.confirm('Mark this counselor session payout as paid?')) return
    try {
      await axios.put(`${API_URL}/api/payments/${paymentId}/pay`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('💸 Payout marked as paid successfully!')
      fetchPayments()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process payment.')
    }
  }

  // --- Feature Actions ---
  
  // 1. User Management Status Toggle
  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'deactivated' : 'active'
    try {
      await axios.put(`${API_URL}/api/auth/users/${userId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert(`User account ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`)
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status')
    }
  }

  const handleUpdateRole = async (userId, role) => {
    try {
      await axios.put(`${API_URL}/api/auth/users/${userId}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('User role updated successfully!')
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user account permanently?')) return
    try {
      await axios.delete(`${API_URL}/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('User account deleted.')
      fetchUsers()
    } catch (err) {
      alert('Failed to delete user')
    }
  }

  // 3. Content Management Edit & Create
  const handleCreateResource = async (e) => {
    e.preventDefault()
    if (!resTitle || !resContent || !resReadTime) {
      setResMessage('Please fill all fields')
      return
    }
    try {
      await axios.post(`${API_URL}/api/resources`, 
        { title: resTitle, content: resContent, category: resCategory, readTime: resReadTime },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResMessage('✅ Resource article added successfully!')
      setResTitle('')
      setResContent('')
      setResReadTime(5)
      fetchResources()
    } catch (err) {
      setResMessage('Failed to add resource')
    }
  }

  const handleUpdateResource = async (e) => {
    e.preventDefault()
    if (!editResource.title || !editResource.content || !editResource.readTime) return
    try {
      await axios.put(`${API_URL}/api/resources/${editResource._id}`, 
        editResource,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('✅ Resource article updated successfully!')
      setEditResource(null)
      fetchResources()
    } catch (err) {
      alert('Failed to update article')
    }
  }

  const handleDeleteResource = async (resId) => {
    if (!window.confirm('Delete this resource article?')) return
    try {
      await axios.delete(`${API_URL}/api/resources/${resId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchResources()
    } catch (err) {
      alert('Failed to delete resource')
    }
  }

  // 4. Recommendation Management
  const handleAssignRecommendation = async (e) => {
    e.preventDefault()
    if (!recUser) {
      alert('Please select a student')
      return
    }
    try {
      await axios.put(`${API_URL}/api/auth/users/${recUser}/recommendation`, 
        { game: recGame, activity: recActivity },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('🎯 Custom recommendation assigned successfully!')
      setRecActivity('')
      setRecUser('')
      fetchUsers() // reload stats
    } catch (err) {
      alert('Failed to assign recommendation')
    }
  }

  // 6. Feedback Resolution
  // *** PENDING FEEDBACK RESOLVE/DONE KARANNA CALL KARANA FUNCTION EKA ***
  // (This function is called when you click the 'Resolve' button to update feedback status to 'resolved')
  const handleResolveFeedback = async (id) => {
    try {
      await axios.put(`${API_URL}/api/feedback/${id}/resolved`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      alert('Complaint marked as done.')
      fetchFeedbacks()
    } catch (err) {
      alert('Failed to update feedback status')
    }
  }

  // 7. Announcements Creation
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    if (!announceTitle || !announceContent) return
    try {
      await axios.post(`${API_URL}/api/announcements`, 
        { title: announceTitle, content: announceContent, targetRole: announceTarget },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAnnounceMessage('📢 Announcement broadcasted successfully!')
      setAnnounceTitle('')
      setAnnounceContent('')
      fetchAnnouncements()
    } catch (err) {
      setAnnounceMessage('Failed to post announcement')
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return
    try {
      await axios.delete(`${API_URL}/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('📢 Announcement deleted successfully!')
      fetchAnnouncements()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete announcement')
    }
  }

  // 9. Chat Moderation (Delete peer message)
  const handleDeletePeerMessage = async (msgId) => {
    if (!window.confirm('Delete this message from Peer Chat?')) return
    try {
      await axios.delete(`${API_URL}/api/messages/peer-chat/${msgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Message deleted.')
      fetchPeerChatHistory()
    } catch (err) {
      alert('Failed to delete message')
    }
  }

  // 13. Counselor Verification Approval (Approve / Reject)
  const handleApplicationStatus = async (appId, status) => {
    if (!window.confirm(`Are you sure you want to mark this application as ${status}?`)) return
    try {
      await axios.put(`${API_URL}/api/counselor-applications/${appId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert(`Verification application successfully marked as ${status}!`)
      setActiveAppReview(null)
      fetchCounselorApplications()
      fetchUsers() // refresh roles
    } catch (err) {
      alert('Failed to update counselor application status')
    }
  }

  // 12. Report Generation Print
  const handlePrintReport = () => {
    window.print()
  }

  // Pre-populate counselor's bank account details if available
  useEffect(() => {
    if (currentUser && currentUser.bankDetails) {
      setBankName(currentUser.bankDetails.bankName || '')
      setBankBranch(currentUser.bankDetails.branchName || '')
      setBankHolder(currentUser.bankDetails.accountHolderName || '')
      setBankAccNum(currentUser.bankDetails.accountNumber || '')
    }
  }, [currentUser])

  // Update Counselor bank details
  const handleUpdateBankDetails = async () => {
    if (!bankName || !bankBranch || !bankHolder || !bankAccNum) {
      alert('Please fill out all bank account fields.')
      return
    }
    try {
      const res = await axios.put(`${API_URL}/api/payments/bank-details`, {
        bankName,
        branchName: bankBranch,
        accountHolderName: bankHolder,
        accountNumber: bankAccNum
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setBankUpdateMsg('🏦 Bank details updated successfully!')
      setTimeout(() => setBankUpdateMsg(''), 4500)
      
      const updatedUser = { ...currentUser, bankDetails: res.data.bankDetails }
      setCurrentUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (err) {
      console.error(err)
      alert('Failed to update bank details. Please try again.')
    }
  }

  // Settle all pending payouts at once (Auto Monthly payout)
  const handleAutoSettlement = async () => {
    if (!window.confirm('Are you sure you want to run the auto-monthly payout settlement cycle for all counselors?')) return
    try {
      const res = await axios.post(`${API_URL}/api/payments/auto-settlement`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSettlementSuccessMsg(res.data.message)
      setAutoSettleLogs(res.data.logs)
      // Refresh payments logs list
      fetchPayments()
    } catch (err) {
      console.error(err)
      alert('Failed to execute auto monthly settlement.')
    }
  }

  // Fetch student mental health report for Counselor view
  const fetchStudentReport = async (studentId) => {
    if (!studentId) return
    setLoadingReport(true)
    try {
      const res = await axios.get(`${API_URL}/api/mood/counselor-view/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelectedStudentReport(res.data)
    } catch (err) {
      console.error(err)
      alert('Failed to fetch student mental health report. Please try again.')
    } finally {
      setLoadingReport(false)
    }
  }

  // Live support chat sender
  const openSupportChat = async (studentId, studentName) => {
    setActiveStudentId(studentId)
    setActiveStudentName(studentName)
    try {
      const res = await axios.get(`${API_URL}/api/messages/admin-support?studentId=${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSupportMessages(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendSupport = (e) => {
    e.preventDefault()
    if (!chatInput.trim() || !socketRef.current || !currentUser || !activeStudentId) return

    socketRef.current.emit('send_message', {
      sender: currentUser.id,
      receiver: activeStudentId,
      text: chatInput.trim(),
      room: `admin-support-${activeStudentId}`,
      senderName: currentUser.name
    })
    setChatInput('')
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

  // Booking Chat actions
  useEffect(() => {
    bookingChatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
    if (!bookingSocketRef.current) {
      bookingSocketRef.current = io(`${API_URL}`)
    }

    const room = `booking-chat-${booking._id}`
    bookingSocketRef.current.emit('join_room', room)

    bookingSocketRef.current.off('receive_message')
    bookingSocketRef.current.on('receive_message', (msg) => {
      if (msg.room === room) {
        setChatMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      }
    })
  }

  const closeBookingChat = () => {
    if (bookingSocketRef.current) {
      bookingSocketRef.current.disconnect()
      bookingSocketRef.current = null
    }
    setActiveChatBooking(null)
  }

  const handleSendBookingMessage = (e) => {
    e.preventDefault()
    if (!chatInputText.trim() || !bookingSocketRef.current || !activeChatBooking || !currentUser) return

    const room = `booking-chat-${activeChatBooking._id}`
    bookingSocketRef.current.emit('send_message', {
      sender: currentUser.id || currentUser._id,
      receiver: activeChatBooking.student?._id || activeChatBooking.student,
      text: chatInputText.trim(),
      room,
      senderName: currentUser.name
    })
    setChatInputText('')
  }

  // --- Aggregate Charts Calculations ---
  const getMoodPieData = () => {
    const counts = { Terrible: 0, Bad: 0, Okay: 0, Good: 0, Great: 0 }
    moodLogs.forEach(log => {
      if (counts[log.label] !== undefined) counts[log.label]++
    })
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }))
  }

  const getBookingBarData = () => {
    const counts = { pending: 0, approved: 0, cancelled: 0 }
    bookings.forEach(b => {
      if (counts[b.status] !== undefined) counts[b.status]++
    })
    return Object.keys(counts).map(key => ({ name: key.toUpperCase(), Count: counts[key] }))
  }

  // Derive emergency alerts dynamically from student mood logs
  const emergencyAlerts = moodLogs.filter(log => {
    const isLowMood = log.value <= 2 // Terrible (1) or Bad (2) rating
    const triggerWords = ['suicide', 'die', 'kill', 'self-harm', 'hurt myself', 'depressed', 'anxious']
    const hasTriggerWord = log.note && triggerWords.some(word => log.note.toLowerCase().includes(word))
    return isLowMood || hasTriggerWord
  }).map(log => ({
    id: log.id,
    userId: log.userId,
    name: log.name,
    email: log.email,
    mood: `${log.emoji} ${log.label} (${log.value}/5)`,
    note: log.note || 'No notes added',
    date: log.date
  }))

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', display: 'flex' }}>
      
      {/* Sidebar Navigation Panel */}
      <div className="no-print" style={{ width: '280px', background: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 24px', marginBottom: '24px' }}>
          <h1 style={{ color: '#6366f1', fontSize: '24px', margin: 0, fontWeight: 'bold' }}>🧠 MindSpace</h1>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {currentUser?.role === 'admin' ? 'Admin Console' : 'Counselor Console'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflowY: 'auto' }}>
          <button onClick={() => setActiveTab('analytics')} style={getSidebarButtonStyle(activeTab === 'analytics')}>1. Mood Analytics</button>
          
          {currentUser?.role === 'admin' && (
            <>
              <button onClick={() => setActiveTab('users')} style={getSidebarButtonStyle(activeTab === 'users')}>2. User Accounts</button>
              <button onClick={() => setActiveTab('resources')} style={getSidebarButtonStyle(activeTab === 'resources')}>3. Resources (Articles)</button>
            </>
          )}

          <button onClick={() => setActiveTab('recommendation')} style={getSidebarButtonStyle(activeTab === 'recommendation')}>4. Curate Games/Tips</button>

          {currentUser?.role === 'admin' && (
            <>
              <button onClick={() => setActiveTab('chats')} style={getSidebarButtonStyle(activeTab === 'chats')}>5. Private Live Help</button>
              <button onClick={() => setActiveTab('feedback')} style={getSidebarButtonStyle(activeTab === 'feedback')}>6. Complaints & Feedback</button>
              <button onClick={() => setActiveTab('announcements')} style={getSidebarButtonStyle(activeTab === 'announcements')}>7. Post Announcements</button>
              <button onClick={() => setActiveTab('monitoring')} style={getSidebarButtonStyle(activeTab === 'monitoring')}>8. Activity Logs</button>
              <button onClick={() => setActiveTab('moderator')} style={getSidebarButtonStyle(activeTab === 'moderator')}>9. Peer Chat Moderator</button>
              <button onClick={() => setActiveTab('emergency')} style={getSidebarButtonStyle(activeTab === 'emergency')}>10. Emergency Alarms</button>
            </>
          )}

          <button onClick={() => setActiveTab('bookings')} style={getSidebarButtonStyle(activeTab === 'bookings')}>11. Appointment Bookings</button>

          {currentUser?.role === 'admin' && (
            <>
              <button onClick={() => setActiveTab('reporting')} style={getSidebarButtonStyle(activeTab === 'reporting')}>12. Report Exporter</button>
              <button 
                onClick={() => setActiveTab('counselorapps')} 
                style={{
                  ...getSidebarButtonStyle(activeTab === 'counselorapps', true),
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>13. Counselor Approvals</span>
                {counselorApps.filter(app => app.status === 'pending').length > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    marginRight: '12px'
                  }}>
                    {counselorApps.filter(app => app.status === 'pending').length}
                  </span>
                )}
              </button>
            </>
          )}

          {currentUser?.role === 'admin' ? (
            <button onClick={() => setActiveTab('payments')} style={getSidebarButtonStyle(activeTab === 'payments')}>14. Counselor Payments</button>
          ) : (
            <button onClick={() => setActiveTab('payments')} style={getSidebarButtonStyle(activeTab === 'payments')}>14. My Earnings</button>
          )}
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid #334155' }}>
          <button onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '10px', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>User Dashboard</button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', minWidth: 0 }}>
        
        {/* Dashboard Header with Welcome and Notification Bell */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          borderBottom: '1px solid #334155',
          paddingBottom: '20px'
        }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '26px', margin: '0 0 4px', fontWeight: 'bold' }}>
              Welcome Back, {currentUser?.name || 'Counselor'} 👋
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>
              System role: <span style={{ color: '#818cf8', fontWeight: 'bold', textTransform: 'capitalize' }}>{currentUser?.role}</span>
            </p>
          </div>

          {/* Notifications Bell Dropdown */}
          {currentUser?.role === 'admin' && (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
              >
                <span style={{ fontSize: '18px' }}>🔔</span>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Notifications</span>
                {counselorApps.filter(app => app.status === 'pending').length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '10px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    boxShadow: '0 0 0 2px #0f172a'
                  }}>
                    {counselorApps.filter(app => app.status === 'pending').length}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '320px',
                  background: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                  zIndex: 2000,
                  overflow: 'hidden',
                  animation: 'fadeIn 0.2s'
                }}>
                  <div style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#1e1b4b'
                  }}>
                    <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#cbd5e1' }}>System Notifications</span>
                    <span style={{
                      fontSize: '11px',
                      background: '#312e81',
                      color: '#a5b4fc',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}>
                      {counselorApps.filter(app => app.status === 'pending').length} Pending
                    </span>
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {counselorApps.filter(app => app.status === 'pending').length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                        <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🎉</span>
                        No new counselor applications pending.
                      </div>
                    ) : (
                      counselorApps.filter(app => app.status === 'pending').map(app => (
                        <div key={app._id} style={{
                          padding: '14px 18px',
                          borderBottom: '1px solid #334155',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          transition: 'background 0.2s',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setActiveTab('counselorapps');
                          setIsNotificationOpen(false);
                        }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'white' }}>{app.fullName}</span>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                              {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                            Applied as a Counselor ({app.specialization?.join(', ')})
                          </span>
                          <div style={{
                            alignSelf: 'flex-start',
                            marginTop: '4px',
                            fontSize: '10.5px',
                            color: '#818cf8',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            Review Details →
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Toast Notification Container */}
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px', width: '100%' }}>
          {notifications.map(n => (
            <div key={n.id} style={{
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '16px',
              padding: '16px 20px',
              color: 'white',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13.5px', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🔔 {n.title}
                </span>
                <button 
                  onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', padding: 0 }}
                >
                  ✕
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.4' }}>{n.message}</p>
              <button 
                onClick={() => {
                  setActiveTab('counselorapps')
                  setNotifications(prev => prev.filter(item => item.id !== n.id))
                }}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '8px',
                  padding: '6px 12px',
                  background: '#6366f1',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '11.5px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Review Now →
              </button>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* System Announcements Board */}
        {announcements.length > 0 && (
          <div style={{ 
            background: '#1e293b', 
            border: '1px solid #334155', 
            borderRadius: '16px', 
            padding: '20px', 
            marginBottom: '24px', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
          }}>
            <h3 style={{ color: '#fbbf24', margin: '0 0 12px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
              <span>📢</span> MindSpace System Announcements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {announcements.map((ann, idx) => (
                <div key={ann._id} style={{ 
                  paddingBottom: idx === announcements.length - 1 ? '0' : '12px', 
                  borderBottom: idx === announcements.length - 1 ? 'none' : '1px solid #334155',
                  marginTop: idx > 0 ? '12px' : '0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '13.5px', fontWeight: 'bold' }}>{ann.title}</h4>
                    <span style={{ fontSize: '9px', background: '#334155', color: '#fbbf24', padding: '1px 6px', borderRadius: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                      {ann.targetRole}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.4' }}>{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* TAB 1: Mood Analytics */}
        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ color: 'white', marginBottom: '8px' }}>📊 Mood Analytics & Student Tracking</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>Overview campus wellness metrics or select a specific student for a detailed report.</p>

            {/* Student selection panel */}
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <label style={{ fontWeight: 'bold', fontSize: '13.5px', color: 'white' }}>🔍 Search Student Report:</label>
              <select 
                value={selectedStudentId} 
                onChange={(e) => handleStudentSelect(e.target.value)}
                style={{ background: '#0f172a', border: '1px solid #475569', color: 'white', padding: '10px 16px', borderRadius: '8px', fontSize: '13.5px', flex: 1, outline: 'none' }}
              >
                <option value="">-- Select student for detailed counselor overview --</option>
                {users.filter(u => u.role === 'student').map(student => (
                  <option key={student._id} value={student._id}>{student.name} ({student.email})</option>
                ))}
              </select>
            </div>

            {selectedStudentId && studentCounselData ? (
              <div style={{ animation: 'fadeIn 0.4s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>📊 Counselor View: {studentCounselData.student?.name}</h3>
                  <button 
                    onClick={() => { setSelectedStudentId(''); setStudentCounselData(null); }}
                    style={{ padding: '8px 16px', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 'bold' }}
                  >
                    ← General Overview
                  </button>
                </div>

                {/* Statistics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Average Mood</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#a78bfa' }}>
                      {studentCounselData.stats?.averageMood} / 5.0
                    </div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Active Streak</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#f97316' }}>
                      🔥 {studentCounselData.student?.streakCount || 0} Days
                    </div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Logs this month</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#10b981' }}>
                      {studentCounselData.student?.monthlyGoalLogs || 0} / 15 Logs
                    </div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Badges Unlocked</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px', color: '#3b82f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      🏆 {studentCounselData.student?.badges?.length || 0} Badges
                    </div>
                  </div>
                </div>

                {/* AI Weekly Summary */}
                <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '24px', borderRadius: '20px', border: '1px solid #4338ca', marginBottom: '32px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#a5b4fc', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <span>✨</span> AI Weekly Wellness Summary
                  </h4>
                  <p style={{ margin: 0, color: '#e0e7ff', fontSize: '13.5px', lineHeight: '1.6' }}>
                    {studentCounselData.stats?.weeklySummary}
                  </p>
                </div>

                {/* Charts Area */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  
                  {/* Line Chart */}
                  <div style={{ background: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                    <h4 style={{ color: 'white', fontSize: '14.5px', fontWeight: 'bold', marginBottom: '20px' }}>📈 Mood Trend Over Time</h4>
                    <div style={{ width: '100%', height: '220px' }}>
                      <ResponsiveContainer>
                        <LineChart data={studentCounselData.stats?.weeklyTrend || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                          <YAxis stroke="#94a3b8" domain={[1, 5]} style={{ fontSize: '11px' }} ticks={[1, 2, 3, 4, 5]} />
                          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                          <Line type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Sleep vs Mood Chart */}
                  <div style={{ background: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                    <h4 style={{ color: 'white', fontSize: '14.5px', fontWeight: 'bold', marginBottom: '20px' }}>🛌 Sleep Hours vs Mood Score</h4>
                    <div style={{ width: '100%', height: '220px' }}>
                      <ResponsiveContainer>
                        <LineChart data={studentCounselData.stats?.sleepVsMood || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '10px' }} />
                          <YAxis stroke="#94a3b8" yAxisId="left" orientation="left" stroke="#3b82f6" style={{ fontSize: '10px' }} />
                          <YAxis stroke="#94a3b8" yAxisId="right" orientation="right" stroke="#10b981" style={{ fontSize: '10px' }} />
                          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                          <Line yAxisId="left" type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Trigger Frequency */}
                  <div style={{ background: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                    <h4 style={{ color: 'white', fontSize: '14.5px', fontWeight: 'bold', marginBottom: '20px' }}>⚠️ Trigger Frequency Chart</h4>
                    {studentCounselData.stats?.triggerFrequency?.length === 0 ? (
                      <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginTop: '60px' }}>No triggers logged.</p>
                    ) : (
                      <div style={{ width: '100%', height: '220px' }}>
                        <ResponsiveContainer>
                          <BarChart data={studentCounselData.stats?.triggerFrequency || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                            <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                            <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Activity vs Mood */}
                  <div style={{ background: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                    <h4 style={{ color: 'white', fontSize: '14.5px', fontWeight: 'bold', marginBottom: '20px' }}>🏃 Activity vs Average Mood</h4>
                    {studentCounselData.stats?.activityVsMood?.length === 0 ? (
                      <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginTop: '60px' }}>No activities logged.</p>
                    ) : (
                      <div style={{ width: '100%', height: '220px' }}>
                        <ResponsiveContainer>
                          <BarChart data={studentCounselData.stats?.activityVsMood || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '9px' }} />
                            <YAxis stroke="#94a3b8" domain={[0, 5]} style={{ fontSize: '11px' }} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                            <Bar dataKey="avgMood" fill="#34d399" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                </div>

                {/* Weather, Music, and Exam stress analysis lists */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  
                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>☀️ Weather vs Average Mood</h5>
                    {studentCounselData.stats?.weatherVsMood?.length === 0 ? (
                      <span style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>No data logged.</span>
                    ) : (
                      studentCounselData.stats?.weatherVsMood?.map(w => (
                        <div key={w.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #334155', paddingBottom: '6px', marginBottom: '6px' }}>
                          <span>{w.name}</span>
                          <strong>{w.avgMood} / 5.0</strong>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>🎵 Music vs Average Mood</h5>
                    {studentCounselData.stats?.musicVsMood?.length === 0 ? (
                      <span style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>No data logged.</span>
                    ) : (
                      studentCounselData.stats?.musicVsMood?.map(m => (
                        <div key={m.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #334155', paddingBottom: '6px', marginBottom: '6px' }}>
                          <span>{m.name}</span>
                          <strong>{m.avgMood} / 5.0</strong>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>📝 Exam Stress Analysis</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Assessment/Exam periods:</span>
                        <strong>{studentCounselData.stats?.examStressAnalysis?.exam} / 5.0</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Non-exam periods:</span>
                        <strong>{studentCounselData.stats?.examStressAnalysis?.nonExam} / 5.0</strong>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Mood Logs History */}
                <div style={{ background: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '32px' }}>
                  <h4 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '15.5px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📋</span> Patient Journal & Mood History Logs
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Historical mood logs, emoji ratings, sleep/lifestyle stats, and personal journal notes recorded by the student.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                    {(!studentCounselData.moods || studentCounselData.moods.length === 0) ? (
                      <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: '20px 0', textAlign: 'center' }}>No mood logs recorded yet.</p>
                    ) : (
                      studentCounselData.moods.map(log => (
                        <div key={log.id} style={{ background: '#0f172a', padding: '16px', borderRadius: '14px', border: '1px solid #1e293b' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '24px' }}>{log.emoji}</span>
                              <div>
                                <strong style={{ color: 'white', fontSize: '14px' }}>{log.label} ({log.value}/5)</strong>
                                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Trigger: <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{log.trigger || 'None'}</span></span>
                              </div>
                            </div>
                            <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 'bold', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 8px', borderRadius: '8px' }}>{log.date}</span>
                          </div>

                          {/* Journal notes */}
                          {log.note ? (
                            <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontSize: '12.5px', fontStyle: 'italic', marginBottom: '10px', borderLeft: '3px solid #6366f1' }}>
                              "{log.note}"
                            </div>
                          ) : (
                            <div style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic', marginBottom: '10px' }}>No journal notes attached.</div>
                          )}

                          {/* Activities & Lifestyle */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '11.5px', color: '#94a3b8' }}>
                            {log.activities && log.activities.length > 0 && (
                              <div>
                                <span style={{ color: '#cbd5e1', fontWeight: 'bold' }}>Activities:</span> {log.activities.join(', ')}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                              <span>🛌 Sleep: <strong>{log.sleepHours} hrs</strong></span>
                              <span>💧 Water: <strong>{log.waterIntake} ml</strong></span>
                              <span>📱 Screen: <strong>{log.screenTime} hrs</strong></span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Direct recommendation form */}
                <div style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
                  <h4 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '15.5px', fontWeight: 'bold' }}>🎯 Curate Recommendation for {studentCounselData.student?.name}</h4>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Assign a relaxation exercise and tip that displays directly on the student's homepage dashboard.</p>

                  {counselMessage && (
                    <div style={{ background: '#161b33', padding: '12px', border: '1px solid #4f46e5', borderRadius: '8px', color: '#818cf8', fontSize: '13px', marginBottom: '16px', fontWeight: 'bold' }}>
                      {counselMessage}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Curated Game:</label>
                      <select 
                        value={counselGame} 
                        onChange={(e) => setCounselGame(e.target.value)}
                        style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none' }}
                      >
                        <option value="bubbles">Bubble Wrap Popper 🫧</option>
                        <option value="memory">Zen Memory Match 🧩</option>
                        <option value="gratitude">Gratitude Garden 🌸</option>
                        <option value="tictactoe">Tic-Tac-Toe ❌⭕</option>
                        <option value="breathing">Breathing Balloon 🎈</option>
                        <option value="affirmation">Affirmation Spinner 🎡</option>
                        <option value="whack">Whack-A-Stress 🔨</option>
                        <option value="doodler">Zen Doodler 🎨</option>
                        <option value="wordsearch">Mindful Word Search 🔍</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Counselor Advice Tip:</label>
                      <input 
                        type="text" 
                        value={counselActivity} 
                        onChange={(e) => setCounselActivity(e.target.value)}
                        placeholder="e.g. Please spend 10 minutes doodling color strokes to clear your anxious focus."
                        style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => handleCounselAssignRecommendation(studentCounselData.student?._id)}
                    disabled={!counselActivity.trim()}
                    style={{ padding: '12px 24px', background: counselActivity.trim() ? '#6366f1' : '#475569', color: 'white', border: 'none', borderRadius: '8px', cursor: counselActivity.trim() ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    Assign Curated Suggestion
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* General dashboard aggregates */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Total Users</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '8px', color: '#6366f1' }}>{users.length}</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Counselling Bookings</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '8px', color: '#10b981' }}>{bookings.length}</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Active Resources</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '8px', color: '#f59e0b' }}>{resources.length}</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Avg Mood Rating</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '8px', color: '#a78bfa' }}>3.7 / 5.0</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                  {/* Line graph */}
                  <div style={{ background: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                    <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '20px' }}>📈 Average Mood Index Over Time</h3>
                    <div style={{ width: '100%', height: '220px' }}>
                      <ResponsiveContainer>
                        <LineChart data={[
                          { date: '06-03', avg: 4.2 },
                          { date: '06-04', avg: 3.8 },
                          { date: '06-05', avg: 3.9 },
                          { date: '06-06', avg: 3.5 },
                          { date: '06-07', avg: 3.2 },
                          { date: '06-08', avg: 3.6 },
                          { date: '06-09', avg: 4.0 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" domain={[1, 5]} />
                          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                          <Line type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pie graph */}
                  <div style={{ background: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '16px' }}>📊 Mood Distribution Breakdown</h3>
                    <div style={{ width: '100%', height: '200px', position: 'relative' }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie 
                            data={getMoodPieData()} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey="value"
                          >
                            {getMoodPieData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '12px' }}>
                      {getMoodPieData().map((m, idx) => (
                        <span key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[idx] }}></span>
                          {m.name} ({m.value})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Individual Records Table */}
                <div style={{ background: '#1e293b', borderRadius: '20px', border: '1px solid #334155', overflowX: 'auto' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', fontWeight: 'bold' }}>📋 Recent Student Mood Logs</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#334155', color: '#cbd5e1' }}>
                        <th style={{ padding: '12px 20px' }}>Student</th>
                        <th style={{ padding: '12px 20px' }}>Mood Rating</th>
                        <th style={{ padding: '12px 20px' }}>Date</th>
                        <th style={{ padding: '12px 20px' }}>Journal Entry / Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moodLogs.map(log => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{log.name}</td>
                          <td style={{ padding: '12px 20px' }}>{log.emoji} {log.label} ({log.value}/5)</td>
                          <td style={{ padding: '12px 20px', color: '#94a3b8' }}>{log.date}</td>
                          <td style={{ padding: '12px 20px', fontStyle: 'italic' }}>"{log.note || 'No notes added'}"</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: User Accounts */}
        {activeTab === 'users' && (
          <div>
            <h2 style={{ color: 'white', marginBottom: '8px' }}>👤 User Role & Account Status Manager</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>Assign system permissions, edit account roles, and activate or deactivate user accounts.</p>

            <div style={{ background: '#1e293b', borderRadius: '20px', overflowX: 'auto', border: '1px solid #334155' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: '#334155', color: '#cbd5e1' }}>
                    <th style={{ padding: '16px 24px' }}>Name</th>
                    <th style={{ padding: '16px 24px' }}>Email</th>
                    <th style={{ padding: '16px 24px' }}>Role</th>
                    <th style={{ padding: '16px 24px' }}>Account Status</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>{u.name}</td>
                      <td style={{ padding: '16px 24px' }}>{u.email}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <select 
                          value={u.role} 
                          onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                          style={{ background: '#0f172a', border: '1px solid #475569', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}
                        >
                          <option value="student">Student</option>
                          <option value="counsellor">Counsellor</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          background: u.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: u.status === 'active' ? '#10b981' : '#ef4444',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleToggleStatus(u._id, u.status)} 
                          style={{ 
                            padding: '6px 12px', 
                            background: u.status === 'active' ? '#d97706' : '#10b981', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDeleteUser(u._id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Content Management (Resources) */}
        {activeTab === 'resources' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {/* Create / Edit Form */}
            <div style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155', height: 'fit-content' }}>
              <h3 style={{ color: 'white', margin: '0 0 8px' }}>📝 Add Curated Article</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Publish a new educational article or mindfulness tip.</p>

              {resMessage && (
                <div style={{ background: '#334155', padding: '12px', border: '1px solid #475569', borderRadius: '8px', color: '#818cf8', fontSize: '13px', marginBottom: '16px' }}>
                  {resMessage}
                </div>
              )}

              <form onSubmit={handleCreateResource} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Article Title</label>
                  <input type="text" value={resTitle} onChange={e => setResTitle(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }} required />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Category</label>
                    <select value={resCategory} onChange={e => setResCategory(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }}>
                      <option value="Stress">Stress</option>
                      <option value="Anxiety">Anxiety</option>
                      <option value="Sleep">Sleep</option>
                      <option value="Mindfulness">Mindfulness</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Read Time (m)</label>
                    <input type="number" value={resReadTime} onChange={e => setResReadTime(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }} required />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Content Body</label>
                  <textarea value={resContent} onChange={e => setResContent(e.target.value)} style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none', height: '140px', resize: 'none', boxSizing: 'border-box' }} required />
                </div>

                <button type="submit" style={{ width: '100%', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>Publish Article</button>
              </form>
            </div>

            {/* List of articles */}
            <div style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
              <h3 style={{ color: 'white', margin: '0 0 16px' }}>📚 Published Resources</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                {resources.map(res => (
                  <div key={res._id} style={{ padding: '16px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ margin: 0, color: 'white', fontSize: '14px' }}>{res.title}</h4>
                        <span style={{ fontSize: '11px', color: '#6366f1', textTransform: 'uppercase', fontWeight: 'bold' }}>{res.category}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setEditResource(res)} style={{ padding: '4px 8px', background: '#3b82f6', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Edit</button>
                        <button onClick={() => handleDeleteResource(res._id)} style={{ padding: '4px 8px', background: '#ef4444', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit modal */}
            {editResource && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
                <div style={{ background: '#1e293b', borderRadius: '24px', maxWidth: '600px', width: '100%', padding: '32px', border: '1px solid #475569', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                  <h3 style={{ color: 'white', marginTop: 0, marginBottom: '20px' }}>✏️ Edit Resource Article</h3>
                  
                  <form onSubmit={handleUpdateResource} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Article Title</label>
                      <input type="text" value={editResource.title} onChange={e => setEditResource({...editResource, title: e.target.value})} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Category</label>
                        <select value={editResource.category} onChange={e => setEditResource({...editResource, category: e.target.value})} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }}>
                          <option value="Stress">Stress</option>
                          <option value="Anxiety">Anxiety</option>
                          <option value="Sleep">Sleep</option>
                          <option value="Mindfulness">Mindfulness</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Read Time (m)</label>
                        <input type="number" value={editResource.readTime} onChange={e => setEditResource({...editResource, readTime: Number(e.target.value)})} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }} required />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Content Body</label>
                      <textarea value={editResource.content} onChange={e => setEditResource({...editResource, content: e.target.value})} style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none', height: '180px', resize: 'none', boxSizing: 'border-box' }} required />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="button" onClick={() => setEditResource(null)} style={{ padding: '10px 20px', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                      <button type="submit" style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Recommendation Management */}
        {activeTab === 'recommendation' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', background: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
            <h2 style={{ color: 'white', marginBottom: '8px' }}>🎯 Curate Recommendations & Activity Tips</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>Assign custom relaxation games and advice notes to specific students.</p>

            <form onSubmit={handleAssignRecommendation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Choose Target Student:</label>
                <select 
                  value={recUser} 
                  onChange={e => setRecUser(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none' }}
                  required
                >
                  <option value="">-- Select Student --</option>
                  {users.filter(u => u.role === 'student').map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Recommend Relaxation Game:</label>
                <select 
                  value={recGame} 
                  onChange={e => setRecGame(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none' }}
                >
                  <option value="bubbles">Bubble Wrap Popper 🫧</option>
                  <option value="memory">Zen Memory Match 🧩</option>
                  <option value="gratitude">Gratitude Garden 🌸</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Personalized Activity Advice:</label>
                <textarea 
                  value={recActivity} 
                  onChange={e => setRecActivity(e.target.value)}
                  placeholder="e.g. Try taking a 10-minute walk or do a quick box-breathing exercise."
                  style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none', height: '100px', resize: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <button type="submit" style={{ padding: '14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                🤝 Assign Recommendation
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: Live Support Chats */}
        {activeTab === 'chats' && (
          <div>
            <h2 style={{ color: 'white', marginBottom: '8px' }}>💬 Live Support Message Board</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>Respond to direct 1-to-1 help inquiries from students in real time.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', height: '480px' }}>
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', overflowY: 'auto', padding: '12px' }}>
                <h4 style={{ margin: '0 0 12px', padding: '8px', color: '#cbd5e1', borderBottom: '1px solid #334155' }}>Active Chats</h4>
                {chatUsers.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', padding: '20px' }}>No active chats.</p>
                ) : (
                  chatUsers.map(cu => (
                    <div 
                      key={cu._id} 
                      onClick={() => openSupportChat(cu._id, cu.name)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: activeStudentId === cu._id ? '#334155' : 'transparent',
                        cursor: 'pointer',
                        marginBottom: '4px',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: activeStudentId === cu._id ? 'white' : '#e2e8f0' }}>{cu.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '4px' }}>
                        {cu.lastMessage}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {activeStudentId ? (
                  <>
                    <div style={{ background: '#334155', padding: '16px 24px', borderBottom: '1px solid #475569', color: 'white', fontWeight: 'bold' }}>
                      💬 Chatting with {activeStudentName}
                    </div>
                    
                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {supportMessages.map((msg, index) => {
                        const isOwn = msg.sender?._id === currentUser?.id || msg.sender === currentUser?.id
                        return (
                          <div 
                            key={msg._id || index}
                            style={{
                              alignSelf: isOwn ? 'flex-end' : 'flex-start',
                              maxWidth: '70%',
                              background: isOwn ? '#6366f1' : '#0f172a',
                              color: 'white',
                              padding: '10px 14px',
                              borderRadius: isOwn ? '12px 12px 0 12px' : '12px 12px 12px 0',
                              fontSize: '13px'
                            }}
                          >
                            {msg.text}
                          </div>
                        )
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendSupport} style={{ padding: '16px', display: 'flex', gap: '10px', borderTop: '1px solid #475569', background: '#0f172a' }}>
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder={`Reply to ${activeStudentName}...`}
                        style={{ flex: 1, padding: '12px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none' }}
                      />
                      <button type="submit" style={{ padding: '0 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Send</button>
                    </form>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '14px' }}>
                    Select a student from the sidebar to open the chat window.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Complaints & Feedback */}
        {activeTab === 'feedback' && (
          <div>
            <h2 style={{ color: 'white', marginBottom: '8px' }}>📋 Student Complaints & Feedback</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>Review and resolve feedback submitted by student users.</p>

            <div style={{ background: '#1e293b', borderRadius: '20px', overflowX: 'auto', border: '1px solid #334155' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: '#334155', color: '#cbd5e1' }}>
                    <th style={{ padding: '16px 24px' }}>Student</th>
                    <th style={{ padding: '16px 24px' }}>Subject</th>
                    <th style={{ padding: '16px 24px' }}>Message</th>
                    <th style={{ padding: '16px 24px' }}>Status</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No feedback submissions found.</td>
                    </tr>
                  ) : (
                    feedbacks.map(f => (
                      <tr key={f._id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>{f.student?.name || 'Anonymous Student'}</td>
                        <td style={{ padding: '16px 24px' }}>{f.subject}</td>
                        <td style={{ padding: '16px 24px', color: '#cbd5e1', fontStyle: 'italic' }}>"{f.message}"</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            background: (f.status === 'resolved' || f.status === 'done') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: (f.status === 'resolved' || f.status === 'done') ? '#10b981' : '#f59e0b',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                          }}>
                            {/* *** METHANADI STATUS EKA 'DONE' KIYALA DISPLAY KARANNE (DISPLAY STATUS AS 'DONE' HERE) *** */}
                            {f.status === 'resolved' || f.status === 'done' ? 'done' : f.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          {f.status === 'pending' && (
                            /* *** METHANA THAMAI UI EKE PENDING FEEDBACK RESOLVE KARANA BUTTON EKA THIYENNE *** */
                            /* (This is the button in the UI that triggers handleResolveFeedback to resolve/done the pending feedback) */
                            <button 
                              onClick={() => handleResolveFeedback(f._id)}
                              style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                            >
                              Resolved
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: Announcement Management */}
        {activeTab === 'announcements' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            
            {/* Form */}
            <div style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155', height: 'fit-content' }}>
              <h3 style={{ color: 'white', margin: '0 0 8px' }}>📢 Post System Announcement</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Broadcast notifications or messages to target user roles.</p>

              {announceMessage && (
                <div style={{ background: '#334155', padding: '12px', border: '1px solid #475569', borderRadius: '8px', color: '#818cf8', fontSize: '13px', marginBottom: '16px' }}>
                  {announceMessage}
                </div>
              )}

              <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Title</label>
                  <input type="text" value={announceTitle} onChange={e => setAnnounceTitle(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }} required />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Target Audience</label>
                  <select value={announceTarget} onChange={e => setAnnounceTarget(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none', boxSizing: 'border-box' }}>
                    <option value="all">Everyone (All)</option>
                    <option value="student">Students Only</option>
                    <option value="counsellor">Counsellors Only</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Announcement Text</label>
                  <textarea value={announceContent} onChange={e => setAnnounceContent(e.target.value)} style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', outline: 'none', height: '100px', resize: 'none', boxSizing: 'border-box' }} required />
                </div>

                <button type="submit" style={{ width: '100%', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>📢 Broadcast Notice</button>
              </form>
            </div>

            {/* List */}
            <div style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
              <h3 style={{ color: 'white', margin: '0 0 16px' }}>📋 Active Announcements</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto' }}>
                {announcements.map(ann => (
                  <div key={ann._id} style={{ padding: '16px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <h4 style={{ margin: 0, color: 'white', fontSize: '14px' }}>{ann.title}</h4>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', background: '#334155', color: '#818cf8', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>{ann.targetRole}</span>
                        {currentUser?.role === 'admin' && (
                          <button 
                            onClick={() => handleDeleteAnnouncement(ann._id)}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Delete Announcement"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.4' }}>{ann.content}</p>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '8px' }}>{new Date(ann.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 8: User Activity Monitoring */}
        {activeTab === 'monitoring' && (
          <div>
            <h2 style={{ color: 'white', marginBottom: '8px' }}>📈 User Activity Logs & Metrics</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>Monitor student platform logins, tracking records, and interactive frequencies.</p>

            <div style={{ background: '#1e293b', borderRadius: '20px', overflowX: 'auto', border: '1px solid #334155' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: '#334155', color: '#cbd5e1' }}>
                    <th style={{ padding: '16px 24px' }}>Student Name</th>
                    <th style={{ padding: '16px 24px' }}>Email Address</th>
                    <th style={{ padding: '16px 24px' }}>Total System Logins</th>
                    <th style={{ padding: '16px 24px' }}>Assigned Custom Game</th>
                    <th style={{ padding: '16px 24px' }}>Last Profile Update</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role === 'student').map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>{u.name}</td>
                      <td style={{ padding: '16px 24px' }}>{u.email}</td>
                      <td style={{ padding: '16px 24px', color: '#6366f1', fontWeight: 'bold' }}>{u.loginCount || 0} times</td>
                      <td style={{ padding: '16px 24px', color: '#10b981' }}>{u.customRecommendation?.game || 'Default Game'}</td>
                      <td style={{ padding: '16px 24px', color: '#94a3b8' }}>{new Date(u.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: Peer Chat Moderator */}
        {activeTab === 'moderator' && (
          <div>
            <h2 style={{ color: 'white', marginBottom: '8px' }}>🛡️ Anonymous Peer Chat Moderator</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>Oversee and moderate content posted in the public student anonymous peer support room.</p>

            <div style={{ background: '#1e293b', borderRadius: '20px', border: '1px solid #334155', overflow: 'hidden', maxHeight: '500px', overflowY: 'auto' }}>
              <div style={{ padding: '18px 24px', background: '#334155', fontWeight: 'bold', borderBottom: '1px solid #334155' }}>🛡️ Peer Chat Room Log</div>
              {peerMessages.length === 0 ? (
                <p style={{ color: '#94a3b8', padding: '32px', textAlign: 'center' }}>No messages logged in the peer chatroom.</p>
              ) : (
                peerMessages.map(msg => (
                  <div key={msg._id} style={{ padding: '16px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, paddingRight: '20px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', color: '#a78bfa', fontSize: '13px' }}>{msg.senderName}</span>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1' }}>{msg.text}</p>
                    </div>
                    <button 
                      onClick={() => handleDeletePeerMessage(msg._id)}
                      style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                    >
                      Delete Message
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 10: Emergency Support Alerts */}
        {activeTab === 'emergency' && (
          <div>
            <h2 style={{ color: '#ef4444', marginBottom: '8px' }}>🚨 Emergency Support Alerts</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>surfaces crisis alerts from student mood tracking values and notes.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {emergencyAlerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: '#1e293b', borderRadius: '16px', border: '1px dashed #334155' }}>
                  <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>🌟</span>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '14.5px' }}>No active emergency alerts. All student mood logs are within safe thresholds.</p>
                </div>
              ) : (
                emergencyAlerts.map(alert => (
                  <div key={alert.id} style={{ background: '#1e293b', borderLeft: '6px solid #ef4444', borderRadius: '12px', padding: '24px', borderTop: '1px solid #334155', borderRight: '1px solid #334155', borderBottom: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '18px' }}>{alert.name}</h3>
                        <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 'bold' }}>{alert.email}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Logged Date: {alert.date}</span>
                    </div>

                    <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #1e293b' }}>
                      <div style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Logged Mood Rating: {alert.mood}</div>
                      <p style={{ color: '#f3f4f6', fontSize: '14px', lineHeight: '1.6', fontStyle: 'italic', margin: 0 }}>
                        "{alert.note}"
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => {
                          if (alert.userId) {
                            setActiveTab('chats')
                            openSupportChat(alert.userId, alert.name)
                          } else {
                            alert('Cannot initiate chat: student ID is not available.')
                          }
                        }} 
                        style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                      >
                        💬 Message Student Immediately
                      </button>
                      <button 
                        onClick={() => alert(`Escalated case to student counseling department for ${alert.name}.`)} 
                        style={{ padding: '10px 20px', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                      >
                        📞 Escalate Case
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 11: Appointment Bookings */}
        {activeTab === 'bookings' && (
          <div>
            <h2 style={{ color: 'white', marginBottom: '8px' }}>📅 Counselling Appointment approvals</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>Review and approve pending student counseling session requests.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', marginBottom: '40px' }}>
              
              <div style={{ background: '#1e293b', borderRadius: '20px', overflowX: 'auto', border: '1px solid #334155' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ background: '#334155', color: '#cbd5e1' }}>
                      <th style={{ padding: '16px 24px' }}>Student</th>
                      <th style={{ padding: '16px 24px' }}>Counsellor</th>
                      <th style={{ padding: '16px 24px' }}>Date</th>
                      <th style={{ padding: '16px 24px' }}>Slot</th>
                      <th style={{ padding: '16px 24px' }}>Student Payment</th>
                      <th style={{ padding: '16px 24px' }}>Status</th>
                      <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No session requests logged.</td>
                      </tr>
                    ) : (
                      bookings.map(book => (
                        <tr key={book._id} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ fontWeight: 'bold', color: 'white' }}>{book.student?.name || 'Anonymous User'}</div>
                            {book.student?._id && (
                              <button 
                                onClick={() => fetchStudentReport(book.student._id)}
                                style={{
                                  background: 'rgba(99, 102, 241, 0.15)',
                                  color: '#818cf8',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  marginTop: '6px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontWeight: 'bold',
                                  transition: 'all 0.2s'
                                }}
                              >
                                📋 View Mental Health Report
                              </button>
                            )}
                          </td>
                          <td style={{ padding: '16px 24px' }}>{book.counsellorName}</td>
                          <td style={{ padding: '16px 24px' }}>{book.date}</td>
                          <td style={{ padding: '16px 24px', color: '#94a3b8' }}>{book.timeSlot}</td>
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{
                              background: book.paymentStatus === 'paid' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: book.paymentStatus === 'paid' ? '#818cf8' : '#ef4444',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              textTransform: 'uppercase'
                            }}>
                              {book.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{
                              background: book.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : (book.status === 'cancelled' || book.status === 'rejected') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: book.status === 'approved' ? '#10b981' : (book.status === 'cancelled' || book.status === 'rejected') ? '#ef4444' : '#f59e0b',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              textTransform: 'uppercase'
                            }}>
                              {book.status}
                            </span>
                            {book.status === 'rejected' && book.rejectionReason && (
                              <div style={{ fontSize: '11px', color: '#ef4444', fontStyle: 'italic', marginTop: '4px' }}>
                                Reason: "{book.rejectionReason}"
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'right', display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            {book.status === 'pending' && (
                              <>
                                <button onClick={() => handleBookingAction(book._id, 'approved')} style={{ padding: '4px 8px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Approve</button>
                                <button onClick={() => setRejectBookingId(book._id)} style={{ padding: '4px 8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Reject</button>
                              </>
                            )}
                            {book.status === 'approved' && (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button 
                                  onClick={() => openBookingChat(book)} 
                                  style={{ padding: '4px 8px', background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                                >
                                  💬 Chat
                                </button>
                                <button 
                                  onClick={() => {
                                    setActiveVideoBooking(book)
                                    setShowVideoModal(true)
                                  }} 
                                  style={{ padding: '4px 8px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                                >
                                  🎥 Call
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bar graph of booking statuses */}
              <div style={{ background: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155' }}>
                <h4 style={{ color: 'white', margin: '0 0 16px' }}>Status Breakdown</h4>
                <div style={{ width: '100%', height: '220px' }}>
                  <ResponsiveContainer>
                    <BarChart data={getBookingBarData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip />
                      <Bar dataKey="Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 12: Report Generation */}
        {activeTab === 'reporting' && (
          <div>
            <h2 className="no-print" style={{ color: 'white', marginBottom: '8px' }}>📄 MindSpace Official Report Generator</h2>
            <p className="no-print" style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>Configure your custom metrics sheet, preview, and print/export the official administrative reports.</p>

            {/* Config Panel */}
            <div className="no-print" style={{ background: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ color: 'white', fontSize: '16px', margin: 0 }}>Configure Report Sections</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setSelectedReportSections({ mood: true, booking: true, usage: true })}
                    style={{ background: '#334155', color: '#cbd5e1', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Select All
                  </button>
                  <button 
                    onClick={() => setSelectedReportSections({ mood: false, booking: false, usage: false })}
                    style={{ background: '#334155', color: '#cbd5e1', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Grid of Report Option Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[
                  { key: 'mood', icon: '🧠', title: 'Student Mood Trends', desc: 'Mood ratings, emojis, logs history' },
                  { key: 'booking', icon: '📅', title: 'Session Booking Ledger', desc: 'Appointment status, counsellors, schedules' },
                  { key: 'usage', icon: '💻', title: 'Engagement Metrics', desc: 'Student login metrics, account status' }
                ].map(item => (
                  <div 
                    key={item.key}
                    onClick={() => setSelectedReportSections(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    style={{
                      background: selectedReportSections[item.key] ? '#1e1b4b' : '#0f172a',
                      border: `2px solid ${selectedReportSections[item.key] ? '#6366f1' : '#334155'}`,
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedReportSections[item.key]}
                      onChange={() => {}} // toggled by parent div onClick
                      style={{ marginTop: '4px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '16px' }}>{item.icon}</span>
                        <h4 style={{ color: 'white', margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{item.title}</h4>
                      </div>
                      <p style={{ color: '#94a3b8', margin: 0, fontSize: '11px', lineHeight: '1.4' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={handlePrintReport} 
                  disabled={!selectedReportSections.mood && !selectedReportSections.booking && !selectedReportSections.usage}
                  style={{
                    padding: '12px 24px',
                    background: (!selectedReportSections.mood && !selectedReportSections.booking && !selectedReportSections.usage) ? '#475569' : '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (!selectedReportSections.mood && !selectedReportSections.booking && !selectedReportSections.usage) ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  🖨️ Export PDF / Print Selected Reports
                </button>
              </div>
            </div>

            {/* Print Sheet Container */}
            {(!selectedReportSections.mood && !selectedReportSections.booking && !selectedReportSections.usage) ? (
              <div className="no-print" style={{ background: '#1e293b', padding: '40px 20px', borderRadius: '16px', border: '1px dashed #334155', textAlign: 'center' }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>📊</span>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '14.5px' }}>Please select at least one report section from the configuration cards above to generate a preview.</p>
              </div>
            ) : (
              <div style={{ background: 'white', color: '#1f2937', padding: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'serif', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                
                {/* Report Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px double #1f2937', paddingBottom: '20px', marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '28px', color: '#1f2937', margin: '0 0 4px', fontFamily: 'Georgia, serif' }}>SLIATE MindSpace Counselling Support</h1>
                  <p style={{ margin: 0, fontSize: '12px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px' }}>Advanced Technological Institute, Dehiwala</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: 'bold' }}>OFFICIAL ADMINISTRATIVE METRICS REPORT</p>
                </div>

                {/* Report Meta Info */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '13px', marginBottom: '32px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                  <div>
                    <strong>Report Scope:</strong>{' '}
                    {[
                      selectedReportSections.mood && 'Mood Trends',
                      selectedReportSections.booking && 'Session Bookings',
                      selectedReportSections.usage && 'Platform Engagement'
                    ].filter(Boolean).join(' • ')}
                  </div>
                  <div><strong>Compiled By:</strong> {currentUser?.name || 'Administrator'}</div>
                  <div><strong>Date Generated:</strong> {new Date().toLocaleDateString()}</div>
                  <div><strong>Document Code:</strong> MS-REP-COMM-{Math.floor(1000 + Math.random() * 9000)}</div>
                </div>

                {/* REPORT SECTIONS */}
                {selectedReportSections.mood && (
                  <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', color: '#1e3a8a', fontFamily: 'Georgia, serif' }}>
                      Section 1: Student Mental Health Index & Mood Trends
                    </h3>
                    <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#374151', margin: '8px 0 16px' }}>
                      Maps the psychological logs gathered through student mood selections. Lower mood entries are monitored to trigger emergency counseling assistance.
                    </p>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <thead>
                        <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                          <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Student Profile</th>
                          <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Recent Score</th>
                          <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Date</th>
                          <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Journal Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {moodLogs.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>No student mood logs recorded.</td>
                          </tr>
                        ) : (
                          moodLogs.map(m => (
                            <tr key={m.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{m.name}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{m.label} ({m.value}/5)</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{m.date}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', fontStyle: 'italic' }}>"{m.note || 'No notes added'}"</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedReportSections.booking && (
                  <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', color: '#1e3a8a', fontFamily: 'Georgia, serif' }}>
                      Section 2: Counselling Session Bookings Ledger
                    </h3>
                    <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#374151', margin: '8px 0 16px' }}>
                      The ledger outlines counselor appointment bookings recorded. Status indicates approvals by administrative counsellors.
                    </p>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <thead>
                        <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                          <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Student Profile</th>
                          <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Counsellor</th>
                          <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Schedule</th>
                          <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Payment Status</th>
                          <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>No booking transactions recorded.</td>
                          </tr>
                        ) : (
                          bookings.map(b => (
                            <tr key={b._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{b.student?.name || 'Anonymous User'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{b.counsellorName}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{b.date} • {b.timeSlot}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textTransform: 'uppercase', fontWeight: 'bold' }}>{b.paymentStatus || 'unpaid'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textTransform: 'uppercase', fontWeight: 'bold' }}>{b.status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedReportSections.usage && (
                  <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', color: '#1e3a8a', fontFamily: 'Georgia, serif' }}>
                      Section 3: Student Platform Engagement Logs
                    </h3>
                    <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#374151', margin: '8px 0 16px' }}>
                      Platform activity metrics mapping total logins, active statuses, and account settings.
                    </p>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <thead>
                        <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                          <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Student Name</th>
                          <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Email Address</th>
                          <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Logins Count</th>
                          <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Account Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u => u.role === 'student').length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>No student records found.</td>
                          </tr>
                        ) : (
                          users.filter(u => u.role === 'student').map(u => (
                            <tr key={u._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{u.name}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{u.email}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{u.loginCount || 0} times</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textTransform: 'uppercase', fontWeight: 'bold' }}>{u.status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Report Footer */}
                <div style={{ marginTop: '64px', borderTop: '1px solid #cbd5e1', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderBottom: '1px solid #1f2937', width: '180px', marginBottom: '4px' }}></div>
                    <span>Project Supervisor Signature</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderBottom: '1px solid #1f2937', width: '180px', marginBottom: '4px' }}></div>
                    <span>Admin Authority Sign</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 13: Counselor Applications Approvals */}
        {activeTab === 'counselorapps' && (
          <div>
            <h2 style={{ color: 'white', marginBottom: '8px' }}>🤝 Counselor Application Approvals</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>Review profiles and verify submitted licenses/NIC details to promote users to counsellors.</p>

            <div style={{ background: '#1e293b', borderRadius: '20px', overflowX: 'auto', border: '1px solid #334155' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: '#334155', color: '#cbd5e1' }}>
                    <th style={{ padding: '16px 24px' }}>Applicant Name</th>
                    <th style={{ padding: '16px 24px' }}>Email Address</th>
                    <th style={{ padding: '16px 24px' }}>Specialization</th>
                    <th style={{ padding: '16px 24px' }}>Submission Date</th>
                    <th style={{ padding: '16px 24px' }}>Status</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {counselorApps.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No counselor applications submitted.</td>
                    </tr>
                  ) : (
                    counselorApps.map(app => (
                      <tr key={app._id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>{app.fullName}</td>
                        <td style={{ padding: '16px 24px' }}>{app.email}</td>
                        <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>{app.specialization?.join(', ')}</td>
                        <td style={{ padding: '16px 24px', color: '#94a3b8' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            background: app.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : app.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: app.status === 'approved' ? '#10b981' : app.status === 'rejected' ? '#ef4444' : '#f59e0b',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                          }}>
                            {app.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <button 
                            onClick={() => setActiveAppReview(app)}
                            style={{ padding: '6px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                          >
                            🔎 Review Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Profile Review Modal */}
            {activeAppReview && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
                <div style={{ background: '#1e293b', borderRadius: '24px', maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px', border: '1px solid #475569', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', position: 'relative' }}>
                  
                  <button 
                    onClick={() => setActiveAppReview(null)} 
                    style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: '#334155', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', color: 'white' }}
                  >
                    ✕
                  </button>

                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '20px' }}>
                    <img src={activeAppReview.profilePhoto || 'https://via.placeholder.com/150'} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366f1' }} />
                    <div>
                      <h3 style={{ color: 'white', margin: '0 0 6px', fontSize: '20px' }}>{activeAppReview.fullName}</h3>
                      <span style={{ fontSize: '13px', color: '#818cf8', fontWeight: 'bold' }}>Applying for Counselor Role</span>
                    </div>
                  </div>

                  {/* 10 Details Breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '13.5px', color: '#cbd5e1', marginBottom: '24px' }}>
                    <div>
                      <strong style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>1. Full Name</strong>
                      {activeAppReview.fullName}
                    </div>
                    <div>
                      <strong style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>2. NIC / Passport Number</strong>
                      {activeAppReview.nic}
                    </div>
                    <div>
                      <strong style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>3. Profile Status</strong>
                      <span style={{ textTransform: 'uppercase', fontWeight: 'bold', color: activeAppReview.status === 'approved' ? '#10b981' : activeAppReview.status === 'rejected' ? '#ef4444' : '#f59e0b' }}>
                        {activeAppReview.status}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>4. Email Address</strong>
                      {activeAppReview.email}
                    </div>
                    <div>
                      <strong style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>5. Phone Number</strong>
                      {activeAppReview.phone}
                    </div>
                    <div>
                      <strong style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>6. Educational Qualifications</strong>
                      {activeAppReview.qualifications?.join(', ')}
                    </div>
                    <div>
                      <strong style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>7. Registration / License Number</strong>
                      {activeAppReview.licenseNumber || 'Not available'}
                    </div>
                    <div>
                      <strong style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>8. Professional Membership</strong>
                      {activeAppReview.membership || 'None'}
                    </div>
                    <div>
                      <strong style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>9. Work Experience</strong>
                      {activeAppReview.experienceYears} Years ({activeAppReview.experienceInstitutions})
                    </div>
                    <div>
                      <strong style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>10. Specializations</strong>
                      {activeAppReview.specialization?.join(', ')}
                    </div>
                  </div>

                  {/* Counselor ID Card Verification Docs */}
                  <div style={{ borderTop: '1px solid #334155', paddingTop: '20px', marginBottom: '20px' }}>
                    <strong style={{ color: 'white', display: 'block', fontSize: '14px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      📁 Counselor ID Card Verification (Both Sides)
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
                        <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Front Side</span>
                        {activeAppReview.counsellorIdFront ? (
                          <img src={activeAppReview.counsellorIdFront} alt="ID Front" style={{ width: '100%', borderRadius: '6px', maxHeight: '180px', objectFit: 'contain' }} />
                        ) : (
                          <div style={{ color: '#64748b', fontSize: '12px', padding: '20px', textAlign: 'center' }}>No Front ID uploaded</div>
                        )}
                      </div>
                      <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
                        <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Back Side</span>
                        {activeAppReview.counsellorIdBack ? (
                          <img src={activeAppReview.counsellorIdBack} alt="ID Back" style={{ width: '100%', borderRadius: '6px', maxHeight: '180px', objectFit: 'contain' }} />
                        ) : (
                          <div style={{ color: '#64748b', fontSize: '12px', padding: '20px', textAlign: 'center' }}>No Back ID uploaded</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions inside modal */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '20px' }}>
                    {activeAppReview.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApplicationStatus(activeAppReview._id, 'approved')}
                          style={{ padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          ✅ Approve Application
                        </button>
                        <button 
                          onClick={() => handleApplicationStatus(activeAppReview._id, 'rejected')}
                          style={{ padding: '12px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          ❌ Reject Application
                        </button>
                      </>
                    )}
                    <button onClick={() => setActiveAppReview(null)} style={{ padding: '12px 24px', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 14: Counselor Payments & Earnings */}
        {activeTab === 'payments' && (
          <div>
            {currentUser?.role === 'admin' ? (
              // ADMIN VIEW: Counselor Payments
              <div>
                <h2 style={{ color: 'white', marginBottom: '8px' }}>💸 Counselor Session Payments</h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>Track session payments owed to counselors and manage payouts.</p>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Total Owed Payouts</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#fbbf24' }}>
                      LKR {payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      {payments.filter(p => p.status === 'pending').length} pending payouts
                    </div>
                  </div>
                  
                  <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Total Paid Out</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#10b981' }}>
                      LKR {payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      {payments.filter(p => p.status === 'paid').length} completed payouts
                    </div>
                  </div>

                  <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Default Session Rate</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#6366f1' }}>
                      LKR 1,500
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Fixed counselor rate per booking
                    </div>
                  </div>
                </div>

                {/* Monthly Auto Settlement Trigger */}
                <div className="no-print" style={{ background: '#1e1b4b', padding: '24px', borderRadius: '20px', border: '1px solid #4338ca', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h4 style={{ color: '#a5b4fc', margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>⚙️</span> Monthly Automated Settlement System
                    </h4>
                    <p style={{ color: '#cbd5e1', margin: 0, fontSize: '12.5px', lineHeight: '1.4' }}>
                      MindSpace pays out all pending counselor fees on the 1st of every month. Pressing settle now simulates direct bank deposit wires for all active counselors.
                    </p>
                  </div>
                  <button 
                    onClick={handleAutoSettlement}
                    disabled={payments.filter(p => p.status === 'pending').length === 0}
                    style={{
                      padding: '12px 24px',
                      background: payments.filter(p => p.status === 'pending').length === 0 ? '#475569' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: payments.filter(p => p.status === 'pending').length === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      transition: 'background 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    ⚡ Run Monthly Settlement Now
                  </button>
                </div>

                {/* Table */}
                <div style={{ background: '#1e293b', borderRadius: '20px', overflowX: 'auto', border: '1px solid #334155' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ background: '#334155', color: '#cbd5e1' }}>
                        <th style={{ padding: '16px 24px' }}>Counselor Name</th>
                        <th style={{ padding: '16px 24px' }}>Student</th>
                        <th style={{ padding: '16px 24px' }}>Date & Slot</th>
                        <th style={{ padding: '16px 24px' }}>Amount</th>
                        <th style={{ padding: '16px 24px' }}>Status</th>
                        <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No payment records found. Payments are created when a booking is approved.</td>
                        </tr>
                      ) : (
                        payments.map(pay => (
                          <tr key={pay._id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ fontWeight: 'bold', color: 'white' }}>{pay.counsellor?.name || 'Deleted User'}</div>
                              {pay.counsellor?.bankDetails?.bankName ? (
                                <div style={{ fontSize: '11px', color: '#818cf8', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span>🏦 {pay.counsellor.bankDetails.bankName} ({pay.counsellor.bankDetails.branchName})</span>
                                  <span>No: {pay.counsellor.bankDetails.accountNumber} • {pay.counsellor.bankDetails.accountHolderName}</span>
                                </div>
                              ) : (
                                <div style={{ fontSize: '11px', color: '#f59e0b', fontStyle: 'italic', marginTop: '4px' }}>
                                  ⚠️ No Bank Settlement Details Saved
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '16px 24px' }}>{pay.student?.name || 'N/A'}</td>
                            <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>
                              {pay.booking ? `${pay.booking.date} | ${pay.booking.timeSlot}` : 'N/A'}
                            </td>
                            <td style={{ padding: '16px 24px', color: '#6366f1', fontWeight: 'bold' }}>LKR {pay.amount.toLocaleString()}</td>
                            <td style={{ padding: '16px 24px' }}>
                              <span style={{
                                background: pay.status === 'paid' ? 'rgba(16, 185, 129, 0.15)' : pay.status === 'cancelled' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: pay.status === 'paid' ? '#10b981' : pay.status === 'cancelled' ? '#ef4444' : '#f59e0b',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                              }}>
                                {pay.status}
                              </span>
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                              {pay.status === 'pending' ? (
                                <button 
                                  onClick={() => handleMarkAsPaid(pay._id)}
                                  style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                >
                                  💸 Mark as Paid
                                </button>
                              ) : pay.status === 'paid' ? (
                                <span style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic' }}>
                                  Paid on {new Date(pay.paidAt).toLocaleDateString()}
                                </span>
                              ) : (
                                <span style={{ color: '#ef4444', fontSize: '11.5px', fontWeight: 'bold' }}>Cancelled</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // COUNSELOR VIEW: Counselor Earnings
              <div>
                <h2 style={{ color: 'white', marginBottom: '8px' }}>💰 My Earnings & Payout Summary</h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>Track your session payout logs and earned amounts paid by MindSpace administration.</p>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Pending Earnings</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#fbbf24' }}>
                      LKR {payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Waiting for Admin payout
                    </div>
                  </div>
                  
                  <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Completed Payouts</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#10b981' }}>
                      LKR {payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Successfully paid to account
                    </div>
                  </div>

                  <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Total Approved Sessions</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#6366f1' }}>
                      {payments.filter(p => p.status !== 'cancelled').length} Sessions
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      LKR 1,500 base rate per session
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div style={{ background: '#1e293b', borderRadius: '20px', overflowX: 'auto', border: '1px solid #334155' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ background: '#334155', color: '#cbd5e1' }}>
                        <th style={{ padding: '16px 24px' }}>Student Participant</th>
                        <th style={{ padding: '16px 24px' }}>Date & Time Slot</th>
                        <th style={{ padding: '16px 24px' }}>Session Status</th>
                        <th style={{ padding: '16px 24px' }}>Amount Owed</th>
                        <th style={{ padding: '16px 24px', textAlign: 'right' }}>Payout Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No counseling bookings with payouts logged yet. Payouts generate when you approve student requests.</td>
                        </tr>
                      ) : (
                        payments.map(pay => (
                          <tr key={pay._id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>{pay.student?.name || 'N/A'}</td>
                            <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>
                              {pay.booking ? `${pay.booking.date} | ${pay.booking.timeSlot}` : 'N/A'}
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <span style={{
                                background: pay.booking?.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : pay.booking?.status === 'cancelled' || pay.booking?.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: pay.booking?.status === 'approved' ? '#10b981' : pay.booking?.status === 'cancelled' || pay.booking?.status === 'rejected' ? '#ef4444' : '#f59e0b',
                                padding: '3px 8px',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 'bold'
                              }}>
                                {pay.booking?.status || 'approved'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 24px', color: '#6366f1', fontWeight: 'bold' }}>LKR {pay.amount.toLocaleString()}</td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                              <span style={{
                                background: pay.status === 'paid' ? 'rgba(16, 185, 129, 0.15)' : pay.status === 'cancelled' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: pay.status === 'paid' ? '#10b981' : pay.status === 'cancelled' ? '#ef4444' : '#f59e0b',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                              }}>
                                {pay.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bank Account Details Form */}
                <div style={{ background: '#1e293b', padding: '32px', borderRadius: '20px', border: '1px solid #334155', marginTop: '32px' }}>
                  <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏦</span> My Bank Account Settlement Details
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '13.5px', marginBottom: '24px' }}>MindSpace administration uses these details to wire your monthly approved earnings automatically.</p>

                  {bankUpdateMsg && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '12px 16px', borderRadius: '8px', fontSize: '13.5px', marginBottom: '24px', fontWeight: 'bold' }}>
                      {bankUpdateMsg}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Bank Name:</label>
                      <input 
                        type="text" 
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        placeholder="e.g. Bank of Ceylon"
                        style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '13.5px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Branch Name:</label>
                      <input 
                        type="text" 
                        value={bankBranch}
                        onChange={e => setBankBranch(e.target.value)}
                        placeholder="e.g. Dehiwala"
                        style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '13.5px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Account Holder Name:</label>
                      <input 
                        type="text" 
                        value={bankHolder}
                        onChange={e => setBankHolder(e.target.value)}
                        placeholder="e.g. Dr. Rohan Perera"
                        style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '13.5px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Account Number:</label>
                      <input 
                        type="text" 
                        value={bankAccNum}
                        onChange={e => setBankAccNum(e.target.value)}
                        placeholder="e.g. 1002345091"
                        style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '13.5px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={handleUpdateBankDetails}
                      style={{ padding: '12px 24px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13.5px', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#4facfe'}
                      onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
                    >
                      💾 Update Settlement Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Embedded print css */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Rejection Reason Modal */}
      {rejectBookingId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#1e293b', borderRadius: '24px', width: '400px', padding: '32px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <h3 style={{ color: 'white', marginTop: 0, marginBottom: '8px' }}>❌ Reject Appointment Booking</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Please specify a reason for rejecting this student request.</p>
            
            <textarea 
              value={rejectReasonInput}
              onChange={e => setRejectReasonInput(e.target.value)}
              placeholder="Enter reason for rejection..."
              style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #475569', borderRadius: '12px', color: 'white', outline: 'none', height: '100px', resize: 'none', boxSizing: 'border-box', marginBottom: '20px', fontSize: '13.5px' }}
              required
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setRejectBookingId(null)
                  setRejectReasonInput('')
                }}
                style={{ padding: '10px 18px', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
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

      {/* Booking Chat Modal */}
      {activeChatBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#1e293b', borderRadius: '24px', width: '450px', height: '550px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #334155' }}>
            
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '20px 24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>💬 Chat with Student</h3>
                <span style={{ fontSize: '12px', opacity: 0.85 }}>Student: {activeChatBooking.student?.name || 'Anonymous Student'}</span>
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
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#0f172a', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', margin: 'auto' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                  <p style={{ margin: 0, fontSize: '13.5px' }}>Start the conversation with the student.</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => {
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
                        background: isOwn ? '#6366f1' : '#1e293b',
                        color: 'white',
                        padding: '10px 14px',
                        borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        fontSize: '13.5px',
                        lineHeight: '1.4',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        wordBreak: 'break-word',
                        border: isOwn ? 'none' : '1px solid #334155'
                      }}>
                        {msg.text}
                      </div>
                      <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', paddingLeft: isOwn ? 0 : '4px', paddingRight: isOwn ? '4px' : 0 }}>
                        {isOwn ? 'You' : msg.senderName || 'Student'}
                      </span>
                    </div>
                  )
                })
              )}
              <div ref={bookingChatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendBookingMessage} style={{ display: 'flex', padding: '16px', gap: '10px', borderTop: '1px solid #334155', background: '#1e293b' }}>
              <input 
                type="text" 
                value={chatInputText} 
                onChange={e => setChatInputText(e.target.value)} 
                placeholder="Type your message..." 
                style={{ flex: 1, padding: '12px 16px', border: '1px solid #475569', borderRadius: '12px', fontSize: '13.5px', outline: 'none', background: '#0f172a', color: 'white' }}
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
                Session with Student: {activeVideoBooking.student?.name || 'Anonymous'}
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

      {/* Loading Report Modal Overlay */}
      {loadingReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '30px', border: '1px solid #334155', textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #334155',
              borderTop: '4px solid #6366f1',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: 'white', margin: 0, fontSize: '14.5px', fontWeight: 'bold' }}>Retrieving student mental health reports...</p>
          </div>
        </div>
      )}

      {/* Student Health Report Modal */}
      {selectedStudentReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#1e293b', borderRadius: '24px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <span style={{ fontSize: '11px', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Confidential Patient File</span>
                <h3 style={{ color: 'white', margin: 0, fontSize: '22px', fontWeight: 'bold' }}>{selectedStudentReport.student?.name}</h3>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Email: {selectedStudentReport.student?.email}</span>
              </div>
              <button 
                onClick={() => setSelectedStudentReport(null)}
                style={{ background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#475569'}
                onMouseLeave={e => e.currentTarget.style.background = '#334155'}
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div style={{ padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Analytics Summary Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Average Mood Score</div>
                  <div style={{ fontSize: '26px', fontWeight: 'bold', marginTop: '6px', color: '#10b981' }}>
                    {selectedStudentReport.stats?.averageMood ? `${selectedStudentReport.stats.averageMood} / 5.0` : 'N/A'}
                  </div>
                </div>
                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Current Log Streak</div>
                  <div style={{ fontSize: '26px', fontWeight: 'bold', marginTop: '6px', color: '#f97316' }}>
                    🔥 {selectedStudentReport.student?.streakCount || 0} Days
                  </div>
                </div>
                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Common Trigger</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '10px', color: '#f59e0b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ⚡ {selectedStudentReport.stats?.mostCommonTrigger || 'None'}
                  </div>
                </div>
              </div>

              {/* AI Assistant Insight */}
              <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '20px', borderRadius: '16px', border: '1px solid #4338ca' }}>
                <h4 style={{ color: '#a5b4fc', margin: '0 0 10px 0', fontSize: '14.5px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🤖</span> AI Mental Health Assessment Summary
                </h4>
                <p style={{ color: '#cbd5e1', margin: 0, fontSize: '13px', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{selectedStudentReport.stats?.weeklySummary || 'No tracking statistics logged by this student.'}"
                </p>
              </div>

              {/* Badges Overview */}
              <div>
                <h4 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '14.5px', fontWeight: 'bold' }}>🏅 Unlocked Badges ({selectedStudentReport.student?.badges?.length || 0})</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(!selectedStudentReport.student?.badges || selectedStudentReport.student.badges.length === 0) ? (
                    <span style={{ fontSize: '12.5px', color: '#64748b', fontStyle: 'italic' }}>No mental health badges unlocked yet.</span>
                  ) : (
                    selectedStudentReport.student.badges.map(b => (
                      <span key={b} style={{ background: '#312e81', color: '#e0e7ff', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #4338ca' }}>
                        🏅 {b}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Patient Mood Journal Logs Table */}
              <div>
                <h4 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '14.5px', fontWeight: 'bold' }}>📋 Mood Logs & Daily Journal Logs</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto', paddingRight: '6px' }}>
                  {(!selectedStudentReport.moods || selectedStudentReport.moods.length === 0) ? (
                    <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: '20px 0', textAlign: 'center' }}>No mood logs recorded yet.</p>
                  ) : (
                    selectedStudentReport.moods.map(log => (
                      <div key={log.id} style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '22px' }}>{log.emoji}</span>
                            <div>
                              <strong style={{ color: 'white', fontSize: '13.5px' }}>{log.label} ({log.value}/5)</strong>
                              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Trigger: <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{log.trigger || 'None'}</span></span>
                            </div>
                          </div>
                          <span style={{ fontSize: '12px', color: '#818cf8', fontWeight: 'bold', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 8px', borderRadius: '8px' }}>{log.date}</span>
                        </div>

                        {log.note ? (
                          <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontSize: '12.5px', fontStyle: 'italic', marginBottom: '10px', borderLeft: '3px solid #6366f1' }}>
                            "{log.note}"
                          </div>
                        ) : (
                          <div style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic', marginBottom: '10px' }}>No journal notes attached.</div>
                        )}

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '11px', color: '#94a3b8' }}>
                          {log.activities && log.activities.length > 0 && (
                            <div>
                              <span style={{ color: '#cbd5e1', fontWeight: 'bold' }}>Activities:</span> {log.activities.join(', ')}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <span>🛌 Sleep: <strong>{log.sleepHours} hrs</strong></span>
                            <span>💧 Water: <strong>{log.waterIntake} ml</strong></span>
                            <span>📱 Screen: <strong>{log.screenTime} hrs</strong></span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '20px 32px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end', flexShrink: 0, background: '#0f172a' }}>
              <button 
                onClick={() => setSelectedStudentReport(null)}
                style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
              >
                Close File
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Settlement Slip Modal */}
      {settlementSuccessMsg && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#1e293b', borderRadius: '24px', width: '100%', maxWidth: '650px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px 32px', background: '#10b981', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>🏦 Bank Settlement Wire Transfer Slip</h3>
                <span style={{ fontSize: '12px', opacity: 0.9 }}>MindSpace Automated Clearing House (ACH) Payout Settlement</span>
              </div>
              <button 
                onClick={() => {
                  setSettlementSuccessMsg('')
                  setAutoSettleLogs(null)
                }}
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '16px', borderRadius: '12px', color: '#34d399', fontSize: '13.5px', fontWeight: '500', textAlign: 'center' }}>
                ✅ {settlementSuccessMsg}
              </div>

              <h4 style={{ color: 'white', margin: '10px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>Clearing House Transaction Log:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {autoSettleLogs && autoSettleLogs.map(log => (
                  <div key={log.transactionId} style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'white', fontWeight: 'bold' }}>
                      <span>👤 {log.counsellorName}</span>
                      <span style={{ color: '#10b981' }}>LKR {log.amount.toLocaleString()}</span>
                    </div>
                    <div style={{ color: '#94a3b8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11.5px' }}>
                      <div>Bank: <strong>{log.bankName}</strong></div>
                      <div>Account: <strong>{log.accountNumber}</strong></div>
                      <div>Holder: <strong>{log.accountHolder}</strong></div>
                      <div>Ref: <strong style={{ color: '#6366f1' }}>{log.transactionId}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '20px 32px', background: '#0f172a', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setSettlementSuccessMsg('')
                  setAutoSettleLogs(null)
                }}
                style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getSidebarButtonStyle(isActive, isEmergency) {
  return {
    width: '100%',
    padding: '12px 24px',
    border: 'none',
    background: isActive ? '#334155' : 'transparent',
    color: isActive ? '#818cf8' : isEmergency ? '#ef4444' : '#94a3b8',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '13.5px',
    fontWeight: '600',
    transition: 'all 0.15s'
  }
}
