import { Link } from 'react-router-dom'
import { Heart, Users, Shield, Flame } from 'lucide-react'
import { motion } from 'framer-motion'

const SAMPLE_PROFILES = [
  { name: 'Sofia', age: 26, color: 'from-pink-400 to-rose-500' },
  { name: 'Marcus', age: 29, color: 'from-orange-400 to-amber-500' },
  { name: 'Luna', age: 24, color: 'from-violet-400 to-purple-500' },
]

const FEATURES = [
  {
    icon: Heart,
    title: 'Smart Matching',
    desc: 'Our algorithm finds people who truly complement you based on personality and shared interests.',
  },
  {
    icon: Users,
    title: 'Real Connections',
    desc: 'We focus on authentic connections — no bots, no fake profiles, just real people.',
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    desc: 'Your data is encrypted and your privacy is our top priority, always.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-32 flex flex-col items-center text-center">
        {/* Background blobs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #e94057 0%, #f27121 100%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #f27121 0%, #e94057 100%)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Flame className="w-8 h-8 text-[#e94057]" />
            <span className="text-sm font-semibold uppercase tracking-widest text-[#e94057]">
              Welcome to Spark
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight text-gray-900 dark:text-white">
            Find Your{' '}
            <span className="text-gradient-brand">Spark</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto">
            Connect with real people who share your vibe. Swipe, match, and start something beautiful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="gradient-brand text-white rounded-full px-8 py-4 font-semibold text-lg hover:opacity-90 transition shadow-lg shadow-[#e94057]/30"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="rounded-full px-8 py-4 font-semibold text-lg border-2 border-[#e94057] text-[#e94057] hover:bg-[#e94057]/5 transition"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Floating profile cards */}
        <div className="relative z-10 mt-16 flex gap-4 items-end justify-center">
          {SAMPLE_PROFILES.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: i === 1 ? -16 : 0 }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              className="w-36 h-48 rounded-2xl border-2 border-white dark:border-gray-700 shadow-xl overflow-hidden flex flex-col justify-end"
              style={{ background: `linear-gradient(135deg, var(--from), var(--to))` }}
            >
              <div className={`w-full h-full bg-gradient-to-br ${p.color} flex flex-col justify-end p-3`}>
                <p className="text-white font-bold text-sm">{p.name}</p>
                <p className="text-white/80 text-xs">{p.age}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12"
        >
          Why choose <span className="text-gradient-brand">Spark</span>?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mb-5">
                <f.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {f.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm border-t border-gray-100 dark:border-gray-800">
        &copy; 2025 Spark Dating. Made with{' '}
        <span className="text-[#e94057]">♥</span>
      </footer>
    </div>
  )
}
