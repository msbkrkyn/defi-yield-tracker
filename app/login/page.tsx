'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('defi_users') || '[]')
      
      // Find user
      const user = users.find((u: any) => u.email === formData.email)
      
      if (!user) {
        throw new Error('Email not found')
      }

      // Simple password check (in real app, use proper hashing)
      if (user.password !== formData.password) {
        // For demo, we'll check if password is "password123" or their email
        if (formData.password !== 'password123' && formData.password !== formData.email) {
          throw new Error('Invalid password')
        }
      }

      // Save current user
      localStorage.setItem('current_user', JSON.stringify(user))
      
      setMessage('Login successful! Redirecting to dashboard...')
      
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)

    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@defiyield.com',
      password: 'password123'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🚀 DeFi Yield Tracker</h1>
          <p className="text-gray-300">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-center text-sm ${
              message.includes('successful') 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:transform-none"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          <button
            onClick={handleDemoLogin}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg font-medium transition-all border border-white/20"
          >
            🎮 Try Demo Account
          </button>

          <div className="text-center">
            <p className="text-gray-300">
              Don't have an account?{' '}
              <Link href="/signup" className="text-purple-400 hover:text-purple-300">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-blue-300 font-semibold mb-2">💡 Demo Credentials</h3>
          <div className="text-blue-300 text-sm space-y-1">
            <p><strong>Email:</strong> demo@defiyield.com</p>
            <p><strong>Password:</strong> password123</p>
            <p className="text-xs mt-2 text-blue-400">Or create your own account above!</p>
          </div>
        </div>
      </div>
    </div>
  )
}