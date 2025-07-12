'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    referralCode: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const generateReferralCode = (email: string) => {
    return email.slice(0, 3).toUpperCase() + Math.random().toString(36).substr(2, 6).toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      // Create user object
      const newUser = {
        id: Date.now().toString(),
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        referralCode: generateReferralCode(formData.email),
        referredBy: formData.referralCode || null,
        referralCount: 0,
        isPremium: false,
        premiumUntil: null,
        createdAt: new Date().toISOString()
      }

      // Save to localStorage (temporary - will replace with real DB)
      const users = JSON.parse(localStorage.getItem('defi_users') || '[]')
      
      // Check if email already exists
      if (users.find((user: any) => user.email === formData.email)) {
        throw new Error('Email already exists')
      }

      // Handle referral
      if (formData.referralCode) {
        const referrer = users.find((user: any) => user.referralCode === formData.referralCode)
        if (referrer) {
          referrer.referralCount += 1
          
          // Check for premium rewards
          if (referrer.referralCount >= 25) {
            referrer.isPremium = true
            referrer.premiumUntil = null // Lifetime
          } else if (referrer.referralCount >= 10 && !referrer.isPremium) {
            referrer.isPremium = true
            referrer.premiumUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
          }
        }
      }

      users.push(newUser)
      localStorage.setItem('defi_users', JSON.stringify(users))
      localStorage.setItem('current_user', JSON.stringify(newUser))

      setMessage('Account created successfully! Redirecting to dashboard...')
      
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🚀 DeFi Yield Tracker</h1>
          <p className="text-gray-300">Create your free account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Doe"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Referral Code (Optional)
            </label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="FRIEND123"
            />
            <p className="text-gray-400 text-xs mt-1">
              Enter a friend's referral code to help them earn rewards
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-center text-sm ${
              message.includes('successfully') 
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-6 bg-green-500/20 border border-green-500/30 rounded-lg p-4">
          <h3 className="text-green-300 font-semibold mb-2">🎁 Referral Rewards</h3>
          <ul className="text-green-300 text-sm space-y-1">
            <li>• 10 referrals → 1 year premium</li>
            <li>• 25 referrals → Lifetime premium</li>
            <li>• Get your unique code after signup!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}