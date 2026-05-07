import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'

export default function NotificationBanner({ match, onDismiss }) {
  useEffect(() => {
    if (match) {
      const timer = setTimeout(() => {
        onDismiss()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [match, onDismiss])

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm mx-auto px-4"
        >
          <div className="gradient-brand rounded-2xl shadow-2xl px-6 py-4 text-white flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 fill-white text-white" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">It&apos;s a Match!</p>
              <p className="text-white/90 text-sm">
                You and{' '}
                <span className="font-semibold">{match.name}</span> liked each
                other.
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="ml-auto text-white/70 hover:text-white text-xl font-light leading-none"
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
