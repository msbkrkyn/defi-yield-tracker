'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

// Wallet connection utilities
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Types
interface Pool {
  id: string;
  protocol: string;
  symbol: string;
  apy: number;
  tvl: number;
  chain: string;
  category: string;
  risk: 'Low' | 'Medium' | 'High';
  tokens: string[];
}

interface Chain {
  id: string;
  name: string;
  logo: string;
  rpcUrl: string;
  chainId: number;
}

// Supported chains
const CHAINS: Chain[] = [
  { id: 'ethereum', name: 'Ethereum', logo: '🔷', rpcUrl: 'https://eth.llamarpc.com', chainId: 1 },
  { id: 'bsc', name: 'BSC', logo: '🟡', rpcUrl: 'https://bsc-dataseed.binance.org', chainId: 56 },
  { id: 'polygon', name: 'Polygon', logo: '🟣', rpcUrl: 'https://polygon-rpc.com', chainId: 137 },
  { id: 'arbitrum', name: 'Arbitrum', logo: '🔵', rpcUrl: 'https://arb1.arbitrum.io/rpc', chainId: 42161 },
  { id: 'solana', name: 'Solana', logo: '🟢', rpcUrl: 'https://api.mainnet-beta.solana.com', chainId: 0 }
]

// Mock pool data (in real app, fetch from multiple APIs)
const generateMockPools = (): Pool[] => {
  const protocols = ['uniswap-v3', 'uniswap-v2', 'sushiswap', 'curve', 'balancer', 'aave-v3', 'compound-v3', 'pancakeswap', 'raydium', 'orca', 'jupiter', 'kyberswap', '1inch', 'dodo', 'bancor']
  const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK', 'UNI', 'AAVE', 'CRV', 'MATIC', 'BNB', 'CAKE', 'SOL', 'RAY']
  const chains = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'solana']
  
  const pools: Pool[] = []
  
  for (let i = 0; i < 100; i++) {
    const protocol = protocols[Math.floor(Math.random() * protocols.length)]
    const chain = chains[Math.floor(Math.random() * chains.length)]
    const token1 = tokens[Math.floor(Math.random() * tokens.length)]
    const token2 = tokens[Math.floor(Math.random() * tokens.length)]
    
    if (token1 === token2) continue
    
    const apy = Math.random() * 500 + 1
    const tvl = Math.random() * 100000000 + 10000
    
    pools.push({
      id: `${protocol}-${token1}-${token2}-${i}`,
      protocol,
      symbol: `${token1}-${token2}`,
      apy,
      tvl,
      chain,
      category: protocol.includes('aave') || protocol.includes('compound') ? 'Lending' : 'DEX',
      risk: apy > 100 ? 'High' : apy > 20 ? 'Medium' : 'Low',
      tokens: [token1, token2]
    })
  }
  
  return pools.sort((a, b) => b.apy - a.apy)
}

