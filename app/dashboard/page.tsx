'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface YieldData {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase?: number;
  apyReward?: number;
  stablecoin: boolean;
}

export default function Dashboard() {
  const [user, setUser] = useState({
    email: 'demo@example.com',
    referralCode: 'DEMO1234',
    referralCount: 3,
    isPremium: false,
    signupDate: new Date().toISOString()
  })
  const [copied, setCopied] = useState(false)
  const [yields, setYields] = useState<YieldData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Load yield data
    fetchYields()
  }, [])

  const fetchYields = async () => {
    try {
      const response = await fetch('https://yields.llama.fi/pools')
      const data = await response.json()
      
      const topYields = data.data
        .filter((pool: YieldData) => 
          pool.apy > 0 && 
          pool.apy < 1000 && 
          pool.tvlUsd > 100000 &&
          pool.project && 
          pool.symbol
        )
        .sort((a: YieldData, b: YieldData) => b.apy - a.apy)
        .slice(0, 10)
      
      setYields(topYields)
    } catch (error) {
      console.error('Error fetching yields:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    const referralUrl = `${window.location.origin}/signup?ref=${user.referralCode}`
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getRemainingReferrals = () => {
    return Math.max(0, 5 - user.referralCount)
  }

  const getPremiumProgress = () => {
    return Math.min(100, (user.referralCount / 5) * 100)
  }

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
    return num.toFixed(0)
  }

  const formatAPY = (apy: number): string => {
    if (apy >= 100) return apy.toFixed(0) + '%'
    if (apy >= 10) return apy.toFixed(1) + '%'
    return apy.toFixed(2) + '%'
  }

  const getProtocolLogo = (project: string): string => {
    const logos: Record<string, string> = {
      uniswap: '🦄', 'uniswap-v3': '🦄', aave: '👻', 'aave-v2': '👻', 'aave-v3': '👻',
      compound: '🏛️', curve: '🌀', balancer: '⚖️', sushiswap: '🍣', pancakeswap: '🥞'
    }
    return logos[project.toLowerCase()] || '💰'
  }

  const getChainLogo = (chain: string): string => {
    const chains: Record<string, string> = {
      ethereum: '🔷', polygon: '🟣', arbitrum: '🔵', optimism: '🔴', 
      avalanche: '⚪', bsc: '🟡', fantom: '👻', solana: '🟢'
    }
    return chains[chain.toLowerCase()] || '⚪'
  }

  const calculateRiskScore = (pool: YieldData) => {
    let riskScore = 0
    if (pool.apy > 50) riskScore += 2
    else if (pool.apy > 20) riskScore += 1
    if (pool.tvlUsd < 1000000) riskScore += 1
    if (pool.stablecoin) riskScore -= 1
    riskScore = Math.max(0, Math.min(3, riskScore))
    
    if (riskScore <= 1) return { level: 'Low', color: 'bg-green-500/20 text-green-400' }
    else if (riskScore === 2) return { level: 'Medium', color: 'bg-yellow-500/20 text-yellow-400' }
    else return { level: 'High', color: 'bg-red-500/20 text-red-400' }
  }

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
              <h1 className="text-2xl font-bold text-white">DeFi Yield Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-gray-300">
                Hoş geldin, <span className="text-white font-semibold">{user.email}</span>
              </div>
              <Link href="/login" className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors">
                Çıkış
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-xl p-1 mb-8 max-w-md">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'bg-white/20 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            📊 Genel Bakış
          </button>
          <button
            onClick={() => setActiveTab('yields')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'yields' 
                ? 'bg-white/20 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            💰 Yield'ler
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'referrals' 
                ? 'bg-white/20 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            🤝 Referral
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Premium Durumu</p>
                    <p className="text-2xl font-bold text-white">
                      {user.isPremium ? 'Premium' : 'Free'}
                    </p>
                  </div>
                  <div className="text-3xl">
                    {user.isPremium ? '👑' : '🆓'}
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Referral Sayısı</p>
                    <p className="text-2xl font-bold text-purple-400">{user.referralCount}</p>
                  </div>
                  <div className="text-3xl">🎯</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Kalan Referral</p>
                    <p className="text-2xl font-bold text-blue-400">{getRemainingReferrals()}</p>
                  </div>
                  <div className="text-3xl">⏳</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Üyelik Tarihi</p>
                    <p className="text-lg font-bold text-green-400">
                      {new Date(user.signupDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="text-3xl">📅</div>
                </div>
              </div>
            </div>

            {/* Premium Progress */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Premium'a Doğru İlerleme</h3>
                <span className="text-purple-400 font-semibold">{getPremiumProgress().toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getPremiumProgress()}%` }}
                ></div>
              </div>
              <p className="text-gray-300">
                {user.isPremium 
                  ? '🎉 Tebrikler! Premium üyesin!' 
                  : `${getRemainingReferrals()} kişi daha davet et ve premium ol!`
                }
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">🎯 Hızlı İşlemler</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('yields')}
                    className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white px-4 py-3 rounded-lg transition-colors text-left"
                  >
                    📈 En Yüksek Yield'leri Gör
                  </button>
                  <button 
                    onClick={() => setActiveTab('referrals')}
                    className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-white px-4 py-3 rounded-lg transition-colors text-left"
                  >
                    🤝 Arkadaş Davet Et
                  </button>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">📊 İstatistikler</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Toplam Kullanıcı:</span>
                    <span className="text-white font-semibold">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Aktif Yield'ler:</span>
                    <span className="text-white font-semibold">{yields.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">En Yüksek APY:</span>
                    <span className="text-green-400 font-semibold">
                      {yields.length > 0 ? formatAPY(Math.max(...yields.map(y => y.apy))) : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Yields Tab */}
        {activeTab === 'yields' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-white">🔥 En Yüksek Yield'ler</h3>
                    <p className="text-gray-300 mt-2">Gerçek zamanlı DeFi protokol verileri</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-semibold">CANLI</span>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <p className="text-gray-300 mt-4">Yield verileri yükleniyor...</p>
                  </div>
                ) : yields.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left p-4 text-gray-300 font-semibold">Protokol</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">Pool</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">Chain</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">APY</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">Risk</th>
                        <th className="text-left p-4 text-gray-300 font-semibold">TVL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yields.map((pool, index) => {
                        const risk = calculateRiskScore(pool)
                        return (
                          <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="text-2xl">
                                  {getProtocolLogo(pool.project)}
                                </div>
                                <div>
                                  <div className="text-white font-semibold capitalize">
                                    {pool.project.replace(/-/g, ' ')}
                                  </div>
                                  <div className="text-gray-400 text-sm">
                                    {pool.pool.substring(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-gray-300 font-medium">
                                {pool.symbol.length > 15 ? 
                                  pool.symbol.substring(0, 15) + '...' : 
                                  pool.symbol
                                }
                              </div>
                              {pool.stablecoin && (
                                <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded mt-1 inline-block">
                                  Stablecoin
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl">{getChainLogo(pool.chain)}</span>
                                <span className="text-gray-300 capitalize text-sm">
                                  {pool.chain}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-green-400 font-bold text-lg">
                                {formatAPY(pool.apy)}
                              </div>
                              {pool.apyBase && pool.apyReward && (
                                <div className="text-xs text-gray-400">
                                  Base: {formatAPY(pool.apyBase)} + Reward: {formatAPY(pool.apyReward)}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-lg text-sm font-medium ${risk.color}`}>
                                {risk.level}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="text-gray-300 font-medium">
                                ${formatNumber(pool.tvlUsd)}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-gray-300">Veri yüklenemiyor. Lütfen daha sonra tekrar deneyin.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div className="space-y-6">
            {/* Referral Link */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">🔗 Referral Linkin</h3>
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
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  {copied ? '✅ Kopyalandı!' : '📋 Kopyala'}
                </button>
              </div>
            </div>

            {/* Referral Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
                <div className="text-3xl font-bold text-purple-400">{user.referralCount}</div>
                <div className="text-gray-300 mt-2">Toplam Referral</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
                <div className="text-3xl font-bold text-blue-400">{getRemainingReferrals()}</div>
                <div className="text-gray-300 mt-2">Kalan Referral</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
                <div className="text-3xl font-bold text-green-400">
                  {user.isPremium ? '∞' : '1 Yıl'}
                </div>
                <div className="text-gray-300 mt-2">Premium Ödül</div>
              </div>
            </div>

            {/* Referral Rewards */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">🎁 Referral Ödülleri</h3>
              <div className="space-y-4">
                <div className={`flex items-center space-x-4 p-4 rounded-lg ${user.referralCount >= 5 ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5 border border-white/10'}`}>
                  <div className="text-2xl">{user.referralCount >= 5 ? '✅' : '⏳'}</div>
                  <div className="flex-1">
                    <div className="text-white font-semibold">5 Referral → 1 Yıl Premium</div>
                    <div className="text-gray-300 text-sm">Tüm premium özelliklere erişim</div>
                  </div>
                  <div className="text-lg font-bold text-purple-400">
                    {user.referralCount}/5
                  </div>
                </div>

                <div className={`flex items-center space-x-4 p-4 rounded-lg ${user.referralCount >= 25 ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5 border border-white/10'}`}>
                  <div className="text-2xl">{user.referralCount >= 25 ? '✅' : '⏳'}</div>
                  <div className="flex-1">
                    <div className="text-white font-semibold">25 Referral → Lifetime Premium</div>
                    <div className="text-gray-300 text-sm">Sınırsız premium erişim</div>
                  </div>
                  <div className="text-lg font-bold text-blue-400">
                    {user.referralCount}/25
                  </div>
                </div>

                <div className={`flex items-center space-x-4 p-4 rounded-lg ${user.referralCount >= 100 ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5 border border-white/10'}`}>
                  <div className="text-2xl">{user.referralCount >= 100 ? '✅' : '⏳'}</div>
                  <div className="flex-1">
                    <div className="text-white font-semibold">100 Referral → Revenue Sharing</div>
                    <div className="text-gray-300 text-sm">Platform gelirlerinden pay alma</div>
                  </div>
                  <div className="text-lg font-bold text-green-400">
                    {user.referralCount}/100
                  </div>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">📢 Paylaş ve Kazan</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors">
                  📘 Facebook
                </button>
                <button className="bg-blue-400 hover:bg-blue-500 text-white p-3 rounded-lg transition-colors">
                  🐦 Twitter
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors">
                  💬 WhatsApp
                </button>
                <button className="bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-lg transition-colors">
                  💼 LinkedIn
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}