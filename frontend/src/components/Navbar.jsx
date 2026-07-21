import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [user, setUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  const [announcements, setAnnouncements] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [hasNewNotifications, setHasNewNotifications] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false)
  const dropdownRef = useRef(null)
  const [navProgress, setNavProgress] = useState(false)

  const triggerNavTransition = (targetPath) => {
    // 1. Instant 1st-click Navigation!
    navigate(targetPath)

    // 2. Trigger Option 4 Sleek Top Glass Progress Bar & Smooth Page Fade
    setNavProgress(true)
    setTimeout(() => {
      setNavProgress(false)
    }, 650)
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const token = localStorage.getItem('token')

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const parsed = JSON.parse(savedUser)
      setUser(parsed)
      setProfilePhoto(parsed.profilePhoto || '')
    }
  }, [isModalOpen])

  useEffect(() => {
    if (token) {
      fetchAnnouncements()
    }
  }, [token])

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAnnouncements(res.data)
      
      // Check if there are new announcements compared to localStorage
      if (res.data.length > 0) {
        const lastSeenId = localStorage.getItem('lastSeenAnnouncementId')
        if (lastSeenId !== res.data[0]._id) {
          setHasNewNotifications(true)
        }
      }
    } catch (err) {
      console.error('Error fetching announcements in Navbar:', err)
    }
  }

  const markAllAsRead = () => {
    if (announcements.length > 0) {
      localStorage.setItem('lastSeenAnnouncementId', announcements[0]._id)
      setHasNewNotifications(false)
    }
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    if (!showNotifications && announcements.length > 0) {
      markAllAsRead()
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Check file type/format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setMessage({ text: '⚠️ Only JPG, JPEG, and PNG formats are allowed.', type: 'error' })
      return
    }

    // Check file size (e.g. limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: '⚠️ File is too large. Limit is 2MB.', type: 'error' })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePhoto(reader.result)
      setMessage({ text: '', type: '' })
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    setUploading(true)
    setMessage({ text: '', type: '' })

    try {
      const res = await axios.put('http://localhost:5000/api/auth/me/profile', 
        { profilePhoto },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Update local storage and user state
      const updatedUser = { ...user, profilePhoto: res.data.profilePhoto }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      setMessage({ text: '✅ Profile photo updated successfully!', type: 'success' })
      setTimeout(() => {
        setIsModalOpen(false)
        setMessage({ text: '', type: '' })
      }, 1200)
    } catch (err) {
      setMessage({ text: err.response?.data?.message || err.message || 'Failed to update profile photo.', type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  if (!user) return null

  const nameInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U'
  const isAdmin = user.role === 'admin' || user.role === 'counsellor'

  return (
    <div className="navbar-header" style={{ background: 'white', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 1000, flexWrap: 'wrap', gap: '10px' }}>
      
      {/* Brand logo */}
      <h1 onClick={() => { setMobileMenuOpen(false); triggerNavTransition('/dashboard', ['🧠', '✨', '💖', '🌿', '🌈', '🌟', '🕊️', '🧘‍♀️']); }} style={{ color: '#4f46e5', fontSize: '22px', margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontFamily: '"Outfit", "Inter", sans-serif', whiteSpace: 'nowrap' }}>
        <span>🧠</span> MindSpace
      </h1>
      
      {/* Desktop Nav Actions */}
      {!isMobile && (
        <div className="desktop-nav-menu" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* 1. Mood Button */}
          <button 
            onClick={() => triggerNavTransition('/mood', ['😊', '😌', '🥰', '💖', '🎭', '🧘‍♀️', '🌸', '✨', '🌻', '🤩', '😃', '🌿', '☁️', '🌈', '☀️', '💧', '🛌', '⚡'])} 
            className="ms-nav-btn"
            style={{ padding: '9px 16px', background: location.pathname === '/mood' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#f3f4f6', color: location.pathname === '/mood' ? 'white' : '#4b5563', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13.5px' }}
          >
            Mood
          </button>
          
          {/* 2. Peer Chat Button */}
          <button 
            onClick={() => triggerNavTransition('/anonymous-chat', ['💬', '👥', '💌', '💭', '🤝', '🗨️', '✨', '💜', '🗣️', '🔒', '🛡️', '🫂', '🕊️', '💌', '🌟'])} 
            className="ms-nav-btn"
            style={{ padding: '9px 16px', background: location.pathname === '/anonymous-chat' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#f3f4f6', color: location.pathname === '/anonymous-chat' ? 'white' : '#4b5563', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13.5px' }}
          >
            Peer Chat
          </button>
          
          {/* 3. AI Aura Button */}
          <button 
            onClick={() => triggerNavTransition('/chat', ['🤖', '✨', '⚡', '🔮', '🧠', '🌌', '💫', '💎', '💡', '🚀', '🔮', '🌌', '🪐', '💫', '🤖'])} 
            className="ms-nav-btn"
            style={{ padding: '9px 16px', background: location.pathname === '/chat' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#f3f4f6', color: location.pathname === '/chat' ? 'white' : '#4b5563', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13.5px' }}
          >
            AI Aura
          </button>

          {/* 4. Resources Button */}
          <button 
            onClick={() => triggerNavTransition('/resources', ['📚', '📖', '🎧', '🧘‍♀️', '💡', '🌱', '🌿', '✨', '🎵', '📜', '🧩', '🎨', '🌊', '🍃', '🌸'])} 
            className="ms-nav-btn"
            style={{ padding: '9px 16px', background: location.pathname === '/resources' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#f3f4f6', color: location.pathname === '/resources' ? 'white' : '#4b5563', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13.5px' }}
          >
            Resources
          </button>

          {/* 5. Bookings Button */}
          <button 
            onClick={() => triggerNavTransition('/booking', ['📅', '⏰', '🗓️', '🩺', '🤝', '🌟', '🤍', '🧑‍⚕️', '📋', '💼', '📍', '💬', '🕒', '✅'])} 
            className="ms-nav-btn"
            style={{ padding: '9px 16px', background: location.pathname === '/booking' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#f3f4f6', color: location.pathname === '/booking' ? 'white' : '#4b5563', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13.5px' }}
          >
            Bookings
          </button>

          {/* 6. Apply as Counselor Button */}
          {user.role === 'student' && (
            <button 
              onClick={() => triggerNavTransition('/apply-counselor', ['🤝', '🌟', '🎖️', '💼', '🏆', '💙', '✨', '📜', '🎓', '✍️', '🖊️', '📄', '🚀', '👑'])} 
              className="ms-nav-btn"
              style={{ padding: '9px 16px', background: location.pathname === '/apply-counselor' ? 'linear-gradient(135deg, #0284c7, #0ea5e9)' : '#e0f2fe', color: location.pathname === '/apply-counselor' ? 'white' : '#0369a1', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13.5px' }}
            >
              Apply as Counselor
            </button>
          )}
          
          {/* Admin / Counselor Console Button */}
          {isAdmin && (
            <button 
              onClick={() => triggerNavTransition('/admin', ['🛠️', '📊', '🛡️', '⚙️', '📋', '📈', '🔑', '⚡', '👨‍⚕️', '📊'])} 
              className="ms-nav-btn"
              style={{ padding: '9px 16px', background: location.pathname === '/admin' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#e0e7ff', color: location.pathname === '/admin' ? 'white' : '#4f46e5', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13.5px' }}
            >
              {user?.role === 'counsellor' ? 'Counsellor Console' : 'Admin Console'}
            </button>
          )}
        </div>
      )}

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Notifications Bell Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={toggleNotifications}
            style={{
              background: showNotifications ? '#f3f4f6' : 'transparent',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: showNotifications ? '#4f46e5' : '#4b5563',
              transition: 'all 0.2s',
              position: 'relative',
              outline: 'none'
            }}
            title="System Announcements"
            className="navbar-bell-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            {hasNewNotifications && (
              <span className="bell-badge" style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                background: '#ef4444',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                boxShadow: '0 0 0 2px white'
              }} />
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '320px',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 8px 20px -6px rgba(0, 0, 0, 0.05)',
              zIndex: 2000,
              overflow: 'hidden',
              animation: 'navFadeIn 0.2s ease-out'
            }}>
              {/* Header */}
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fcfdff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '800', fontSize: '14px', color: '#1e293b' }}>Announcements</span>
                  {announcements.length > 0 && (
                    <span style={{
                      background: '#e0e7ff',
                      color: '#4f46e5',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 'bold'
                    }}>
                      {announcements.length}
                    </span>
                  )}
                </div>
                {announcements.length > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4f46e5',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: 0,
                      outline: 'none'
                    }}
                    className="navbar-mark-read-btn"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Body */}
              <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="custom-scrollbar">
                {announcements.length === 0 ? (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: '#64748b' }}>
                    <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '500' }}>You're all caught up!</p>
                    <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#94a3b8' }}>No active system announcements.</p>
                  </div>
                ) : (
                  announcements.map((ann, idx) => (
                    <div 
                      key={ann._id} 
                      style={{
                        padding: '14px 18px',
                        borderBottom: idx === announcements.length - 1 ? 'none' : '1px solid #f1f5f9',
                        transition: 'background 0.2s',
                        cursor: 'default',
                        textAlign: 'left'
                      }}
                      className="announcement-item"
                    >
                      <h4 style={{ margin: '0 0 4px', color: '#1f2937', fontSize: '13.5px', fontWeight: 'bold', lineHeight: '1.3', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {ann.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12.5px', color: '#4b5563', lineHeight: '1.45', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                        {ann.content}
                      </p>
                      <div style={{
                        marginTop: '8px',
                        fontSize: '10.5px',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>{new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile avatar / settings trigger */}
        <div 
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '2px', borderRadius: '20px', transition: 'background 0.2s' }}
          title="Profile Settings"
        >
          {user.profilePhoto ? (
            <img 
              src={user.profilePhoto} 
              alt={user.name} 
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366f1', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} 
            />
          ) : (
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              {nameInitial}
            </div>
          )}
        </div>

        {!isMobile && (
          <button 
            onClick={handleLogout} 
            className="desktop-logout-btn"
            style={{ padding: '9px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13.5px', transition: 'all 0.2s' }}
          >
            Logout
          </button>
        )}

        {/* Mobile Hamburger Toggle Button (☰) */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger-btn"
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}
            title="Toggle Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        )}
      </div>

      {/* Mobile Drawer Menu (Slide Down on ☰ click) */}
      {mobileMenuOpen && (
        <div 
          style={{
            width: '100%',
            background: 'white',
            borderTop: '1px solid #f1f5f9',
            padding: '16px 0 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }} 
          className="mobile-drawer-menu"
        >
          <button 
            onClick={() => { setMobileMenuOpen(false); triggerNavTransition('/mood', ['😊', '😌', '🥰', '💖', '🎭', '🧘‍♀️', '🌸', '✨', '🌻', '🤩', '😃', '🌿', '☁️', '🌈', '☀️', '💧', '🛌', '⚡']); }} 
            style={{ padding: '12px 16px', background: location.pathname === '/mood' ? '#e0e7ff' : '#f8fafc', color: location.pathname === '/mood' ? '#4f46e5' : '#4b5563', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <span>😊</span> Mood Journal
          </button>

          <button 
            onClick={() => { setMobileMenuOpen(false); triggerNavTransition('/anonymous-chat', ['💬', '👥', '💌', '💭', '🤝', '🗨️', '✨', '💜', '🗣️', '🔒', '🛡️', '🫂', '🕊️', '💌', '🌟']); }} 
            style={{ padding: '12px 16px', background: location.pathname === '/anonymous-chat' ? '#e0e7ff' : '#f8fafc', color: location.pathname === '/anonymous-chat' ? '#4f46e5' : '#4b5563', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <span>👥</span> Peer Support Chat
          </button>

          <button 
            onClick={() => { setMobileMenuOpen(false); triggerNavTransition('/chat', ['🤖', '✨', '⚡', '🔮', '🧠', '🌌', '💫', '💎', '💡', '🚀', '🔮', '🌌', '🪐', '💫', '🤖']); }} 
            style={{ padding: '12px 16px', background: location.pathname === '/chat' ? '#e0e7ff' : '#f8fafc', color: location.pathname === '/chat' ? '#4f46e5' : '#4b5563', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <span>💬</span> AI Aura Assistant
          </button>

          <button 
            onClick={() => { setMobileMenuOpen(false); triggerNavTransition('/resources', ['📚', '📖', '🎧', '🧘‍♀️', '💡', '🌱', '🌿', '✨', '🎵', '📜', '🧩', '🎨', '🌊', '🍃', '🌸']); }} 
            style={{ padding: '12px 16px', background: location.pathname === '/resources' ? '#e0e7ff' : '#f8fafc', color: location.pathname === '/resources' ? '#4f46e5' : '#4b5563', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <span>📚</span> Resources & Breathing
          </button>

          <button 
            onClick={() => { setMobileMenuOpen(false); triggerNavTransition('/booking', ['📅', '⏰', '🗓️', '🩺', '🤝', '🌟', '🤍', '🧑‍⚕️', '📋', '💼', '📍', '💬', '🕒', '✅']); }} 
            style={{ padding: '12px 16px', background: location.pathname === '/booking' ? '#e0e7ff' : '#f8fafc', color: location.pathname === '/booking' ? '#4f46e5' : '#4b5563', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <span>📅</span> Bookings & Counseling
          </button>

          {user.role === 'student' && (
            <button 
              onClick={() => { setMobileMenuOpen(false); triggerNavTransition('/apply-counselor', ['🤝', '🌟', '🎖️', '💼', '🏆', '💙', '✨', '📜', '🎓', '✍️', '🖊️', '📄', '🚀', '👑']); }} 
              style={{ padding: '12px 16px', background: location.pathname === '/apply-counselor' ? '#0284c7' : '#e0f2fe', color: location.pathname === '/apply-counselor' ? 'white' : '#0369a1', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <span>🤝</span> Apply as Counselor
            </button>
          )}
          
          {isAdmin && (
            <button 
              onClick={() => { setMobileMenuOpen(false); triggerNavTransition('/admin', ['🛠️', '📊', '🛡️', '⚙️', '📋', '📈', '🔑', '⚡', '👨‍⚕️', '📊']); }} 
              style={{ padding: '12px 16px', background: location.pathname === '/admin' ? '#4f46e5' : '#e0e7ff', color: location.pathname === '/admin' ? 'white' : '#4f46e5', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <span>🛠️</span> {user?.role === 'counsellor' ? 'Counsellor Console' : 'Admin Console'}
            </button>
          )}

          <button 
            onClick={() => { setMobileMenuOpen(false); setIsModalOpen(true); }} 
            style={{ padding: '12px 16px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <span>👤</span> My Profile Settings
          </button>

          <button 
            onClick={() => { setMobileMenuOpen(false); handleLogout(); }} 
            style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <span>🚪</span> Logout
          </button>
        </div>
      )}

      {/* --- PROFILE MODAL --- */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '380px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
            
            <button 
              onClick={() => { setIsModalOpen(false); setMessage({ text: '', type: '' }); }} 
              style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: '#f1f5f9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#1e293b', fontWeight: 'bold' }}>My Profile</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Update your profile photo</p>
            </div>

            {message.text && (
              <div style={{ 
                background: message.type === 'success' ? '#ecfdf5' : '#fef2f2', 
                color: message.type === 'success' ? '#047857' : '#b91c1c', 
                padding: '10px 14px', 
                borderRadius: '10px', 
                fontSize: '13px', 
                marginBottom: '16px',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                {message.text}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              {/* Profile Photo Display */}
              <div style={{ position: 'relative' }}>
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #6366f1', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.15)' }} />
                ) : (
                  <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '36px', border: '3px solid #6366f1', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.15)' }}>
                    {nameInitial}
                  </div>
                )}
              </div>

              {/* File input (Device Upload, No URL) */}
              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#475569', marginBottom: '6px', textAlign: 'center' }}>Upload new photo:</label>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handleFileChange}
                  style={{ width: '100%', padding: '8px', border: '1px dashed #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none', background: '#f8fafc', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Readonly info */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '24px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Name:</span>
                <strong style={{ color: '#1e293b' }}>{user.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Email:</span>
                <strong style={{ color: '#1e293b' }}>{user.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>System Role:</span>
                <strong style={{ color: '#6366f1', textTransform: 'capitalize' }}>{user.role}</strong>
              </div>
            </div>

            <button 
              onClick={handleSaveProfile}
              disabled={uploading}
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(118, 75, 162, 0.2)' }}
            >
              {uploading ? 'Saving Photo...' : 'Save Profile Photo'}
            </button>
          </div>
        </div>
      )}

      {/* --- OPTION 4: TOP GLASS PROGRESS BAR & SMOOTH PAGE FADE --- */}
      {navProgress && (
        <>
          {/* Top Progress Loading Bar */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '3.5px',
            zIndex: 999999,
            pointerEvents: 'none',
            background: 'linear-gradient(90deg, #4f46e5 0%, #8b5cf6 50%, #ec4899 100%)',
            boxShadow: '0 0 12px rgba(139, 92, 246, 0.8), 0 0 4px rgba(236, 72, 153, 0.6)',
            animation: 'topProgressBar 0.65s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            willChange: 'width, opacity'
          }} />

          {/* Smooth Glass Backdrop Fade Overlay */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(3px)',
            pointerEvents: 'none',
            zIndex: 999998,
            animation: 'smoothPageFade 0.5s ease-out forwards'
          }} />
        </>
      )}

      <style>{`
        @keyframes topProgressBar {
          0% {
            width: 0%;
            opacity: 1;
          }
          65% {
            width: 85%;
            opacity: 0.95;
          }
          100% {
            width: 100%;
            opacity: 0;
          }
        }
        @keyframes smoothPageFade {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .ms-nav-btn {
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          position: relative !important;
          outline: none !important;
          user-select: none !important;
        }
        .ms-nav-btn:hover {
          transform: translateY(-2px) scale(1.04) !important;
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.25) !important;
        }
        .ms-nav-btn:active {
          transform: scale(0.92) translateY(1px) !important;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4) !important;
          animation: msRipple 0.3s ease-out !important;
        }
        @keyframes msRipple {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.6); }
          100% { box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); }
        }
        .navbar-bell-btn:hover {
          background-color: #f3f4f6 !important;
          color: #4f46e5 !important;
        }
        .navbar-mark-read-btn:hover {
          text-decoration: underline;
          color: #4338ca !important;
        }
        .announcement-item:hover {
          background-color: #f8fafc;
        }
        @keyframes navFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .bell-badge {
          animation: pulseBadge 2s infinite;
        }
        @keyframes pulseBadge {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

    </div>
  )
}
