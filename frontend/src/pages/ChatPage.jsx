import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return (
    d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
}

function MessageBubble({ message, isOwn }) {
  const [showTime, setShowTime] = useState(false)

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="max-w-[70%]">
        <div
          onClick={() => setShowTime((v) => !v)}
          className={`px-4 py-2.5 rounded-2xl cursor-pointer text-sm leading-relaxed ${
            isOwn
              ? 'gradient-brand text-white rounded-br-sm'
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow rounded-bl-sm'
          }`}
        >
          {message.content}
        </div>
        {showTime && (
          <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatTime(message.created_at)}
          </p>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { socket } = useSocket()

  const [match, setMatch] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  const bottomRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load match info + message history
  useEffect(() => {
    const load = async () => {
      try {
        const [matchRes, msgRes] = await Promise.all([
          api.get(`/matches/${matchId}`),
          api.get(`/matches/${matchId}/messages`),
        ])
        setMatch(matchRes.data.match ?? matchRes.data)
        setMessages(msgRes.data.messages ?? [])
      } catch {
        // ignore load errors
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [matchId])

  // Join the match room on the global socket and listen for incoming messages
  useEffect(() => {
    if (!socket) return

    socket.emit('join_match', matchId)

    const handleNewMessage = (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message]
      })
    }

    socket.on('new_message', handleNewMessage)

    return () => {
      socket.emit('leave_match', matchId)
      socket.off('new_message', handleNewMessage)
    }
  }, [socket, matchId])

  // Auto-scroll whenever messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async (e) => {
    e.preventDefault()
    const content = input.trim()
    if (!content || sending) return

    setSending(true)

    // Optimistic bubble
    const optimisticId = `opt-${Date.now()}`
    const optimistic = {
      id: optimisticId,
      content,
      sender_id: user?.id,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    setInput('')

    try {
      // 1. Persist via Laravel API
      const res = await api.post(`/matches/${matchId}/messages`, { content })
      const saved = res.data.message ?? res.data

      // 2. Replace optimistic with the saved message (has real id)
      setMessages((prev) => prev.map((m) => (m.id === optimisticId ? saved : m)))

      // 3. Broadcast to the other person via Socket.io
      socket?.emit('send_message', {
        matchId,
        message: saved,
        recipientUserId: partner?.id,
      })
    } catch {
      // Roll back optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
      setInput(content)
    } finally {
      setSending(false)
    }
  }

  const partner = match?.other_user ?? match?.partner ?? match

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate('/matches')}
          className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        ) : (
          <>
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#e94057] to-[#f27121]">
              {partner?.profile_picture_url ? (
                <img
                  src={partner.profile_picture_url}
                  alt={partner?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {partner?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {partner?.name}
                {partner?.age ? `, ${partner.age}` : ''}
              </p>
              <p className={`text-xs ${socket?.connected ? 'text-green-500' : 'text-gray-400'}`}>
                {socket?.connected ? 'Online' : 'Connecting...'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 rounded-full border-4 border-[#e94057] border-t-transparent animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center">
              <Send className="w-7 h-7 text-white" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Say hello to {partner?.name}!
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <MessageBubble message={msg} isOwn={msg.sender_id === user?.id} />
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-3">
        <form onSubmit={handleSend} className="flex items-center gap-3 max-w-2xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${partner?.name || ''}...`}
            className="flex-1 border border-gray-200 dark:border-gray-700 rounded-full px-5 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e94057] text-sm placeholder-gray-400"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-full gradient-brand flex items-center justify-center hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  )
}
