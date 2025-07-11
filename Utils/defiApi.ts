// utils/defiApi.ts
// DeFiLlama API'sinden gerçek yield verilerini çeken fonksiyonlar

export interface YieldData {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase?: number;
  apyReward?: number;
  il7d?: number;
  apyPct1D?: number;
  apyPct7D?: number;
  apyPct30D?: number;
  stablecoin: boolean;
  exposure?: string;
  predictions?: {
    predictedClass: string;
    predictedProbability: number;
    binnedConfidence: number;
  };
}

export interface ProtocolData {
  id: string;
  name: string;
  address: string;
  symbol: string;
  url: string;
  description: string;
  chain: string;
  logo: string;
  audits: string;
  audit_note: string;
  gecko_id: string;
  cmcId: string;
  category: string;
  chains: string[];
  module: string;
  twitter: string;
  forkedFrom: string[];
  oracles: string[];
  listedAt: number;
  methodology: string;
  slug: string;
  tvl: number;
  chainTvls: Record<string, number>;
  change_1h: number;
  change_1d: number;
  change_7d: number;
  tokenBreakdowns: Record<string, number>;
  mcap: number;
}

// DeFiLlama Yields API'sinden veri çek
export async function fetchYieldPools(): Promise<YieldData[]> {
  try {
    const response = await fetch('https://yields.llama.fi/pools');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: { status: string; data: YieldData[] } = await response.json();
    
    if (data.status !== 'success') {
      throw new Error('API returned unsuccessful status');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching yield pools:', error);
    return [];
  }
}

// En yüksek APY'leri getir
export async function getTopYieldPools(limit: number = 20): Promise<YieldData[]> {
  try {
    const pools = await fetchYieldPools();
    
    // Filtrele ve sırala
    return pools
      .filter(pool => 
        pool.apy > 0 && 
        pool.apy < 1000 && // Aşırı yüksek APY'leri filtrele (probable outliers)
        pool.tvlUsd > 100000 && // Minimum TVL
        pool.project && 
        pool.symbol
      )
      .sort((a, b) => b.apy - a.apy)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top yield pools:', error);
    return [];
  }
}

// Stablecoin pool'larını getir
export async function getStablecoinPools(limit: number = 10): Promise<YieldData[]> {
  try {
    const pools = await fetchYieldPools();
    
    return pools
      .filter(pool => 
        pool.stablecoin === true &&
        pool.apy > 0 && 
        pool.apy < 100 &&
        pool.tvlUsd > 500000
      )
      .sort((a, b) => b.apy - a.apy)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting stablecoin pools:', error);
    return [];
  }
}

// Protokol bilgilerini getir
export async function fetchProtocols(): Promise<ProtocolData[]> {
  try {
    const response = await fetch('https://api.llama.fi/protocols');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ProtocolData[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching protocols:', error);
    return [];
  }
}

// Belirli bir protokolün detaylarını getir
export async function getProtocolByName(name: string): Promise<ProtocolData | null> {
  try {
    const protocols = await fetchProtocols();
    const protocol = protocols.find(p => 
      p.name.toLowerCase() === name.toLowerCase() ||
      p.slug.toLowerCase() === name.toLowerCase()
    );
    
    return protocol || null;
  } catch (error) {
    console.error('Error getting protocol by name:', error);
    return null;
  }
}

// TVL'ye göre top protokolleri getir
export async function getTopProtocols(limit: number = 20): Promise<ProtocolData[]> {
  try {
    const protocols = await fetchProtocols();
    
    return protocols
      .filter(protocol => protocol.tvl > 0)
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top protocols:', error);
    return [];
  }
}

// Risk skorlaması hesapla
export function calculateRiskScore(pool: YieldData): {
  score: number;
  level: 'Low' | 'Medium' | 'High' | 'Very High';
  color: string;
} {
  let riskScore = 0;
  
  // APY riski (çok yüksek APY = daha riskli)
  if (pool.apy > 100) riskScore += 3;
  else if (pool.apy > 50) riskScore += 2;
  else if (pool.apy > 20) riskScore += 1;
  
  // TVL riski (düşük TVL = daha riskli)
  if (pool.tvlUsd < 1000000) riskScore += 2;
  else if (pool.tvlUsd < 10000000) riskScore += 1;
  
  // Impermanent Loss riski
  if (pool.il7d && pool.il7d > 5) riskScore += 2;
  else if (pool.il7d && pool.il7d > 2) riskScore += 1;
  
  // Stablecoin bonus (daha güvenli)
  if (pool.stablecoin) riskScore -= 1;
  
  // Chain riski
  const lowRiskChains = ['ethereum', 'polygon', 'arbitrum', 'optimism'];
  if (!lowRiskChains.includes(pool.chain.toLowerCase())) {
    riskScore += 1;
  }
  
  // Skor normalizasyonu
  riskScore = Math.max(0, Math.min(10, riskScore));
  
  if (riskScore <= 2) {
    return { score: riskScore, level: 'Low', color: 'text-green-400 bg-green-500/20' };
  } else if (riskScore <= 4) {
    return { score: riskScore, level: 'Medium', color: 'text-yellow-400 bg-yellow-500/20' };
  } else if (riskScore <= 6) {
    return { score: riskScore, level: 'High', color: 'text-orange-400 bg-orange-500/20' };
  } else {
    return { score: riskScore, level: 'Very High', color: 'text-red-400 bg-red-500/20' };
  }
}

// Sayıları formatla
export function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  } else {
    return num.toFixed(0);
  }
}

// APY formatla
export function formatAPY(apy: number): string {
  if (apy >= 100) {
    return apy.toFixed(0) + '%';
  } else if (apy >= 10) {
    return apy.toFixed(1) + '%';
  } else {
    return apy.toFixed(2) + '%';
  }
}

// Chain logoları
export function getChainLogo(chain: string): string {
  const chainLogos: Record<string, string> = {
    ethereum: '🔷',
    polygon: '🟣',
    arbitrum: '🔵',
    optimism: '🔴',
    avalanche: '⚪',
    bsc: '🟡',
    fantom: '👻',
    solana: '🟢',
    cardano: '💙',
    near: '🌈'
  };
  
  return chainLogos[chain.toLowerCase()] || '⚪';
}

// Protokol logoları (fallback)
export function getProtocolLogo(project: string): string {
  const protocolLogos: Record<string, string> = {
    uniswap: '🦄',
    'uniswap-v3': '🦄',
    aave: '👻',
    'aave-v2': '👻',
    'aave-v3': '👻',
    compound: '🏛️',
    'compound-v3': '🏛️',
    curve: '🌀',
    balancer: '⚖️',
    sushiswap: '🍣',
    pancakeswap: '🥞',
    'trader-joe': '☕',
    quickswap: '⚡',
    spookyswap: '👻',
    raydium: '☀️',
    orca: '🐋'
  };
  
  return protocolLogos[project.toLowerCase()] || '💰';
}