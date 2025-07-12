// lib/wallet.ts - SADECE METAMASK
export interface WalletState {
  address: string | null
  chainId: number | null
  balance: string
  isConnected: boolean
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class WalletConnection {
  private provider: any = null

  async connect(): Promise<WalletState> {
    // SADECE METAMASK CHECK
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed! Please install MetaMask extension.')
    }

    // Check if it's really MetaMask (not Phantom or other wallets)
    if (!window.ethereum.isMetaMask) {
      throw new Error('Please use MetaMask wallet only!')
    }

    try {
      console.log('🦊 Connecting to MetaMask...')
      
      // Request account access from MetaMask ONLY
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length === 0) {
        throw new Error('No MetaMask accounts found')
      }

      // Use MetaMask provider
      this.provider = window.ethereum
      
      const address = accounts[0]
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      
      // Get balance from MetaMask
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      })

      // Convert hex to decimal and then to ETH
      const balanceWei = parseInt(balanceHex, 16)
      const balance = (balanceWei / Math.pow(10, 18)).toFixed(4)

      // Listen for MetaMask events
      window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this))
      window.ethereum.on('chainChanged', this.handleChainChanged.bind(this))

      console.log('✅ MetaMask connected successfully!')
      console.log('Address:', address)
      console.log('Chain ID:', parseInt(chainId, 16))
      console.log('Balance:', balance, 'ETH')

      return {
        address,
        chainId: parseInt(chainId, 16),
        balance,
        isConnected: true
      }
    } catch (error) {
      console.error('❌ MetaMask connection failed:', error)
      throw error
    }
  }

  async switchNetwork(chainId: number): Promise<void> {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      throw new Error('MetaMask not available')
    }

    const chainIdHex = `0x${chainId.toString(16)}`

    try {
      console.log(`🔄 Switching to chain ${chainId} via MetaMask...`)
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
      
      console.log('✅ Network switched successfully!')
    } catch (switchError: any) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        console.log('📡 Adding new network to MetaMask...')
        const networkConfig = this.getNetworkConfig(chainId)
        if (networkConfig) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          })
          console.log('✅ Network added to MetaMask!')
        }
      } else {
        throw switchError
      }
    }
  }

  private getNetworkConfig(chainId: number) {
    const networks: Record<number, any> = {
      1: null, // Ethereum mainnet (already in MetaMask)
      56: {
        chainId: '0x38',
        chainName: 'Binance Smart Chain Mainnet',
        nativeCurrency: {
          name: 'Binance Chain Native Token',
          symbol: 'BNB',
          decimals: 18,
        },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com/'],
      },
      137: {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18,
        },
        rpcUrls: ['https://polygon-rpc.com/'],
        blockExplorerUrls: ['https://polygonscan.com/'],
      },
      42161: {
        chainId: '0xa4b1',
        chainName: 'Arbitrum One',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io/'],
      },
      10: {
        chainId: '0xa',
        chainName: 'Optimism',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://mainnet.optimism.io/'],
        blockExplorerUrls: ['https://optimistic.etherscan.io/'],
      },
    }

    return networks[chainId]
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider || !window.ethereum.isMetaMask) {
      throw new Error('MetaMask not connected')
    }

    const balanceHex = await this.provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    })
    
    const balanceWei = parseInt(balanceHex, 16)
    return (balanceWei / Math.pow(10, 18)).toFixed(4)
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    if (!this.provider || !window.ethereum.isMetaMask) {
      throw new Error('MetaMask not connected')
    }

    // ERC20 balanceOf call via MetaMask
    const data = '0x70a08231' + walletAddress.slice(2).padStart(64, '0')
    
    try {
      const result = await this.provider.request({
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: data
        }, 'latest']
      })

      const balance = parseInt(result, 16)
      return (balance / Math.pow(10, 18)).toFixed(6) // Assuming 18 decimals
    } catch (error) {
      console.error('Failed to get token balance via MetaMask:', error)
      return '0'
    }
  }

  getSigner(): any {
    if (!this.provider || !window.ethereum.isMetaMask) {
      throw new Error('MetaMask not connected')
    }
    return this.provider
  }

  getProvider(): any {
    if (!this.provider || !window.ethereum.isMetaMask) {
      throw new Error('MetaMask not connected')
    }
    return this.provider
  }

  private handleAccountsChanged(accounts: string[]) {
    console.log('🦊 MetaMask accounts changed:', accounts)
    if (accounts.length === 0) {
      // User disconnected MetaMask
      console.log('❌ MetaMask disconnected')
      this.disconnect()
    } else {
      // User switched accounts in MetaMask
      console.log('🔄 MetaMask account switched, reloading...')
      window.location.reload()
    }
  }

  private handleChainChanged(chainId: string) {
    console.log('🔗 MetaMask chain changed to:', parseInt(chainId, 16))
    // Reload page when chain changes
    window.location.reload()
  }

  disconnect() {
    this.provider = null
    console.log('📤 MetaMask disconnected')
    
    // Remove MetaMask event listeners
    if (window.ethereum && window.ethereum.isMetaMask) {
      window.ethereum.removeAllListeners('accountsChanged')
      window.ethereum.removeAllListeners('chainChanged')
    }
  }

  // Check if MetaMask is installed
  static isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && 
           window.ethereum && 
           window.ethereum.isMetaMask === true
  }

  // Get MetaMask download link
  static getMetaMaskDownloadLink(): string {
    return 'https://metamask.io/download/'
  }
}