export default function DEXAggregatorHome() {
  // State
  const [account, setAccount] = useState<string>('')
  const [chainId, setChainId] = useState<number>(1)
  const [balance, setBalance] = useState<string>('0')
  const [pools, setPools] = useState<Pool[]>([])
  const [filteredPools, setFilteredPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(false)
  
  // Filters
  const [selectedChain, setSelectedChain] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [minAPY, setMinAPY] = useState<number>(0)
  const [minTVL, setMinTVL] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Initialize pools
  useEffect(() => {
    const mockPools = generateMockPools()
    setPools(mockPools)
    setFilteredPools(mockPools)
  }, [])

  // Filter pools
  useEffect(() => {
    let filtered = pools

    if (selectedChain !== 'all') {
      filtered = filtered.filter(pool => pool.chain === selectedChain)
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(pool => pool.category === selectedCategory)
    }

    if (minAPY > 0) {
      filtered = filtered.filter(pool => pool.apy >= minAPY)
    }

    if (minTVL > 0) {
      filtered = filtered.filter(pool => pool.tvl >= minTVL)
    }

    if (searchTerm) {
      filtered = filtered.filter(pool => 
        pool.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.protocol.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPools(filtered)
  }, [pools, selectedChain, selectedCategory, minAPY, minTVL, searchTerm])

  // Wallet functions
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!')
      return
    }

    try {
      setLoading(true)
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      if (accounts.length > 0) {
        setAccount(accounts[0])
        await getBalance(accounts[0])
        await getChainId()
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBalance = async (address: string) => {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      })
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18)
      setBalance(balanceInEth.toFixed(4))
    } catch (error) {
      console.error('Failed to get balance:', error)
    }
  }

  const getChainId = async () => {
    try {
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      })
      setChainId(parseInt(chainId, 16))
    } catch (error) {
      console.error('Failed to get chain ID:', error)
    }
  }

  const switchChain = async (targetChainId: number) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }]
      })
      setChainId(targetChainId)
    } catch (error) {
      console.error('Failed to switch chain:', error)
    }
  }

  const disconnectWallet = () => {
    setAccount('')
    setBalance('0')
    setChainId(1)
  }

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
    return num.toFixed(0)
  }

  const formatAPY = (apy: number): string => {
    return apy.toFixed(2) + '%'
  }

  const getProtocolLogo = (protocol: string): string => {
    const logos: Record<string, string> = {
      'uniswap-v3': '🦄', 'uniswap-v2': '🦄', 'sushiswap': '🍣', 'curve': '🌀',
      'balancer': '⚖️', 'aave-v3': '👻', 'compound-v3': '🏛️', 'pancakeswap': '🥞',
      'raydium': '☀️', 'orca': '🐋', 'jupiter': '🪐', 'kyberswap': '⚡',
      '1inch': '🔀', 'dodo': '🦤', 'bancor': '🌊'
    }
    return logos[protocol] || '💰'
  }

  const getCurrentChain = () => {
    return CHAINS.find(chain => chain.chainId === chainId) || CHAINS[0]
  }

  const handleSwap = (pool: Pool) => {
    if (!account) {
      alert('Please connect your wallet first!')
      return
    }
    
    // In real implementation, this would open swap interface
    alert(`Opening swap interface for ${pool.symbol} on ${pool.protocol}`)
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
                <p className="text-gray-300 text-sm">Multi-Chain DEX Aggregator</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {account ? (
                <div className="flex items-center space-x-4">
                  <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                    <div className="text-white text-sm">
                      {getCurrentChain().logo} {getCurrentChain().name}
                    </div>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                    <div className="text-white text-sm">
                      💰 {balance} ETH
                    </div>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                    <div className="text-white text-sm">
                      🔗 {account.slice(0, 6)}...{account.slice(-4)}
                    </div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors border border-red-500/30"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
                >
                  {loading ? 'Connecting...' : '🔗 Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Chain Selector */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {CHAINS.map((chain) => (
            <button
              key={chain.id}
              onClick={() => chain.chainId > 0 && switchChain(chain.chainId)}
              className={`bg-white/10 hover:bg-white/20 rounded-xl p-4 border transition-all ${
                chainId === chain.chainId ? 'border-purple-400 bg-purple-500/20' : 'border-white/20'
              }`}
            >
              <div className="text-2xl mb-2">{chain.logo}</div>
              <div className="text-white font-semibold text-sm">{chain.name}</div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">🔍 Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                {CHAINS.map(chain => (
                  <option key={chain.id} value={chain.id}>{chain.name}</option>
                ))}
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
                <option value="DEX">DEX</option>
                <option value="Lending">Lending</option>
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
                placeholder="0"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-green-400">{filteredPools.length}</div>
            <div className="text-gray-300">Available Pools</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {filteredPools.length > 0 ? formatAPY(Math.max(...filteredPools.map(p => p.apy))) : '0%'}
            </div>
            <div className="text-gray-300">Highest APY</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-blue-400">
              ${formatNumber(filteredPools.reduce((sum, p) => sum + p.tvl, 0))}
            </div>
            <div className="text-gray-300">Total TVL</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-pink-400">🔥</div>
            <div className="text-gray-300">Live Data</div>
          </div>
        </div>

        {/* Pools Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                🏆 Top Yield Opportunities
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-semibold">LIVE</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
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
                {filteredPools.slice(0, 20).map((pool) => (
                  <tr key={pool.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getProtocolLogo(pool.protocol)}</div>
                        <div>
                          <div className="text-white font-semibold capitalize">
                            {pool.protocol.replace(/-/g, ' ')}
                          </div>
                          <div className="text-gray-400 text-sm">{pool.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-300 font-medium">{pool.symbol}</div>
                      <div className="text-gray-400 text-sm">
                        {pool.tokens.join(' / ')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">
                          {CHAINS.find(c => c.id === pool.chain)?.logo}
                        </span>
                        <span className="text-gray-300 capitalize text-sm">
                          {pool.chain}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-green-400 font-bold text-lg">
                        {formatAPY(pool.apy)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
                        pool.risk === 'Low' ? 'bg-green-500/20 text-green-400' :
                        pool.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {pool.risk}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-300 font-medium">
                        ${formatNumber(pool.tvl)}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}