import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentTransactionSchema } from '@/lib/validators'
import { createSuccessResponse, createErrorResponse, createAuditLog, getClientIpAddress } from '@/lib/utils'
import { formidable } from 'formidable'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = paymentTransactionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Invalid input data', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    const { booking_id, type, method, amount, reference } = validation.data
    const { receipt_file_id, client_id } = body // These should come from file upload and authentication
    const ipAddress = getClientIpAddress(request)

    // Check if booking exists
    const booking = await db.booking.findUnique({
      where: { id: booking_id },
      include: {
        client: true,
        payments: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        createErrorResponse('Booking not found', 'BOOKING_NOT_FOUND'),
        { status: 404 }
      )
    }

    // Verify client owns this booking
    if (booking.client_id !== client_id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized - Not your booking', 'UNAUTHORIZED'),
        { status: 403 }
      )
    }

    // Check if booking is in correct status
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      return NextResponse.json(
        createErrorResponse('Cannot add payment to this booking', 'INVALID_STATUS'),
        { status: 400 }
      )
    }

    // Validate payment amount based on type
    let expectedAmount: number
    if (type === 'DEPOSIT') {
      expectedAmount = Number(booking.deposit_due)
    } else if (type === 'BALANCE') {
      const depositPaid = booking.payments
        .filter(p => p.type === 'DEPOSIT' && p.status === 'VERIFIED')
        .reduce((sum, p) => sum + Number(p.amount), 0)
      expectedAmount = Number(booking.subtotal) - depositPaid
    } else {
      expectedAmount = amount // For referral payments, accept any amount
    }

    if (type !== 'REFERRAL' && Math.abs(amount - expectedAmount) > 0.01) {
      return NextResponse.json(
        createErrorResponse(`Invalid amount. Expected $${expectedAmount.toFixed(2)}`, 'INVALID_AMOUNT'),
        { status: 400 }
      )
    }

    // Create payment transaction
    const payment = await db.paymentTransaction.create({
      data: {
        booking_id,
        type,
        method,
        amount,
        reference,
        receipt_file_id,
        status: 'UPLOADED'
      }
    })

    // Create audit log
    const auditData = createAuditLog(
      'PAYMENT',
      'PAYMENT_UPLOADED',
      {
        payment_id: payment.id,
        booking_id,
        type,
        method,
        amount,
        reference
      },
      client_id,
      booking_id,
      undefined,
      booking.client.email,
      ipAddress
    )

    await db.auditLog.create({
      data: auditData
    })

    // TODO: Send notification to admin about new payment upload

    return NextResponse.json(
      createSuccessResponse(payment, 'Payment uploaded successfully'),
      { status: 201 }
    )

  } catch (error) {
    console.error('Payment transaction creation error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to upload payment', 'CREATION_ERROR'),
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const booking_id = searchParams.get('booking_id')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Build query conditions
    const where: any = {}

    if (booking_id) {
      where.booking_id = booking_id
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    const payments = await db.paymentTransaction.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            reference_code: true,
            subtotal: true,
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
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(
      createSuccessResponse(payments)
    )

  } catch (error) {
    console.error('Payment transactions fetch error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to fetch payment transactions', 'FETCH_ERROR'),
      { status: 500 }
    )
  }
}