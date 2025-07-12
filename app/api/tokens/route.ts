// app/api/tokens/route.ts - BACKEND PROXY
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const chainId = searchParams.get('chainId') || '1'

  try {
    console.log(`🔄 Fetching tokens for chain ${chainId} via backend proxy...`)
    
    const response = await fetch(`https://api.1inch.io/v5.0/${chainId}/tokens`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DeFi-Yield-Tracker/1.0',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`1inch API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ Got ${Object.keys(data.tokens).length} tokens from 1inch`)

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Backend proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}