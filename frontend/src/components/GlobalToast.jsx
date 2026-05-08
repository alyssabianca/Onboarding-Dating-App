import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle } from 'lucide-react'

export default function GlobalToast({ notification, onDismiss }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [notification, onDismiss])

  const handleClick = () => {
    if (notification?.matchId) navigate(`/chat/${notification.matchId}`)
    onDismiss()
  }

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 right-4 z-[100] w-full max-w-sm cursor-pointer"
          onClick={handleClick}
        >
          <div className="gradient-brand rounded-2xl shadow-2xl px-6 py-4 text-white flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              {notification.type === 'match' ? (
                <Heart className="w-6 h-6 fill-white text-white" />
              ) : (
                <MessageCircle className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {notification.type === 'match' ? (
                <>
                  <p className="font-bold text-lg leading-tight">It&apos;s a Match!</p>
                  <p className="text-white/90 text-sm">
                    You and <span className="font-semibold">{notification.name}</span> liked each other.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-sm leading-tight">{notification.senderName}</p>
                  <p className="text-white/90 text-sm truncate">{notification.content}</p>
                </>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss() }}
              className="text-white/70 hover:text-white text-xl font-light leading-none flex-shrink-0"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
