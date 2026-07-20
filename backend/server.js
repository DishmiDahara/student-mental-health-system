const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
require('dotenv').config()

const app = express()
app.use(cors({ origin: '*', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log('DB Error:', err))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/mood', require('./routes/mood'))
app.use('/api/bookings', require('./routes/bookings'))
app.use('/api/resources', require('./routes/resources'))
app.use('/api/messages', require('./routes/messages'))
app.use('/api/feedback', require('./routes/feedback'))
app.use('/api/announcements', require('./routes/announcements'))
app.use('/api/counselor-applications', require('./routes/counselorApplications'))
app.use('/api/payments', require('./routes/payments'))

app.get('/', (req, res) => res.send('Mental Health API is running!'))

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*', // In production, replace with specific frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
})
app.set('io', io)


const Message = require('./models/Message')

// Matchmaking queue and active rooms for anonymous peer chat
let peerQueue = []
const activePeerRooms = {}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.on('join_room', (room) => {
    socket.join(room)
    console.log(`User ${socket.id} joined room: ${room}`)
  })

  // Matchmaking Peer Support Chat events
  socket.on('join_queue', (data) => {
    const { userId, alias } = data
    // Remove if already in queue to prevent duplicate queuing
    peerQueue = peerQueue.filter(item => item.socketId !== socket.id)

    // Find a partner who is not the same user (different userId)
    const partnerIndex = peerQueue.findIndex(item => item.userId !== userId)

    if (partnerIndex !== -1) {
      // Pair found!
      const partner = peerQueue.splice(partnerIndex, 1)[0]
      const partnerSocket = io.sockets.sockets.get(partner.socketId)

      if (partnerSocket) {
        const roomName = `peer-room-${partner.socketId}-${socket.id}`

        // Join both sockets to the room
        partnerSocket.join(roomName)
        socket.join(roomName)

        // Track pairings
        activePeerRooms[socket.id] = { roomName, partnerSocketId: partner.socketId }
        activePeerRooms[partner.socketId] = { roomName, partnerSocketId: socket.id }

        // Emit matched event to both sides
        io.to(roomName).emit('peer_matched', {
          room: roomName,
          peers: {
            [socket.id]: alias,
            [partner.socketId]: partner.alias
          }
        })
        console.log(`Match found! Room: ${roomName} between socket ${socket.id} (user: ${userId}) and ${partner.socketId} (user: ${partner.userId})`)
      } else {
        // Partner socket no longer exists, enqueue current user
        peerQueue.push({ socketId: socket.id, userId, alias })
        socket.emit('waiting_for_peer')
      }
    } else {
      // Queue current user
      peerQueue.push({ socketId: socket.id, userId, alias })
      socket.emit('waiting_for_peer')
      console.log(`User ${socket.id} added to peer queue. Queue size: ${peerQueue.length}`)
    }
  })

  socket.on('leave_queue', () => {
    peerQueue = peerQueue.filter(item => item.socketId !== socket.id)
    console.log(`User ${socket.id} left the peer queue. Queue size: ${peerQueue.length}`)
  })

  socket.on('leave_chat', () => {
    const session = activePeerRooms[socket.id]
    if (session) {
      const { roomName, partnerSocketId } = session
      // Notify partner
      io.to(roomName).emit('peer_disconnected')

      // Sockets leave room
      socket.leave(roomName)
      const partnerSocket = io.sockets.sockets.get(partnerSocketId)
      if (partnerSocket) {
        partnerSocket.leave(roomName)
      }

      // Cleanup mappings
      delete activePeerRooms[socket.id]
      delete activePeerRooms[partnerSocketId]
      console.log(`Chat room ${roomName} ended manually by ${socket.id}`)
    }
  })

  socket.on('send_message', async (data) => {
    try {
      const { sender, receiver, text, room, senderName } = data
      
      // Save message to database
      const newMessage = await Message.create({
        sender: sender || null,
        receiver: receiver || null,
        text,
        room,
        senderName: senderName || ''
      })

      // Populate sender field if sender exists
      let populatedMessage = newMessage
      if (sender) {
        populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name email role')
      }

      // Emit to all users in the room
      io.to(room).emit('receive_message', populatedMessage)
    } catch (err) {
      console.error('Socket message save/send error:', err)
    }
  })

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
    // Remove from queue if present
    peerQueue = peerQueue.filter(item => item.socketId !== socket.id)

    // Notify partner and cleanup room if was in active chat
    const session = activePeerRooms[socket.id]
    if (session) {
      const { roomName, partnerSocketId } = session
      io.to(roomName).emit('peer_disconnected')

      const partnerSocket = io.sockets.sockets.get(partnerSocketId)
      if (partnerSocket) {
        partnerSocket.leave(roomName)
      }

      delete activePeerRooms[socket.id]
      delete activePeerRooms[partnerSocketId]
      console.log(`Chat room ${roomName} ended due to disconnection of ${socket.id}`)
    }
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))