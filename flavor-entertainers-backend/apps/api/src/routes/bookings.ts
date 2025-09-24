import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  CreateBookingRequestSchema,
  BookingApprovalRequestSchema,
  BookingSearchQuerySchema,
  UUIDSchema,
  BOOKING_STATUSES,
  DEFAULT_BOOKING_FEE,
  DEPOSIT_PERCENTAGE
} from '@flavor-entertainers/shared'
import { getSupabaseClient } from '../lib/database'
import { authenticateUser, requireAdmin, requireAdminOrClient } from '../middleware/auth'
import { validateBody, validateQuery, validateParams } from '../middleware/validation'
import { auditService } from '../services/audit'
import { payidService } from '../services/payid'
import { notificationService } from '../services/notifications'
import { logger } from '../lib/logger'
import { config } from '../config'

export async function bookingRoutes(fastify: FastifyInstance) {
  const supabase = getSupabaseClient()

  // Create booking request
  fastify.post('/request', {
    preHandler: [validateBody(CreateBookingRequestSchema)],
    schema: {
      tags: ['Bookings'],
      description: 'Create a new booking request',
      body: CreateBookingRequestSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            booking_id: { type: 'string' },
            status: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const bookingData = request.body as any

    try {
      // Check if email/phone is blacklisted
      const { data: blacklisted } = await supabase
        .rpc('check_blacklist', {
          p_email: bookingData.email,
          p_phone: bookingData.phone,
          p_full_name: bookingData.name
        })

      if (blacklisted) {
        logger.warn({
          email: bookingData.email,
          phone: bookingData.phone,
          name: bookingData.name
        }, 'Booking blocked - client is blacklisted')

        return reply.code(403).send({
          error: 'Booking Blocked',
          message: 'Unable to process booking request'
        })
      }

      // Check if client exists and get ID
      let clientId: string | null = null
      const { data: existingClient } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', bookingData.email)
        .eq('role', 'client')
        .single()

      if (existingClient) {
        clientId = existingClient.id

        // Check if pre-approved
        const { data: approved } = await supabase
          .rpc('is_client_approved', { p_client_id: clientId })

        if (!approved) {
          // Create vetting application if not pre-approved
          const { error: vettingError } = await supabase
            .from('vetting_applications')
            .insert({
              client_id: clientId,
              full_name: bookingData.name,
              email: bookingData.email,
              mobile: bookingData.phone,
              event_date: bookingData.event_date,
              event_address: bookingData.location,
              event_type: bookingData.service,
              ip_address: request.ip
            })

          if (vettingError) {
            logger.error({ error: vettingError }, 'Failed to create vetting application')
          }
        }
      } else {
        // Create vetting application for unknown client
        const { error: vettingError } = await supabase
          .from('vetting_applications')
          .insert({
            full_name: bookingData.name,
            email: bookingData.email,
            mobile: bookingData.phone,
            event_date: bookingData.event_date,
            event_address: bookingData.location,
            event_type: bookingData.service,
            ip_address: request.ip
          })

        if (vettingError) {
          logger.error({ error: vettingError }, 'Failed to create vetting application')
        }
      }

      // Create booking
      const total = bookingData.rate + DEFAULT_BOOKING_FEE
      const balanceDue = total - (total * DEPOSIT_PERCENTAGE)

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          client_id: clientId,
          performer_id: bookingData.performer_id,
          event_date: bookingData.event_date,
          event_time: bookingData.event_time,
          location: bookingData.location,
          service: bookingData.service,
          rate: bookingData.rate,
          booking_fee: DEFAULT_BOOKING_FEE,
          total,
          balance_due: balanceDue,
          message: bookingData.message,
          status: BOOKING_STATUSES.PENDING_REVIEW
        })
        .select()
        .single()

      if (bookingError) {
        logger.error({ error: bookingError }, 'Failed to create booking')
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to create booking'
        })
      }

      await auditService.log({
        event_type: 'booking_created',
        action: 'create',
        actor_email: bookingData.email,
        ip: request.ip,
        request_id: request.id,
        booking_id: booking.id,
        details: {
          service: bookingData.service,
          event_date: bookingData.event_date,
          rate: bookingData.rate,
          total
        }
      })

      // Notify admin of new booking
      await notificationService.sendNotification({
        type: 'booking_pending_review',
        recipient: {
          phone: config.ADMIN_WHATSAPP.replace('whatsapp:', ''),
          email: config.ADMIN_EMAIL
        },
        data: {
          booking_id: booking.id,
          client_name: bookingData.name,
          service: bookingData.service,
          event_date: bookingData.event_date,
          rate: bookingData.rate
        }
      })

      logger.info({
        bookingId: booking.id,
        clientEmail: bookingData.email,
        service: bookingData.service
      }, 'Booking created successfully')

      return reply.code(201).send({
        booking_id: booking.id,
        status: booking.status,
        message: 'Booking request submitted successfully. We will review and contact you shortly.'
      })
    } catch (error) {
      logger.error({ error, bookingData }, 'Booking creation exception')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create booking'
      })
    }
  })

  // Approve booking (admin only)
  fastify.post('/:id/approve', {
    preHandler: [
      authenticateUser,
      requireAdmin,
      validateParams(z.object({ id: UUIDSchema })),
      validateBody(BookingApprovalRequestSchema)
    ],
    schema: {
      tags: ['Bookings'],
      description: 'Approve a booking and generate payment link',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      body: BookingApprovalRequestSchema
    }
  }, async (request, reply) => {
    const { id } = request.params as any
    const { performer_id } = request.body as any

    try {
      // Get booking
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('*, clients(*)')
        .eq('id', id)
        .eq('status', BOOKING_STATUSES.PENDING_REVIEW)
        .single()

      if (fetchError || !booking) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Booking not found or not in pending review status'
        })
      }

      // Generate PayID payment instructions
      const description = `Deposit for ${booking.service} on ${booking.event_date}`
      const paymentDetails = await payidService.generatePaymentInstructions({
        bookingId: booking.id,
        amount: booking.total,
        description,
        clientEmail: booking.clients?.email || 'unknown@example.com',
        clientName: `${booking.clients?.first_name || ''} ${booking.clients?.last_name || ''}`.trim()
      })

      // Calculate balance due date (14 days from now)
      const balanceDueDate = new Date()
      balanceDueDate.setDate(balanceDueDate.getDate() + 14)

      // Update booking
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: BOOKING_STATUSES.AWAITING_PAYMENT,
          performer_id,
          balance_due_date: balanceDueDate.toISOString().split('T')[0]
        })
        .eq('id', id)

      if (updateError) {
        logger.error({ error: updateError }, 'Failed to update booking')
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to approve booking'
        })
      }

      await auditService.log({
        event_type: 'booking_approved',
        action: 'approve',
        actor_user_id: request.user!.id,
        actor_email: request.user!.email,
        ip: request.ip,
        request_id: request.id,
        booking_id: id,
        performer_id,
        details: {
          payid: paymentDetails.payid,
          reference: paymentDetails.reference,
          deposit_amount: paymentDetails.amount
        }
      })

      // Send payment instructions via email and SMS
      const emailHtml = payidService.generatePaymentEmail(paymentDetails)
      const smsText = payidService.generatePaymentSMS(paymentDetails)

      // Notify client with payment instructions
      await notificationService.sendNotification({
        type: 'payment_instructions',
        recipient: {
          email: booking.clients?.email,
          phone: booking.clients?.phone,
          name: `${booking.clients?.first_name || ''} ${booking.clients?.last_name || ''}`.trim()
        },
        template: emailHtml,
        data: {
          payid: paymentDetails.payid,
          amount: paymentDetails.amount,
          reference: paymentDetails.reference,
          bsb: paymentDetails.bsb,
          account_number: paymentDetails.accountNumber
        }
      })

      logger.info({
        bookingId: id,
        performerId: performer_id,
        approvedBy: request.user!.id,
        payid: paymentDetails.payid,
        reference: paymentDetails.reference
      }, 'Booking approved with PayID instructions')

      return reply.send({
        message: 'Booking approved successfully. Payment instructions sent to client.',
        payment_details: {
          payid: paymentDetails.payid,
          amount: paymentDetails.amount,
          reference: paymentDetails.reference,
          bsb: paymentDetails.bsb,
          account_number: paymentDetails.accountNumber
        },
        status: BOOKING_STATUSES.AWAITING_PAYMENT
      })
    } catch (error) {
      logger.error({ error, bookingId: id }, 'Booking approval exception')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to approve booking'
      })
    }
  })

  // Get booking details
  fastify.get('/:id', {
    preHandler: [
      authenticateUser,
      validateParams(z.object({ id: UUIDSchema }))
    ],
    schema: {
      tags: ['Bookings'],
      description: 'Get booking details',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as any

    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          clients:client_id(*),
          performers:performer_id(*),
          payments(*)
        `)
        .eq('id', id)

      // Apply row level security - users can only see their own bookings
      if (request.user!.role === 'client') {
        query = query.eq('client_id', request.user!.id)
      } else if (request.user!.role === 'performer') {
        query = query.eq('performer_id', request.user!.id)
      }
      // Admin can see all bookings (no additional filter needed)

      const { data: booking, error } = await query.single()

      if (error || !booking) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Booking not found'
        })
      }

      return reply.send(booking)
    } catch (error) {
      logger.error({ error, bookingId: id }, 'Failed to fetch booking')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch booking'
      })
    }
  })

  // List bookings with filters
  fastify.get('/', {
    preHandler: [
      authenticateUser,
      validateQuery(BookingSearchQuerySchema)
    ],
    schema: {
      tags: ['Bookings'],
      description: 'List bookings with optional filters',
      security: [{ bearerAuth: [] }],
      querystring: BookingSearchQuerySchema
    }
  }, async (request, reply) => {
    const filters = request.query as any

    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          clients:client_id(first_name, last_name, email),
          performers:performer_id(stage_name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      // Apply role-based filters
      if (request.user!.role === 'client') {
        query = query.eq('client_id', request.user!.id)
      } else if (request.user!.role === 'performer') {
        query = query.eq('performer_id', request.user!.id)
      }

      // Apply additional filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.performer_id) {
        query = query.eq('performer_id', filters.performer_id)
      }

      if (filters.client_id && request.user!.role === 'admin') {
        query = query.eq('client_id', filters.client_id)
      }

      if (filters.date_from) {
        query = query.gte('event_date', filters.date_from)
      }

      if (filters.date_to) {
        query = query.lte('event_date', filters.date_to)
      }

      // Apply pagination
      const limit = filters.limit || 20
      const offset = filters.offset || 0
      query = query.range(offset, offset + limit - 1)

      const { data: bookings, error, count } = await query

      if (error) {
        logger.error({ error, filters }, 'Failed to fetch bookings')
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to fetch bookings'
        })
      }

      return reply.send({
        data: bookings || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          has_more: (count || 0) > offset + limit
        }
      })
    } catch (error) {
      logger.error({ error, filters }, 'Bookings list exception')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch bookings'
      })
    }
  })

  // Cancel booking
  fastify.post('/:id/cancel', {
    preHandler: [
      authenticateUser,
      requireAdminOrClient,
      validateParams(z.object({ id: UUIDSchema }))
    ],
    schema: {
      tags: ['Bookings'],
      description: 'Cancel a booking',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } }
      },
      body: {
        type: 'object',
        properties: {
          reason: { type: 'string', maxLength: 500 }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as any
    const { reason } = request.body as any

    try {
      // Get booking with permission check
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .in('status', [BOOKING_STATUSES.PENDING_REVIEW, BOOKING_STATUSES.AWAITING_PAYMENT, BOOKING_STATUSES.CONFIRMED])

      if (request.user!.role === 'client') {
        query = query.eq('client_id', request.user!.id)
      }

      const { data: booking, error: fetchError } = await query.single()

      if (fetchError || !booking) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Booking not found or cannot be cancelled'
        })
      }

      // Process refund if payment was made
      if (booking.stripe_payment_intent_id && booking.status === BOOKING_STATUSES.CONFIRMED) {
        try {
          // TODO: Implement PayID refund process
          // await stripeService.refundPayment(
          //   booking.stripe_payment_intent_id,
          //   undefined, // Full refund
          //   'booking_cancellation'
          // )
        } catch (refundError) {
          logger.error({ error: refundError, bookingId: id }, 'Refund failed during cancellation')
          // Continue with cancellation even if refund fails - can be processed manually
        }
      }

      // Update booking status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: BOOKING_STATUSES.CANCELLED,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) {
        logger.error({ error: updateError }, 'Failed to cancel booking')
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to cancel booking'
        })
      }

      await auditService.log({
        event_type: 'booking_cancelled',
        action: 'cancel',
        actor_user_id: request.user!.id,
        actor_email: request.user!.email,
        ip: request.ip,
        request_id: request.id,
        booking_id: id,
        details: { reason }
      })

      logger.info({
        bookingId: id,
        cancelledBy: request.user!.id,
        reason
      }, 'Booking cancelled')

      return reply.send({
        message: 'Booking cancelled successfully',
        refund_info: booking.stripe_payment_intent_id
          ? 'Refund will be processed within 3-5 business days'
          : 'No payment to refund'
      })
    } catch (error) {
      logger.error({ error, bookingId: id }, 'Booking cancellation exception')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to cancel booking'
      })
    }
  })
}