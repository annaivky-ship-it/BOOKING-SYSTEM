import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { bookingCreateSchema, bookingFilterBackendSchema, paginationSchema } from '@/lib/validators'
import {
  createSuccessResponse,
  createErrorResponse,
  createAuditLog,
  getClientIpAddress,
  generateReferenceCode,
  calculateDepositAmount,
  isDateInFuture
} from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse pagination
    const paginationData = paginationSchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10'
    })

    // Parse filters
    const filterData = bookingFilterBackendSchema.parse({
      status: searchParams.get('status'),
      performer_id: searchParams.get('performer_id'),
      client_id: searchParams.get('client_id'),
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date')
    })

    const { page, limit } = paginationData
    const offset = (page - 1) * limit

    // Build query conditions
    const where: any = {}

    if (filterData.status) {
      where.status = filterData.status
    }

    if (filterData.performer_id) {
      where.performer_id = filterData.performer_id
    }

    if (filterData.client_id) {
      where.client_id = filterData.client_id
    }

    if (filterData.start_date || filterData.end_date) {
      where.event_date = {}
      if (filterData.start_date) {
        where.event_date.gte = new Date(filterData.start_date)
      }
      if (filterData.end_date) {
        where.event_date.lte = new Date(filterData.end_date)
      }
    }

    // Get bookings with related data
    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              email: true,
              phone: true,
              legal_name: true
            }
          },
          performer: {
            select: {
              id: true,
              stage_name: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              category: true,
              unit: true,
              base_rate: true
            }
          },
          payments: {
            select: {
              id: true,
              type: true,
              method: true,
              amount: true,
              status: true,
              created_at: true
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: [
          { created_at: 'desc' }
        ]
      }),
      db.booking.count({ where })
    ])

    return NextResponse.json(
      createSuccessResponse({
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    )

  } catch (error) {
    console.error('Bookings fetch error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to fetch bookings', 'FETCH_ERROR'),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = bookingCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Invalid input data', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    const { performer_id, service_id, event_date, start_time, duration_mins, address, notes } = validation.data
    const { client_id } = body // This should come from authentication
    const ipAddress = getClientIpAddress(request)

    // Validate event date is in future
    if (!isDateInFuture(event_date, 24)) {
      return NextResponse.json(
        createErrorResponse('Event must be at least 24 hours in advance', 'INVALID_DATE'),
        { status: 400 }
      )
    }

    // Check if performer exists and is available
    const performer = await db.performer.findUnique({
      where: { id: performer_id },
      include: {
        user: true
      }
    })

    if (!performer) {
      return NextResponse.json(
        createErrorResponse('Performer not found', 'PERFORMER_NOT_FOUND'),
        { status: 404 }
      )
    }

    // Check if service exists
    const service = await db.service.findUnique({
      where: { id: service_id }
    })

    if (!service) {
      return NextResponse.json(
        createErrorResponse('Service not found', 'SERVICE_NOT_FOUND'),
        { status: 404 }
      )
    }

    // Check if client exists
    const client = await db.user.findUnique({
      where: { id: client_id }
    })

    if (!client) {
      return NextResponse.json(
        createErrorResponse('Client not found', 'CLIENT_NOT_FOUND'),
        { status: 404 }
      )
    }

    // Calculate pricing
    const hourlyRate = Number(service.base_rate)
    const durationHours = duration_mins / 60
    const subtotal = hourlyRate * durationHours
    const depositDue = calculateDepositAmount(subtotal)

    // Generate reference code
    const referenceCode = generateReferenceCode('BK', Date.now().toString())

    // Create booking
    const booking = await db.booking.create({
      data: {
        client_id,
        performer_id,
        service_id,
        event_date: new Date(event_date),
        start_time,
        duration_mins,
        address,
        notes,
        subtotal,
        deposit_due: depositDue,
        reference_code: referenceCode,
        status: 'PENDING'
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            phone: true,
            legal_name: true
          }
        },
        performer: {
          select: {
            id: true,
            stage_name: true,
            user: {
              select: {
                id: true,
                email: true,
                phone: true
              }
            }
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    })

    // Create audit log
    const auditData = createAuditLog(
      'BOOKING',
      'BOOKING_CREATED',
      {
        booking_id: booking.id,
        reference_code: referenceCode,
        performer_id,
        service_id,
        subtotal,
        deposit_due: depositDue
      },
      client_id,
      booking.id,
      undefined,
      client.email,
      ipAddress
    )

    await db.auditLog.create({
      data: auditData
    })

    // TODO: Send notifications to admin and performer
    // This would integrate with the Twilio service

    return NextResponse.json(
      createSuccessResponse(booking, 'Booking created successfully'),
      { status: 201 }
    )

  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to create booking', 'CREATION_ERROR'),
      { status: 500 }
    )
  }
}