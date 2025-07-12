// app/api/quote/route.ts - QUOTE PROXY
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const chainId = searchParams.get('chainId') || '1'
  const fromTokenAddress = searchParams.get('fromTokenAddress')
  const toTokenAddress = searchParams.get('toTokenAddress')
  const amount = searchParams.get('amount')

  if (!fromTokenAddress || !toTokenAddress || !amount) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  try {
    console.log('🔄 Getting quote via backend proxy...')
    
    const queryParams = new URLSearchParams({
      fromTokenAddress,
      toTokenAddress,
      amount,
    })

    const response = await fetch(
      `https://api.1inch.io/v5.0/${chainId}/quote?${queryParams}`,
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
      console.error('1inch quote error:', errorText)
      throw new Error(`1inch quote error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Got quote from 1inch via backend')

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Quote proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to get quote' },
      { status: 500 }
    )
  }
}