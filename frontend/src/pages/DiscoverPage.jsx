import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { X, Heart, SlidersHorizontal, RefreshCw } from 'lucide-react'
import api from '../lib/api'
import NotificationBanner from '../components/NotificationBanner'

function ProfileCard({ profile, onSwipe, isTop }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-20, 20])
  const likeOpacity = useTransform(x, [20, 80], [0, 1])
  const skipOpacity = useTransform(x, [-80, -20], [1, 0])

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 80) {
      onSwipe('right')
    } else if (info.offset.x < -80) {
      onSwipe('left')
    }
  }

  const avatarUrl = profile.profile_picture_url || null

  return (
    <motion.div
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0 }}
      className={`absolute inset-0 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing select-none ${
        isTop ? 'z-10' : 'z-0 scale-95 opacity-80'
      }`}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Photo / gradient background */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={profile.name}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full gradient-brand flex items-center justify-center">
          <span className="text-white text-7xl font-bold opacity-60">
            {profile.name?.charAt(0)?.toUpperCase()}
          </span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
        <h2 className="text-white text-3xl font-bold">
          {profile.name}, {profile.age}
        </h2>
        {profile.bio && (
          <p className="text-white/80 text-sm mt-1 line-clamp-2">{profile.bio}</p>
        )}
      </div>

      {/* LIKE stamp */}
      {isTop && (
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-10 left-8 pointer-events-none"
        >
          <div className="border-4 border-green-400 rounded-xl px-4 py-2 -rotate-12">
            <span className="text-green-400 text-3xl font-extrabold tracking-widest">
              LIKE
            </span>
          </div>
        </motion.div>
      )}

      {/* SKIP stamp */}
      {isTop && (
        <motion.div
          style={{ opacity: skipOpacity }}
          className="absolute top-10 right-8 pointer-events-none"
        >
          <div className="border-4 border-red-400 rounded-xl px-4 py-2 rotate-12">
            <span className="text-red-400 text-3xl font-extrabold tracking-widest">
              SKIP
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [swiping, setSwiping] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ age_min: 18, age_max: 60, distance: 50 })
  const [matchNotif, setMatchNotif] = useState(null)

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/discovery', { params: filters })
      setProfiles(res.data.profiles ?? res.data ?? [])
      setCurrentIndex(0)
    } catch {
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const handleSwipe = async (direction) => {
    if (swiping) return
    const profile = profiles[currentIndex]
    if (!profile) return

    setSwiping(true)
    try {
      const res = await api.post('/swipes', {
        user_id: profile.id,
        direction,
      })
      if (res.data?.matched) {
        setMatchNotif({ name: profile.name, matchId: res.data.match_id })
      }
    } catch {
      // ignore swipe errors
    } finally {
      setCurrentIndex((prev) => prev + 1)
      setSwiping(false)
    }
  }

  const currentProfile = profiles[currentIndex]
  const nextProfile = profiles[currentIndex + 1]
  const exhausted = !loading && currentIndex >= profiles.length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <NotificationBanner
        match={matchNotif}
        onDismiss={() => setMatchNotif(null)}
      />

      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Discover
          </h1>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition ${
              showFilters
                ? 'bg-[#e94057] border-[#e94057] text-white'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#e94057] hover:text-[#e94057]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 space-y-4">
                <div>
                  <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span>Min Age</span>
                    <span className="text-[#e94057]">{filters.age_min}</span>
                  </label>
                  <input
                    type="range"
                    min={18}
                    max={filters.age_max}
                    value={filters.age_min}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, age_min: Number(e.target.value) }))
                    }
                    className="w-full accent-[#e94057]"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span>Max Age</span>
                    <span className="text-[#e94057]">{filters.age_max}</span>
                  </label>
                  <input
                    type="range"
                    min={filters.age_min}
                    max={80}
                    value={filters.age_max}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, age_max: Number(e.target.value) }))
                    }
                    className="w-full accent-[#e94057]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    value={filters.distance}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, distance: Number(e.target.value) }))
                    }
                    min={1}
                    max={500}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e94057] text-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    setShowFilters(false)
                    fetchProfiles()
                  }}
                  className="w-full gradient-brand text-white rounded-full py-2.5 font-semibold text-sm hover:opacity-90 transition"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card stack */}
        {loading ? (
          <div className="flex items-center justify-center h-[480px]">
            <div className="w-12 h-12 rounded-full border-4 border-[#e94057] border-t-transparent animate-spin" />
          </div>
        ) : exhausted ? (
          <div className="flex flex-col items-center justify-center h-[480px] gap-6 text-center">
            <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                You&apos;re all caught up!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Check back later for new people nearby.
              </p>
            </div>
            <button
              onClick={fetchProfiles}
              className="flex items-center gap-2 gradient-brand text-white rounded-full px-6 py-3 font-semibold hover:opacity-90 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        ) : (
          <>
            {/* Card area */}
            <div className="relative w-full h-[480px] mb-8">
              {/* Back card */}
              {nextProfile && (
                <ProfileCard
                  key={nextProfile.id + '-back'}
                  profile={nextProfile}
                  onSwipe={() => {}}
                  isTop={false}
                />
              )}
              {/* Front card */}
              <AnimatePresence>
                {currentProfile && (
                  <motion.div
                    key={currentProfile.id}
                    className="absolute inset-0"
                    exit={{
                      x: 0,
                      opacity: 0,
                      scale: 0.8,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <ProfileCard
                      profile={currentProfile}
                      onSwipe={handleSwipe}
                      isTop={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={() => handleSwipe('left')}
                disabled={swiping}
                className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg border-2 border-red-200 dark:border-red-900 flex items-center justify-center hover:scale-110 hover:border-red-400 active:scale-95 transition disabled:opacity-50"
                aria-label="Skip"
              >
                <X className="w-7 h-7 text-red-400" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => handleSwipe('right')}
                disabled={swiping}
                className="w-20 h-20 rounded-full gradient-brand shadow-xl shadow-[#e94057]/30 flex items-center justify-center hover:scale-110 active:scale-95 transition disabled:opacity-50"
                aria-label="Like"
              >
                <Heart className="w-9 h-9 text-white fill-white" />
              </button>
              <button
                onClick={() => handleSwipe('left')}
                disabled={swiping}
                className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center hover:scale-110 active:scale-95 transition disabled:opacity-50 opacity-0 pointer-events-none"
                aria-label="placeholder"
              />
            </div>

            {/* Profile count hint */}
            <p className="text-center text-xs text-gray-400 mt-4">
              {profiles.length - currentIndex} profile{profiles.length - currentIndex !== 1 ? 's' : ''} remaining
            </p>
          </>
        )}
      </div>
    </div>
  )
}
