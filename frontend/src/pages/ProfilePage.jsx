import { useState, useRef } from 'react'
import { Camera, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    age: user?.age || '',
  })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
    setSuccess(false)
  }

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name cannot be empty.')
      return
    }
    if (form.age && Number(form.age) < 18) {
      setError('Age must be at least 18.')
      return
    }

    setLoading(true)
    setSuccess(false)
    try {
      const data = new FormData()
      data.append('name', form.name)
      data.append('bio', form.bio)
      if (form.age) data.append('age', form.age)
      if (photo) data.append('profile_picture', photo)

      const res = await api.post('/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      updateUser(res.data.user ?? res.data)
      setSuccess(true)
      setPhoto(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const avatarUrl = photoPreview || user?.profile_picture_url || null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Your Profile
        </h1>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 flex items-center gap-6"
        >
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#e94057] to-[#f27121]">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.name}
            </p>
            {user?.age && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.age} years old
              </p>
            )}
            {user?.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-xs">
                {user.bio}
              </p>
            )}
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Edit Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo upload */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#e94057] to-[#f27121]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-[#e94057] hover:text-[#e94057] transition"
                >
                  <Camera className="w-4 h-4" />
                  Change photo
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhoto}
                />
                {photo && (
                  <p className="text-xs text-gray-400 mt-1">{photo.name}</p>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e94057]"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                min={18}
                max={100}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e94057]"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell people about yourself..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e94057] resize-none"
              />
            </div>

            {/* Error / Success */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-xl">
                {error}
              </p>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2.5 rounded-xl">
                <CheckCircle className="w-4 h-4" />
                Profile updated successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="gradient-brand text-white rounded-full px-6 py-3 font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
