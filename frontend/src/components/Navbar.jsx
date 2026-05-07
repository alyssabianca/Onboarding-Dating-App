import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Flame,
  Compass,
  Heart,
  User,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'text-[#e94057] bg-[#e94057]/10'
        : 'text-gray-600 dark:text-gray-300 hover:text-[#e94057] hover:bg-[#e94057]/5'
    }`

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Flame className="w-7 h-7 text-[#e94057]" />
          <span className="text-xl font-bold text-gradient-brand">Spark</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {user ? (
            <>
              <NavLink to="/discover" className={navLinkClass}>
                <Compass className="w-4 h-4" />
                <span className="hidden sm:inline">Discover</span>
              </NavLink>
              <NavLink to="/matches" className={navLinkClass}>
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Matches</span>
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </NavLink>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-[#e94057] hover:bg-[#e94057]/5 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Theme toggle even when logged out */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-[#e94057] hover:bg-[#e94057]/5 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#e94057] transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold gradient-brand text-white hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
