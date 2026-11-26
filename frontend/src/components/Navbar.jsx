import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import ThemeToggle from './ThemeToggle'
import Icon from './ui/Icon'
import { Logo } from './ui/Brand'

/**
 * App chrome. Renders:
 *  - desktop: a side rail (icon-only on tablets)
 *  - mobile: a slim top bar + bottom tab bar + "More" sheet
 * Notifications (announcements), profile photo, theme and logout all live here.
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
  const [moreOpen, setMoreOpen] = useState(false)
  const railBellRef = useRef(null)
  const topBellRef = useRef(null)

  const token = localStorage.getItem('token')

  // Load the signed-in user (re-read on navigation + after the profile modal closes)
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

  useEffect(() => {
    setMoreOpen(false)
    setShowNotifications(false)
  }, [location.pathname])

  // Allow other components (e.g. Mobile Home helper) to trigger opening the navigation drawer
  useEffect(() => {
    const handleOpenMobileNav = () => setMoreOpen(true)
    window.addEventListener('open-mobile-nav', handleOpenMobileNav)
    return () => window.removeEventListener('open-mobile-nav', handleOpenMobileNav)
  }, [])

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

  // Close the notification popover when clicking elsewhere
  useEffect(() => {
    function handleClickOutside(event) {
      const inRail = railBellRef.current && railBellRef.current.contains(event.target)
      const inTop = topBellRef.current && topBellRef.current.contains(event.target)
      if (!inRail && !inTop) setShowNotifications(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const groups = [
    {
      label: 'Today',
      items: [
        { to: '/dashboard', icon: 'home', label: 'Home' },
        { to: '/mood', icon: 'smile', label: 'Mood' }
      ]
    },
    {
      label: 'Support',
      items: [
        { to: '/chat', icon: 'feather', label: 'AI Aura' },
        { to: '/anonymous-chat', icon: 'users', label: 'Peer Chat' },
        { to: '/booking', icon: 'calendar', label: 'Bookings' }
      ]
    },
    {
      label: 'Grow',
      items: [
        { to: '/resources', icon: 'book', label: 'Resources' },
        ...(user.role === 'student' ? [{ to: '/apply-counselor', icon: 'briefcase', label: 'Apply as Counselor' }] : []),
        ...(isAdmin ? [{ to: '/admin', icon: 'shield', label: user.role === 'counsellor' ? 'Counsellor Console' : 'Admin Console' }] : [])
      ]
    }
  ]

  const go = (to, state) => { setMoreOpen(false); navigate(to, { state }) }

  const tabs = [
    { to: '/dashboard', icon: 'home', label: 'Home' },
    { to: '/mood', icon: 'smile', label: 'Mood' },
    { to: '/chat', icon: 'feather', label: 'Aura' },
    { to: '/booking', icon: 'calendar', label: 'Sessions' }
  ]
  const moreActive = !tabs.some(t => t.to === path) && path !== '/'

  const mobileNavCategories = [
    {
      title: 'Mood & Wellbeing Tracking',
      items: [
        {
          label: 'Mood Tracker',
          desc: 'Emotion logs, triggers & weekly patterns',
          icon: 'smile',
          to: '/mood',
          state: { tab: 'log' },
          tileClass: 'tile-sun',
          badge: null
        },
        {
          label: 'Daily Wellbeing Assessment',
          desc: '2-minute clinical check-in & personalized pulse',
          icon: 'activity',
          to: '/mood',
          state: { tab: 'log', scrollTo: 'sec-assessment' },
          tileClass: 'tile-primary',
          badge: 'Daily'
        },
        {
          label: 'Mood Analytics & Trends',
          desc: 'Trigger breakdown & weekly charts',
          icon: 'trending',
          to: '/mood',
          state: { tab: 'analytics' },
          tileClass: 'tile-sky',
          badge: null
        }
      ]
    },
    {
      title: 'Therapeutic Coping & Exercises',
      items: [
        {
          label: 'Therapeutic Exercise Library',
          desc: 'Guided breathing, somatic calming & audio guides',
          icon: 'compass',
          to: '/mood',
          state: { tab: 'log', scrollTo: 'sec-library' },
          tileClass: 'tile-success',
          badge: 'Coping'
        },
        {
          label: 'Relaxation Games',
          desc: '65+ ASMR, tactile bubble wrap & 3D WebGL scenes',
          icon: 'award',
          to: '/mood',
          state: { tab: 'log', scrollTo: 'sec-3d' },
          tileClass: 'tile-rose',
          badge: '65+ Games'
        },
        {
          label: 'Calming Soundscapes',
          desc: 'Nature ambience, binaural beats & focus audio',
          icon: 'headphones',
          to: '/mood',
          state: { tab: 'music' },
          tileClass: 'tile-dusk',
          badge: 'Audio'
        }
      ]
    },
    {
      title: 'Support & Counseling',
      items: [
        {
          label: 'Aura AI Chatbot',
          desc: '24/7 empathetic listener in English & Sinhala',
          icon: 'feather',
          to: '/chat',
          tileClass: 'tile-dusk',
          badge: '24/7 AI'
        },
        {
          label: 'Anonymous Peer Space',
          desc: 'Safe student discussion with encrypted aliases',
          icon: 'users',
          to: '/anonymous-chat',
          tileClass: 'tile-sky',
          badge: 'Encrypted'
        },
        {
          label: 'Counseling Appointments',
          desc: '1-on-1 private appointments with campus psychologists',
          icon: 'calendar',
          to: '/booking',
          tileClass: 'tile-rose',
          badge: 'Free'
        }
      ]
    },
    {
      title: 'Resources & Campus Portal',
      items: [
        {
          label: 'Wellbeing Resources & Articles',
          desc: 'Clinical guides, stress reduction & self-help',
          icon: 'book',
          to: '/resources',
          tileClass: 'tile-primary',
          badge: null
        },
        ...(user.role === 'student' ? [{
          label: 'Apply as Peer Counselor',
          desc: 'Join the campus student mental health support team',
          icon: 'briefcase',
          to: '/apply-counselor',
          tileClass: 'tile-sun',
          badge: null
        }] : []),
        ...(isAdmin ? [{
          label: user.role === 'counsellor' ? 'Counsellor Console' : 'Admin Console',
          desc: 'Manage appointments, analytics & student sessions',
          icon: 'shield',
          to: '/admin',
          tileClass: 'tile-danger',
          badge: 'Staff'
        }] : [])
      ]
    }
  ]

  const notificationsPanel = showNotifications && (
    <div className="popover" role="dialog" aria-label="Announcements">
      <div className="popover-head">
        <div className="row gap-8">
          <strong className="serif" style={{ fontSize: 17 }}>Announcements</strong>
          {announcements.length > 0 && <span className="chip chip-primary" style={{ padding: '2px 9px' }}>{announcements.length}</span>}
        </div>
        {announcements.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllAsRead}>Mark read</button>
        )}
      </div>
      <div className="popover-body">
        {announcements.length === 0 ? (
          <div className="center" style={{ padding: '36px 20px' }}>
            <div className="tile tile-lg" style={{ margin: '0 auto 12px' }}><Icon name="bell" size={24} /></div>
            <strong>You're all caught up</strong>
            <p className="small muted mt-8">No active system announcements right now.</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann._id} className="popover-item">
              <strong style={{ display: 'block', fontSize: 14.5, marginBottom: 4 }}>{ann.title}</strong>
              <p className="small muted" style={{ lineHeight: 1.5 }}>{ann.content}</p>
              <span className="tiny muted" style={{ display: 'block', marginTop: 8 }}>
                {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const helpCard = (
    <div className="rail-help">
      <strong>Need someone now?</strong>
      <p>You don't have to carry this alone. Reach our staff, or call the 24/7 national helpline.</p>
      <div className="col gap-8">
        <button className="btn btn-primary btn-sm btn-block" onClick={() => go('/anonymous-chat')}>
          <Icon name="message" size={16} /> Message staff
        </button>
        <a className="btn btn-outline btn-sm btn-block" href="tel:1926">
          <Icon name="phone" size={16} /> Call 1926
        </a>
      </div>
    </div>
  )

  return (
    <>
      {/* ---------------- Desktop / tablet rail ---------------- */}
      <aside className="rail" aria-label="Primary">
        <button className="rail-brand" onClick={() => navigate('/dashboard')} aria-label="MindSpace home">
          <Logo size={42} />
          <span className="brand-text">
            <span className="brand-name">MindSpace</span>
            <span className="brand-tag">STUDENT WELLBEING</span>
          </span>
        </button>

        <nav className="rail-scroll">
          {groups.map(g => (
            <div className="rail-group" key={g.label}>
              <div className="rail-label">{g.label}</div>
              {g.items.map(item => (
                <button
                  key={item.to}
                  className={`nav-item ${path === item.to ? 'is-active' : ''}`}
                  onClick={() => go(item.to)}
                  title={item.label}
                  aria-current={path === item.to ? 'page' : undefined}
                >
                  <Icon name={item.icon} size={20} />
                  <span className="nav-text">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {helpCard}

        <div className="rail-foot">
          <a className="icon-btn rail-sos" href="tel:1926" title="Need help now? Call 1926 (24/7)" aria-label="Call the 1926 helpline">
            <Icon name="phone" size={19} />
          </a>
          <button className="rail-user" onClick={() => setIsModalOpen(true)} title="Profile settings">
            <span className="avatar">
              {user.profilePhoto ? <img src={user.profilePhoto} alt="" /> : nameInitial}
            </span>
            <span className="rail-user-meta" style={{ minWidth: 0 }}>
              <span className="rail-user-name" style={{ display: 'block' }}>{user.name}</span>
              <span className="rail-user-role">{user.role}</span>
            </span>
          </button>
          <div ref={railBellRef} style={{ position: 'relative' }}>
            <button className={`icon-btn ${showNotifications ? 'is-on' : ''}`} onClick={toggleNotifications} title="Announcements" aria-label="Announcements">
              <Icon name="bell" size={20} />
              {hasNewNotifications && <span className="badge-dot" />}
            </button>
            {showNotifications && (
              <div className="only-desktop" style={{ position: 'absolute', left: 'calc(100% + 14px)', bottom: -6 }}>
                {notificationsPanel}
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>
      </aside>

      {/* ---------------- Mobile top bar ---------------- */}
      <header className="topbar">
        <div className="row gap-8" style={{ alignItems: 'center' }}>
          <button
            className="icon-btn mobile-menu-btn"
            onClick={() => setMoreOpen(true)}
            title="Open side navigation bar"
            aria-label="Open side navigation bar"
          >
            <Icon name="menu" size={22} />
          </button>
          <button className="row gap-8" style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0 }} onClick={() => navigate('/dashboard')} aria-label="MindSpace home">
            <Logo size={32} />
            <span className="brand-name" style={{ fontSize: 20 }}>MindSpace</span>
          </button>
        </div>
        <div className="row gap-4" style={{ alignItems: 'center' }}>
          <ThemeToggle />
          <div ref={topBellRef}>
            <button className={`icon-btn ${showNotifications ? 'is-on' : ''}`} onClick={toggleNotifications} aria-label="Announcements">
              <Icon name="bell" size={19} />
              {hasNewNotifications && <span className="badge-dot" />}
            </button>
            <div className="only-mobile">{notificationsPanel}</div>
          </div>
          <button className="avatar avatar-sm" style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(true)} aria-label="Profile settings">
            {user.profilePhoto ? <img src={user.profilePhoto} alt="" /> : nameInitial}
          </button>
        </div>
      </header>

      {/* ---------------- Mobile tab bar ---------------- */}
      <nav className="tabbar" aria-label="Primary">
        {tabs.map(t => (
          <button key={t.to} className={`tab-item ${path === t.to ? 'is-active' : ''}`} onClick={() => go(t.to)} aria-current={path === t.to ? 'page' : undefined}>
            <span className="pill"><Icon name={t.icon} size={21} /></span>
            {t.label}
          </button>
        ))}
        <button className={`tab-item ${moreActive || moreOpen ? 'is-active' : ''}`} onClick={() => setMoreOpen(true)}>
          <span className="pill"><Icon name="grid" size={21} /></span>
          Menu
        </button>
      </nav>

      {/* ---------------- Mobile Side Navigation Bar Drawer ---------------- */}
      {moreOpen && (
        <>
          <div className="side-nav-overlay" onClick={() => setMoreOpen(false)} />
          <aside className="side-nav-drawer" role="dialog" aria-label="MindSpace Side Navigation Bar">
            {/* Brand Header */}
            <div className="side-nav-brand-header">
              <button
                className="row gap-8"
                style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0, textAlign: 'left' }}
                onClick={() => go('/dashboard')}
                aria-label="MindSpace home"
              >
                <Logo size={36} />
                <span className="brand-text">
                  <span className="brand-name" style={{ fontSize: 22 }}>MindSpace</span>
                  <span className="brand-tag">STUDENT WELLBEING</span>
                </span>
              </button>
              <button className="icon-btn icon-btn-sm" onClick={() => setMoreOpen(false)} aria-label="Close side navigation bar">
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
              <button className="btn btn-soft btn-sm" onClick={() => { setMoreOpen(false); setIsModalOpen(true) }}>
                Profile
              </button>
            </div>

            {/* Scrollable Navigation Groups */}
            <div className="side-nav-scroll">
              <div className="side-nav-categories">
                {mobileNavCategories.map((cat) => (
                  <div className="side-nav-category" key={cat.title}>
                    <span className="side-nav-category-title">{cat.title}</span>
                    <div className="col gap-4">
                      {cat.items.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          className={`side-nav-item ${path === item.to ? 'is-active' : ''}`}
                          onClick={() => go(item.to, item.state)}
                        >
                          <span className={`side-nav-item-icon ${item.tileClass}`}>
                            <Icon name={item.icon} size={18} />
                          </span>
                          <div className="side-nav-item-body">
                            <div className="side-nav-item-top">
                              <span className="side-nav-item-title">{item.label}</span>
                              {item.badge && <span className="side-nav-item-badge">{item.badge}</span>}
                            </div>
                            <p className="side-nav-item-desc">{item.desc}</p>
                          </div>
                          <span className="side-nav-item-arrow"><Icon name="chevronRight" size={15} /></span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* 24/7 Immediate Emergency Helplines Section */}
                <div className="side-nav-helplines">
                  <div className="side-nav-helplines-head">
                    <span className="tile tile-sm tile-danger"><Icon name="phone" size={14} /></span>
                    <div>
                      <strong style={{ fontSize: 13, display: 'block', color: 'var(--danger-ink)' }}>24/7 Free Crisis Helplines</strong>
                      <span className="tiny muted">Confidential assistance available anytime in Sri Lanka</span>
                    </div>
                  </div>
                  <div className="side-nav-helpline-grid">
                    <a href="tel:1926" className="side-nav-helpline-chip">
                      <strong>1926</strong>
                      <span>NIMH Mental</span>
                    </a>
                    <a href="tel:1990" className="side-nav-helpline-chip">
                      <strong>1990</strong>
                      <span>Suwaseriya</span>
                    </a>
                    <a href="tel:1333" className="side-nav-helpline-chip">
                      <strong>1333</strong>
                      <span>CCCline</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer: Theme & Logout */}
            <div className="side-nav-footer">
              <ThemeToggle />
              <button className="btn btn-danger-soft btn-sm" onClick={() => { setMoreOpen(false); handleLogout() }}>
                <Icon name="logout" size={16} /> Log out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ---------------- Profile modal ---------------- */}
      {isModalOpen && (
        <div className="overlay" onClick={() => { setIsModalOpen(false); setMessage({ text: '', type: '' }) }}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()} role="dialog" aria-label="My profile">
            <button className="modal-close" aria-label="Close" onClick={() => { setIsModalOpen(false); setMessage({ text: '', type: '' }) }}>
              <Icon name="x" size={18} />
            </button>
            <h3 className="h-title" style={{ fontSize: 26 }}>My profile</h3>
            <p className="muted small mt-8">Update your profile photo</p>

            {message.text && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mt-16`}>
                <Icon name={message.type === 'success' ? 'checkCircle' : 'alert'} size={18} />
                <span>{message.text}</span>
              </div>
            )}

            <div className="center mt-24">
              <div className="avatar avatar-lg" style={{ margin: '0 auto', width: 112, height: 112, fontSize: 40 }}>
                {profilePhoto ? <img src={profilePhoto} alt="Profile" /> : nameInitial}
              </div>
              <label className="btn btn-soft btn-sm mt-16" style={{ cursor: 'pointer' }}>
                <Icon name="camera" size={16} /> Choose photo
                <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
              <p className="tiny muted mt-8">JPG or PNG, up to 2MB</p>
            </div>

            <div className="card card-soft card-pad-sm mt-24 col gap-8">
              <div className="row-between small"><span className="muted">Name</span><strong>{user.name}</strong></div>
              <div className="row-between small"><span className="muted">Email</span><strong style={{ wordBreak: 'break-all', textAlign: 'right' }}>{user.email}</strong></div>
              <div className="row-between small"><span className="muted">Role</span><strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{user.role}</strong></div>
            </div>

            <button className="btn btn-primary btn-lg btn-block mt-24" onClick={handleSaveProfile} disabled={uploading}>
              {uploading ? 'Saving…' : 'Save profile photo'}
            </button>
            <button className="btn btn-ghost btn-block mt-8" onClick={handleLogout}>
              <Icon name="logout" size={17} /> Log out
            </button>
          </div>
        </div>
      )}
    </>
  )
}
