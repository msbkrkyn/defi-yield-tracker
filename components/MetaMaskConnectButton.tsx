// components/MetaMaskConnectButton.tsx - SADECE METAMASK
import { useWallet } from '../hooks/useWallet'

export function MetaMaskConnectButton() {
  const {
    address,
    chainId,
    balance,
    isConnected,
    isConnecting,
    error,
    isMetaMaskInstalled,
    connect,
    disconnect,
    getMetaMaskDownloadLink,
  } = useWallet()

  // MetaMask not installed
  if (!isMetaMaskInstalled) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🦊</div>
          <h3 className="text-xl font-bold text-white mb-2">MetaMask Required</h3>
          <p className="text-gray-300 mb-4">Please install MetaMask extension to continue</p>
          <a
            href={getMetaMaskDownloadLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 inline-block"
          >
            📥 Install MetaMask
          </a>
        </div>
      </div>
    )
  }

  // Connected to MetaMask
  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-4">
        <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
          <div className="text-white text-sm">
            🦊 MetaMask Connected
          </div>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
          <div className="text-white text-sm">
            💰 {balance} ETH
          </div>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
          <div className="text-white text-sm">
            🔗 {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        </div>
        <button
          onClick={disconnect}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors border border-red-500/30"
        >
          Disconnect
        </button>
      </div>
    )
  }

  // Connect to MetaMask
  return (
    <div>
      <button
        onClick={connect}
        disabled={isConnecting}
        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center space-x-2"
      >
        <span className="text-xl">🦊</span>
        <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask'}</span>
      </button>
      
      {error && (
        <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-300 text-sm">❌ {error}</p>
        </div>
      )}
    </div>
  )
}