import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30' // days

    const daysAgo = parseInt(timeframe)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // Get dashboard statistics using Supabase queries
    const [
      totalUsersResult,
      totalPerformersResult,
      totalBookingsResult,
      pendingBookingsResult,
      completedBookingsResult,
      completedBookingsDataResult,
      pendingPaymentsResult,
      verifiedPaymentsResult,
      pendingVettingResult,
      approvedVettingResult,
      dnsEntriesResult,
      recentBookingsResult
    ] = await Promise.all([
      // Total users
      db.from('users').select('*', { count: 'exact', head: true }),

      // Total active performers
      db.from('performers').select('*', { count: 'exact', head: true }).eq('verified', true),

      // Total bookings
      db.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', startDate.toISOString()),

      // Pending bookings
      db.from('bookings').select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING')
        .gte('created_at', startDate.toISOString()),

      // Completed bookings
      db.from('bookings').select('*', { count: 'exact', head: true })
        .eq('status', 'COMPLETED')
        .gte('created_at', startDate.toISOString()),

      // Get completed bookings data for revenue calculation
      db.from('bookings').select('subtotal')
        .eq('status', 'COMPLETED')
        .gte('created_at', startDate.toISOString()),

      // Pending payments
      db.from('payment_transactions').select('*', { count: 'exact', head: true })
        .eq('status', 'UPLOADED')
        .gte('created_at', startDate.toISOString()),

      // Verified payments
      db.from('payment_transactions').select('*', { count: 'exact', head: true })
        .eq('status', 'VERIFIED')
        .gte('created_at', startDate.toISOString()),

      // Pending vetting applications
      db.from('vetting_applications').select('*', { count: 'exact', head: true })
        .eq('status', 'SUBMITTED'),

      // Approved vetting applications
      db.from('vetting_applications').select('*', { count: 'exact', head: true })
        .eq('status', 'APPROVED')
        .gte('created_at', startDate.toISOString()),

      // Active DNS entries
      db.from('dns_list').select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE'),

      // Recent bookings for timeline
      db.from('bookings').select(`
        *,
        client:users!bookings_client_id_fkey(id, email, legal_name),
        performer:performers!bookings_performer_id_fkey(id, stage_name),
        service:services!bookings_service_id_fkey(name, category)
      `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(20)
    ])

    // Check for errors and extract data
    if (totalUsersResult.error) throw new Error(totalUsersResult.error.message)
    if (totalPerformersResult.error) throw new Error(totalPerformersResult.error.message)
    if (totalBookingsResult.error) throw new Error(totalBookingsResult.error.message)
    if (pendingBookingsResult.error) throw new Error(pendingBookingsResult.error.message)
    if (completedBookingsResult.error) throw new Error(completedBookingsResult.error.message)
    if (completedBookingsDataResult.error) throw new Error(completedBookingsDataResult.error.message)
    if (pendingPaymentsResult.error) throw new Error(pendingPaymentsResult.error.message)
    if (verifiedPaymentsResult.error) throw new Error(verifiedPaymentsResult.error.message)
    if (pendingVettingResult.error) throw new Error(pendingVettingResult.error.message)
    if (approvedVettingResult.error) throw new Error(approvedVettingResult.error.message)
    if (dnsEntriesResult.error) throw new Error(dnsEntriesResult.error.message)
    if (recentBookingsResult.error) throw new Error(recentBookingsResult.error.message)

    const totalUsers = totalUsersResult.count || 0
    const totalPerformers = totalPerformersResult.count || 0
    const totalBookings = totalBookingsResult.count || 0
    const pendingBookings = pendingBookingsResult.count || 0
    const completedBookings = completedBookingsResult.count || 0
    const pendingPayments = pendingPaymentsResult.count || 0
    const verifiedPayments = verifiedPaymentsResult.count || 0
    const pendingVetting = pendingVettingResult.count || 0
    const approvedVetting = approvedVettingResult.count || 0
    const dnsEntries = dnsEntriesResult.count || 0
    const recentBookings = recentBookingsResult.data || []

    // Calculate total revenue from completed bookings
    const totalRevenue = {
      _sum: {
        subtotal: (completedBookingsDataResult.data || []).reduce((sum, booking) => sum + Number(booking.subtotal || 0), 0)
      }
    }

    // Calculate trends (compare with previous period)
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - daysAgo)

    const [
      previousBookingsResult,
      previousRevenueDataResult,
      previousUsersResult
    ] = await Promise.all([
      db.from('bookings').select('*', { count: 'exact', head: true })
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString()),

      db.from('bookings').select('subtotal')
        .eq('status', 'COMPLETED')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString()),

      db.from('users').select('*', { count: 'exact', head: true })
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString())
    ])

    if (previousBookingsResult.error) throw new Error(previousBookingsResult.error.message)
    if (previousRevenueDataResult.error) throw new Error(previousRevenueDataResult.error.message)
    if (previousUsersResult.error) throw new Error(previousUsersResult.error.message)

    const previousBookings = previousBookingsResult.count || 0
    const previousUsers = previousUsersResult.count || 0
    const previousRevenue = {
      _sum: {
        subtotal: (previousRevenueDataResult.data || []).reduce((sum, booking) => sum + Number(booking.subtotal || 0), 0)
      }
    }

    // Calculate percentage changes
    const bookingTrend = previousBookings > 0
      ? ((totalBookings - previousBookings) / previousBookings) * 100
      : 0

    const revenueTrend = (previousRevenue._sum.subtotal ?? 0) > 0
      ? (((totalRevenue._sum.subtotal ?? 0) - (previousRevenue._sum.subtotal ?? 0)) / (previousRevenue._sum.subtotal ?? 0)) * 100
      : 0

    const userTrend = previousUsers > 0
      ? ((totalUsers - previousUsers) / previousUsers) * 100
      : 0

    // Get booking status breakdown
    // Note: Supabase doesn't support groupBy directly - using JS aggregation
    const { data: bookingsForStatus, error: statusError } = await db
      .from('bookings')
      .select('status')
      .gte('created_at', startDate.toISOString())

    if (statusError) throw new Error(statusError.message)

    const bookingStatusBreakdown = (bookingsForStatus || []).reduce((acc: any[], booking: any) => {
      const existing = acc.find(item => item.status === booking.status)
      if (existing) {
        existing._count.status++
      } else {
        acc.push({ status: booking.status, _count: { status: 1 } })
      }
      return acc
    }, [])

    // Get service category performance
    // Note: Supabase doesn't support groupBy directly - using JS aggregation
    const { data: bookingsForService, error: serviceError } = await db
      .from('bookings')
      .select('service_id, subtotal')
      .gte('created_at', startDate.toISOString())

    if (serviceError) throw new Error(serviceError.message)

    const servicePerformance = (bookingsForService || []).reduce((acc: any[], booking: any) => {
      const existing = acc.find((item: any) => item.service_id === booking.service_id)
      if (existing) {
        existing._count.service_id++
        existing._sum.subtotal += Number(booking.subtotal || 0)
      } else {
        acc.push({
          service_id: booking.service_id,
          _count: { service_id: 1 },
          _sum: { subtotal: Number(booking.subtotal || 0) }
        })
      }
      return acc
    }, [])

    const dashboard = {
      overview: {
        total_users: totalUsers,
        total_performers: totalPerformers,
        total_bookings: totalBookings,
        total_revenue: totalRevenue._sum.subtotal ?? 0,
        trends: {
          bookings: bookingTrend,
          revenue: revenueTrend,
          users: userTrend
        }
      },
      bookings: {
        pending: pendingBookings,
        completed: completedBookings,
        status_breakdown: bookingStatusBreakdown.reduce((acc, item) => {
          acc[item.status] = item._count.status
          return acc
        }, {} as Record<string, number>)
      },
      payments: {
        pending: pendingPayments,
        verified: verifiedPayments,
        total_processed: verifiedPayments + pendingPayments
      },
      vetting: {
        pending: pendingVetting,
        approved: approvedVetting
      },
      security: {
        dns_entries: dnsEntries
      },
      recent_activity: recentBookings.map(booking => ({
        id: booking.id,
        type: 'booking',
        status: booking.status,
        client_email: booking.client.email,
        performer_name: booking.performer.stage_name,
        service_name: booking.service.name,
        amount: booking.subtotal,
        created_at: booking.created_at
      }))
    }

    return NextResponse.json(
      createSuccessResponse(dashboard)
    )

  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to fetch dashboard data', 'FETCH_ERROR'),
      { status: 500 }
    )
  }
}