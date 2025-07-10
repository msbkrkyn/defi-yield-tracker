// GÜVENLI YÖNTEMİ: Mevcut app/page.tsx dosyasına sadece dil seçiciyi ekleyelim

'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

// YENİ: Basit dil sistemi ekleyelim
const texts = {
  tr: {
    title: 'DeFi Yield Tracker',
    hero: 'Track the Highest DeFi Yields',
    subtitle: 'Gerçek zamanlı DeFi yield verileri! En yüksek APY\'leri keşfet, riskleri analiz et, kripto kazancını maksimize et.',
    getStarted: 'Get Started',
    loading: 'Yield verileri yükleniyor...',
    lastUpdate: 'Son güncelleme'
  },
  en: {
    title: 'DeFi Yield Tracker',
    hero: 'Track the Highest DeFi Yields',
    subtitle: 'Real-time DeFi yield data! Discover the highest APYs, analyze risks, and maximize your crypto earnings.',
    getStarted: 'Get Started',
    loading: 'Loading yield data...',
    lastUpdate: 'Last update'
  }
}

// Basit dil seçici component
function LanguageToggle({ language, setLanguage }: { language: string, setLanguage: (lang: string) => void }) {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
        className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors border border-white/20 text-white text-sm"
      >
        {language === 'tr' ? '🇹🇷 TR' : '🇺🇸 EN'}
      </button>
    </div>
  )
}

// DeFi API types (aynı)
interface YieldData {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase?: number;
  apyReward?: number;
  il7d?: number;
  stablecoin: boolean;
}

// API fonksiyonları (aynı)
async function fetchTopYields(): Promise<YieldData[]> {
  try {
    const response = await fetch('https://yields.llama.fi/pools');
    const data = await response.json();
    
    return data.data
      .filter((pool: YieldData) => 
        pool.apy > 0 && 
        pool.apy < 1000 && 
        pool.tvlUsd > 100000 &&
        pool.project && 
        pool.symbol
      )
      .sort((a: YieldData, b: YieldData) => b.apy - a.apy)
      .slice(0, 8);
  } catch (error) {
    console.error('Error fetching yields:', error);
    return [];
  }
}

function calculateRiskScore(pool: YieldData): {
  level: 'Low' | 'Medium' | 'High';
  color: string;
} {
  let riskScore = 0;
  
  if (pool.apy > 50) riskScore += 2;
  else if (pool.apy > 20) riskScore += 1;
  
  if (pool.tvlUsd < 1000000) riskScore += 1;
  if (pool.il7d && pool.il7d > 2) riskScore += 1;
  if (pool.stablecoin) riskScore -= 1;
  
  riskScore = Math.max(0, Math.min(3, riskScore));
  
  if (riskScore <= 1) {
    return { level: 'Low', color: 'bg-green-500/20 text-green-400' };
  } else if (riskScore === 2) {
    return { level: 'Medium', color: 'bg-yellow-500/20 text-yellow-400' };
  } else {
    return { level: 'High', color: 'bg-red-500/20 text-red-400' };
  }
}

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(0);
}

function formatAPY(apy: number): string {
  if (apy >= 100) return apy.toFixed(0) + '%';
  if (apy >= 10) return apy.toFixed(1) + '%';
  return apy.toFixed(2) + '%';
}

function getProtocolLogo(project: string): string {
  const logos: Record<string, string> = {
    uniswap: '🦄', 'uniswap-v3': '🦄', aave: '👻', 'aave-v2': '👻', 'aave-v3': '👻',
    compound: '🏛️', curve: '🌀', balancer: '⚖️', sushiswap: '🍣', pancakeswap: '🥞'
  };
  return logos[project.toLowerCase()] || '💰';
}

function getChainLogo(chain: string): string {
  const chains: Record<string, string> = {
    ethereum: '🔷', polygon: '🟣', arbitrum: '🔵', optimism: '🔴', 
    avalanche: '⚪', bsc: '🟡', fantom: '👻', solana: '🟢'
  };
  return chains[chain.toLowerCase()] || '⚪';
}

