import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
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

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <Navbar />

      {/* Main Chat Layout */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '30px 20px', boxSizing: 'border-box' }}>
        <div style={{ background: 'white', borderRadius: '24px', maxWidth: '850px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Tabs header */}
          <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
            <button 
              onClick={() => setActiveTab('peer')} 
              style={{
                flex: 1,
                padding: '18px 24px',
                border: 'none',
                background: activeTab === 'peer' ? 'white' : 'transparent',
                color: activeTab === 'peer' ? '#4f46e5' : '#6b7280',
                borderBottom: activeTab === 'peer' ? '3px solid #4f46e5' : 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '15px'
              }}
            >
              👥 Anonymous Peer Support Room
            </button>
            <button 
              onClick={() => setActiveTab('admin')} 
              style={{
                flex: 1,
                padding: '18px 24px',
                border: 'none',
                background: activeTab === 'admin' ? 'white' : 'transparent',
                color: activeTab === 'admin' ? '#4f46e5' : '#6b7280',
                borderBottom: activeTab === 'admin' ? '3px solid #4f46e5' : 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '15px'
              }}
            >
              💬 Contact Admin / Counsellor
            </button>
          </div>

          {/* Active Status Info Bar */}
          {activeTab === 'peer' ? (
            chatStatus === 'idle' ? (
              <div style={{ background: 'rgba(79, 70, 229, 0.05)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f0f7' }}>
                <span style={{ fontSize: '13px', color: '#4b5563' }}>
                  👤 Your pseudonym is: <strong>{alias}</strong>
                </span>
                <button 
                  onClick={changeAlias} 
                  style={{ padding: '6px 12px', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '12px', color: '#4b5563', cursor: 'pointer', fontWeight: '500' }}
                >
                  🔄 Change Name
                </button>
              </div>
            ) : chatStatus === 'searching' ? (
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f0f7' }}>
                <span style={{ fontSize: '13px', color: '#b45309', fontWeight: '500' }}>
                  🔍 Searching for a peer to pair you with...
                </span>
                <button 
                  onClick={handleCancelSearch} 
                  style={{ padding: '6px 12px', background: '#4b5563', border: 'none', borderRadius: '8px', fontSize: '12px', color: 'white', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel Search
                </button>
              </div>
            ) : chatStatus === 'connected' ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eef7f2' }}>
                <span style={{ fontSize: '13px', color: '#065f46', fontWeight: '500' }}>
                  🟢 Connected with: <strong style={{ color: '#047857' }}>{peerPartnerAlias}</strong> (Your alias: {alias})
                </span>
                <button 
                  onClick={handleLeaveChat} 
                  style={{ padding: '6px 12px', background: '#dc2626', border: 'none', borderRadius: '8px', fontSize: '12px', color: 'white', cursor: 'pointer', fontWeight: '600' }}
                >
                  🛑 Leave Chat
                </button>
              </div>
            ) : (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f0f7' }}>
                <span style={{ fontSize: '13px', color: '#b91c1c', fontWeight: '500' }}>
                  ⚠️ Your peer has disconnected from the session.
                </span>
                <button 
                  onClick={handleResetToIdle} 
                  style={{ padding: '6px 12px', background: '#4f46e5', border: 'none', borderRadius: '8px', fontSize: '12px', color: 'white', cursor: 'pointer', fontWeight: '600' }}
                >
                  Find New Peer
                </button>
              </div>
            )
          ) : (
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '12px 24px', borderBottom: '1px solid #eef7f2' }}>
              <span style={{ fontSize: '13px', color: '#065f46' }}>
                🔒 This is a secure 1-to-1 conversation with our staff psychologists and administrators.
              </span>
            </div>
          )}

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#fafbfc', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', minHeight: '320px' }}>
            {activeTab === 'peer' ? (
              chatStatus === 'idle' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', gap: '20px', flex: 1 }}>
                  <div style={{ fontSize: '64px' }}>👥</div>
                  <h3 style={{ fontSize: '20px', color: '#1f2937', margin: 0, fontWeight: 'bold' }}>1-to-1 Anonymous Peer Support</h3>
                  <p style={{ color: '#4b5563', fontSize: '14px', maxWidth: '500px', lineHeight: '1.6', margin: 0 }}>
                    Connect anonymously with another student to chat, share thoughts, or offer support. 
                    Your identity is fully protected behind your animal alias <strong>({alias})</strong>.
                  </p>
                  <button 
                    onClick={handleFindPeer}
                    style={{
                      padding: '14px 32px',
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                      transition: 'all 0.2s'
                    }}
                  >
                    Find a Peer to Chat 🚀
                  </button>
                </div>
              ) : chatStatus === 'searching' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', textAlign: 'center', gap: '24px', flex: 1 }}>
                  <div className="pulsing-search-icon" style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: 'rgba(79, 70, 229, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    animation: 'pulse 1.6s infinite ease-in-out'
                  }}>
                    🔍
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', color: '#1f2937', margin: '0 0 8px', fontWeight: 'bold' }}>Finding a Peer...</h3>
                    <p style={{ color: '#6b7280', fontSize: '13.5px', maxWidth: '420px', lineHeight: '1.6', margin: 0 }}>
                      We are looking for another online student to pair you with. This might take a moment.
                    </p>
                  </div>
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes pulse {
                      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
                      70% { transform: scale(1); box-shadow: 0 0 0 18px rgba(79, 70, 229, 0); }
                      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
                    }
                  `}} />
                </div>
              ) : (
                <>
                  {peerMessages.length === 0 ? (
                    <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px', fontStyle: 'italic' }}>
                      Connected! Say hi to your peer and start the conversation.
                    </p>
                  ) : (
                    peerMessages.map((msg, index) => {
                      const isOwnMessage = msg.sender === user?.id || msg.sender?._id === user?.id || msg.senderName === alias
                      return (
                        <div 
                          key={msg._id || index}
                          style={{
                            alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <span style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', paddingLeft: isOwnMessage ? 0 : '8px', paddingRight: isOwnMessage ? '8px' : 0 }}>
                            {msg.senderName}
                          </span>
                          <div style={{
                            background: isOwnMessage ? '#4f46e5' : 'white',
                            color: isOwnMessage ? 'white' : '#1f2937',
                            padding: '12px 16px',
                            borderRadius: isOwnMessage ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            fontSize: '14px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            border: isOwnMessage ? 'none' : '1px solid #e5e7eb',
                            wordBreak: 'break-word'
                          }}>
                            {msg.text}
                          </div>
                        </div>
                      )
                    })
                  )}
                  {chatStatus === 'disconnected' && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '16px', color: '#991b1b', fontSize: '13.5px', textAlign: 'center', marginTop: '16px' }}>
                      ℹ️ The peer has disconnected from this session. Click "Find New Peer" above to match again.
                    </div>
                  )}
                </>
              )
            ) : (
              adminMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>💬</div>
                  <p>Send a message below to contact a counsellor or administrator privately.</p>
                </div>
              ) : (
                adminMessages.map((msg, index) => {
                  const currentUserId = user?.id || user?._id
                  const messageSenderId = msg.sender?._id || msg.sender
                  const isOwnMessage = currentUserId && messageSenderId && (messageSenderId.toString() === currentUserId.toString())
                  const senderRole = msg.sender?.role || (isOwnMessage ? 'student' : 'admin')
                  return (
                    <div 
                      key={msg._id || index}
                      style={{
                        alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <span style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', paddingLeft: isOwnMessage ? 0 : '8px' }}>
                        {isOwnMessage ? 'You' : `${msg.senderName || 'Staff Member'} (${senderRole.toUpperCase()})`}
                      </span>
                      <div style={{
                        background: isOwnMessage ? 'linear-gradient(135deg, #4facfe, #00f2fe)' : '#f3f4f6',
                        color: isOwnMessage ? 'white' : '#1f2937',
                        padding: '12px 16px',
                        borderRadius: isOwnMessage ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        fontSize: '14px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        wordBreak: 'break-word'
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  )
                })
              )
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input Area - hidden for peer tab unless in connected state */}
          {((activeTab === 'peer' && chatStatus === 'connected') || activeTab === 'admin') && (
            <form 
              onSubmit={activeTab === 'peer' ? handleSendPeer : handleSendAdmin} 
              style={{ display: 'flex', padding: '16px 24px', gap: '12px', borderTop: '1px solid #f3f4f6' }}
            >
              <input
                type="text"
                value={activeTab === 'peer' ? peerInput : adminInput}
                onChange={e => activeTab === 'peer' ? setPeerInput(e.target.value) : setAdminInput(e.target.value)}
                placeholder={activeTab === 'peer' ? `Send a supportive message to ${peerPartnerAlias} anonymously...` : "Type your message to staff here..."}
                style={{ flex: 1, padding: '14px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
              />
              <button
                type="submit"
                style={{
                  padding: '0 24px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Send 🚀
              </button>
            </form>
          )}

        </div>
      </div>

    </div>
  )
}
