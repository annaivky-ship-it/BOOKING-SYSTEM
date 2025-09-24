import { getSupabaseClient } from '../lib/database'
import { logger } from '../lib/logger'
import { config } from '../config'
import { DEPOSIT_PERCENTAGE, PAYMENT_METHODS, PAYMENT_STATUSES } from '@flavor-entertainers/shared'

export interface PayIDPaymentRequest {
  bookingId: string
  amount: number
  description: string
  clientEmail: string
  clientName: string
}

export interface PayIDPaymentDetails {
  payid: string
  amount: number
  reference: string
  description: string
  accountName: string
  bsb?: string
  accountNumber?: string
}

export class PayIDService {
  private supabase = getSupabaseClient()

  // PayID details for Flavor Entertainers
  private readonly BUSINESS_PAYID = 'bookings@lustandlace.com.au'
  private readonly BUSINESS_NAME = 'Flavor Entertainers'
  private readonly BSB = '062-000' // Example BSB
  private readonly ACCOUNT_NUMBER = '12345678' // Example account

  async generatePaymentInstructions(request: PayIDPaymentRequest): Promise<PayIDPaymentDetails> {
    try {
      const depositAmount = Math.ceil(request.amount * DEPOSIT_PERCENTAGE * 100) / 100 // Calculate 15% deposit
      const reference = `FE-${request.bookingId.substring(0, 8).toUpperCase()}`

      const paymentDetails: PayIDPaymentDetails = {
        payid: this.BUSINESS_PAYID,
        amount: depositAmount,
        reference,
        description: request.description,
        accountName: this.BUSINESS_NAME,
        bsb: this.BSB,
        accountNumber: this.ACCOUNT_NUMBER
      }

      // Create a payment record with 'requires_action' status
      const { error: paymentError } = await this.supabase
        .from('payments')
        .insert({
          booking_id: request.bookingId,
          amount: depositAmount,
          currency: 'AUD',
          method: PAYMENT_METHODS.PAYID,
          status: PAYMENT_STATUSES.REQUIRES_ACTION,
          provider_ref: reference
        })

      if (paymentError) {
        logger.error({ error: paymentError, bookingId: request.bookingId }, 'Failed to create PayID payment record')
        throw new Error('Failed to create payment record')
      }

      logger.info({
        bookingId: request.bookingId,
        amount: depositAmount,
        reference,
        payid: this.BUSINESS_PAYID
      }, 'PayID payment instructions generated')

      return paymentDetails
    } catch (error) {
      logger.error({ error, request }, 'Failed to generate PayID payment instructions')
      throw new Error(`Failed to generate payment instructions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async processReceiptUpload(
    bookingId: string,
    receiptFileId: string,
    uploadedBy: string
  ): Promise<void> {
    try {
      // Update payment record with receipt
      const { data: payment, error: updateError } = await this.supabase
        .from('payments')
        .update({
          receipt_file_id: receiptFileId,
          status: PAYMENT_STATUSES.REQUIRES_ACTION // Admin needs to verify
        })
        .eq('booking_id', bookingId)
        .eq('method', PAYMENT_METHODS.PAYID)
        .select()
        .single()

      if (updateError || !payment) {
        logger.error({ error: updateError, bookingId }, 'Failed to update payment with receipt')
        throw new Error('Payment record not found or update failed')
      }

      logger.info({
        bookingId,
        paymentId: payment.id,
        receiptFileId,
        uploadedBy
      }, 'PayID receipt uploaded, awaiting admin verification')

    } catch (error) {
      logger.error({ error, bookingId, receiptFileId }, 'Failed to process receipt upload')
      throw new Error('Failed to process receipt upload')
    }
  }

  async verifyPayment(
    paymentId: string,
    verifiedBy: string,
    verified: boolean,
    notes?: string
  ): Promise<{ bookingId: string; status: string }> {
    try {
      const newStatus = verified ? PAYMENT_STATUSES.SUCCEEDED : PAYMENT_STATUSES.FAILED

      const { data: payment, error: updateError } = await this.supabase
        .from('payments')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .eq('method', PAYMENT_METHODS.PAYID)
        .select('booking_id')
        .single()

      if (updateError || !payment) {
        logger.error({ error: updateError, paymentId }, 'Failed to update payment status')
        throw new Error('Payment not found or update failed')
      }

      // If verified, update booking status to confirmed
      if (verified) {
        const { error: bookingError } = await this.supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.booking_id)

        if (bookingError) {
          logger.error({ error: bookingError, bookingId: payment.booking_id }, 'Failed to confirm booking after payment verification')
        }
      }

      logger.info({
        paymentId,
        bookingId: payment.booking_id,
        verified,
        verifiedBy,
        notes
      }, 'PayID payment verification completed')

      return {
        bookingId: payment.booking_id,
        status: newStatus
      }

    } catch (error) {
      logger.error({ error, paymentId }, 'Failed to verify payment')
      throw new Error('Failed to verify payment')
    }
  }

  async getPendingPayments(): Promise<any[]> {
    try {
      const { data: payments, error } = await this.supabase
        .from('payments')
        .select(`
          *,
          bookings:booking_id (
            id,
            service,
            event_date,
            event_time,
            total,
            clients:client_id (
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('method', PAYMENT_METHODS.PAYID)
        .eq('status', PAYMENT_STATUSES.REQUIRES_ACTION)
        .not('receipt_file_id', 'is', null) // Only payments with receipts
        .order('created_at', { ascending: false })

      if (error) {
        logger.error({ error }, 'Failed to fetch pending payments')
        throw new Error('Failed to fetch pending payments')
      }

      return payments || []
    } catch (error) {
      logger.error({ error }, 'Failed to get pending payments')
      throw error
    }
  }

  generatePaymentEmail(paymentDetails: PayIDPaymentDetails): string {
    return `
      <h2>Payment Instructions - Flavor Entertainers</h2>

      <p><strong>Thank you for your booking!</strong> Please complete your payment using the details below:</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Payment Method 1: PayID (Recommended)</h3>
        <p><strong>PayID:</strong> ${paymentDetails.payid}</p>
        <p><strong>Amount:</strong> $${paymentDetails.amount.toFixed(2)} AUD</p>
        <p><strong>Reference:</strong> ${paymentDetails.reference}</p>
        <p><strong>Description:</strong> ${paymentDetails.description}</p>
      </div>

      <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Payment Method 2: Bank Transfer</h3>
        <p><strong>Account Name:</strong> ${paymentDetails.accountName}</p>
        <p><strong>BSB:</strong> ${paymentDetails.bsb}</p>
        <p><strong>Account Number:</strong> ${paymentDetails.accountNumber}</p>
        <p><strong>Amount:</strong> $${paymentDetails.amount.toFixed(2)} AUD</p>
        <p><strong>Reference:</strong> ${paymentDetails.reference}</p>
      </div>

      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Important:</strong></p>
        <ul>
          <li>This is a deposit payment (15% of total booking value)</li>
          <li>Please include the reference number: <strong>${paymentDetails.reference}</strong></li>
          <li>After payment, you'll need to upload your receipt for verification</li>
          <li>Your booking will be confirmed once payment is verified</li>
        </ul>
      </div>

      <p>If you have any questions, please contact us at bookings@lustandlace.com.au</p>

      <p>Best regards,<br>Flavor Entertainers Team</p>
    `
  }

  generatePaymentSMS(paymentDetails: PayIDPaymentDetails): string {
    return `🎉 Booking approved! Please pay $${paymentDetails.amount} deposit to PayID: ${paymentDetails.payid} using reference: ${paymentDetails.reference}. Upload receipt to confirm booking. Questions? Reply HELP`
  }
}

export const payidService = new PayIDService()