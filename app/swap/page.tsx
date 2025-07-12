'use client'
import { useState, useEffect } from 'react'

// Token data
interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
  chainId: number
}

interface SwapQuote {
  fromToken: Token
  toToken: Token
  fromAmount: string
  toAmount: string
  protocols: string[]
  estimatedGas: string
  priceImpact: number
}

export default function SwapInterface() {
  const [account, setAccount] = useState<string>('')
  const [chainId, setChainId] = useState<number>(1)
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [fromAmount, setFromAmount] = useState<string>('')
  const [toAmount, setToAmount] = useState<string>('')
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [loading, setLoading] = useState(false)
  const [slippage, setSlippage] = useState<number>(1.0)

  // Popular tokens by chain
  const POPULAR_TOKENS: Record<number, Token[]> = {
    1: [ // Ethereum
      { address: '0xA0b86a33E6441d0C0c5829b0D0155c8f5B7D8DBB', symbol: 'ETH', name: 'Ethereum', decimals: 18, logoURI: '🔷', chainId: 1 },
      { address: '0xA0b86a33E6441e0c0c5829b0d0155c8f5b7d8dba', symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: '💵', chainId: 1 },
      { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether', decimals: 6, logoURI: '💸', chainId: 1 },
      { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, logoURI: '🟡', chainId: 1 },
      { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, logoURI: '₿', chainId: 1 }
    ],
    56: [ // BSC
      { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', symbol: 'BNB', name: 'BNB', decimals: 18, logoURI: '🟡', chainId: 56 },
      { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', name: 'USD Coin', decimals: 18, logoURI: '💵', chainId: 56 },
      { address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', symbol: 'CAKE', name: 'PancakeSwap', decimals: 18, logoURI: '🥞', chainId: 56 }
    ]
  }

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          setChainId(parseInt(chainId, 16))
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!')
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts.length > 0) {
        setAccount(accounts[0])
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        setChainId(parseInt(chainId, 16))
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
    }
  }

  const getQuote = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) return

    setLoading(true)
    try {
      // Simulate API call to 1inch or 0x for real quotes
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock quote calculation
      const rate = Math.random() * 2000 + 100 // Random exchange rate
      const calculatedToAmount = (parseFloat(fromAmount) * rate).toFixed(6)
      
      const mockQuote: SwapQuote = {
        fromToken,
        toToken,
        fromAmount,
        toAmount: calculatedToAmount,
        protocols: ['Uniswap V3', 'SushiSwap', '1inch'],
        estimatedGas: (Math.random() * 50000 + 21000).toFixed(0),
        priceImpact: Math.random() * 2
      }
      
      setQuote(mockQuote)
      setToAmount(calculatedToAmount)
    } catch (error) {
      console.error('Failed to get quote:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchTokens = () => {
    const tempToken = fromToken
    const tempAmount = fromAmount
    
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(tempAmount)
    setQuote(null)
  }

  const currentTokens = POPULAR_TOKENS[chainId] || POPULAR_TOKENS[1]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔄 DeFi Swap</h1>
          <p className="text-gray-300">Best rates across all DEXs</p>
        </div>

        {/* Wallet Connection */}
        {!account ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
            <div className="text-center">
              <div className="text-4xl mb-4">👛</div>
              <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-gray-300 mb-4">Connect your wallet to start trading</p>
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                🔗 Connect MetaMask
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Swap Interface */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
              {/* From Token */}
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">From</label>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <select
                      value={fromToken?.address || ''}
                      onChange={(e) => {
                        const token = currentTokens.find(t => t.address === e.target.value)
                        setFromToken(token || null)
                        setQuote(null)
                      }}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Select token</option>
                      {currentTokens.map(token => (
                        <option key={token.address} value={token.address}>
                          {token.logoURI} {token.symbol}
                        </option>
                      ))}
                    </select>
                    <button className="text-purple-400 text-sm">Max</button>
                  </div>
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => {
                      setFromAmount(e.target.value)
                      setQuote(null)
                    }}
                    placeholder="0.0"
                    className="w-full bg-transparent text-white text-2xl font-bold outline-none"
                  />
                  <div className="text-gray-400 text-sm mt-1">
                    Balance: 0.0 {fromToken?.symbol}
                  </div>
                </div>
              </div>

              {/* Switch Button */}
              <div className="flex justify-center mb-4">
                <button
                  onClick={switchTokens}
                  className="bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all transform hover:scale-110"
                >
                  <div className="text-white text-xl">⇅</div>
                </button>
              </div>

              {/* To Token */}
              <div className="mb-6">
                <label className="block text-white text-sm font-medium mb-2">To</label>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <select
                      value={toToken?.address || ''}
                      onChange={(e) => {
                        const token = currentTokens.find(t => t.address === e.target.value)
                        setToToken(token || null)
                        setQuote(null)
                      }}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Select token</option>
                      {currentTokens.map(token => (
                        <option key={token.address} value={token.address}>
                          {token.logoURI} {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={toAmount}
                    readOnly
                    placeholder="0.0"
                    className="w-full bg-transparent text-white text-2xl font-bold outline-none"
                  />
                  <div className="text-gray-400 text-sm mt-1">
                    Balance: 0.0 {toToken?.symbol}
                  </div>
                </div>
              </div>

              {/* Slippage Settings */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white text-sm font-medium">Slippage Tolerance</label>
                  <span className="text-purple-400 text-sm">{slippage}%</span>
                </div>
                <div className="flex space-x-2">
                  {[0.1, 0.5, 1.0, 3.0].map(value => (
                    <button
                      key={value}
                      onClick={() => setSlippage(value)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        slippage === value 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Get Quote Button */}
              <button
                onClick={getQuote}
                disabled={!fromToken || !toToken || !fromAmount || loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white py-3 px-6 rounded-lg font-semibold transition-all mb-4"
              >
                {loading ? 'Getting Quote...' : '💰 Get Best Quote'}
              </button>

              {/* Quote Details */}
              {quote && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                  <h4 className="text-white font-semibold mb-3">📊 Quote Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Rate</span>
                      <span className="text-white">
                        1 {quote.fromToken.symbol} = {(parseFloat(quote.toAmount) / parseFloat(quote.fromAmount)).toFixed(6)} {quote.toToken.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Price Impact</span>
                      <span className={`${quote.priceImpact > 1 ? 'text-red-400' : 'text-green-400'}`}>
                        {quote.priceImpact.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Estimated Gas</span>
                      <span className="text-white">{quote.estimatedGas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Route</span>
                      <span className="text-purple-400">{quote.protocols.join(' → ')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Swap Button */}
              <button
                onClick={executeSwap}
                disabled={!quote || loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
              >
                {loading ? 'Swapping...' : '🚀 Execute Swap'}
              </button>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">📜 Recent Transactions</h3>
              <div className="space-y-3">
                {[
                  { from: 'ETH', to: 'USDC', amount: '0.5', status: 'success' },
                  { from: 'USDT', to: 'DAI', amount: '100', status: 'pending' },
                  { from: 'WBTC', to: 'ETH', amount: '0.01', status: 'success' }
                ].map((tx, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">
                        {tx.status === 'success' ? '✅' : '⏳'}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">
                          {tx.amount} {tx.from} → {tx.to}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {tx.status === 'success' ? 'Completed' : 'Pending'}
                        </div>
                      </div>
                    </div>
                    <button className="text-purple-400 text-sm">View</button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
    }
  }

  const executeSwap = async () => {
    if (!quote || !account) return

    try {
      setLoading(true)
      
      // In real implementation, this would:
      // 1. Get swap transaction data from 1inch/0x API
      // 2. Send transaction via MetaMask
      // 3. Wait for confirmation
      
      // Mock transaction
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      alert(`Swap successful! \n${quote.fromAmount} ${quote.fromToken.symbol} → ${quote.toAmount} ${quote.toToken.symbol}`)
      
      // Reset form
      setFromAmount('')
      setToAmount('')
      setQuote(null)
    } catch (error) {
      console.error('Swap failed:', error)
      alert('Swap failed! Please try again.')
    } finally {
      setLoading(false)