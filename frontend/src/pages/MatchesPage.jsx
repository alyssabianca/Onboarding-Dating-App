import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'

function ConfirmDialog({ name, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Unmatch {name}?
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          This will remove your match and all messages. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
          >
            Unmatch
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function MatchesPage() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmUnmatch, setConfirmUnmatch] = useState(null) // { id, name }

  useEffect(() => {
    api
      .get('/matches')
      .then((res) => setMatches(res.data.matches ?? res.data ?? []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false))
  }, [])

  const handleUnmatch = async (matchId) => {
    try {
      await api.delete(`/matches/${matchId}`)
      setMatches((prev) => prev.filter((m) => m.id !== matchId))
    } catch {
      // ignore
    } finally {
      setConfirmUnmatch(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Matches
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-[#e94057] border-t-transparent animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
            <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No matches yet
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Keep swiping! Someone special is out there.
              </p>
            </div>
            <button
              onClick={() => navigate('/discover')}
              className="gradient-brand text-white rounded-full px-6 py-3 font-semibold hover:opacity-90 transition"
            >
              Start Swiping
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match, i) => {
              const partner = match.other_user ?? match.partner ?? match
              const avatarUrl = partner.profile_picture_url || null

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex items-center gap-4 hover:shadow-xl transition-shadow"
                >
                  {/* Avatar */}
                  <div
                    onClick={() => navigate(`/chat/${match.id}`)}
                    className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#e94057] to-[#f27121] cursor-pointer"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={partner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                        {partner.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/chat/${match.id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {partner.name}
                        {partner.age ? `, ${partner.age}` : ''}
                      </p>
                      {match.unread_count > 0 && (
                        <span className="flex-shrink-0 w-5 h-5 rounded-full gradient-brand text-white text-xs font-bold flex items-center justify-center">
                          {match.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {match.last_message?.content || 'Say hello!'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/chat/${match.id}`)}
                      className="p-2 rounded-xl text-gray-400 hover:text-[#e94057] hover:bg-[#e94057]/5 transition"
                      aria-label="Open chat"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmUnmatch({ id: match.id, name: partner.name })
                      }
                      className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      aria-label="Unmatch"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      <AnimatePresence>
        {confirmUnmatch && (
          <ConfirmDialog
            name={confirmUnmatch.name}
            onConfirm={() => handleUnmatch(confirmUnmatch.id)}
            onCancel={() => setConfirmUnmatch(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
