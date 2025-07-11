// Yeni Referral Sistemi - components/ReferralCard.tsx
'use client'
import { useState } from 'react'

interface ReferralCardProps {
  referralCount: number
  referralCode: string
  isPremium: boolean
  premiumUntil?: string
}

export default function ReferralCard({ 
  referralCount, 
  referralCode, 
  isPremium, 
  premiumUntil 
}: ReferralCardProps) {
  const [copied, setCopied] = useState(false)

  const copyReferralLink = () => {
    const referralUrl = `${window.location.origin}/signup?ref=${referralCode}`
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getProgressToNextLevel = () => {
    if (referralCount >= 25) return 100
    if (referralCount >= 10) return 100
    return (referralCount / 10) * 100
  }

  const getCurrentStatus = () => {
    if (referralCount >= 25) return "Lifetime Premium"
    if (referralCount >= 10) return "1 Year Premium"
    return "Free User"
  }

  const getNextMilestone = () => {
    if (referralCount >= 25) return null
    if (referralCount >= 10) return { target: 25, reward: "Lifetime Premium" }
    return { target: 10, reward: "1 Year Premium" }
  }

  const nextMilestone = getNextMilestone()
  const remainingReferrals = nextMilestone ? nextMilestone.target - referralCount : 0

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Mevcut Durumun</h3>
            <p className="text-purple-300">{getCurrentStatus()}</p>
          </div>
          <div className="text-3xl">
            {referralCount >= 25 ? '👑' : referralCount >= 10 ? '⭐' : '🆓'}
          </div>
        </div>

        {/* Progress Bar */}
        {nextMilestone && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>İlerleme</span>
              <span>{referralCount}/{nextMilestone.target}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressToNextLevel()}%` }}
              ></div>
            </div>
            <p className="text-center text-gray-300 mt-2">
              {remainingReferrals} kişi daha davet et → {nextMilestone.reward}
            </p>
          </div>
        )}

        {isPremium && premiumUntil && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
            <p className="text-green-300 text-sm">
              ✨ Premium üyeliğin {new Date(premiumUntil).toLocaleDateString('tr-TR')} tarihine kadar aktif
            </p>
          </div>
        )}
      </div>

      {/* Referral Link */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">🔗 Referral Linkin</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${referralCode}`}
              readOnly
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>
          <button
            onClick={copyReferralLink}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 whitespace-nowrap"
          >
            {copied ? '✅ Kopyalandı!' : '📋 Kopyala'}
          </button>
        </div>
      </div>

      {/* New Referral Rewards */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">🎁 Yeni Referral Ödülleri</h3>
        <div className="space-y-4">
          {/* Free Tier */}
          <div className="flex items-center space-x-4 p-4 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <div className="text-2xl">🆓</div>
            <div className="flex-1">
              <div className="text-white font-semibold">Ücretsiz Kullanım</div>
              <div className="text-gray-300 text-sm">Tüm temel özellikler + 1 ay premium deneme</div>
            </div>
            <div className="text-lg font-bold text-blue-400">Herkes</div>
          </div>

          {/* 10 Referrals */}
          <div className={`flex items-center space-x-4 p-4 rounded-lg ${referralCount >= 10 ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5 border border-white/10'}`}>
            <div className="text-2xl">{referralCount >= 10 ? '✅' : '⏳'}</div>
            <div className="flex-1">
              <div className="text-white font-semibold">10 Referral → 1 Yıl Premium</div>
              <div className="text-gray-300 text-sm">Gelişmiş analitik + Whale tracking + Özel alerts</div>
            </div>
            <div className="text-lg font-bold text-purple-400">
              {referralCount}/10
            </div>
          </div>

          {/* 25 Referrals */}
          <div className={`flex items-center space-x-4 p-4 rounded-lg ${referralCount >= 25 ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5 border border-white/10'}`}>
            <div className="text-2xl">{referralCount >= 25 ? '✅' : '⏳'}</div>
            <div className="flex-1">
              <div className="text-white font-semibold">25 Referral → Lifetime Premium</div>
              <div className="text-gray-300 text-sm">Sınırsız premium erişim + VIP support</div>
            </div>
            <div className="text-lg font-bold text-gold-400">
              {referralCount}/25
            </div>
          </div>
        </div>
      </div>

      {/* Commission Info */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30">
        <h3 className="text-xl font-bold text-white mb-4">💰 Komisyon Sistemi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl mb-2">🦄</div>
            <div className="text-white font-semibold">Uniswap</div>
            <div className="text-green-400">%0.05 komisyon</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl mb-2">👻</div>
            <div className="text-white font-semibold">Aave</div>
            <div className="text-green-400">%0.1 komisyon</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl mb-2">☀️</div>
            <div className="text-white font-semibold">Raydium</div>
            <div className="text-green-400">%0.03 komisyon</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl mb-2">🌀</div>
            <div className="text-white font-semibold">Curve</div>
            <div className="text-green-400">%0.04 komisyon</div>
          </div>
        </div>
        <div className="mt-4 bg-green-500/20 border border-green-500/30 rounded-lg p-3">
          <p className="text-green-300 text-sm text-center">
            💡 <strong>Nasıl Çalışır:</strong> Platformumuz üzerinden DeFi protokollerine bağlandığında, 
            her işlemden küçük bir komisyon alırız. Sen hiçbir ücret ödemezsin!
          </p>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">📢 Paylaş ve Büyüt</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button 
            onClick={() => {
              const url = `${window.location.origin}/signup?ref=${referralCode}`
              const text = `🚀 DeFi Yield Tracker'da en yüksek APY'leri keşfet! Ücretsiz kayıt ol ve premium özelliklere erişim kazan.`
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank')
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
          >
            📘 Facebook
          </button>
          <button 
            onClick={() => {
              const url = `${window.location.origin}/signup?ref=${referralCode}`
              const text = `🚀 DeFi Yield Tracker'da en yüksek APY'leri keşfet! ${url}`
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
            }}
            className="bg-blue-400 hover:bg-blue-500 text-white p-3 rounded-lg transition-colors"
          >
            🐦 Twitter
          </button>
          <button 
            onClick={() => {
              const url = `${window.location.origin}/signup?ref=${referralCode}`
              const text = `🚀 DeFi Yield Tracker'da en yüksek APY'leri keşfet! Ücretsiz kayıt ol: ${url}`
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
            }}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors"
          >
            💬 WhatsApp
          </button>
          <button 
            onClick={() => {
              const url = `${window.location.origin}/signup?ref=${referralCode}`
              const text = `DeFi Yield Tracker - En yüksek APY'leri keşfet`
              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`, '_blank')
            }}
            className="bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-lg transition-colors"
          >
            💼 LinkedIn
          </button>
        </div>
      </div>
    </div>
  )
}