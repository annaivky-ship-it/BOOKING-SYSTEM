import Stripe from 'stripe'
import { config } from '../config'
import { logger } from '../lib/logger'
import { DEPOSIT_PERCENTAGE } from '@flavor-entertainers/shared'

export class StripeService {
  private stripe: Stripe

  constructor() {
    this.stripe = new Stripe(config.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20'
    })
  }

  async createPaymentLink(
    bookingId: string,
    amount: number,
    description: string
  ): Promise<{ url: string; paymentIntentId: string }> {
    try {
      const depositAmount = Math.ceil(amount * DEPOSIT_PERCENTAGE * 100) // Convert to cents

      const price = await this.stripe.prices.create({
        currency: 'aud',
        unit_amount: depositAmount,
        product_data: {
          name: description,
          metadata: {
            booking_id: bookingId
          }
        }
      })

      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1
          }
        ],
        metadata: {
          booking_id: bookingId,
          type: 'deposit'
        },
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${config.BASE_URL}/booking/${bookingId}/success`
          }
        }
      })

      logger.info({
        bookingId,
        priceId: price.id,
        amount: depositAmount
      }, 'Payment link created')

      return {
        url: paymentLink.url,
        paymentIntentId: price.id // Using price.id as reference
      }
    } catch (error) {
      logger.error({ error, bookingId, amount }, 'Failed to create payment link')
      throw new Error(`Failed to create payment link: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<any> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.STRIPE_WEBHOOK_SECRET
      )

      logger.info({ eventId: event.id, type: event.type }, 'Stripe webhook received')

      return event
    } catch (error) {
      logger.error({ error }, 'Stripe webhook verification failed')
      throw new Error('Invalid webhook signature')
    }
  }

  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId)
    } catch (error) {
      logger.error({ error, paymentIntentId }, 'Failed to retrieve payment intent')
      throw new Error('Failed to retrieve payment intent')
    }
  }

  async refundPayment(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason: reason as Stripe.RefundCreateParams.Reason,
        metadata: {
          refund_reason: reason || 'booking_cancellation'
        }
      })

      logger.info({
        paymentIntentId,
        refundId: refund.id,
        amount: refund.amount
      }, 'Refund processed')

      return refund
    } catch (error) {
      logger.error({ error, paymentIntentId }, 'Failed to process refund')
      throw new Error('Failed to process refund')
    }
  }

  async createBalanceTransfer(
    performerId: string,
    amount: number,
    description: string
  ): Promise<Stripe.Transfer> {
    try {
      // Note: This requires the performer to have a connected Stripe account
      // For now, we'll just log the intended transfer
      logger.info({
        performerId,
        amount,
        description
      }, 'Balance transfer requested (manual processing required)')

      // In production, you'd create an actual transfer:
      // const transfer = await this.stripe.transfers.create({
      //   amount: Math.round(amount * 100), // Convert to cents
      //   currency: 'aud',
      //   destination: performerStripeAccountId,
      //   description
      // })

      // For now, return a mock transfer object
      return {
        id: `tr_mock_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: 'aud',
        description,
        created: Math.floor(Date.now() / 1000)
      } as any
    } catch (error) {
      logger.error({ error, performerId, amount }, 'Failed to create balance transfer')
      throw new Error('Failed to create balance transfer')
    }
  }
}

export const stripeService = new StripeService()