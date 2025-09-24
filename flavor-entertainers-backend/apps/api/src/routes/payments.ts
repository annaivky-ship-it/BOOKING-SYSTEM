import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  UUIDSchema,
  PayIDReceiptRequestSchema,
  PAYMENT_METHODS,
  PAYMENT_STATUSES
} from '@flavor-entertainers/shared'
import { getSupabaseClient } from '../lib/database'
import { authenticateUser, requireAdmin, requireAdminOrClient } from '../middleware/auth'
import { validateBody, validateParams } from '../middleware/validation'
import { auditService } from '../services/audit'
import { payidService } from '../services/payid'
import { notificationService } from '../services/notifications'
import { logger } from '../lib/logger'

export async function paymentRoutes(fastify: FastifyInstance) {
  const supabase = getSupabaseClient()

  // Upload PayID receipt
  fastify.post('/:booking_id/payid-receipt', {
    preHandler: [
      authenticateUser,
      requireAdminOrClient,
      validateParams(z.object({ booking_id: UUIDSchema })),
      validateBody(PayIDReceiptRequestSchema)
    ],
    schema: {
      tags: ['Payments'],
      description: 'Upload PayID payment receipt',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['booking_id'],
        properties: { booking_id: { type: 'string', format: 'uuid' } }
      },
      body: PayIDReceiptRequestSchema
    }
  }, async (request, reply) => {
    const { booking_id } = request.params as any
    const { receipt_file } = request.body as any

    try {
      // Verify booking exists and user has access
      let query = supabase
        .from('bookings')
        .select('*, clients:client_id(*)')
        .eq('id', booking_id)

      if (request.user!.role === 'client') {
        query = query.eq('client_id', request.user!.id)
      }

      const { data: booking, error: bookingError } = await query.single()

      if (bookingError || !booking) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Booking not found or access denied'
        })
      }

      if (booking.status !== 'awaiting_payment') {
        return reply.code(400).send({
          error: 'Invalid Status',
          message: 'Booking is not awaiting payment'
        })
      }

      // Process receipt upload
      await payidService.processReceiptUpload(
        booking_id,
        receipt_file,
        request.user!.id
      )

      // Log audit event
      await auditService.log({
        event_type: 'payment_receipt_uploaded',
        action: 'upload_receipt',
        actor_user_id: request.user!.id,
        actor_email: request.user!.email,
        ip: request.ip,
        request_id: request.id,
        booking_id: booking_id,
        details: {
          receipt_file_id: receipt_file,
          method: PAYMENT_METHODS.PAYID
        }
      })

      // Notify admin of receipt upload
      await notificationService.sendNotification({
        type: 'payment_receipt_uploaded',
        recipient: {
          email: process.env.ADMIN_EMAIL,
          phone: process.env.ADMIN_WHATSAPP?.replace('whatsapp:', '')
        },
        data: {
          booking_id: booking_id,
          client_name: `${booking.clients?.first_name || ''} ${booking.clients?.last_name || ''}`.trim(),
          service: booking.service,
          event_date: booking.event_date,
          receipt_file_id: receipt_file
        }
      })

      logger.info({
        bookingId: booking_id,
        uploadedBy: request.user!.id,
        receiptFileId: receipt_file
      }, 'PayID receipt uploaded')

      return reply.send({
        message: 'Receipt uploaded successfully. Payment will be verified by admin.',
        status: 'awaiting_verification'
      })

    } catch (error) {
      logger.error({ error, bookingId: booking_id }, 'Failed to upload receipt')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to upload receipt'
      })
    }
  })

  // Verify PayID payment (admin only)
  fastify.post('/:payment_id/verify', {
    preHandler: [
      authenticateUser,
      requireAdmin,
      validateParams(z.object({ payment_id: UUIDSchema }))
    ],
    schema: {
      tags: ['Payments'],
      description: 'Verify PayID payment receipt (admin only)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['payment_id'],
        properties: { payment_id: { type: 'string', format: 'uuid' } }
      },
      body: {
        type: 'object',
        required: ['verified'],
        properties: {
          verified: { type: 'boolean' },
          notes: { type: 'string', maxLength: 500 }
        }
      }
    }
  }, async (request, reply) => {
    const { payment_id } = request.params as any
    const { verified, notes } = request.body as any

    try {
      const result = await payidService.verifyPayment(
        payment_id,
        request.user!.id,
        verified,
        notes
      )

      await auditService.log({
        event_type: 'payment_verified',
        action: verified ? 'payment_approved' : 'payment_rejected',
        actor_user_id: request.user!.id,
        actor_email: request.user!.email,
        ip: request.ip,
        request_id: request.id,
        booking_id: result.bookingId,
        details: {
          payment_id,
          verified,
          notes,
          status: result.status
        }
      })

      if (verified) {
        // Get booking details for notifications
        const { data: booking } = await supabase
          .from('bookings')
          .select(`
            *,
            clients:client_id(*),
            performers:performer_id(*)
          `)
          .eq('id', result.bookingId)
          .single()

        if (booking) {
          // Notify client of confirmed booking
          await notificationService.sendBookingConfirmed({
            recipient: {
              email: booking.clients?.email,
              phone: booking.clients?.phone,
              name: `${booking.clients?.first_name || ''} ${booking.clients?.last_name || ''}`.trim()
            },
            booking,
            performer: booking.performers
          })

          // Notify performer of new confirmed booking
          if (booking.performers) {
            await notificationService.sendDepositReceived({
              recipient: {
                phone: booking.performers.whatsapp_number,
                email: booking.performers.email,
                name: booking.performers.stage_name
              },
              booking,
              payment: { amount: booking.total * 0.15 }
            })
          }
        }
      }

      logger.info({
        paymentId: payment_id,
        bookingId: result.bookingId,
        verified,
        verifiedBy: request.user!.id
      }, 'Payment verification completed')

      return reply.send({
        message: verified ? 'Payment verified and booking confirmed' : 'Payment rejected',
        booking_id: result.bookingId,
        status: result.status
      })

    } catch (error) {
      logger.error({ error, paymentId: payment_id }, 'Failed to verify payment')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to verify payment'
      })
    }
  })

  // Get payment details
  fastify.get('/:booking_id/payment', {
    preHandler: [
      authenticateUser,
      validateParams(z.object({ booking_id: UUIDSchema }))
    ],
    schema: {
      tags: ['Payments'],
      description: 'Get payment details for booking',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['booking_id'],
        properties: { booking_id: { type: 'string', format: 'uuid' } }
      }
    }
  }, async (request, reply) => {
    const { booking_id } = request.params as any

    try {
      // Verify access to booking
      let bookingQuery = supabase
        .from('bookings')
        .select('client_id, performer_id')
        .eq('id', booking_id)

      if (request.user!.role === 'client') {
        bookingQuery = bookingQuery.eq('client_id', request.user!.id)
      } else if (request.user!.role === 'performer') {
        bookingQuery = bookingQuery.eq('performer_id', request.user!.id)
      }

      const { data: booking, error: bookingError } = await bookingQuery.single()

      if (bookingError || !booking) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Booking not found or access denied'
        })
      }

      // Get payment details
      const { data: payments, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', booking_id)
        .order('created_at', { ascending: false })

      if (paymentError) {
        logger.error({ error: paymentError, bookingId: booking_id }, 'Failed to fetch payments')
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to fetch payment details'
        })
      }

      return reply.send({
        booking_id,
        payments: payments || []
      })

    } catch (error) {
      logger.error({ error, bookingId: booking_id }, 'Failed to get payment details')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get payment details'
      })
    }
  })

  // Get pending payments for admin review
  fastify.get('/pending-verification', {
    preHandler: [authenticateUser, requireAdmin],
    schema: {
      tags: ['Payments'],
      description: 'Get pending payment verifications (admin only)',
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    try {
      const pendingPayments = await payidService.getPendingPayments()

      return reply.send({
        pending_payments: pendingPayments,
        total: pendingPayments.length
      })

    } catch (error) {
      logger.error({ error }, 'Failed to get pending payments')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get pending payments'
      })
    }
  })
}