import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import ThemeToggle from './ThemeToggle'
import Icon from './ui/Icon'
import { Logo } from './ui/Brand'

const getFormattedDate = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

/**
 * MindSpace Professional Horizontal Navigation Bar & Header
 * Inspired by official high-quality institutional & corporate websites (CEYPETCO style).
 * - Full horizontal desktop layout with clear header, logo, nav links, dropdown menus, and active indicators.
 * - Zero desktop sidebars.
 * - Clean, responsive mobile drawer & bottom quick tabbar for mobile devices.
 */
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
  
  // Desktop dropdown state ('mood' | 'coping' | 'support' | 'user' | null)
  const [activeDropdown, setActiveDropdown] = useState(null)
  
  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const navRef = useRef(null)
  const notifRef = useRef(null)
  const token = localStorage.getItem('token')

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
        setProfilePhoto(parsed.profilePhoto || '')
      } catch { /* ignore corrupt value */ }
    } else {
      setUser(null)
    }
  }, [isModalOpen, location.pathname])

  // Close menus on route change
  useEffect(() => {
    setActiveDropdown(null)
    setMobileDrawerOpen(false)
    setShowNotifications(false)
  }, [location.pathname])

  // Click outside to close dropdowns & popovers
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Listen for mobile nav open requests from other components
  useEffect(() => {
    const handleOpenMobileNav = () => setMobileDrawerOpen(true)
    window.addEventListener('open-mobile-nav', handleOpenMobileNav)
    return () => window.removeEventListener('open-mobile-nav', handleOpenMobileNav)
  }, [])

  // Fetch announcements
  useEffect(() => {
    if (token) fetchAnnouncements()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAnnouncements(res.data)
      if (res.data.length > 0) {
        const lastSeenId = localStorage.getItem('lastSeenAnnouncementId')
        if (lastSeenId !== res.data[0]._id) setHasNewNotifications(true)
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
    if (!showNotifications && announcements.length > 0) markAllAsRead()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setMessage({ text: 'Only JPG, JPEG, and PNG formats are allowed.', type: 'error' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'File is too large. Limit is 2MB.', type: 'error' })
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
      const res = await axios.put(`${API_URL}/api/auth/me/profile`,
        { profilePhoto },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const updatedUser = { ...user, profilePhoto: res.data.profilePhoto }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setMessage({ text: 'Profile photo updated successfully!', type: 'success' })
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
  const path = location.pathname

  const go = (to, state) => {
    setActiveDropdown(null)
    setMobileDrawerOpen(false)
    navigate(to, { state })
  }

  // Quick Mobile Bottom Tabbar Items
  const tabs = [
    { to: '/dashboard', icon: 'home', label: 'Home' },
    { to: '/mood', icon: 'smile', label: 'Mood' },
    { to: '/chat', icon: 'feather', label: 'Aura AI' },
    { to: '/booking', icon: 'calendar', label: 'Sessions' }
  ]
  const isTabActive = (tabTo) => path === tabTo

  return (
    <>
      <style>{`
        /* =========================================================================
           MindSpace Professional Horizontal Header & Navbar
           Inspired by clean, high-quality institutional corporate portals (CEYPETCO)
           ========================================================================= */
        .ms-nav-wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          background: var(--surface);
          border-bottom: 1px solid var(--line);
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        /* 1. Institutional Pre-Header Utility Bar */
        .ms-utility-bar {
          background: color-mix(in srgb, var(--surface) 88%, var(--primary-soft));
          border-bottom: 1px solid var(--line);
          font-size: 12px;
          color: var(--ink-2);
          padding: 6px 0;
          width: 100%;
        }
        .ms-utility-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .ms-utility-left {
          display: flex;
          align-items: center;
          gap: 14px;
          font-weight: 550;
        }
        .ms-utility-portal-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--primary);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 10.5px;
        }
        .ms-utility-helpline-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--danger);
          font-weight: 700;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .ms-utility-helpline-link:hover {
          text-decoration: underline;
        }
        .ms-utility-right {
          display: flex;
          align-items: center;
          gap: 16px;
          font-weight: 550;
          color: var(--ink-3);
        }

        /* 2. Main Horizontal Navigation Header */
        .ms-main-nav {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 24px;
          height: 74px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        /* Brand Section (Left) */
        .ms-brand-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          cursor: pointer;
          border: none;
          background: transparent;
          padding: 0;
          flex-shrink: 0;
        }
        .ms-brand-text {
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        .ms-brand-name {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 800;
          color: var(--ink);
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .ms-brand-tag {
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.12em;
          color: var(--primary);
          text-transform: uppercase;
          margin-top: 2px;
        }

        /* Horizontal Menu Links (Center) */
        .ms-menu-links {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 100%;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .ms-nav-item-wrap {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
        }
        .ms-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--ink-2);
          font-size: 14.5px;
          font-weight: 650;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.18s ease;
          position: relative;
          text-decoration: none;
          white-space: nowrap;
        }
        .ms-nav-btn:hover {
          color: var(--primary);
          background: var(--primary-faint);
        }
        .ms-nav-btn.is-active {
          color: var(--primary);
          font-weight: 750;
        }
        .ms-nav-btn.is-active::after {
          content: '';
          position: absolute;
          bottom: 0px;
          left: 14px;
          right: 14px;
          height: 3px;
          border-radius: 3px 3px 0 0;
          background: var(--primary);
        }
        .ms-chevron {
          font-size: 10px;
          transition: transform 0.2s ease;
          opacity: 0.6;
        }
        .ms-nav-item-wrap.is-open .ms-chevron {
          transform: rotate(180deg);
          opacity: 1;
        }

        /* Dropdown Popover */
        .ms-dropdown-pane {
          position: absolute;
          top: calc(100% - 6px);
          left: 0;
          min-width: 290px;
          padding: 8px;
          border-radius: 18px;
          background: var(--surface);
          border: 1px solid var(--line);
          box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.12);
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 100;
          animation: msDropdownFade 0.18s cubic-bezier(0.2, 0, 0, 1);
        }
        @keyframes msDropdownFade {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ms-dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: background-color 0.15s ease, transform 0.15s ease;
          width: 100%;
          box-sizing: border-box;
        }
        .ms-dropdown-item:hover {
          background: var(--primary-soft);
          transform: translateX(3px);
        }
        .ms-dropdown-item-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: var(--surface-2);
          color: var(--primary);
          flex-shrink: 0;
          border: 1px solid var(--line);
        }
        .ms-dropdown-item:hover .ms-dropdown-item-icon {
          background: var(--surface);
          color: var(--primary-ink);
        }
        .ms-dropdown-item-title {
          font-size: 13.5px;
          font-weight: 750;
          color: var(--ink);
          margin-bottom: 2px;
        }
        .ms-dropdown-item-desc {
          font-size: 11.5px;
          color: var(--ink-3);
          margin: 0;
          line-height: 1.35;
        }

        /* Right Header Controls */
        .ms-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .ms-user-trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px 6px 6px;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: var(--surface-2);
          cursor: pointer;
          font-family: inherit;
          transition: all 0.18s ease;
        }
        .ms-user-trigger:hover {
          border-color: var(--primary);
          background: var(--surface);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .ms-user-name {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--ink);
          max-width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ms-user-role-badge {
          font-size: 10px;
          font-weight: 750;
          padding: 2px 7px;
          border-radius: 999px;
          background: var(--primary-soft);
          color: var(--primary);
          text-transform: capitalize;
        }

        /* User Profile Dropdown */
        .ms-user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 240px;
          padding: 10px;
          border-radius: 18px;
          background: var(--surface);
          border: 1px solid var(--line);
          box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.14);
          z-index: 100;
          display: flex;
          flex-direction: column;
          gap: 4px;
          animation: msDropdownFade 0.18s cubic-bezier(0.2, 0, 0, 1);
        }
        .ms-user-header {
          padding: 8px 10px 10px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 4px;
        }
        .ms-user-email {
          font-size: 11.5px;
          color: var(--ink-3);
          word-break: break-all;
          margin-top: 2px;
        }

        /* Announcements Popover */
        .ms-notif-popover {
          position: absolute;
          top: calc(100% + 10px);
          right: -40px;
          width: 320px;
          max-width: 90vw;
          border-radius: 20px;
          background: var(--surface);
          border: 1px solid var(--line);
          box-shadow: 0 20px 40px -4px rgba(0, 0, 0, 0.18);
          z-index: 1000;
          overflow: hidden;
          animation: msDropdownFade 0.2s cubic-bezier(0.2, 0, 0, 1);
        }

        /* 3. Responsive Breakpoints & Mobile Navigation */
        .ms-desktop-only { display: flex; }
        .ms-mobile-only { display: none; }

        @media (max-width: 1024px) {
          .ms-menu-links {
            gap: 2px;
          }
          .ms-nav-btn {
            font-size: 13.5px;
            padding: 8px 10px;
          }
        }

        @media (max-width: 860px) {
          .ms-desktop-only { display: none !important; }
          .ms-mobile-only { display: flex !important; }
          .ms-utility-bar { display: none; }
          .ms-main-nav {
            height: 64px;
            padding: 0 16px;
          }
        }
      `}</style>

      {/* ---------------- Main Persistent Horizontal Header ---------------- */}
      <div className="ms-nav-wrapper" ref={navRef}>
        {/* Top Institutional Pre-Header Strip */}
        <div className="ms-utility-bar ms-desktop-only">
          <div className="ms-utility-inner">
            <div className="ms-utility-left">
              <span className="ms-utility-portal-tag">
                <Icon name="shield" size={13} /> Sri Lanka Student Mental Health System
              </span>
              <span>•</span>
              <a href="tel:1926" className="ms-utility-helpline-link" title="National Mental Health Helpline">
                <Icon name="phone" size={12} /> 24/7 Crisis Helpline: 1926 (NIMH)
              </a>
              <span>•</span>
              <a href="tel:1990" className="ms-utility-helpline-link" style={{ color: 'var(--ink-2)' }} title="Emergency Ambulance Care">
                Ambulance: 1990
              </a>
            </div>

            <div className="ms-utility-right">
              <span>{getFormattedDate()}</span>
            </div>
          </div>
        </div>

        {/* Primary Horizontal Navbar */}
        <nav className="ms-main-nav" aria-label="Main Navigation">
          {/* Brand Logo (Left) */}
          <button className="ms-brand-link" onClick={() => go('/dashboard')} aria-label="MindSpace Home">
            <Logo size={40} />
            <div className="ms-brand-text">
              <span className="ms-brand-name">MindSpace</span>
              <span className="ms-brand-tag">STUDENT WELLBEING PORTAL</span>
            </div>
          </button>

          {/* Desktop Horizontal Navigation Links with Dropdowns (Center) */}
          <ul className="ms-menu-links ms-desktop-only">
            {/* 1. Home */}
            <li className="ms-nav-item-wrap">
              <button
                type="button"
                className={`ms-nav-btn ${path === '/dashboard' ? 'is-active' : ''}`}
                onClick={() => go('/dashboard')}
              >
                <Icon name="home" size={16} />
                <span>Home</span>
              </button>
            </li>

            {/* 2. Mood & Assessment Dropdown */}
            <li className={`ms-nav-item-wrap ${activeDropdown === 'mood' ? 'is-open' : ''}`}>
              <button
                type="button"
                className={`ms-nav-btn ${path === '/mood' ? 'is-active' : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'mood' ? null : 'mood')}
                onMouseEnter={() => setActiveDropdown('mood')}
                aria-expanded={activeDropdown === 'mood'}
              >
                <Icon name="smile" size={16} />
                <span>Mood &amp; Check-in</span>
                <span className="ms-chevron">▼</span>
              </button>

              {activeDropdown === 'mood' && (
                <div className="ms-dropdown-pane" onMouseLeave={() => setActiveDropdown(null)}>
                  <button type="button" className="ms-dropdown-item" onClick={() => go('/mood')}>
                    <span className="ms-dropdown-item-icon"><Icon name="smile" size={18} /></span>
                    <div>
                      <div className="ms-dropdown-item-title">Mood Tracker &amp; Pulse</div>
                      <p className="ms-dropdown-item-desc">Log your daily mood and receive coping suggestions</p>
                    </div>
                  </button>
                  <button type="button" className="ms-dropdown-item" onClick={() => go('/mood', { tab: 'log', scrollTo: 'sec-assessment' })}>
                    <span className="ms-dropdown-item-icon"><Icon name="activity" size={18} /></span>
                    <div>
                      <div className="ms-dropdown-item-title">Wellbeing Assessment</div>
                      <p className="ms-dropdown-item-desc">2-minute clinical reflection and trigger check-in</p>
                    </div>
                  </button>
                  <button type="button" className="ms-dropdown-item" onClick={() => go('/mood', { tab: 'log', openFaceScanner: true, scrollTo: 'sec-assessment' })}>
                    <span className="ms-dropdown-item-icon"><Icon name="camera" size={18} /></span>
                    <div>
                      <div className="ms-dropdown-item-title">Facial AI Emotion Scanner</div>
                      <p className="ms-dropdown-item-desc">Real-time camera emotion and expression analysis</p>
                    </div>
                  </button>
                  <button type="button" className="ms-dropdown-item" onClick={() => go('/mood', { tab: 'analytics' })}>
                    <span className="ms-dropdown-item-icon"><Icon name="trending" size={18} /></span>
                    <div>
                      <div className="ms-dropdown-item-title">Mood Trends &amp; Patterns</div>
                      <p className="ms-dropdown-item-desc">Weekly emotional charts and progress history</p>
                    </div>
                  </button>
                </div>
              )}
            </li>

            {/* 3. Therapeutic Coping Dropdown */}
            <li className={`ms-nav-item-wrap ${activeDropdown === 'coping' ? 'is-open' : ''}`}>
              <button
                type="button"
                className={`ms-nav-btn ${path === '/mood' && location.state?.scrollTo ? 'is-active' : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'coping' ? null : 'coping')}
                onMouseEnter={() => setActiveDropdown('coping')}
                aria-expanded={activeDropdown === 'coping'}
              >
                <Icon name="award" size={16} />
                <span>Therapeutic Coping</span>
                <span className="ms-chevron">▼</span>
              </button>

              {activeDropdown === 'coping' && (
                <div className="ms-dropdown-pane" onMouseLeave={() => setActiveDropdown(null)}>
                  <button type="button" className="ms-dropdown-item" onClick={() => go('/mood', { tab: 'log', scrollTo: 'sec-3d' })}>
                    <span className="ms-dropdown-item-icon"><Icon name="award" size={18} /></span>
                    <div>
                      <div className="ms-dropdown-item-title">65+ Relaxing Coping Games</div>
                      <p className="ms-dropdown-item-desc">Self-hosted Pop-It, Zen Sand Garden &amp; 3D worlds</p>
                    </div>
                  </button>
                  <button type="button" className="ms-dropdown-item" onClick={() => go('/mood', { tab: 'log', scrollTo: 'sec-library' })}>
                    <span className="ms-dropdown-item-icon"><Icon name="compass" size={18} /></span>
                    <div>
                      <div className="ms-dropdown-item-title">Exercise Library</div>
                      <p className="ms-dropdown-item-desc">Box breathing, grounding and somatic exercises</p>
                    </div>
                  </button>
                  <button type="button" className="ms-dropdown-item" onClick={() => go('/mood', { tab: 'music' })}>
                    <span className="ms-dropdown-item-icon"><Icon name="headphones" size={18} /></span>
                    <div>
                      <div className="ms-dropdown-item-title">Nature Soundscapes</div>
                      <p className="ms-dropdown-item-desc">Binaural waves, rain and calming ambient audio</p>
                    </div>
                  </button>
                </div>
              )}
            </li>

            {/* 4. Counseling & Support Dropdown */}
            <li className={`ms-nav-item-wrap ${activeDropdown === 'support' ? 'is-open' : ''}`}>
              <button
                type="button"
                className={`ms-nav-btn ${path === '/chat' || path === '/booking' || path === '/anonymous-chat' ? 'is-active' : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'support' ? null : 'support')}
                onMouseEnter={() => setActiveDropdown('support')}
                aria-expanded={activeDropdown === 'support'}
              >
                <Icon name="heart" size={16} />
                <span>Counseling &amp; Support</span>
                <span className="ms-chevron">▼</span>
              </button>

              {activeDropdown === 'support' && (
                <div className="ms-dropdown-pane" onMouseLeave={() => setActiveDropdown(null)}>
                  <button type="button" className="ms-dropdown-item" onClick={() => go('/chat')}>
                    <span className="ms-dropdown-item-icon"><Icon name="feather" size={18} /></span>
                    <div>
                      <div className="ms-dropdown-item-title">Talk to Aura AI</div>
                      <p className="ms-dropdown-item-desc">24/7 empathetic conversational companion</p>
                    </div>
                  </button>
                  <button type="button" className="ms-dropdown-item" onClick={() => go('/booking')}>
                    <span className="ms-dropdown-item-icon"><Icon name="calendar" size={18} /></span>
                    <div>
                      <div className="ms-dropdown-item-title">Book Counselor Session</div>
                      <p className="ms-dropdown-item-desc">Free confidential 1-on-1 university appointments</p>
                    </div>
                  </button>
                  <button type="button" className="ms-dropdown-item" onClick={() => go('/anonymous-chat')}>
                    <span className="ms-dropdown-item-icon"><Icon name="users" size={18} /></span>
                    <div>
                      <div className="ms-dropdown-item-title">Anonymous Peer Space</div>
                      <p className="ms-dropdown-item-desc">Encrypted student peer chat under a safe alias</p>
                    </div>
                  </button>
                </div>
              )}
            </li>

            {/* 5. Resources */}
            <li className="ms-nav-item-wrap">
              <button
                type="button"
                className={`ms-nav-btn ${path === '/resources' ? 'is-active' : ''}`}
                onClick={() => go('/resources')}
              >
                <Icon name="book" size={16} />
                <span>Resources</span>
              </button>
            </li>

            {/* 6. Conditional: Apply Counselor (Students) */}
            {user.role === 'student' && (
              <li className="ms-nav-item-wrap">
                <button
                  type="button"
                  className={`ms-nav-btn ${path === '/apply-counselor' ? 'is-active' : ''}`}
                  onClick={() => go('/apply-counselor')}
                >
                  <Icon name="briefcase" size={16} />
                  <span>Apply Counselor</span>
                </button>
              </li>
            )}

            {/* 7. Conditional: Staff Console (Staff & Admins) */}
            {isAdmin && (
              <li className="ms-nav-item-wrap">
                <button
                  type="button"
                  className={`ms-nav-btn ${path === '/admin' ? 'is-active' : ''}`}
                  onClick={() => go('/admin')}
                  style={{ color: 'var(--danger-ink)' }}
                >
                  <Icon name="shield" size={16} />
                  <span>{user.role === 'counsellor' ? 'Staff Console' : 'Admin Console'}</span>
                </button>
              </li>
            )}
          </ul>

          {/* Right Header Controls (Desktop & Mobile) */}
          <div className="ms-nav-right">
            {/* Announcements Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className={`icon-btn ${showNotifications ? 'is-on' : ''}`}
                onClick={toggleNotifications}
                title="System Announcements"
                aria-label="System Announcements"
              >
                <Icon name="bell" size={20} />
                {hasNewNotifications && <span className="badge-dot" />}
              </button>

              {showNotifications && (
                <div className="ms-notif-popover">
                  <div className="popover-head">
                    <div className="row gap-8">
                      <strong className="serif" style={{ fontSize: 16 }}>Announcements</strong>
                      {announcements.length > 0 && (
                        <span className="chip chip-primary" style={{ padding: '2px 8px', fontSize: 11 }}>
                          {announcements.length}
                        </span>
                      )}
                    </div>
                    {announcements.length > 0 && (
                      <button className="btn btn-ghost btn-sm" onClick={markAllAsRead}>Mark read</button>
                    )}
                  </div>
                  <div className="popover-body">
                    {announcements.length === 0 ? (
                      <div className="center" style={{ padding: '28px 16px' }}>
                        <div className="tile tile-lg" style={{ margin: '0 auto 10px' }}><Icon name="bell" size={22} /></div>
                        <strong>No new notifications</strong>
                        <p className="small muted mt-4">You are all caught up with university announcements.</p>
                      </div>
                    ) : (
                      announcements.map((ann) => (
                        <div key={ann._id} className="popover-item">
                          <strong style={{ display: 'block', fontSize: 14, marginBottom: 3 }}>{ann.title}</strong>
                          <p className="small muted" style={{ lineHeight: 1.45, margin: 0 }}>{ann.content}</p>
                          <span className="tiny muted" style={{ display: 'block', marginTop: 6 }}>
                            {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Desktop User Profile Trigger & Dropdown */}
            <div className="ms-desktop-only" style={{ position: 'relative' }}>
              <button
                type="button"
                className="ms-user-trigger"
                onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                aria-label="User profile and settings"
              >
                <span className="avatar avatar-sm">
                  {user.profilePhoto ? <img src={user.profilePhoto} alt="" /> : nameInitial}
                </span>
                <span className="ms-user-name">{user.name}</span>
                <span className="ms-user-role-badge">{user.role}</span>
                <span className="ms-chevron" style={{ fontSize: 9 }}>▼</span>
              </button>

              {activeDropdown === 'user' && (
                <div className="ms-user-dropdown">
                  <div className="ms-user-header">
                    <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{user.name}</strong>
                    <div className="ms-user-email">{user.email}</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ justifyContent: 'flex-start', padding: '8px 10px' }}
                    onClick={() => { setActiveDropdown(null); setIsModalOpen(true); }}
                  >
                    <Icon name="camera" size={15} /> Edit Profile Photo
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-soft btn-sm"
                    style={{ justifyContent: 'flex-start', padding: '8px 10px', marginTop: 4 }}
                    onClick={handleLogout}
                  >
                    <Icon name="logout" size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              className="icon-btn ms-mobile-only"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Icon name="menu" size={22} />
            </button>
          </div>
        </nav>
      </div>

      {/* ---------------- Mobile Slide-Over Drawer Navigation ---------------- */}
      {mobileDrawerOpen && (
        <>
          <div className="side-nav-overlay" onClick={() => setMobileDrawerOpen(false)} />
          <aside className="side-nav-drawer" role="dialog" aria-label="MindSpace Navigation Drawer">
            {/* Drawer Header */}
            <div className="side-nav-brand-header">
              <button
                className="row gap-8"
                style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0, textAlign: 'left' }}
                onClick={() => go('/dashboard')}
                aria-label="MindSpace Home"
              >
                <Logo size={36} />
                <span className="brand-text">
                  <span className="brand-name" style={{ fontSize: 22 }}>MindSpace</span>
                  <span className="brand-tag">STUDENT WELLBEING</span>
                </span>
              </button>
              <button
                type="button"
                className="icon-btn icon-btn-sm"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close Navigation"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="side-nav-user-card">
              <span className="avatar avatar-md">{user.profilePhoto ? <img src={user.profilePhoto} alt="" /> : nameInitial}</span>
              <div className="side-nav-user-meta">
                <strong className="side-nav-user-name">{user.name}</strong>
                <span className="side-nav-user-role">{user.role}</span>
              </div>
              <button className="btn btn-soft btn-sm" onClick={() => { setMobileDrawerOpen(false); setIsModalOpen(true); }}>
                Profile
              </button>
            </div>

            {/* Scrollable Navigation Groups */}
            <div className="side-nav-scroll">
              <div className="side-nav-categories">
                {/* 1. Core Wellbeing */}
                <div className="side-nav-category">
                  <span className="side-nav-category-title">Wellbeing &amp; Mood</span>
                  <div className="col gap-4">
                    <button type="button" className={`side-nav-item ${path === '/dashboard' ? 'is-active' : ''}`} onClick={() => go('/dashboard')}>
                      <span className="side-nav-item-icon tile-primary"><Icon name="home" size={18} /></span>
                      <div className="side-nav-item-body">
                        <div className="side-nav-item-title">Home Dashboard</div>
                        <p className="side-nav-item-desc">Personal sanctuary &amp; daily overview</p>
                      </div>
                    </button>
                    <button type="button" className={`side-nav-item ${path === '/mood' ? 'is-active' : ''}`} onClick={() => go('/mood')}>
                      <span className="side-nav-item-icon tile-sun"><Icon name="smile" size={18} /></span>
                      <div className="side-nav-item-body">
                        <div className="side-nav-item-title">Mood Tracker</div>
                        <p className="side-nav-item-desc">Log feelings &amp; reflection</p>
                      </div>
                    </button>
                    <button type="button" className="side-nav-item" onClick={() => go('/mood', { tab: 'log', scrollTo: 'sec-assessment' })}>
                      <span className="side-nav-item-icon tile-success"><Icon name="activity" size={18} /></span>
                      <div className="side-nav-item-body">
                        <div className="side-nav-item-title">Clinical Assessment</div>
                        <p className="side-nav-item-desc">2-minute wellbeing check-in</p>
                      </div>
                    </button>
                    <button type="button" className="side-nav-item" onClick={() => go('/mood', { tab: 'log', openFaceScanner: true, scrollTo: 'sec-assessment' })}>
                      <span className="side-nav-item-icon tile-dusk"><Icon name="camera" size={18} /></span>
                      <div className="side-nav-item-body">
                        <div className="side-nav-item-title">Facial AI Scanner</div>
                        <p className="side-nav-item-desc">Webcam emotion detection</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Coping & Relief */}
                <div className="side-nav-category">
                  <span className="side-nav-category-title">Therapeutic Coping</span>
                  <div className="col gap-4">
                    <button type="button" className="side-nav-item" onClick={() => go('/mood', { tab: 'log', scrollTo: 'sec-3d' })}>
                      <span className="side-nav-item-icon tile-rose"><Icon name="award" size={18} /></span>
                      <div className="side-nav-item-body">
                        <div className="side-nav-item-title">65+ Relaxing Games</div>
                        <p className="side-nav-item-desc">Pop-It, Sand Garden &amp; 3D zones</p>
                      </div>
                    </button>
                    <button type="button" className="side-nav-item" onClick={() => go('/mood', { tab: 'log', scrollTo: 'sec-library' })}>
                      <span className="side-nav-item-icon tile-success"><Icon name="compass" size={18} /></span>
                      <div className="side-nav-item-body">
                        <div className="side-nav-item-title">Therapeutic Exercises</div>
                        <p className="side-nav-item-desc">Box breathing &amp; grounding</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. Support & Counseling */}
                <div className="side-nav-category">
                  <span className="side-nav-category-title">Counseling &amp; Support</span>
                  <div className="col gap-4">
                    <button type="button" className={`side-nav-item ${path === '/chat' ? 'is-active' : ''}`} onClick={() => go('/chat')}>
                      <span className="side-nav-item-icon tile-dusk"><Icon name="feather" size={18} /></span>
                      <div className="side-nav-item-body">
                        <div className="side-nav-item-title">Talk to Aura AI</div>
                        <p className="side-nav-item-desc">24/7 empathetic listener</p>
                      </div>
                    </button>
                    <button type="button" className={`side-nav-item ${path === '/booking' ? 'is-active' : ''}`} onClick={() => go('/booking')}>
                      <span className="side-nav-item-icon tile-sky"><Icon name="calendar" size={18} /></span>
                      <div className="side-nav-item-body">
                        <div className="side-nav-item-title">Counseling Sessions</div>
                        <p className="side-nav-item-desc">1-on-1 private appointments</p>
                      </div>
                    </button>
                    <button type="button" className={`side-nav-item ${path === '/anonymous-chat' ? 'is-active' : ''}`} onClick={() => go('/anonymous-chat')}>
                      <span className="side-nav-item-icon tile-primary"><Icon name="users" size={18} /></span>
                      <div className="side-nav-item-body">
                        <div className="side-nav-item-title">Anonymous Peer Space</div>
                        <p className="side-nav-item-desc">Safe peer conversations</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 4. Resources & Administration */}
                <div className="side-nav-category">
                  <span className="side-nav-category-title">More Services</span>
                  <div className="col gap-4">
                    <button type="button" className={`side-nav-item ${path === '/resources' ? 'is-active' : ''}`} onClick={() => go('/resources')}>
                      <span className="side-nav-item-icon tile-sun"><Icon name="book" size={18} /></span>
                      <div className="side-nav-item-body">
                        <div className="side-nav-item-title">Resources &amp; Audio</div>
                        <p className="side-nav-item-desc">Self-help articles and guides</p>
                      </div>
                    </button>
                    {user.role === 'student' && (
                      <button type="button" className={`side-nav-item ${path === '/apply-counselor' ? 'is-active' : ''}`} onClick={() => go('/apply-counselor')}>
                        <span className="side-nav-item-icon tile-primary"><Icon name="briefcase" size={18} /></span>
                        <div className="side-nav-item-body">
                          <div className="side-nav-item-title">Apply as Counselor</div>
                          <p className="side-nav-item-desc">Join our student support team</p>
                        </div>
                      </button>
                    )}
                    {isAdmin && (
                      <button type="button" className={`side-nav-item ${path === '/admin' ? 'is-active' : ''}`} onClick={() => go('/admin')}>
                        <span className="side-nav-item-icon tile-danger"><Icon name="shield" size={18} /></span>
                        <div className="side-nav-item-body">
                          <div className="side-nav-item-title">{user.role === 'counsellor' ? 'Staff Console' : 'Admin Console'}</div>
                          <p className="side-nav-item-desc">Manage student bookings and appointments</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Emergency Crisis Helplines Panel */}
                <div className="side-nav-helplines">
                  <div className="side-nav-helplines-head">
                    <span className="tile tile-sm tile-danger"><Icon name="phone" size={14} /></span>
                    <div>
                      <strong style={{ fontSize: 13, display: 'block', color: 'var(--danger-ink)' }}>24/7 Free Crisis Helplines</strong>
                      <span className="tiny muted">National emergency assistance across Sri Lanka</span>
                    </div>
                  </div>
                  <div className="side-nav-helpline-grid">
                    <a href="tel:1926" className="side-nav-helpline-chip">
                      <strong>1926</strong>
                      <span>NIMH Hotline</span>
                    </a>
                    <a href="tel:1990" className="side-nav-helpline-chip">
                      <strong>1990</strong>
                      <span>Ambulance</span>
                    </a>
                    <a href="tel:1333" className="side-nav-helpline-chip">
                      <strong>1333</strong>
                      <span>CCCline</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="side-nav-footer">
              <ThemeToggle />
              <button type="button" className="btn btn-danger-soft btn-sm" onClick={handleLogout}>
                <Icon name="logout" size={16} /> Sign Out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ---------------- Mobile Bottom Quick Tabbar (Sticky Thumb Access) ---------------- */}
      <nav className="tabbar ms-mobile-only" aria-label="Quick Mobile Navigation">
        {tabs.map((t) => (
          <button
            key={t.to}
            type="button"
            className={`tab-item ${isTabActive(t.to) ? 'is-active' : ''}`}
            onClick={() => go(t.to)}
            aria-current={isTabActive(t.to) ? 'page' : undefined}
          >
            <span className="pill"><Icon name={t.icon} size={20} /></span>
            {t.label}
          </button>
        ))}
        <button
          type="button"
          className={`tab-item ${mobileDrawerOpen ? 'is-active' : ''}`}
          onClick={() => setMobileDrawerOpen(true)}
          aria-label="Open Full Navigation Menu"
        >
          <span className="pill"><Icon name="grid" size={20} /></span>
          Menu
        </button>
      </nav>

      {/* ---------------- Profile Settings Modal ---------------- */}
      {isModalOpen && (
        <div className="overlay" onClick={() => { setIsModalOpen(false); setMessage({ text: '', type: '' }); }}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="My Profile">
            <button
              type="button"
              className="modal-close"
              aria-label="Close"
              onClick={() => { setIsModalOpen(false); setMessage({ text: '', type: '' }); }}
            >
              <Icon name="x" size={18} />
            </button>
            <h3 className="h-title" style={{ fontSize: 24, margin: '0 0 4px' }}>Profile Settings</h3>
            <p className="muted small" style={{ margin: 0 }}>Update your student profile photo and details</p>

            {message.text && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mt-16`}>
                <Icon name={message.type === 'success' ? 'checkCircle' : 'alert'} size={18} />
                <span>{message.text}</span>
              </div>
            )}

            <div className="center mt-20">
              <div className="avatar avatar-lg" style={{ margin: '0 auto', width: 104, height: 104, fontSize: 38 }}>
                {profilePhoto ? <img src={profilePhoto} alt="Profile" /> : nameInitial}
              </div>
              <label className="btn btn-soft btn-sm mt-16" style={{ cursor: 'pointer' }}>
                <Icon name="camera" size={16} /> Choose Photo
                <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
              <p className="tiny muted mt-6">JPG or PNG, up to 2MB</p>
            </div>

            <div className="card card-soft card-pad-sm mt-20 col gap-8">
              <div className="row-between small"><span className="muted">Name</span><strong>{user.name}</strong></div>
              <div className="row-between small"><span className="muted">Email</span><strong style={{ wordBreak: 'break-all', textAlign: 'right' }}>{user.email}</strong></div>
              <div className="row-between small"><span className="muted">Role</span><strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{user.role}</strong></div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg btn-block mt-20"
              onClick={handleSaveProfile}
              disabled={uploading}
            >
              {uploading ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-block mt-8"
              onClick={handleLogout}
            >
              <Icon name="logout" size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  )
}
