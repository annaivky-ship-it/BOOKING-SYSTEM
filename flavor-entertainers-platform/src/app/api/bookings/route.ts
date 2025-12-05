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

    // Build query for bookings
    let bookingsQuery = db
      .from('bookings')
      .select(`
        *,
        client:users!bookings_client_id_fkey(id, email, phone, legal_name),
        performer:performers!bookings_performer_id_fkey(
          id,
          stage_name,
          user:users!performers_user_id_fkey(id, email, phone)
        ),
        service:services!bookings_service_id_fkey(id, name, category, unit, base_rate),
        payments:payment_transactions(id, type, method, amount, status, created_at)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (filterData.status) {
      bookingsQuery = bookingsQuery.eq('status', filterData.status)
    }

    if (filterData.performer_id) {
      bookingsQuery = bookingsQuery.eq('performer_id', filterData.performer_id)
    }

    if (filterData.client_id) {
      bookingsQuery = bookingsQuery.eq('client_id', filterData.client_id)
    }

    if (filterData.start_date) {
      bookingsQuery = bookingsQuery.gte('event_date', filterData.start_date)
    }

    if (filterData.end_date) {
      bookingsQuery = bookingsQuery.lte('event_date', filterData.end_date)
    }

    // Build count query
    let countQuery = db
      .from('bookings')
      .select('*', { count: 'exact', head: true })

    if (filterData.status) {
      countQuery = countQuery.eq('status', filterData.status)
    }

    if (filterData.performer_id) {
      countQuery = countQuery.eq('performer_id', filterData.performer_id)
    }

    if (filterData.client_id) {
      countQuery = countQuery.eq('client_id', filterData.client_id)
    }

    if (filterData.start_date) {
      countQuery = countQuery.gte('event_date', filterData.start_date)
    }

    if (filterData.end_date) {
      countQuery = countQuery.lte('event_date', filterData.end_date)
    }

    // Execute queries in parallel
    const [bookingsResult, countResult] = await Promise.all([
      bookingsQuery,
      countQuery
    ])

    if (bookingsResult.error) {
      throw new Error(bookingsResult.error.message)
    }

    if (countResult.error) {
      throw new Error(countResult.error.message)
    }

    const bookings = bookingsResult.data || []
    const total = countResult.count || 0

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
    const { data: performer, error: performerError } = await db
      .from('performers')
      .select('*, user:users!performers_user_id_fkey(*)')
      .eq('id', performer_id)
      .single()

    if (performerError || !performer) {
      return NextResponse.json(
        createErrorResponse('Performer not found', 'PERFORMER_NOT_FOUND'),
        { status: 404 }
      )
    }

    // Check if service exists
    const { data: service, error: serviceError } = await db
      .from('services')
      .select('*')
      .eq('id', service_id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        createErrorResponse('Service not found', 'SERVICE_NOT_FOUND'),
        { status: 404 }
      )
    }

    // Check if client exists
    const { data: client, error: clientError } = await db
      .from('users')
      .select('*')
      .eq('id', client_id)
      .single()

    if (clientError || !client) {
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
    const { data: booking, error: bookingError } = await db
      .from('bookings')
      .insert({
        client_id,
        performer_id,
        service_id,
        event_date: new Date(event_date).toISOString(),
        start_time,
        duration_mins,
        address,
        notes,
        subtotal,
        deposit_due: depositDue,
        reference_code: referenceCode,
        status: 'PENDING'
      })
      .select(`
        *,
        client:users!bookings_client_id_fkey(id, email, phone, legal_name),
        performer:performers!bookings_performer_id_fkey(
          id,
          stage_name,
          user:users!performers_user_id_fkey(id, email, phone)
        ),
        service:services!bookings_service_id_fkey(id, name, category)
      `)
      .single()

    if (bookingError || !booking) {
      throw new Error(bookingError?.message || 'Failed to create booking')
    }

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

    const { error: auditError } = await db
      .from('audit_logs')
      .insert(auditData)

    if (auditError) {
      console.error('Failed to create audit log:', auditError)
    }

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