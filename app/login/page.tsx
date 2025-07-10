'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Basit demo login - gerçek auth için deploy sonrası
      if (formData.email && formData.password.length >= 6) {
        // Demo için direkt dashboard'a yönlendir
        router.push('/dashboard')
      } else {
        setError('Email ve şifre gerekli (min 6 karakter)')
      }
    } catch (err: any) {
      setError('Giriş yapılırken hata oluştu')
    }

    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-white hover:text-purple-300 transition-colors mb-6">
            <span className="text-2xl">🚀</span>
            <span className="font-bold text-lg">DeFi Yield Tracker</span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Giriş Yap</h2>
          <p className="text-gray-300">Dashboard'una hoş geldin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-white font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
              placeholder="ornek@email.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-white font-medium mb-2">
              Şifre
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
              placeholder="Şifrenizi girin"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Giriş Yapılıyor...</span>
              </>
            ) : (
              <>
                <span>🔐</span>
                <span>Giriş Yap</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Notice */}
        <div className="mt-6 bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
          <p className="text-blue-300 text-sm text-center">
            <span className="font-semibold">Demo Modu:</span> Herhangi bir email ve 6+ karakter şifre ile giriş yapabilirsin
          </p>
        </div>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Hesabın yok mu?{' '}
            <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Hesap Oluştur
            </Link>
          </p>
        </div>

        {/* Features Preview */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center space-x-3 text-sm text-gray-300">
            <span className="text-green-400">✓</span>
            <span>Gerçek zamanlı DeFi yield verileri</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-300">
            <span className="text-green-400">✓</span>
            <span>Risk analizi ve portfolio tracking</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-300">
            <span className="text-green-400">✓</span>
            <span>Referral sistemi ile premium erişim</span>
          </div>
        </div>
      </div>
    </div>
  )
}