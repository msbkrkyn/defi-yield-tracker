// utils/protocolLinks.ts
// DeFi protokol bağlantıları ve komisyon sistemi

export interface ProtocolLink {
  name: string;
  logo: string;
  baseUrl: string;
  commission: number;
  category: string;
}

export const protocolLinks: Record<string, ProtocolLink> = {
  'uniswap': {
    name: 'Uniswap V3',
    logo: '🦄',
    baseUrl: 'https://app.uniswap.org',
    commission: 0.05,
    category: 'DEX'
  },
  'uniswap-v3': {
    name: 'Uniswap V3',
    logo: '🦄',
    baseUrl: 'https://app.uniswap.org',
    commission: 0.05,
    category: 'DEX'
  },
  'aave': {
    name: 'Aave',
    logo: '👻',
    baseUrl: 'https://app.aave.com',
    commission: 0.1,
    category: 'Lending'
  },
  'aave-v2': {
    name: 'Aave V2',
    logo: '👻',
    baseUrl: 'https://app.aave.com',
    commission: 0.1,
    category: 'Lending'
  },
  'aave-v3': {
    name: 'Aave V3',
    logo: '👻',
    baseUrl: 'https://app.aave.com',
    commission: 0.1,
    category: 'Lending'
  },
  'compound': {
    name: 'Compound',
    logo: '🏛️',
    baseUrl: 'https://app.compound.finance',
    commission: 0.08,
    category: 'Lending'
  },
  'compound-v3': {
    name: 'Compound V3',
    logo: '🏛️',
    baseUrl: 'https://app.compound.finance',
    commission: 0.08,
    category: 'Lending'
  },
  'curve': {
    name: 'Curve Finance',
    logo: '🌀',
    baseUrl: 'https://curve.fi',
    commission: 0.04,
    category: 'DEX'
  },
  'balancer': {
    name: 'Balancer',
    logo: '⚖️',
    baseUrl: 'https://app.balancer.fi',
    commission: 0.06,
    category: 'DEX'
  },
  'sushiswap': {
    name: 'SushiSwap',
    logo: '🍣',
    baseUrl: 'https://app.sushi.com',
    commission: 0.03,
    category: 'DEX'
  },
  'pancakeswap': {
    name: 'PancakeSwap',
    logo: '🥞',
    baseUrl: 'https://pancakeswap.finance',
    commission: 0.025,
    category: 'DEX'
  },
  'raydium': {
    name: 'Raydium',
    logo: '☀️',
    baseUrl: 'https://raydium.io',
    commission: 0.03,
    category: 'DEX'
  },
  'orca': {
    name: 'Orca',
    logo: '🐋',
    baseUrl: 'https://orca.so',
    commission: 0.02,
    category: 'DEX'
  },
  'jupiter': {
    name: 'Jupiter',
    logo: '🪐',
    baseUrl: 'https://jup.ag',
    commission: 0.025,
    category: 'DEX'
  },
  'lido': {
    name: 'Lido',
    logo: '🟡',
    baseUrl: 'https://lido.fi',
    commission: 0.05,
    category: 'Staking'
  },
  'convex': {
    name: 'Convex Finance',
    logo: '⚡',
    baseUrl: 'https://convexfinance.com',
    commission: 0.04,
    category: 'Yield'
  },
  'yearn': {
    name: 'Yearn Finance',
    logo: '🔵',
    baseUrl: 'https://yearn.fi',
    commission: 0.06,
    category: 'Yield'
  }
};

// Protokol linkini oluştur
export function generateProtocolLink(projectName: string): string {
  const protocol = protocolLinks[projectName.toLowerCase()];
  
  if (!protocol) {
    // Fallback - DeFiLlama protokol sayfası
    return `https://defillama.com/protocol/${projectName}`;
  }

  // Referral parametresi ile protokol linkini oluştur
  const hasQuery = protocol.baseUrl.includes('?');
  const separator = hasQuery ? '&' : '?';
  
  return `${protocol.baseUrl}${separator}ref=defi-yield-tracker`;
}

// Protokol komisyon bilgisini al
export function getProtocolCommission(projectName: string): number {
  const protocol = protocolLinks[projectName.toLowerCase()];
  return protocol?.commission || 0;
}

// Protokol kategorisini al
export function getProtocolCategory(projectName: string): string {
  const protocol = protocolLinks[projectName.toLowerCase()];
  return protocol?.category || 'Unknown';
}