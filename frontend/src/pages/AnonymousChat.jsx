import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import io from 'socket.io-client'
import axios from 'axios'
import API_URL from '../config'

const animalAliases = [
  'Calm Panda', 'Serene Owl', 'Joyful Dolphin', 'Mindful Koala', 
  'Peaceful Deer', 'Happy Otter', 'Gentle Rabbit', 'Brave Badger', 
  'Patient Turtle', 'Wise Fox', 'Friendly Squirrel', 'Relaxed Sloth'
]

export default function AnonymousChat() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'peer') // 'peer' or 'admin'
  const [user, setUser] = useState(null)
  
  // Peer Chat Matchmaking states
  const [peerMessages, setPeerMessages] = useState([])
  const [peerInput, setPeerInput] = useState('')
  const [alias, setAlias] = useState('')
  const [chatStatus, setChatStatus] = useState('idle') // 'idle', 'searching', 'connected', 'disconnected'
  const [currentPeerRoom, setCurrentPeerRoom] = useState('')
  const [peerPartnerAlias, setPeerPartnerAlias] = useState('')
  
  // Admin Support states
  const [adminMessages, setAdminMessages] = useState([])
  const [adminInput, setAdminInput] = useState('')
  
  const socketRef = useRef(null)
  const chatEndRef = useRef(null)

  const token = localStorage.getItem('token')

  useEffect(() => {
    // Retrieve logged-in user profile
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    // Set or generate random animal alias for peer chat
    let savedAlias = localStorage.getItem('peer_alias')
    if (!savedAlias) {
      savedAlias = animalAliases[Math.floor(Math.random() * animalAliases.length)]
      localStorage.setItem('peer_alias', savedAlias)
    }
    setAlias(savedAlias)

    // Connect to Socket.IO Server
    socketRef.current = io(API_URL)

    // Fetch message histories
    fetchAdminHistory()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  // Join admin support room and peer matchmaking event listeners
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !user) return

    socket.emit('join_room', `admin-support-${user.id || user._id}`)

    // Handle matchmaking matched
    socket.on('peer_matched', (data) => {
      const { room, peers } = data
      // Determine the partner's alias
      const socketIds = Object.keys(peers)
      const myId = socket.id
      const partnerSocketId = socketIds.find(id => id !== myId)
      const partnerAlias = peers[partnerSocketId] || 'Supportive Peer'

      setCurrentPeerRoom(room)
      setPeerPartnerAlias(partnerAlias)
      setPeerMessages([]) // Reset peer message list for fresh match
      setChatStatus('connected')
    })

    // Handle peer disconnected
    socket.on('peer_disconnected', () => {
      setChatStatus('disconnected')
    })

    return () => {
      socket.off('peer_matched')
      socket.off('peer_disconnected')
    }
  }, [user, alias])

  // Handle live message receipt (refreshed when peer room ID changes)
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !user) return

    socket.on('receive_message', (msg) => {
      if (currentPeerRoom && msg.room === currentPeerRoom) {
        setPeerMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      } else if (msg.room === `admin-support-${user.id || user._id}`) {
        setAdminMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      }
    })

    return () => {
      socket.off('receive_message')
    }
  }, [user, currentPeerRoom])

  // Scroll to bottom when tab or messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [peerMessages, adminMessages, activeTab])

  const fetchAdminHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/messages/admin-support`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAdminMessages(res.data)
    } catch (err) {
      console.error('Error fetching support history:', err)
    }
  }

  // --- Peer Chat Matchmaking Handlers ---
  const handleFindPeer = () => {
    if (!socketRef.current || !user) return
    setChatStatus('searching')
    socketRef.current.emit('join_queue', {
      userId: user.id || user._id,
      alias: alias
    })
  }

  const handleCancelSearch = () => {
    if (!socketRef.current) return
    setChatStatus('idle')
    socketRef.current.emit('leave_queue')
  }

  const handleLeaveChat = () => {
    if (!socketRef.current) return
    if (window.confirm('Are you sure you want to end this peer chat session?')) {
      socketRef.current.emit('leave_chat')
      setChatStatus('idle')
      setCurrentPeerRoom('')
      setPeerPartnerAlias('')
      setPeerMessages([])
    }
  }

  const handleResetToIdle = () => {
    setChatStatus('idle')
    setCurrentPeerRoom('')
    setPeerPartnerAlias('')
    setPeerMessages([])
  }

  const handleSendPeer = (e) => {
    e.preventDefault()
    if (!peerInput.trim() || !socketRef.current || !user || !currentPeerRoom) return

    socketRef.current.emit('send_message', {
      sender: user.id || user._id,
      receiver: null,
      text: peerInput.trim(),
      room: currentPeerRoom,
      senderName: alias
    })
    setPeerInput('')
  }

  const handleSendAdmin = (e) => {
    e.preventDefault()
    if (!adminInput.trim() || !socketRef.current || !user) return

    socketRef.current.emit('send_message', {
      sender: user.id || user._id,
      receiver: null, // Admin
      text: adminInput.trim(),
      room: `admin-support-${user.id || user._id}`,
      senderName: user.name
    })
    setAdminInput('')
  }

  const changeAlias = () => {
    if (chatStatus !== 'idle') return // Do not allow changing name during search/chat
    const newAlias = animalAliases[Math.floor(Math.random() * animalAliases.length)]
    localStorage.setItem('peer_alias', newAlias)
    setAlias(newAlias)
  }

  const isPeer = activeTab === 'peer'
  const canType = (isPeer && chatStatus === 'connected') || !isPeer

  return (
    <div className="chat-page">
      <section className="chat-card">
        {/* Tabs */}
        <div className="chat-head" style={{ padding: '14px 18px' }}>
          <div className="seg" role="tablist" style={{ width: '100%' }}>
            <button role="tab" aria-selected={isPeer} className={`seg-btn grow ${isPeer ? 'is-active' : ''}`} onClick={() => setActiveTab('peer')}>
              <Icon name="users" size={17} /> Peer support
            </button>
            <button role="tab" aria-selected={!isPeer} className={`seg-btn grow ${!isPeer ? 'is-active' : ''}`} onClick={() => setActiveTab('admin')}>
              <Icon name="shield" size={17} /> Counselor &amp; admin
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="peer-status">
          {isPeer ? (
            chatStatus === 'idle' ? (
              <>
                <span className="row gap-8 small"><Icon name="user" size={16} /> Your pseudonym: <strong>{alias}</strong></span>
                <button className="btn btn-ghost btn-sm" onClick={changeAlias}><Icon name="refresh" size={15} /> Change</button>
              </>
            ) : chatStatus === 'searching' ? (
              <>
                <span className="row gap-8 small"><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Searching for a peer…</span>
                <button className="btn btn-danger-soft btn-sm" onClick={handleCancelSearch}>Cancel search</button>
              </>
            ) : chatStatus === 'connected' ? (
              <>
                <span className="row gap-8 small"><span className="dot" style={{ color: 'var(--success)' }} /> Connected with <strong style={{ color: 'var(--success-ink)' }}>{peerPartnerAlias}</strong><span className="muted">· you are {alias}</span></span>
                <button className="btn btn-danger-soft btn-sm" onClick={handleLeaveChat}>Leave chat</button>
              </>
            ) : (
              <>
                <span className="row gap-8 small"><span className="dot" style={{ color: 'var(--danger)' }} /> Peer disconnected</span>
                <button className="btn btn-primary btn-sm" onClick={handleResetToIdle}><Icon name="refresh" size={15} /> Find new peer</button>
              </>
            )
          ) : (
            <span className="row gap-8 small"><Icon name="lock" size={15} /> Private conversation with our counselors &amp; administrators</span>
          )}
        </div>

        {/* Messages */}
        <div className="chat-scroll">
          {isPeer ? (
            chatStatus === 'idle' ? (
              <div className="peer-hero">
                <div className="tile tile-lg tile-sky" style={{ width: 76, height: 76, borderRadius: 26 }}><Icon name="users" size={34} /></div>
                <h2 className="h-title">1-to-1 anonymous peer support</h2>
                <p className="muted" style={{ maxWidth: 480 }}>
                  Connect anonymously with another student to chat, share thoughts, or offer support.
                  Your identity is fully protected behind your animal alias <strong style={{ color: 'var(--ink)' }}>({alias})</strong>.
                </p>
                <button className="btn btn-primary btn-lg" onClick={handleFindPeer}><Icon name="search" size={18} /> Find a peer to talk to</button>
                <div className="row-wrap" style={{ justifyContent: 'center' }}>
                  <span className="chip"><Icon name="lock" size={13} /> Anonymous</span>
                  <span className="chip"><Icon name="heart" size={13} /> Judgement-free</span>
                  <span className="chip"><Icon name="shield" size={13} /> Moderated</span>
                </div>
              </div>
            ) : chatStatus === 'searching' ? (
              <div className="peer-hero">
                <div className="searching"><i /><i /><i /><span className="tile tile-lg" style={{ borderRadius: '50%', width: 64, height: 64, position: 'relative' }}><Icon name="users" size={28} /></span></div>
                <h2 className="h-title" style={{ fontSize: 24 }}>Finding a peer…</h2>
                <p className="muted" style={{ maxWidth: 420 }}>We are looking for another online student to pair you with. This might take a moment.</p>
              </div>
            ) : (
              <>
                {peerMessages.length === 0 ? (
                  <p className="muted center" style={{ padding: 40, fontStyle: 'italic' }}>Connected! Say hi to your peer and start the conversation.</p>
                ) : (
                  peerMessages.map((msg, index) => {
                    const isOwnMessage = msg.sender === user?.id || msg.sender?._id === user?.id || msg.senderName === alias
                    return (
                      <div key={msg._id || index} className={`msg ${isOwnMessage ? 'msg-user' : 'msg-ai'}`}>
                        {!isOwnMessage && <div className="tiny strong" style={{ color: 'var(--primary)', marginBottom: 3 }}>{msg.senderName}</div>}
                        {msg.text}
                      </div>
                    )
                  })
                )}
                {chatStatus === 'disconnected' && (
                  <div className="alert alert-info" style={{ alignSelf: 'center' }}>
                    <Icon name="info" size={18} /> <span>The peer has disconnected from this session. Choose &ldquo;Find new peer&rdquo; above to match again.</span>
                  </div>
                )}
              </>
            )
          ) : adminMessages.length === 0 ? (
            <div className="peer-hero">
              <div className="tile tile-lg tile-rose" style={{ width: 76, height: 76, borderRadius: 26 }}><Icon name="message" size={32} /></div>
              <p className="muted" style={{ maxWidth: 420 }}>Send a message below to contact a counsellor or administrator privately.</p>
            </div>
          ) : (
            adminMessages.map((msg, index) => {
              const currentUserId = user?.id || user?._id
              const messageSenderId = msg.sender?._id || msg.sender
              const isOwnMessage = currentUserId && messageSenderId && (messageSenderId.toString() === currentUserId.toString())
              const senderRole = msg.sender?.role || (isOwnMessage ? 'student' : 'admin')
              return (
                <div key={msg._id || index} className={`msg ${isOwnMessage ? 'msg-user' : 'msg-ai'}`}>
                  <div className="tiny strong" style={{ opacity: 0.8, marginBottom: 3, letterSpacing: '0.04em' }}>
                    {isOwnMessage ? 'You' : `${msg.senderName || 'Staff Member'} · ${senderRole.toUpperCase()}`}
                  </div>
                  {msg.text}
                </div>
              )
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Composer */}
        {canType && (!isPeer || chatStatus === 'connected') && (
          <form className="chat-composer" onSubmit={isPeer ? handleSendPeer : handleSendAdmin} style={{ paddingBottom: 16 }}>
            <input
              className="chat-input"
              value={isPeer ? peerInput : adminInput}
              onChange={e => isPeer ? setPeerInput(e.target.value) : setAdminInput(e.target.value)}
              placeholder={isPeer ? `Send a supportive message to ${peerPartnerAlias} anonymously…` : 'Type your message to staff here…'}
            />
            <button type="submit" className="btn btn-primary btn-icon" disabled={!(isPeer ? peerInput : adminInput).trim()} aria-label="Send"><Icon name="send" size={19} /></button>
          </form>
        )}
      </section>
    </div>
  )
}
