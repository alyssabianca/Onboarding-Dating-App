import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { showNotification } from '../lib/notifications'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [socket, setSocket] = useState(null)
  const [notification, setNotification] = useState(null)

  const clearNotification = useCallback(() => setNotification(null), [])

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
      }
      return
    }

    const token = localStorage.getItem('spark_token')
    if (!token) return

    const s = io(import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3001', { auth: { token }, path: '/socket.io' })
    socketRef.current = s
    setSocket(s)

    s.on('match_notification', ({ matchedUserName, matchId }) => {
      setNotification({ type: 'match', name: matchedUserName, matchId })
      showNotification('🔥 New Match!', `You and ${matchedUserName} liked each other!`)
    })

    s.on('message_notification', ({ matchId, message, senderName }) => {
      const onChat = window.location.pathname === `/chat/${matchId}`
      if (!onChat || document.hidden) {
        setNotification({ type: 'message', senderName, content: message.content, matchId })
        showNotification(`💬 ${senderName}`, message.content)
      }
    })

    return () => {
      s.disconnect()
      socketRef.current = null
      setSocket(null)
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket, notification, clearNotification }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
