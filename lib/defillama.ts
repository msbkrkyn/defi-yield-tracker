// lib/defillama.ts - GERÇEK DEFILLAMA API
import axios from 'axios'

export interface YieldPool {
  chain: string
  project: string
  symbol: string
  pool: string
  apy: number
  apyBase?: number
  apyReward?: number
  tvlUsd: number
  stablecoin: boolean
  ilRisk: boolean
  exposure: string
  predictions?: {
    predictedClass: string
    predictedProbability: number
    binnedConfidence: number
  }
  poolMeta?: string
  mu?: number
  sigma?: number
  count?: number
  outlier?: boolean
  underlyingTokens?: string[]
  il7d?: number
  apyBase7d?: number
  apyMean30d?: number
  volumeUsd1d?: number
  volumeUsd7d?: number
}

export interface Protocol {
  id: string
  name: string
  address: string
  symbol: string
  url: string
  description: string
  chain: string
  logo: string
  audits: string
  audit_note: string
  gecko_id: string
  cmcId: string
  category: string
  chains: string[]
  module: string
  twitter: string
  forkedFrom: string[]
  oracles: string[]
  listedAt: number
  methodology: string
  slug: string
  tvl: number
  chainTvls: Record<string, number>
  change_1h: number
  change_1d: number
  change_7d: number
  tokenBreakdowns: Record<string, any>
  mcap: number
}

export class DeFiLlamaAPI {
  private baseURL = 'https://yields.llama.fi'
  private protocolsURL = 'https://api.llama.fi/protocols'

  // Get all yield pools
  async getAllPools(): Promise<YieldPool[]> {
    try {
      const response = await axios.get(`${this.baseURL}/pools`)
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch pools:', error)
      throw new Error('Failed to fetch yield pools from DeFiLlama')
    }
  }

  // Get pools by chain
  async getPoolsByChain(chain: string): Promise<YieldPool[]> {
    try {
      const allPools = await this.getAllPools()
      return allPools.filter(pool => pool.chain.toLowerCase() === chain.toLowerCase())
    } catch (error) {
      console.error(`Failed to fetch pools for chain ${chain}:`, error)
      throw error
    }
  }

  // Get pools by protocol
  async getPoolsByProtocol(protocol: string): Promise<YieldPool[]> {
    try {
      const allPools = await this.getAllPools()
      return allPools.filter(pool => 
        pool.project.toLowerCase().includes(protocol.toLowerCase())
      )
    } catch (error) {
      console.error(`Failed to fetch pools for protocol ${protocol}:`, error)
      throw error
    }
  }

  // Get top pools by APY
  async getTopPoolsByAPY(limit: number = 50, minTvl: number = 1000000): Promise<YieldPool[]> {
    try {
      const allPools = await this.getAllPools()
      return allPools
        .filter(pool => 
          pool.apy > 0 && 
          pool.apy < 10000 && // Filter out unrealistic APYs
          pool.tvlUsd > minTvl &&
          !pool.outlier
        )
        .sort((a, b) => b.apy - a.apy)
        .slice(0, limit)
    } catch (error) {
      console.error('Failed to fetch top pools:', error)
      throw error
    }
  }

  // Get stable pools (stablecoin only)
  async getStablePools(minTvl: number = 1000000): Promise<YieldPool[]> {
    try {
      const allPools = await this.getAllPools()
      return allPools
        .filter(pool => 
          pool.stablecoin && 
          pool.tvlUsd > minTvl &&
          pool.apy > 0 &&
          !pool.outlier
        )
        .sort((a, b) => b.apy - a.apy)
    } catch (error) {
      console.error('Failed to fetch stable pools:', error)
      throw error
    }
  }

  // Get all protocols
  async getAllProtocols(): Promise<Protocol[]> {
    try {
      const response = await axios.get(this.protocolsURL)
      return response.data
    } catch (error) {
      console.error('Failed to fetch protocols:', error)
      throw new Error('Failed to fetch protocols from DeFiLlama')
    }
  }

  // Get protocol by name
  async getProtocol(name: string): Promise<Protocol | null> {
    try {
      const protocols = await this.getAllProtocols()
      return protocols.find(p => 
        p.name.toLowerCase() === name.toLowerCase() ||
        p.slug.toLowerCase() === name.toLowerCase()
      ) || null
    } catch (error) {
      console.error(`Failed to fetch protocol ${name}:`, error)
      return null
    }
  }

  // Get protocols by chain
  async getProtocolsByChain(chain: string): Promise<Protocol[]> {
    try {
      const protocols = await this.getAllProtocols()
      return protocols.filter(p => 
        p.chains.some(c => c.toLowerCase() === chain.toLowerCase())
      )
    } catch (error) {
      console.error(`Failed to fetch protocols for chain ${chain}:`, error)
      throw error
    }
  }

  // Get TVL data for protocol
  async getProtocolTVL(protocol: string): Promise<any> {
    try {
      const response = await axios.get(`https://api.llama.fi/protocol/${protocol}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch TVL for ${protocol}:`, error)
      throw error
    }
  }

  // Filter pools with advanced criteria
  filterPools(
    pools: YieldPool[],
    filters: {
      minAPY?: number
      maxAPY?: number
      minTVL?: number
      maxTVL?: number
      chains?: string[]
      protocols?: string[]
      stablecoinOnly?: boolean
      excludeOutliers?: boolean
      categories?: string[]
    }
  ): YieldPool[] {
    return pools.filter(pool => {
      // APY filters
      if (filters.minAPY && pool.apy < filters.minAPY) return false
      if (filters.maxAPY && pool.apy > filters.maxAPY) return false
      
      // TVL filters
      if (filters.minTVL && pool.tvlUsd < filters.minTVL) return false
      if (filters.maxTVL && pool.tvlUsd > filters.maxTVL) return false
      
      // Chain filter
      if (filters.chains && !filters.chains.includes(pool.chain.toLowerCase())) return false
      
      // Protocol filter
      if (filters.protocols && !filters.protocols.some(p => 
        pool.project.toLowerCase().includes(p.toLowerCase())
      )) return false
      
      // Stablecoin filter
      if (filters.stablecoinOnly && !pool.stablecoin) return false
      
      // Exclude outliers
      if (filters.excludeOutliers && pool.outlier) return false
      
      return true
    })
  }

  // Calculate risk score
  calculateRiskScore(pool: YieldPool): number {
    let riskScore = 0
    
    // High APY = higher risk
    if (pool.apy > 100) riskScore += 3
    else if (pool.apy > 50) riskScore += 2
    else if (pool.apy > 20) riskScore += 1
    
    // Low TVL = higher risk
    if (pool.tvlUsd < 1000000) riskScore += 2
    else if (pool.tvlUsd < 10000000) riskScore += 1
    
    // Impermanent loss risk
    if (pool.ilRisk) riskScore += 1
    
    // Outlier detection
    if (pool.outlier) riskScore += 2
    
    // Stablecoin = lower risk
    if (pool.stablecoin) riskScore -= 1
    
    return Math.max(0, Math.min(5, riskScore)) // 0-5 scale
  }

  // Get risk level string
  getRiskLevel(score: number): string {
    if (score <= 1) return 'Low'
    if (score <= 3) return 'Medium'
    return 'High'
  }
}