export default function Home() {
  // YENİ: Dil state'i ekle
  const [language, setLanguage] = useState('tr')
  const t = texts[language as keyof typeof texts]
  
  const [yields, setYields] = useState<YieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const loadYields = async () => {
      setLoading(true);
      const data = await fetchTopYields();
      setYields(data);
      setLastUpdate(new Date().toLocaleTimeString());
      setLoading(false);
    };

    loadYields();
    
    // Her 5 dakikada bir güncelle
    const interval = setInterval(loadYields, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">🚀</span>
              </div>
              <h1 className="text-2xl font-bold text-white">{t.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdate && (
                <span className="text-gray-400 text-sm">
                  {t.lastUpdate}: {lastUpdate}
                </span>
              )}
              {/* YENİ: Dil seçici ekle */}
              <LanguageToggle language={language} setLanguage={setLanguage} />
              <Link href="/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105">
                {t.getStarted}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            {t.hero}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105">
              🚀 {language === 'tr' ? 'Ücretsiz Başla' : 'Get Started Free'}
            </Link>
            <Link href="/login" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/20">
              📊 {language === 'tr' ? 'Giriş Yap' : 'Login'}
            </Link>
          </div>
        </div>

        {/* Stats - Aynı kalacak, sadece birkaç text değişecek */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-green-400">{yields.length}</div>
            <div className="text-gray-300">{language === 'tr' ? 'Aktif Pool' : 'Active Pools'}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {yields.length > 0 ? formatAPY(Math.max(...yields.map(y => y.apy))) : '0%'}
            </div>
            <div className="text-gray-300">{language === 'tr' ? 'En Yüksek APY' : 'Highest APY'}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-blue-400">
              ${yields.length > 0 ? formatNumber(yields.reduce((sum, y) => sum + y.tvlUsd, 0)) : '0'}
            </div>
            <div className="text-gray-300">{language === 'tr' ? 'Toplam TVL' : 'Total TVL'}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-pink-400">🔥</div>
            <div className="text-gray-300">{language === 'tr' ? 'Canlı Veri' : 'Live Data'}</div>
          </div>
        </div>

        {/* Yield Table - Sadece başlık ve loading text değişecek */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  🔥 {language === 'tr' ? 'En Yüksek Yield\'ler' : 'Top Yields'}
                </h3>
                <p className="text-gray-300 mt-2">
                  {language === 'tr' ? 'Gerçek zamanlı DeFi protokol verileri' : 'Real-time DeFi protocol data'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-semibold">
                  {language === 'tr' ? 'CANLI' : 'LIVE'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="text-gray-300 mt-4">{t.loading}</p>
              </div>
            ) : yields.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-4 text-gray-300 font-semibold">
                      {language === 'tr' ? 'Protokol' : 'Protocol'}
                    </th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Pool</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Chain</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">APY</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">
                      {language === 'tr' ? 'Risk' : 'Risk'}
                    </th>
                    <th className="text-left p-4 text-gray-300 font-semibold">TVL</th>
                  </tr>
                </thead>
                <tbody>
                  {yields.map((pool, index) => {
                    const risk = calculateRiskScore(pool);
                    return (
                      <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">
                              {getProtocolLogo(pool.project)}
                            </div>
                            <div>
                              <div className="text-white font-semibold capitalize">
                                {pool.project.replace(/-/g, ' ')}
                              </div>
                              <div className="text-gray-400 text-sm">
                                {pool.pool.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300 font-medium">
                            {pool.symbol.length > 15 ? 
                              pool.symbol.substring(0, 15) + '...' : 
                              pool.symbol
                            }
                          </div>
                          {pool.stablecoin && (
                            <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded mt-1 inline-block">
                              Stablecoin
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{getChainLogo(pool.chain)}</span>
                            <span className="text-gray-300 capitalize text-sm">
                              {pool.chain}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-green-400 font-bold text-lg">
                            {formatAPY(pool.apy)}
                          </div>
                          {pool.apyBase && pool.apyReward && (
                            <div className="text-xs text-gray-400">
                              Base: {formatAPY(pool.apyBase)} + Reward: {formatAPY(pool.apyReward)}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-lg text-sm font-medium ${risk.color}`}>
                            {language === 'tr' ? 
                              (risk.level === 'Low' ? 'Düşük' : risk.level === 'Medium' ? 'Orta' : 'Yüksek') :
                              risk.level
                            }
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300 font-medium">
                            ${formatNumber(pool.tvlUsd)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-300">
                  {language === 'tr' ? 
                    'Veri yüklenemiyor. Lütfen daha sonra tekrar deneyin.' :
                    'Unable to load data. Please try again later.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Geri kalan kısımlar aynı, sadece birkaç text değişir... */}
        {/* Features, CTA, Footer aynı kalacak */}
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 mb-16">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-white mb-4">
              {language === 'tr' ? 'Gerçek Zamanlı Veriler' : 'Real-time Data'}
            </h3>
            <p className="text-gray-300">
              {language === 'tr' ? 
                'DeFiLlama API\'sinden anlık yield verileri. Hiçbir fırsatı kaçırma!' :
                'Live yield data from DeFiLlama API. Never miss a high-yield opportunity!'
              }
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-white mb-4">
              {language === 'tr' ? 'Risk Analizi' : 'Risk Analysis'}
            </h3>
            <p className="text-gray-300">
              {language === 'tr' ?
                'Akıllı risk skorlama sistemi ile impermanent loss ve protokol risklerini anla.' :
                'Smart risk scoring system helps you understand impermanent loss and protocol risks.'
              }
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-white mb-4">
              {language === 'tr' ? 'Referral Ödülleri' : 'Referral Rewards'}
            </h3>
            <p className="text-gray-300">
              {language === 'tr' ?
                '5 arkadaş davet et, 1 yıl premium erişim kazan. DeFi topluluğunu büyüt!' :
                'Invite 5 friends and get 1 year premium access. Build your DeFi community!'
              }
            </p>
          </div>
        </div>

        {/* Referral CTA */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-purple-500/30">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-4">🎉 Launch Special!</h3>
            <p className="text-xl text-gray-300 mb-6">
              {language === 'tr' ?
                'İlk 1000 kullanıcı arasında ol ve SINIRSIZ ÜCRETSİZ ERİŞİM kazan' :
                'Be among the first 1000 users and get UNLIMITED FREE ACCESS'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105">
                🚀 {language === 'tr' ? 'Ücretsiz Başla' : 'Get Free Access'}
              </Link>
              <Link href="/login" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/20">
                📱 {language === 'tr' ? 'Giriş Yap' : 'Login'}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 DeFi Yield Tracker. 
              {language === 'tr' ? 
                ' DeFi topluluğu için geliştirildi' : 
                ' Built for the DeFi community'
              } 🚀
            </p>
            <p className="text-sm mt-2">Powered by DeFiLlama API</p>
          </div>
        </div>
      </footer>
    </div>
  );
}