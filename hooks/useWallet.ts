// hooks/useWallet.ts - SADECE METAMASK HOOK
import { useState, useEffect, useCallback } from 'react'
import { WalletConnection, WalletState } from '../lib/wallet'

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    balance: '0',
    isConnected: false
  })
  
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const wallet = new WalletConnection()

  // Check if MetaMask is installed
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false)

  useEffect(() => {
    // Check MetaMask installation
    setIsMetaMaskInstalled(WalletConnection.isMetaMaskInstalled())
    
    // Check existing connection
    if (WalletConnection.isMetaMaskInstalled()) {
      checkConnection()
    }
  }, [])

  const checkConnection = async () => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        console.log('🦊 Found existing MetaMask connection')
        const state = await wallet.connect()
        setWalletState(state)
      }
    } catch (error) {
      console.error('Failed to check existing MetaMask connection:', error)
    }
  }

  const connect = useCallback(async () => {
    // STRICT MetaMask check
    if (!window.ethereum) {
      setError('MetaMask is not installed! Please install MetaMask extension.')
      return
    }

    if (!window.ethereum.isMetaMask) {
      setError('Please use MetaMask wallet only! Other wallets are not supported.')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      console.log('🦊 Connecting to MetaMask only...')
      const state = await wallet.connect()
      setWalletState(state)
      console.log('✅ MetaMask connected successfully!')
    } catch (error: any) {
      setError(error.message)
      console.error('❌ MetaMask connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    wallet.disconnect()
    setWalletState({
      address: null,
      chainId: null,
      balance: '0',
      isConnected: false
    })
    setError(null)
    console.log('📤 MetaMask disconnected')
  }, [])

  const switchNetwork = useCallback(async (chainId: number) => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      setError('MetaMask not available')
      return
    }

    try {
      setError(null)
      await wallet.switchNetwork(chainId)
      
      // Update state after network switch
      setTimeout(async () => {
        try {
          const state = await wallet.connect()
          setWalletState(state)
        } catch (error) {
          console.error('Failed to update state after network switch:', error)
        }
      }, 1000)
    } catch (error: any) {
      setError(error.message)
      console.error('❌ MetaMask network switch failed:', error)
    }
  }, [])

  const getTokenBalance = useCallback(async (tokenAddress: string) => {
    if (!walletState.address) {
      throw new Error('MetaMask not connected')
    }

    try {
      return await wallet.getTokenBalance(tokenAddress, walletState.address)
    } catch (error) {
      console.error('Failed to get token balance via MetaMask:', error)
      throw error
    }
  }, [walletState.address])

  const refreshBalance = useCallback(async () => {
    if (!walletState.address || !window.ethereum?.isMetaMask) {
      return
    }

    try {
      const balance = await wallet.getBalance(walletState.address)
      setWalletState(prev => ({ ...prev, balance }))
    } catch (error) {
      console.error('Failed to refresh balance via MetaMask:', error)
    }
  }, [walletState.address])

  return {
    // State
    ...walletState,
    isConnecting,
    error,
    isMetaMaskInstalled,
    
    // Actions
    connect,
    disconnect,
    switchNetwork,
    getTokenBalance,
    refreshBalance,
    
    // Utils
    getSigner: () => wallet.getSigner(),
    getProvider: () => wallet.getProvider(),
    getMetaMaskDownloadLink: () => WalletConnection.getMetaMaskDownloadLink(),
  }
}