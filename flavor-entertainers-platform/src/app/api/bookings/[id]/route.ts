import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { bookingUpdateSchema } from '@/lib/validators'
import { createSuccessResponse, createErrorResponse, createAuditLog, getClientIpAddress } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data: booking, error: bookingError } = await db
      .from('bookings')
      .select(`
        *,
        client:users!bookings_client_id_fkey(id, email, phone, legal_name),
        performer:performers!bookings_performer_id_fkey(
          id,
          stage_name,
          bio,
          media_refs,
          user:users!performers_user_id_fkey(id, email, phone)
        ),
        service:services!bookings_service_id_fkey(id, name, description, category, unit, base_rate),
        payments:payment_transactions(id, type, method, amount, status, reference, created_at, verified_at)
      `)
      .eq('id', id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        createErrorResponse('Booking not found', 'BOOKING_NOT_FOUND'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      createSuccessResponse(booking)
    )

  } catch (error) {
    console.error('Booking fetch error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to fetch booking', 'FETCH_ERROR'),
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Validate input
    const validation = bookingUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Invalid input data', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    const { status, notes } = validation.data
    const { actor_user_id } = body // This should come from authentication
    const ipAddress = getClientIpAddress(request)

    // Get existing booking
    const { data: existingBooking, error: existingError } = await db
      .from('bookings')
      .select(`
        *,
        client:users!bookings_client_id_fkey(*),
        performer:performers!bookings_performer_id_fkey(*, user:users!performers_user_id_fkey(*))
      `)
      .eq('id', id)
      .single()

    if (existingError || !existingBooking) {
      return NextResponse.json(
        createErrorResponse('Booking not found', 'BOOKING_NOT_FOUND'),
        { status: 404 }
      )
    }

    // Update booking
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    if (status) updateData.status = status
    if (notes) updateData.notes = notes

    const { data: updatedBooking, error: updateError } = await db
      .from('bookings')
      .update(updateData)
      .eq('id', id)
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

    if (updateError || !updatedBooking) {
      throw new Error(updateError?.message || 'Failed to update booking')
    }

    // Create audit log
    const auditData = createAuditLog(
      'BOOKING',
      'BOOKING_UPDATED',
      {
        booking_id: id,
        old_status: existingBooking.status,
        new_status: status,
        changes: { status, notes }
      },
      actor_user_id,
      id,
      undefined,
      existingBooking.client.email,
      ipAddress
    )

    const { error: auditError } = await db
      .from('audit_logs')
      .insert(auditData)

    if (auditError) {
      console.error('Failed to create audit log:', auditError)
    }

    // TODO: Send notification based on status change
    // APPROVED -> Notify client and performer
    // REJECTED -> Notify client with reason
    // COMPLETED -> Trigger review request

    return NextResponse.json(
      createSuccessResponse(updatedBooking, 'Booking updated successfully')
    )

  } catch (error) {
    console.error('Booking update error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to update booking', 'UPDATE_ERROR'),
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { actor_user_id } = await request.json()
    const ipAddress = getClientIpAddress(request)

    // Get existing booking
    const { data: existingBooking, error: existingError } = await db
      .from('bookings')
      .select('*, client:users!bookings_client_id_fkey(*), payments:payment_transactions(*)')
      .eq('id', id)
      .single()

    if (existingError || !existingBooking) {
      return NextResponse.json(
        createErrorResponse('Booking not found', 'BOOKING_NOT_FOUND'),
        { status: 404 }
      )
    }

    // Check if booking can be cancelled
    if (existingBooking.status === 'COMPLETED') {
      return NextResponse.json(
        createErrorResponse('Cannot cancel completed booking', 'INVALID_STATUS'),
        { status: 400 }
      )
    }

    // Check if there are verified payments
    const verifiedPayments = existingBooking.payments.filter((p: any) => p.status === 'VERIFIED')
    if (verifiedPayments.length > 0) {
      return NextResponse.json(
        createErrorResponse('Cannot cancel booking with verified payments', 'HAS_PAYMENTS'),
        { status: 400 }
      )
    }

    // Update booking status to cancelled (soft delete)
    const { data: cancelledBooking, error: cancelError } = await db
      .from('bookings')
      .update({
        status: 'CANCELLED',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (cancelError || !cancelledBooking) {
      throw new Error(cancelError?.message || 'Failed to cancel booking')
    }

    // Create audit log
    const auditData = createAuditLog(
      'BOOKING',
      'BOOKING_CANCELLED',
      {
        booking_id: id,
        reference_code: existingBooking.reference_code,
        reason: 'Client cancellation'
      },
      actor_user_id,
      id,
      undefined,
      existingBooking.client.email,
      ipAddress
    )

    const { error: auditError } = await db
      .from('audit_logs')
      .insert(auditData)

    if (auditError) {
      console.error('Failed to create audit log:', auditError)
    }

    return NextResponse.json(
      createSuccessResponse(cancelledBooking, 'Booking cancelled successfully')
    )

  } catch (error) {
    console.error('Booking cancellation error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to cancel booking', 'CANCELLATION_ERROR'),
      { status: 500 }
    )
  }
}