const { createServer } = require('http')
const { Server } = require('socket.io')
const axios = require('axios')

const LARAVEL_URL = process.env.LARAVEL_URL || 'http://localhost:8000'
const PORT = process.env.PORT || 3001

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

async function validateToken(token) {
  try {
    const res = await axios.get(`${LARAVEL_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      timeout: 5000,
    })
    return res.data.user ?? null
  } catch {
    return null
  }
}

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('No auth token'))

  const user = await validateToken(token)
  if (!user) return next(new Error('Invalid token'))

  socket.user = user
  next()
})

io.on('connection', (socket) => {
  console.log(`[socket] ${socket.user.name} (id=${socket.user.id}) connected`)

  // Each user gets a personal room for directed notifications
  socket.join(`user_${socket.user.id}`)

  // ── Chat room events ──────────────────────────────────────────────────────
  socket.on('join_match', (matchId) => {
    socket.join(`match_${matchId}`)
    console.log(`[socket] ${socket.user.name} joined match_${matchId}`)
  })

  socket.on('leave_match', (matchId) => {
    socket.leave(`match_${matchId}`)
  })

  // Sender already persisted the message via Laravel; we just relay it.
  // recipientUserId is included so we can also push a background notification.
  socket.on('send_message', ({ matchId, message, recipientUserId }) => {
    // Real-time delivery to anyone in the match room
    socket.to(`match_${matchId}`).emit('new_message', message)

    // Background notification to the recipient's personal room
    if (recipientUserId) {
      socket.to(`user_${recipientUserId}`).emit('message_notification', {
        matchId,
        message,
        senderName: socket.user.name,
      })
    }
  })

  // ── Match notification ────────────────────────────────────────────────────
  // Fired by the user who just completed a mutual like, so the other person
  // finds out in real-time even if they're on a different page.
  socket.on('notify_match', ({ targetUserId, matchId, matchedUserName }) => {
    socket.to(`user_${targetUserId}`).emit('match_notification', {
      matchId,
      matchedUserName,
    })
    console.log(
      `[socket] match_notification → user_${targetUserId} (matched with ${matchedUserName})`
    )
  })

  socket.on('disconnect', () => {
    console.log(`[socket] ${socket.user.name} disconnected`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Socket.io server listening on port ${PORT}`)
})
