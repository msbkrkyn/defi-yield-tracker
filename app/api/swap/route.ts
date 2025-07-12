// app/api/swap/route.ts - SWAP PROXY
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const chainId = searchParams.get('chainId') || '1'
  const fromTokenAddress = searchParams.get('fromTokenAddress')
  const toTokenAddress = searchParams.get('toTokenAddress')
  const amount = searchParams.get('amount')
  const fromAddress = searchParams.get('fromAddress')
  const slippage = searchParams.get('slippage') || '1'

  if (!fromTokenAddress || !toTokenAddress || !amount || !fromAddress) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  try {
    console.log('🔄 Getting swap data via backend proxy...')
    
    const queryParams = new URLSearchParams({
      fromTokenAddress,
      toTokenAddress,
      amount,
      fromAddress,
      slippage,
      disableEstimate: 'false',
    })

    const response = await fetch(
      `https://api.1inch.io/v5.0/${chainId}/swap?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DeFi-Yield-Tracker/1.0',
        },
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('1inch swap error:', errorText)
      throw new Error(`1inch swap error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Got swap data from 1inch via backend')

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Swap proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to get swap data' },
      { status: 500 }
    )
  }
}