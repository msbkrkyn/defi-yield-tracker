'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Basit kayıt fonksiyonu
  const signUpUser = async (email: string, password: string, referralCode?: string) => {
    try {
      // Import et
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // 1. Auth kayıt
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Referral kodu oluştur
        const userReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase()

        // 3. Profil oluştur
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            email: email,
            referral_code: userReferralCode,
            referred_by: referralCode || null,
            referral_count: 0,
            is_premium: false,
          }])

        if (profileError) {
          console.error('Profile error:', profileError)
          throw new Error('Profil oluşturulurken hata oluştu')
        }

        // 4. Referral işlemleri
        if (referralCode) {
          const { data: referrer } = await supabase
            .from('users')
            .select('id, referral_count')
            .eq('referral_code', referralCode)
            .single()

          if (referrer) {
            // Referral kaydı ekle
            await supabase
              .from('referrals')
              .insert([{
                referrer_id: referrer.id,
                referred_id: authData.user.id,
              }])

            // Referrer sayısını güncelle
            const newCount = (referrer.referral_count || 0) + 1
            await supabase
              .from('users')
              .update({ 
                referral_count: newCount,
                is_premium: newCount >= 5,
                premium_until: newCount >= 5 ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null
              })
              .eq('id', referrer.id)
          }
        }
      }

      return { data: authData, error: null }
    } catch (error: any) {
      console.error('SignUp error:', error)
      return { data: null, error: error.message || 'Beklenmeyen hata' }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validasyon
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalı')
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await signUpUser(
        formData.email,
        formData.password,
        formData.referralCode || undefined
      )

      if (signUpError) {
        setError(signUpError)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen bir hata oluştu')
    }

    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-4">Hoş Geldin!</h2>
          <p className="text-gray-300 mb-6">
            Hesabın başarıyla oluşturuldu. Dashboard'a yönlendiriliyorsun...
          </p>
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
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
          <h2 className="text-3xl font-bold text-white mb-2">Hesap Oluştur</h2>
          <p className="text-gray-300">En yüksek DeFi yield'leri keşfetmeye başla</p>
        </div>

        {/* Referral Bonus */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30 mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🎁</div>
            <div>
              <div className="text-white font-semibold">Launch Special!</div>
              <div className="text-purple-300 text-sm">
                İlk 1000 kullanıcı → Lifetime Free Access
              </div>
            </div>
          </div>
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
              placeholder="En az 6 karakter"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-white font-medium mb-2">
              Şifre Tekrar
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
              placeholder="Şifreyi tekrar girin"
            />
          </div>

          {/* Referral Code */}
          <div>
            <label htmlFor="referralCode" className="block text-white font-medium mb-2">
              Referral Kodu <span className="text-gray-400">(Opsiyonel)</span>
            </label>
            <input
              type="text"
              name="referralCode"
              id="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors uppercase"
              placeholder="ABC12345"
              maxLength={8}
            />
            <p className="text-gray-400 text-xs mt-1">
              Arkadaşının referral kodunu gir ve özel bonuslar kazan!
            </p>
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
                <span>Hesap Oluşturuluyor...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Hesap Oluştur</span>
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Zaten hesabın var mı?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Giriş Yap
            </Link>
          </p>
        </div>

        {/* Referral Info */}
        <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
          <h4 className="text-white font-semibold mb-2 flex items-center">
            <span className="mr-2">🤝</span>
            Referral Program
          </h4>
          <div className="space-y-1 text-sm text-gray-300">
            <p>• 5 arkadaş davet et → 1 yıl premium</p>
            <p>• 25 arkadaş davet et → Lifetime premium</p>
            <p>• 100 arkadaş davet et → Revenue sharing</p>
          </div>
        </div>
      </div>
    </div>
  )
}