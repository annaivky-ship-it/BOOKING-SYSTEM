import { FastifyInstance } from 'fastify'
import { getSupabaseClient } from '../lib/database'
import { stripeService } from '../services/stripe'
import { notificationService } from '../services/notifications'
import { auditService } from '../services/audit'
import { logger } from '../lib/logger'
import { BOOKING_STATUSES, PAYMENT_STATUSES, PAYMENT_METHODS } from '@flavor-entertainers/shared'

export async function webhookRoutes(fastify: FastifyInstance) {
  const supabase = getSupabaseClient()

  // Stripe webhook handler
  fastify.post('/stripe', {
    config: {
      rawBody: true
    },
    schema: {
      tags: ['Webhooks'],
      description: 'Handle Stripe webhook events',
      consumes: ['application/json'],
      headers: {
        type: 'object',
        required: ['stripe-signature'],
        properties: {
          'stripe-signature': { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const signature = request.headers['stripe-signature'] as string
    const rawBody = request.rawBody as Buffer

    if (!signature || !rawBody) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'Missing signature or body'
      })
    }

    try {
      const event = await stripeService.handleWebhook(rawBody, signature)

      // Check if we've already processed this event
      const { data: existingEvent } = await supabase
        .from('events_processed')
        .select('id')
        .eq('id', event.id)
        .single()

      if (existingEvent) {
        logger.info({ eventId: event.id }, 'Webhook event already processed')
        return reply.send({ received: true })
      }

      // Mark event as received
      await supabase
        .from('events_processed')
        .insert({
          id: event.id,
          event_type: event.type
        })

      // Process the event
      await processStripeEvent(event)

      logger.info({ eventId: event.id, type: event.type }, 'Stripe webhook processed successfully')

      return reply.send({ received: true })
    } catch (error) {
      logger.error({ error }, 'Stripe webhook processing failed')
      return reply.code(400).send({
        error: 'Webhook Error',
        message: 'Invalid webhook'
      })
    }
  })

  async function processStripeEvent(event: any) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      case 'charge.refunded':
        await handleRefund(event.data.object)
        break

      default:
        logger.info({ eventType: event.type }, 'Unhandled Stripe event type')
    }
  }

  async function handlePaymentSucceeded(paymentIntent: any) {
    const bookingId = paymentIntent.metadata.booking_id

    if (!bookingId) {
      logger.warn({ paymentIntentId: paymentIntent.id }, 'Payment succeeded but no booking ID in metadata')
      return
    }

    try {
      // Get booking details
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          clients:client_id(*),
          performers:performer_id(*)
        `)
        .eq('id', bookingId)
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .single()

      if (bookingError || !booking) {
        logger.error({
          error: bookingError,
          bookingId,
          paymentIntentId: paymentIntent.id
        }, 'Booking not found for successful payment')
        return
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount: paymentIntent.amount / 100, // Convert from cents
          currency: paymentIntent.currency.toUpperCase(),
          method: PAYMENT_METHODS.STRIPE,
          status: PAYMENT_STATUSES.SUCCEEDED,
          provider_ref: paymentIntent.id
        })

      if (paymentError) {
        logger.error({ error: paymentError }, 'Failed to create payment record')
      }

      // Update booking status to confirmed
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: BOOKING_STATUSES.CONFIRMED,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (updateError) {
        logger.error({ error: updateError }, 'Failed to update booking status')
        return
      }

      // Log audit event
      await auditService.log({
        event_type: 'payment_received',
        action: 'deposit_paid',
        actor_email: booking.clients?.email,
        booking_id: bookingId,
        details: {
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          payment_intent_id: paymentIntent.id
        }
      })

      // Send notifications
      if (booking.clients) {
        await notificationService.sendBookingConfirmed({
          recipient: {
            email: booking.clients.email,
            phone: booking.clients.phone,
            name: `${booking.clients.first_name} ${booking.clients.last_name}`.trim()
          },
          booking,
          performer: booking.performers
        })
      }

      if (booking.performers) {
        await notificationService.sendDepositReceived({
          recipient: {
            phone: booking.performers.whatsapp_number,
            email: booking.performers.email,
            name: booking.performers.stage_name
          },
          booking,
          payment: { amount: paymentIntent.amount / 100 }
        })
      }

      // Schedule payment reminder for balance
      if (booking.balance_due > 0 && booking.balance_due_date) {
        await notificationService.sendPaymentReminder({
          recipient: {
            email: booking.clients?.email,
            phone: booking.clients?.phone,
            name: `${booking.clients?.first_name} ${booking.clients?.last_name}`.trim()
          },
          booking
        })
      }

      logger.info({
        bookingId,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100
      }, 'Payment processed successfully')

    } catch (error) {
      logger.error({
        error,
        bookingId,
        paymentIntentId: paymentIntent.id
      }, 'Error processing successful payment')
    }
  }

  async function handlePaymentFailed(paymentIntent: any) {
    const bookingId = paymentIntent.metadata.booking_id

    if (!bookingId) {
      logger.warn({ paymentIntentId: paymentIntent.id }, 'Payment failed but no booking ID in metadata')
      return
    }

    try {
      // Create payment record with failed status
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          method: PAYMENT_METHODS.STRIPE,
          status: PAYMENT_STATUSES.FAILED,
          provider_ref: paymentIntent.id
        })

      if (paymentError) {
        logger.error({ error: paymentError }, 'Failed to create failed payment record')
      }

      // Log audit event
      await auditService.log({
        event_type: 'payment_failed',
        action: 'deposit_failed',
        booking_id: bookingId,
        details: {
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          payment_intent_id: paymentIntent.id,
          failure_reason: paymentIntent.last_payment_error?.message
        }
      })

      logger.info({
        bookingId,
        paymentIntentId: paymentIntent.id,
        failureReason: paymentIntent.last_payment_error?.message
      }, 'Payment failed')

    } catch (error) {
      logger.error({
        error,
        bookingId,
        paymentIntentId: paymentIntent.id
      }, 'Error processing failed payment')
    }
  }

  async function handleRefund(charge: any) {
    try {
      // Find payment by provider reference
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('provider_ref', charge.payment_intent)
        .single()

      if (paymentError || !payment) {
        logger.warn({ chargeId: charge.id }, 'Payment not found for refund')
        return
      }

      // Update payment status to refunded
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: PAYMENT_STATUSES.REFUNDED,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id)

      if (updateError) {
        logger.error({ error: updateError }, 'Failed to update payment status to refunded')
      }

      // Log audit event
      await auditService.log({
        event_type: 'payment_refunded',
        action: 'refund_processed',
        booking_id: payment.booking_id,
        details: {
          payment_id: payment.id,
          refund_amount: charge.amount_refunded / 100,
          charge_id: charge.id
        }
      })

      logger.info({
        paymentId: payment.id,
        bookingId: payment.booking_id,
        refundAmount: charge.amount_refunded / 100
      }, 'Refund processed')

    } catch (error) {
      logger.error({
        error,
        chargeId: charge.id
      }, 'Error processing refund')
    }
  }
}