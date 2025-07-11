// utils/protocolLinks.ts
// Basit DeFi protokol bağlantıları

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
  }
};

// Basit link oluşturma fonksiyonu
export function generateProtocolLink(projectName: string): string {
  const protocol = protocolLinks[projectName.toLowerCase()];
  
  if (!protocol) {
    return `https://defillama.com/protocol/${projectName}`;
  }

  // Basit referral link oluştur
  return `${protocol.baseUrl}?ref=defi-yield-tracker`;
}