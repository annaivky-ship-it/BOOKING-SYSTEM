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

    const booking = await db.booking.findUnique({
      where: { id },
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
            bio: true,
            media_refs: true,
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
            description: true,
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
            reference: true,
            created_at: true,
            verified_at: true
          },
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    })

    if (!booking) {
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
    const existingBooking = await db.booking.findUnique({
      where: { id },
      include: {
        client: true,
        performer: { include: { user: true } }
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        createErrorResponse('Booking not found', 'BOOKING_NOT_FOUND'),
        { status: 404 }
      )
    }

    // Update booking
    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
        updated_at: new Date()
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

    await db.auditLog.create({
      data: auditData
    })

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
    const existingBooking = await db.booking.findUnique({
      where: { id },
      include: {
        client: true,
        payments: true
      }
    })

    if (!existingBooking) {
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
    const verifiedPayments = existingBooking.payments.filter(p => p.status === 'VERIFIED')
    if (verifiedPayments.length > 0) {
      return NextResponse.json(
        createErrorResponse('Cannot cancel booking with verified payments', 'HAS_PAYMENTS'),
        { status: 400 }
      )
    }

    // Update booking status to cancelled (soft delete)
    const cancelledBooking = await db.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updated_at: new Date()
      }
    })

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

    await db.auditLog.create({
      data: auditData
    })

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