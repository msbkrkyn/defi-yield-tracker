// lib/dex-aggregator.ts - BACKEND PROXY KULLANIMI
export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
}

export class DEXAggregator {
  private chainId: number

  constructor(chainId: number = 1) {
    this.chainId = chainId
  }

  // BACKEND PROXY üzerinden token listesi
  async getTokens(): Promise<Record<string, Token>> {
    try {
      console.log(`🔄 Fetching tokens via backend proxy for chain ${this.chainId}...`)
      
      const response = await fetch(`/api/tokens?chainId=${this.chainId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      console.log(`✅ Loaded ${Object.keys(data.tokens).length} tokens via backend`)
      
      return data.tokens
    } catch (error) {
      console.error('❌ Failed to fetch tokens via backend:', error)
      throw new Error(`Failed to fetch tokens: ${error}`)
    }
  }

  // BACKEND PROXY üzerinden quote
  async getQuote(params: {
    fromTokenAddress: string
    toTokenAddress: string
    amount: string
  }): Promise<any> {
    try {
      console.log('🔄 Getting quote via backend proxy...')
      console.log('Parameters:', params)

      const queryParams = new URLSearchParams({
        chainId: this.chainId.toString(),
        fromTokenAddress: params.fromTokenAddress,
        toTokenAddress: params.toTokenAddress,
        amount: params.amount,
      })

      const response = await fetch(`/api/quote?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Backend error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      console.log('✅ Got quote via backend:', data)
      
      return data
    } catch (error) {
      console.error('❌ Failed to get quote via backend:', error)
      throw error
    }
  }

  // BACKEND PROXY üzerinden swap data
  async getSwap(params: {
    fromTokenAddress: string
    toTokenAddress: string
    amount: string
    fromAddress: string
    slippage: number
  }): Promise<any> {
    try {
      console.log('🔄 Getting swap data via backend proxy...')
      console.log('Swap parameters:', params)

      const queryParams = new URLSearchParams({
        chainId: this.chainId.toString(),
        fromTokenAddress: params.fromTokenAddress,
        toTokenAddress: params.toTokenAddress,
        amount: params.amount,
        fromAddress: params.fromAddress,
        slippage: params.slippage.toString(),
      })

      const response = await fetch(`/api/swap?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Backend error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      console.log('✅ Got swap data via backend:', data)
      
      return data
    } catch (error) {
      console.error('❌ Failed to get swap data via backend:', error)
      throw error
    }
  }

  // GERÇEK blockchain transaction execution
  async executeSwap(swapData: any, walletProvider: any): Promise<any> {
    try {
      console.log('🚀 Executing REAL blockchain transaction...')
      console.log('Transaction data:', swapData.tx)

      // Check if token approval is needed (not ETH)
      if (swapData.fromToken?.address !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        console.log('🔍 Checking token allowance...')
        
        const allowance = await this.checkAllowance(
          swapData.fromToken.address,
          swapData.tx.from,
          walletProvider
        )

        console.log('Current allowance:', allowance)
        console.log('Required amount:', swapData.fromTokenAmount)

        if (parseFloat(allowance) < parseFloat(swapData.fromTokenAmount)) {
          console.log('❗ Need to approve token first')
          const approvalTx = await this.approveToken(
            swapData.fromToken.address,
            swapData.tx.to,
            swapData.fromTokenAmount,
            walletProvider
          )
          
          console.log('⏳ Waiting for approval transaction...')
          await this.waitForTransaction(approvalTx.hash, walletProvider)
          console.log('✅ Token approved!')
        }
      }

      // Execute the actual swap transaction
      console.log('🔄 Sending swap transaction...')
      const txHash = await walletProvider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: swapData.tx.from,
          to: swapData.tx.to,
          data: swapData.tx.data,
          value: swapData.tx.value,
          gas: swapData.tx.gas,
          gasPrice: swapData.tx.gasPrice,
        }],
      })

      console.log('🚀 Transaction sent! Hash:', txHash)

      return {
        hash: txHash,
        wait: () => this.waitForTransaction(txHash, walletProvider)
      }
    } catch (error) {
      console.error('❌ Transaction failed:', error)
      throw error
    }
  }

  // Token approval
  async approveToken(
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    walletProvider: any
  ): Promise<any> {
    try {
      console.log(`🔄 Approving ${tokenAddress} for ${spenderAddress}...`)

      // ERC20 approve function signature
      const approveData = '0x095ea7b3' + 
        spenderAddress.slice(2).padStart(64, '0') + 
        parseInt(amount).toString(16).padStart(64, '0')

      const txHash = await walletProvider.request({
        method: 'eth_sendTransaction',
        params: [{
          to: tokenAddress,
          data: approveData,
          gas: '0x15f90', // 90000 gas
        }],
      })

      console.log('✅ Approval transaction sent:', txHash)
      return { hash: txHash }
    } catch (error) {
      console.error('❌ Token approval failed:', error)
      throw error
    }
  }

  // Check allowance
  async checkAllowance(
    tokenAddress: string,
    walletAddress: string,
    walletProvider: any
  ): Promise<string> {
    try {
      // Use fixed spender address for 1inch
      const spenderAddress = '0x1111111254fb6c44bAC0beD2854e76F90643097d' // 1inch router

      // ERC20 allowance function call
      const allowanceData = '0xdd62ed3e' + 
        walletAddress.slice(2).padStart(64, '0') + 
        spenderAddress.slice(2).padStart(64, '0')

      const result = await walletProvider.request({
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: allowanceData
        }, 'latest']
      })

      const allowance = parseInt(result, 16).toString()
      console.log('Current allowance:', allowance)
      return allowance
    } catch (error) {
      console.error('Failed to check allowance:', error)
      return '0'
    }
  }

  // Wait for transaction
  async waitForTransaction(txHash: string, walletProvider: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkTransaction = async () => {
        try {
          const receipt = await walletProvider.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash]
          })

          if (receipt) {
            if (receipt.status === '0x1') {
              console.log('✅ Transaction confirmed!')
              resolve(receipt)
            } else {
              console.log('❌ Transaction failed')
              reject(new Error('Transaction failed'))
            }
          } else {
            // Transaction still pending, check again
            setTimeout(checkTransaction, 2000)
          }
        } catch (error) {
          reject(error)
        }
      }

      checkTransaction()
    })
  }

  // Utility functions
  formatAmount(amount: string, decimals: number): string {
    const value = parseFloat(amount)
    return Math.floor(value * Math.pow(10, decimals)).toString()
  }

  parseAmount(amount: string, decimals: number): string {
    const value = parseFloat(amount)
    return (value / Math.pow(10, decimals)).toFixed(6)
  }
}