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

    // Get dashboard statistics
    const [
      totalUsers,
      totalPerformers,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue,
      pendingPayments,
      verifiedPayments,
      pendingVetting,
      approvedVetting,
      dnsEntries,
      recentBookings
    ] = await Promise.all([
      // Total users
      db.user.count(),

      // Total active performers
      db.performer.count({
        where: {
          verified: true
        }
      }),

      // Total bookings
      db.booking.count({
        where: {
          created_at: {
            gte: startDate
          }
        }
      }),

      // Pending bookings
      db.booking.count({
        where: {
          status: 'PENDING',
          created_at: {
            gte: startDate
          }
        }
      }),

      // Completed bookings
      db.booking.count({
        where: {
          status: 'COMPLETED',
          created_at: {
            gte: startDate
          }
        }
      }),

      // Total revenue from completed bookings
      db.booking.aggregate({
        where: {
          status: 'COMPLETED',
          created_at: {
            gte: startDate
          }
        },
        _sum: {
          subtotal: true
        }
      }),

      // Pending payments
      db.paymentTransaction.count({
        where: {
          status: 'UPLOADED',
          created_at: {
            gte: startDate
          }
        }
      }),

      // Verified payments
      db.paymentTransaction.count({
        where: {
          status: 'VERIFIED',
          created_at: {
            gte: startDate
          }
        }
      }),

      // Pending vetting applications
      db.vettingApplication.count({
        where: {
          status: 'SUBMITTED'
        }
      }),

      // Approved vetting applications
      db.vettingApplication.count({
        where: {
          status: 'APPROVED',
          created_at: {
            gte: startDate
          }
        }
      }),

      // Active DNS entries
      db.dNSList.count({
        where: {
          status: 'ACTIVE'
        }
      }),

      // Recent bookings for timeline
      db.booking.findMany({
        where: {
          created_at: {
            gte: startDate
          }
        },
        include: {
          client: {
            select: {
              id: true,
              email: true,
              legal_name: true
            }
          },
          performer: {
            select: {
              id: true,
              stage_name: true
            }
          },
          service: {
            select: {
              name: true,
              category: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 20
      })
    ])

    // Calculate trends (compare with previous period)
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - daysAgo)

    const [
      previousBookings,
      previousRevenue,
      previousUsers
    ] = await Promise.all([
      db.booking.count({
        where: {
          created_at: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      }),

      db.booking.aggregate({
        where: {
          status: 'COMPLETED',
          created_at: {
            gte: previousStartDate,
            lt: startDate
          }
        },
        _sum: {
          subtotal: true
        }
      }),

      db.user.count({
        where: {
          created_at: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      })
    ])

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
    const bookingStatusBreakdown = await db.booking.groupBy({
      by: ['status'],
      where: {
        created_at: {
          gte: startDate
        }
      },
      _count: {
        status: true
      }
    })

    // Get service category performance
    const servicePerformance = await db.booking.groupBy({
      by: ['service_id'],
      where: {
        created_at: {
          gte: startDate
        }
      },
      _count: {
        service_id: true
      },
      _sum: {
        subtotal: true
      }
    })

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