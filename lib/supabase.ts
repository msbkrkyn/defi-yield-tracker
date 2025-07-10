// lib/supabase.ts
// Supabase client setup

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  referral_code: string
  referred_by?: string
  referral_count: number
  is_premium: boolean
  premium_until?: string
  created_at: string
  updated_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  created_at: string
}

// Auth functions
export async function signUp(email: string, password: string, referralCode?: string) {
  try {
    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError

    if (authData.user) {
      // 2. Generate unique referral code
      const userReferralCode = generateReferralCode()

      // 3. Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email || '',
          referral_code: userReferralCode,
          referred_by: referralCode || null,
          referral_count: 0,
          is_premium: false,
        })

      if (profileError) {
        console.error('Profile error:', profileError)
        throw profileError
      }

      // 4. If referred by someone, create referral record and update referrer
      if (referralCode) {
        const { data: referrer } = await supabase
          .from('users')
          .select('id, referral_count')
          .eq('referral_code', referralCode)
          .single()

        if (referrer) {
          // Add referral record
          await supabase
            .from('referrals')
            .insert({
              referrer_id: referrer.id,
              referred_id: authData.user.id,
            })

          // Update referrer count
          const newCount = (referrer.referral_count || 0) + 1
          await supabase
            .from('users')
            .update({ 
              referral_count: newCount,
              // Give premium if reached 5 referrals
              is_premium: newCount >= 5,
              premium_until: newCount >= 5 ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null
            })
            .eq('id', referrer.id)
        }
      }
    }

    return { data: authData, error: null }
  } catch (error) {
    console.error('SignUp error:', error)
    return { data: null, error }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return profile
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function getUserReferrals(userId: string) {
  try {
    const { data } = await supabase
      .from('referrals')
      .select(`
        id,
        created_at,
        referred:users!referrals_referred_id_fkey(email, created_at)
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })

    return data || []
  } catch (error) {
    console.error('Error getting referrals:', error)
    return []
  }
}

// Utility functions
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function checkReferralCode(code: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', code)
      .single()

    return !!data
  } catch {
    return false
  }
}

// Leaderboard functions
export async function getTopReferrers(limit: number = 10) {
  try {
    const { data } = await supabase
      .from('users')
      .select('email, referral_count, referral_code, created_at')
      .gt('referral_count', 0)
      .order('referral_count', { ascending: false })
      .limit(limit)

    return data || []
  } catch (error) {
    console.error('Error getting top referrers:', error)
    return []
  }
}