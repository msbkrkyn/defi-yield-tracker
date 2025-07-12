'use client'
import { useState, useEffect } from 'react'
import { useWallet } from '../../hooks/useWallet'
import { DEXAggregator, Token } from '../../lib/dex-aggregator'

export default function ProductionSwapPage() {
  // Real wallet connection
  const {
    address,
    chainId,
    balance,
    isConnected,
    isMetaMaskInstalled,
    connect,
    getSigner,
    getProvider,
    getTokenBalance,
  } = useWallet()

  // Real swap states
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [fromAmount, setFromAmount] = useState<string>('')
  const [toAmount, setToAmount] = useState<string>('')
  const [availableTokens, setAvailableTokens] = useState<Record<string, Token>>({})
  const [quote, setQuote] = useState<any>(null)
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [slippage, setSlippage] = useState<number>(1.0)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({})

  // Real DEX aggregator
  const dexAggregator = new DEXAggregator(chainId || 1)

  // Load real tokens from 1inch API
  useEffect(() => {
    if (chainId && isConnected) {
      loadRealTokens()
    }
  }, [chainId, isConnected])

  // Load token balances when tokens change
  useEffect(() => {
    if (isConnected && address && fromToken) {
      loadTokenBalance(fromToken.address)
    }
    if (isConnected && address && toToken) {
      loadTokenBalance(toToken.address)
    }
  }, [isConnected, address, fromToken, toToken])

  const loadRealTokens = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log(`🔄 Loading REAL tokens for chain ${chainId}...`)
      
      const tokens = await dexAggregator.getTokens()
      setAvailableTokens(tokens)
      
      console.log(`✅ Loaded ${Object.keys(tokens).length} REAL tokens from 1inch`)
      
      // Set default tokens
      const tokenList = Object.values(tokens)
      const eth = tokenList.find(t => t.symbol === 'ETH' || t.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
      const usdc = tokenList.find(t => t.symbol === 'USDC')
      
      if (eth && !fromToken) setFromToken(eth)
      if (usdc && !toToken) setToToken(usdc)
      
    } catch (err: any) {
      console.error('❌ Failed to load REAL tokens:', err)
      setError(`Failed to load tokens: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadTokenBalance = async (tokenAddress: string) => {
    if (!address || !isConnected) return

    try {
      let balance: string
      
      if (tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        // Native ETH balance
        balance = await dexAggregator.parseAmount(await getProvider().request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        }), 18)
      } else {
        // ERC20 token balance
        balance = await getTokenBalance(tokenAddress)
      }
      
      setTokenBalances(prev => ({
        ...prev,
        [tokenAddress]: balance
      }))
    } catch (error) {
      console.error('Failed to load token balance:', error)
    }
  }

  const getRealQuote = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      return
    }

    setQuoteLoading(true)
    setError(null)
    setQuote(null)

    try {
      console.log('🔄 Getting REAL quote from 1inch API...')
      
      const amount = dexAggregator.formatAmount(fromAmount, fromToken.decimals)
      
      const quoteResult = await dexAggregator.getQuote({
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: amount
      })
      
      console.log('✅ Got REAL quote from 1inch:', quoteResult)
      
      setQuote(quoteResult)
      setToAmount(dexAggregator.parseAmount(quoteResult.toTokenAmount, toToken.decimals))
      
    } catch (err: any) {
      console.error('❌ Failed to get REAL quote:', err)
      setError(`Quote failed: ${err.message}`)
    } finally {
      setQuoteLoading(false)
    }
  }

  const executeRealSwap = async () => {
    if (!quote || !fromToken || !toToken || !address || !isConnected) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('🔄 Preparing REAL swap transaction via 1inch...')
      
      const amount = dexAggregator.formatAmount(fromAmount, fromToken.decimals)
      
      // Get REAL swap transaction data from 1inch API
      const swapResult = await dexAggregator.getSwap({
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: amount,
        fromAddress: address,
        slippage: slippage,
        disableEstimate: false
      })
      
      console.log('✅ Got REAL swap data from 1inch:', swapResult)
      
      // Execute the REAL blockchain transaction
      const provider = getProvider()
      const tx = await dexAggregator.executeSwap(swapResult, provider)
      
      console.log('🚀 REAL transaction sent:', tx.hash)
      setTxHash(tx.hash)
      setSuccess('Transaction sent! Waiting for confirmation...')
      
      // Wait for REAL confirmation
      const receipt = await tx.wait()
      console.log('✅ REAL transaction confirmed:', receipt)
      
      setSuccess(`✅ Swap successful! Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`)
      
      // Reset form
      setFromAmount('')
      setToAmount('')
      setQuote(null)
      
      // Refresh REAL balances
      loadTokenBalance(fromToken.address)
      loadTokenBalance(toToken.address)
      
    } catch (err: any) {
      console.error('❌ REAL swap failed:', err)
      setError(`Swap failed: ${err.message}`)
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

  const setMaxAmount = () => {
    if (!fromToken || !address) return
    
    const balance = tokenBalances[fromToken.address]
    if (balance) {
      // Leave some gas for transaction if ETH
      const maxAmount = fromToken.symbol === 'ETH' 
        ? Math.max(0, parseFloat(balance) - 0.01).toString()
        : balance
      
      setFromAmount(maxAmount)
      setQuote(null)
    }
  }

  const getTokenOptions = () => {
    return Object.values(availableTokens).slice(0, 20) // Show top 20 tokens
  }

  const getExplorerLink = (hash: string) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      56: 'https://bscscan.com',
      137: 'https://polygonscan.com',
      42161: 'https://arbiscan.io',
      10: 'https://optimistic.etherscan.io'
    }
    return `${explorers[chainId || 1]}/tx/${hash}`
  }

  // MetaMask not installed
  if (!isMetaMaskInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-5xl mb-4">🦊</div>
            <h2 className="text-2xl font-bold text-white mb-4">MetaMask Required</h2>
            <p className="text-gray-300 mb-6">Please install MetaMask extension to use real swap functionality</p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 inline-block"
            >
              📥 Install MetaMask
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔄 Real DeFi Swap</h1>
          <p className="text-gray-300">Powered by 1inch API + MetaMask</p>
          <div className="mt-2 text-green-400 text-sm">
            🟢 REAL Blockchain Transactions
          </div>
        </div>

        {/* Wallet Connection */}
        {!isConnected ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🦊</div>
              <h3 className="text-xl font-bold text-white mb-2">Connect MetaMask</h3>
              <p className="text-gray-300 mb-4">Connect your MetaMask to start REAL trading</p>
              <button
                onClick={connect}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                🦊 Connect MetaMask
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Account Info */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <div className="font-semibold">🦊 MetaMask Connected</div>
                  <div className="text-sm text-gray-300">{address?.slice(0, 8)}...{address?.slice(-6)}</div>
                  <div className="text-xs text-gray-400">Chain: {chainId}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-semibold">{parseFloat(balance).toFixed(4)} ETH</div>
                  <div className="text-gray-400 text-sm">Native Balance</div>
                </div>
              </div>
            </div>

            {/* Loading Tokens */}
            {loading && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-2"></div>
                  <p className="text-white">Loading REAL tokens from 1inch...</p>
                </div>
              </div>
            )}

            {/* Swap Interface */}
            {Object.keys(availableTokens).length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
                {/* From Token */}
                <div className="mb-4">
                  <label className="block text-white text-sm font-medium mb-2">From</label>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <select
                        value={fromToken?.address || ''}
                        onChange={(e) => {
                          const token = availableTokens[e.target.value]
                          setFromToken(token || null)
                          setQuote(null)
                        }}
                        className="bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white text-sm max-w-[140px]"
                        style={{ backgroundColor: '#1f2937' }}
                      >
                        <option value="">Select token</option>
                        {getTokenOptions().map(token => (
                          <option key={token.address} value={token.address} style={{ backgroundColor: '#1f2937' }}>
                            {token.symbol}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={setMaxAmount}
                        className="text-purple-400 text-sm hover:text-purple-300"
                      >
                        Max
                      </button>
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
                      Balance: {fromToken && tokenBalances[fromToken.address] 
                        ? parseFloat(tokenBalances[fromToken.address]).toFixed(6)
                        : '0.0'} {fromToken?.symbol}
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
                          const token = availableTokens[e.target.value]
                          setToToken(token || null)
                          setQuote(null)
                        }}
                        className="bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white text-sm max-w-[140px]"
                        style={{ backgroundColor: '#1f2937' }}
                      >
                        <option value="">Select token</option>
                        {getTokenOptions().map(token => (
                          <option key={token.address} value={token.address} style={{ backgroundColor: '#1f2937' }}>
                            {token.symbol}
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
                      Balance: {toToken && tokenBalances[toToken.address] 
                        ? parseFloat(tokenBalances[toToken.address]).toFixed(6)
                        : '0.0'} {toToken?.symbol}
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
                  onClick={getRealQuote}
                  disabled={!fromToken || !toToken || !fromAmount || quoteLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white py-3 px-6 rounded-lg font-semibold transition-all mb-4"
                >
                  {quoteLoading ? '🔄 Getting REAL Quote...' : '💰 Get 1inch Quote'}
                </button>

                {/* Quote Details */}
                {quote && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                    <h4 className="text-white font-semibold mb-3">📊 REAL Quote from 1inch</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Exchange Rate</span>
                        <span className="text-white">
                          1 {fromToken?.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken?.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Estimated Gas</span>
                        <span className="text-white">{parseInt(quote.estimatedGas).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Protocol</span>
                        <span className="text-purple-400">1inch Aggregator</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Execute Swap Button */}
                <button
                  onClick={executeRealSwap}
                  disabled={!quote || loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
                >
                  {loading ? '🔄 Executing REAL Swap...' : '🚀 Execute REAL Swap'}
                </button>
              </div>
            )}

            {/* Status Messages */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
                <p className="text-red-300">❌ {error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6">
                <p className="text-green-300">✅ {success}</p>
                {txHash && (
                  <a 
                    href={getExplorerLink(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 text-sm block mt-2"
                  >
                    🔗 View on Explorer
                  </a>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
                  <p className="text-white">Processing REAL transaction...</p>
                  <p className="text-gray-400 text-sm">Please confirm in MetaMask</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}