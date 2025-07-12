'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  referralCode: string
  referredBy: string | null
  referralCount: number
  isPremium: boolean
  premiumUntil: string | null
  createdAt: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem('current_user')
    if (!currentUser) {
      window.location.href = '/login'
      return
    }

    try {
      const userData = JSON.parse(currentUser)
      setUser(userData)
    } catch (error) {
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('current_user')
    window.location.href = '/'
  }

  const copyReferralLink = () => {
    if (!user) return
    
    const referralUrl = `${window.location.origin}/signup?ref=${user.referralCode}`
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getProgressToNextLevel = () => {
    if (!user) return 0
    if (user.referralCount >= 25) return 100
    if (user.referralCount >= 10) return 100
    return (user.referralCount / 10) * 100
  }

  const getCurrentStatus = () => {
    if (!user) return "Free User"
    if (user.referralCount >= 25) return "Lifetime Premium"
    if (user.referralCount >= 10) return "1 Year Premium"
    return "Free User"
  }

  const getNextMilestone = () => {
    if (!user) return null
    if (user.referralCount >= 25) return null
    if (user.referralCount >= 10) return { target: 25, reward: "Lifetime Premium" }
    return { target: 10, reward: "1 Year Premium" }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const nextMilestone = getNextMilestone()
  const remainingReferrals = nextMilestone ? nextMilestone.target - user.referralCount : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">🚀</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">DeFi Yield Tracker</h1>
                <p className="text-gray-300 text-sm">Welcome back, {user.firstName}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white">
                Home
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors border border-red-500/30"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Current Status */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white">Your Status</h3>
              <p className="text-purple-300 text-lg">{getCurrentStatus()}</p>
            </div>
            <div className="text-5xl">
              {user.referralCount >= 25 ? '👑' : user.referralCount >= 10 ? '⭐' : '🆓'}
            </div>
          </div>

          {/* Progress Bar */}
          {nextMilestone && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Progress to next level</span>
                <span>{user.referralCount}/{nextMilestone.target}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressToNextLevel()}%` }}
                ></div>
              </div>
              <p className="text-center text-gray-300 mt-2">
                {remainingReferrals} more referrals needed for {nextMilestone.reward}
              </p>
            </div>
          )}

          {user.isPremium && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-300 text-sm">
                ✨ Premium membership active {user.premiumUntil ? `until ${new Date(user.premiumUntil).toLocaleDateString()}` : 'forever'}
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-green-400">{user.referralCount}</div>
            <div className="text-gray-300">Successful Referrals</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {user.isPremium ? 'Premium' : 'Free'}
            </div>
            <div className="text-gray-300">Account Type</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-blue-400">
              {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-gray-300">Days Active</div>
          </div>
        </div>

        {/* Referral Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">🔗 Your Referral Link</h3>
          
          <div className="bg-white/5 rounded-lg p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${user.referralCode}`}
                  readOnly
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                />
              </div>
              <button
                onClick={copyReferralLink}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 whitespace-nowrap"
              >
                {copied ? '✅ Copied!' : '📋 Copy Link'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-300 font-semibold mb-2">🎯 10 Referrals</h4>
              <p className="text-gray-300 text-sm">Unlock 1 year of premium features</p>
            </div>
            <div className="bg-gold-500/20 border border-yellow-500/30 rounded-lg p-4">
              <h4 className="text-yellow-300 font-semibold mb-2">👑 25 Referrals</h4>
              <p className="text-gray-300 text-sm">Lifetime premium access</p>
            </div>
          </div>
        </div>

        {/* Protocol Links */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6">🔗 Quick Protocol Access</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Uniswap', logo: '🦄', url: 'https://app.uniswap.org?ref=defi-yield-tracker' },
              { name: 'Aave', logo: '👻', url: 'https://app.aave.com?referral=DFYT001' },
              { name: 'Curve', logo: '🌀', url: 'https://curve.fi?ref=defiyieldtracker' },
              { name: 'Raydium', logo: '☀️', url: 'https://raydium.io?ref=defiyield' }
            ].map((protocol) => (
              <a
                key={protocol.name}
                href={protocol.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 hover:bg-white/10 rounded-lg p-4 text-center transition-all transform hover:scale-105 border border-white/10 hover:border-purple-400"
              >
                <div className="text-3xl mb-2">{protocol.logo}</div>
                <div className="text-white font-semibold">{protocol.name}</div>
                <div className="text-green-400 text-xs mt-1">Earn Commission</div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}