import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Building2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch {
      toast.error('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-4">
            <Building2 size={28} className="text-dark-900" />
          </div>
          <h1 className="text-2xl font-bold text-white">DMS Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Document Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-800 rounded-2xl p-6 border border-dark-600 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-dark-900 font-semibold py-2.5 rounded-xl text-sm hover:bg-yellow-300 transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
