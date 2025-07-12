'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useWallet } from '../hooks/useWallet'
import { DeFiLlamaAPI, YieldPool } from '../lib/defillama'
import { DEXAggregator } from '../lib/dex-aggregator'

// Chain configurations
const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', logo: '🔷' },
  { id: 56, name: 'BSC', symbol: 'BNB', logo: '🟡' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', logo: '🟣' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', logo: '🔵' },
  { id: 10, name: 'Optimism', symbol: 'ETH', logo: '🔴' },
]

export default function RealHomePage() {
  // Real wallet connection
  const {
    address,
    chainId,
    balance,
    isConnected,
    isConnecting,
    error: walletError,
    connect,
    disconnect,
    switchNetwork,
  } = useWallet()

  // Real data states
  const [pools, setPools] = useState<YieldPool[]>([])
  const [filteredPools, setFilteredPools] = useState<YieldPool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Filter states
  const [selectedChain, setSelectedChain] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [minAPY, setMinAPY] = useState<number>(0)
  const [minTVL, setMinTVL] = useState<number>(1000000)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [stablecoinOnly, setStablecoinOnly] = useState<boolean>(false)

  // Initialize DeFiLlama API
  const defillama = new DeFiLlamaAPI()

  // Load real data from DeFiLlama
  useEffect(() => {
    loadRealData()
  }, [])

  const loadRealData = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Loading real data from DeFiLlama...')
      
      // Get top pools with minimum TVL
      const topPools = await defillama.getTopPoolsByAPY(200, 100000)
      
      console.log(`✅ Loaded ${topPools.length} real pools`)
      
      setPools(topPools)
      setFilteredPools(topPools)
      setLastUpdated(new Date())
      
    } catch (err: any) {
      console.error('❌ Failed to load real data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters to real data
  useEffect(() => {
    let filtered = pools

    // Chain filter
    if (selectedChain !== 'all') {
      filtered = filtered.filter(pool => pool.chain.toLowerCase() === selectedChain.toLowerCase())
    }

    // Category filter (lending vs dex)
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'lending') {
        filtered = filtered.filter(pool => 
          pool.project.toLowerCase().includes('aave') ||
          pool.project.toLowerCase().includes('compound') ||
          pool.project.toLowerCase().includes('venus') ||
          pool.project.toLowerCase().includes('radiant')
        )
      } else if (selectedCategory === 'dex') {
        filtered = filtered.filter(pool => 
          !pool.project.toLowerCase().includes('aave') &&
          !pool.project.toLowerCase().includes('compound') &&
          !pool.project.toLowerCase().includes('venus')
        )
      }
    }

    // APY filter
    if (minAPY > 0) {
      filtered = filtered.filter(pool => pool.apy >= minAPY)
    }

    // TVL filter
    if (minTVL > 0) {
      filtered = filtered.filter(pool => pool.tvlUsd >= minTVL)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pool =>
        pool.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.chain.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Stablecoin filter
    if (stablecoinOnly) {
      filtered = filtered.filter(pool => pool.stablecoin)
    }

    setFilteredPools(filtered)
  }, [pools, selectedChain, selectedCategory, minAPY, minTVL, searchTerm, stablecoinOnly])

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
    return num.toFixed(0)
  }

  const formatAPY = (apy: number): string => {
    return apy.toFixed(2) + '%'
  }

  const getProtocolLogo = (project: string): string => {
    const logos: Record<string, string> = {
      'uniswap-v3': '🦄', 'uniswap-v2': '🦄', 'sushiswap': '🍣', 'curve': '🌀',
      'balancer': '⚖️', 'aave-v3': '👻', 'aave-v2': '👻', 'compound-v3': '🏛️',
      'pancakeswap': '🥞', 'raydium': '☀️', 'orca': '🐋', 'jupiter': '🪐',
      'kyberswap': '⚡', '1inch': '🔀', 'dodo': '🦤', 'bancor': '🌊'
    }
    
    for (const [key, logo] of Object.entries(logos)) {
      if (project.toLowerCase().includes(key)) {
        return logo
      }
    }
    return '💰'
  }

  const getChainLogo = (chain: string): string => {
    const chainLogos: Record<string, string> = {
      'ethereum': '🔷', 'bsc': '🟡', 'polygon': '🟣', 'arbitrum': '🔵',
      'optimism': '🔴', 'avalanche': '⚪', 'fantom': '👻', 'solana': '🟢'
    }
    return chainLogos[chain.toLowerCase()] || '⚪'
  }

  const getRiskLevel = (pool: YieldPool) => {
    const riskScore = defillama.calculateRiskScore(pool)
    const level = defillama.getRiskLevel(riskScore)
    
    const colors = {
      'Low': 'bg-green-500/20 text-green-400',
      'Medium': 'bg-yellow-500/20 text-yellow-400',
      'High': 'bg-red-500/20 text-red-400'
    }
    
    return { level, color: colors[level as keyof typeof colors] }
  }

  const getCurrentChain = () => {
    return SUPPORTED_CHAINS.find(chain => chain.id === chainId) || SUPPORTED_CHAINS[0]
  }

  const handleSwap = (pool: YieldPool) => {
    if (!isConnected) {
      alert('Please connect your wallet first!')
      return
    }
    
    // Navigate to real swap page
    window.location.href = `/swap?protocol=${pool.project}&pool=${pool.pool}&chain=${pool.chain}`
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
              <div>
                <h1 className="text-2xl font-bold text-white">DeFi Yield Tracker</h1>
                <p className="text-gray-300 text-sm">Real Multi-Chain DEX Aggregator</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-4">
                  <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                    <div className="text-white text-sm">
                      {getCurrentChain().logo} {getCurrentChain().name}
                    </div>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                    <div className="text-white text-sm">
                      💰 {parseFloat(balance).toFixed(4)} {getCurrentChain().symbol}
                    </div>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                    <div className="text-white text-sm">
                      🔗 {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                  </div>
                  <button
                    onClick={disconnect}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors border border-red-500/30"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connect}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
                >
                  {isConnecting ? 'Connecting...' : '🔗 Connect Wallet'}
                </button>
              )}
            </div>
          </div>
          
          {walletError && (
            <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-300 text-sm">❌ {walletError}</p>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Chain Selector */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {SUPPORTED_CHAINS.map((chain) => (
            <button
              key={chain.id}
              onClick={() => switchNetwork(chain.id)}
              className={`bg-white/10 hover:bg-white/20 rounded-xl p-4 border transition-all ${
                chainId === chain.id ? 'border-purple-400 bg-purple-500/20' : 'border-white/20'
              }`}
            >
              <div className="text-2xl mb-2">{chain.logo}</div>
              <div className="text-white font-semibold text-sm">{chain.name}</div>
              {chainId === chain.id && (
                <div className="text-green-400 text-xs mt-1">Connected</div>
              )}
            </button>
          ))}
        </div>

        {/* Real Data Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold">Real Live Data from DeFiLlama</span>
              {lastUpdated && (
                <span className="text-gray-400 text-sm">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
            <button
              onClick={loadRealData}
              disabled={loading}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition-colors border border-blue-500/30 disabled:opacity-50"
            >
              {loading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">🔍 Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pools..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Chain</label>
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
              >
                <option value="all">All Chains</option>
                <option value="ethereum">Ethereum</option>
                <option value="bsc">BSC</option>
                <option value="polygon">Polygon</option>
                <option value="arbitrum">Arbitrum</option>
                <option value="optimism">Optimism</option>
                <option value="avalanche">Avalanche</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
              >
                <option value="all">All Categories</option>
                <option value="dex">DEX</option>
                <option value="lending">Lending</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Min APY (%)</label>
              <input
                type="number"
                value={minAPY}
                onChange={(e) => setMinAPY(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Min TVL ($)</label>
              <input
                type="number"
                value={minTVL}
                onChange={(e) => setMinTVL(Number(e.target.value))}
                placeholder="1000000"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Options</label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={stablecoinOnly}
                  onChange={(e) => setStablecoinOnly(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-white text-sm">Stablecoins only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Real Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-green-400">{filteredPools.length}</div>
            <div className="text-gray-300">Real Pools</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {filteredPools.length > 0 ? formatAPY(Math.max(...filteredPools.map(p => p.apy))) : '0%'}
            </div>
            <div className="text-gray-300">Highest APY</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-blue-400">
              ${formatNumber(filteredPools.reduce((sum, p) => sum + p.tvlUsd, 0))}
            </div>
            <div className="text-gray-300">Total TVL</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-pink-400">🔥</div>
            <div className="text-gray-300">Live Data</div>
          </div>
        </div>

        {/* Real Pools Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                🏆 Real DeFi Opportunities
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-semibold">LIVE DATA</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
                <p className="text-gray-300">Loading real data from DeFiLlama...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="text-red-400 mb-4">❌ Error loading data</div>
                <p className="text-gray-300 mb-4">{error}</p>
                <button
                  onClick={loadRealData}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition-colors border border-blue-500/30"
                >
                  🔄 Retry
                </button>
              </div>
            ) : filteredPools.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-4 text-gray-300 font-semibold">Protocol</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Pool</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Chain</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">APY</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Risk</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">TVL</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPools.slice(0, 30).map((pool, index) => {
                    const risk = getRiskLevel(pool)
                    
                    return (
                      <tr key={`${pool.pool}-${index}`} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{getProtocolLogo(pool.project)}</div>
                            <div>
                              <div className="text-white font-semibold capitalize">
                                {pool.project.replace(/-/g, ' ')}
                              </div>
                              <div className="text-gray-400 text-sm">
                                {pool.stablecoin && <span className="text-blue-400">🔵 Stable</span>}
                                {pool.ilRisk && <span className="text-yellow-400">⚠️ IL Risk</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300 font-medium">
                            {pool.symbol.length > 20 ? 
                              pool.symbol.substring(0, 20) + '...' : 
                              pool.symbol
                            }
                          </div>
                          <div className="text-gray-400 text-xs">
                            {pool.poolMeta && pool.poolMeta.substring(0, 30)}
                          </div>
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
                            <div className="text-gray-400 text-xs">
                              Base: {formatAPY(pool.apyBase)}<br/>
                              Reward: {formatAPY(pool.apyReward)}
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
                        <td className="p-4">
                          <button
                            onClick={() => handleSwap(pool)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                          >
                            🚀 Trade
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-300">No pools found matching your filters</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}