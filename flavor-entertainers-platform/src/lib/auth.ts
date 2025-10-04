import { createServerComponentClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies()
  return createServerComponentClient()
})

export async function getUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = createServerSupabaseClient()
  const user = await getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/auth/login')
  }
  return user
}

export async function requireRole(role: 'admin' | 'performer' | 'client') {
  const profile = await getUserProfile()
  if (!profile || profile.role !== role) {
    redirect('/unauthorized')
  }
  return profile
}

export async function requireAdmin() {
  return requireRole('admin')
}

export async function requirePerformer() {
  return requireRole('performer')
}

export async function requireClient() {
  return requireRole('client')
}

export async function signOut() {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

// Utility functions for checking permissions
export async function canManageApplication(applicationId: string) {
  const profile = await getUserProfile()
  if (!profile) return false

  if (profile.role === 'admin') return true

  const supabase = createServerSupabaseClient()
  const { data: application } = await supabase
    .from('vetting_applications_new')
    .select('client_id')
    .eq('id', applicationId)
    .single()

  return application?.client_id === profile.id
}

export async function canManageBooking(bookingId: string) {
  const profile = await getUserProfile()
  if (!profile) return false

  if (profile.role === 'admin') return true

  const supabase = createServerSupabaseClient()
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      client_id,
      performer:performers!inner(user_id)
    `)
    .eq('id', bookingId)
    .single()

  return (
    booking?.client_id === profile.id ||
    booking?.performer?.[0]?.user_id === profile.id
  )
}

export async function canViewPayment(paymentId: string) {
  const profile = await getUserProfile()
  if (!profile) return false

  if (profile.role === 'admin') return true

  const supabase = createServerSupabaseClient()
  const { data: payment } = await supabase
    .from('payments')
    .select(`
      booking:bookings!inner(
        client_id,
        performer:performers!inner(user_id)
      )
    `)
    .eq('id', paymentId)
    .single()

  return (
    payment?.booking?.client_id === profile.id ||
    payment?.booking?.performer?.[0]?.user_id === profile.id
  )
}

// Audit logging
export async function logAuditEvent(
  eventType: string,
  action: string,
  details: Record<string, any> = {}
) {
  const supabase = createServerSupabaseClient()
  const user = await getUser()

  if (!user) return

  await supabase.from('audit_log').insert({
    actor: user.id,
    event_type: eventType,
    action,
    details,
  })
}

// Blacklist check utility
export async function isBlacklisted(email: string, phone?: string) {
  const supabase = createServerSupabaseClient()

  const { data: blacklistEntry } = await supabase
    .from('blacklist')
    .select('*')
    .or(`email.eq.${email}${phone ? `,phone.eq.${phone}` : ''}`)
    .eq('status', 'active')
    .single()

  return {
    isBlacklisted: !!blacklistEntry,
    reason: blacklistEntry?.reason,
    dateAdded: blacklistEntry?.date_added,
  }
}

// Get performer by user ID
export async function getPerformerByUserId(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data: performer } = await supabase
    .from('performers')
    .select('*')
    .eq('user_id', userId)
    .single()

  return performer
}

// Check if user has completed vetting
export async function isVetted(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data: vetting } = await supabase
    .from('vetting_applications_new')
    .select('status')
    .eq('client_id', userId)
    .eq('status', 'approved')
    .single()

  return !!vetting
}

// Rate limiting check
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = identifier

  let bucket = rateLimitMap.get(key)

  if (!bucket || now > bucket.resetTime) {
    bucket = {
      count: 0,
      resetTime: now + windowMs,
    }
    rateLimitMap.set(key, bucket)
  }

  if (bucket.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: bucket.resetTime,
    }
  }

  bucket.count++

  return {
    allowed: true,
    remaining: maxRequests - bucket.count,
    resetTime: bucket.resetTime,
  }
}