import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'
import { Twilio } from 'twilio'
import { Resend } from 'resend'
import { config } from '../config'
import { logger } from '../lib/logger'
import { NOTIFICATION_TYPES } from '@flavor-entertainers/shared'

export interface NotificationJob {
  type: string
  recipient: {
    phone?: string
    email?: string
    name?: string
  }
  data: Record<string, any>
  template?: string
}

export interface NotificationProvider {
  send(job: NotificationJob): Promise<void>
}

class TwilioWhatsAppProvider implements NotificationProvider {
  private client: Twilio

  constructor() {
    this.client = new Twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
  }

  async send(job: NotificationJob): Promise<void> {
    if (!job.recipient.phone) {
      throw new Error('Phone number required for WhatsApp notification')
    }

    const message = this.formatMessage(job)

    try {
      const result = await this.client.messages.create({
        from: config.TWILIO_WHATSAPP_FROM,
        to: `whatsapp:${job.recipient.phone}`,
        body: message
      })

      logger.info({
        jobType: job.type,
        recipient: job.recipient.phone,
        messageSid: result.sid
      }, 'WhatsApp message sent')
    } catch (error) {
      logger.error({
        error,
        jobType: job.type,
        recipient: job.recipient.phone
      }, 'Failed to send WhatsApp message')
      throw error
    }
  }

  private formatMessage(job: NotificationJob): string {
    const { type, data, recipient } = job

    switch (type) {
      case NOTIFICATION_TYPES.BOOKING_CONFIRMED:
        return `🎉 Booking Confirmed!\n\nHi ${recipient.name || 'there'},\n\nYour booking for ${data.service} on ${data.event_date} at ${data.event_time} has been confirmed.\n\nLocation: ${data.location}\nPerformer: ${data.performer_name}\nRate: $${data.rate}\n\nThank you for choosing Flavor Entertainers! 💋`

      case NOTIFICATION_TYPES.DEPOSIT_RECEIVED:
        return `💰 Deposit Received\n\nNew booking confirmed!\n\nService: ${data.service}\nDate: ${data.event_date}\nTime: ${data.event_time}\nClient: ${data.client_initials}\nDeposit: $${data.deposit_amount}\n\nLogin to view full details.`

      case NOTIFICATION_TYPES.BOOKING_CANCELLED:
        return `❌ Booking Cancelled\n\nBooking #${data.booking_id} has been cancelled.\n\nDate: ${data.event_date}\nReason: ${data.reason || 'Not specified'}\n\nRefund will be processed if applicable.`

      case NOTIFICATION_TYPES.VETTING_REQUIRED:
        return `📋 New Vetting Application\n\nClient: ${data.full_name}\nEmail: ${data.email}\nEvent Date: ${data.event_date}\nEvent Type: ${data.event_type}\n\nReview required in admin panel.`

      case NOTIFICATION_TYPES.PAYMENT_REMINDER:
        return `💳 Payment Reminder\n\nHi ${recipient.name},\n\nYour balance of $${data.balance_due} is due on ${data.balance_due_date}.\n\nBooking: ${data.service} on ${data.event_date}\n\nPlease complete payment to confirm your booking.`

      default:
        return job.template || `Notification: ${job.type}`
    }
  }
}

class EmailProvider implements NotificationProvider {
  private resend: Resend

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key')
  }

  async send(job: NotificationJob): Promise<void> {
    if (!job.recipient.email) {
      throw new Error('Email address required for email notification')
    }

    const { subject, html } = this.formatEmail(job)

    try {
      const result = await this.resend.emails.send({
        from: 'Flavor Entertainers <bookings@lustandlace.com.au>',
        to: job.recipient.email,
        subject,
        html
      })

      logger.info({
        jobType: job.type,
        recipient: job.recipient.email,
        emailId: result.data?.id
      }, 'Email sent')
    } catch (error) {
      logger.error({
        error,
        jobType: job.type,
        recipient: job.recipient.email
      }, 'Failed to send email')
      throw error
    }
  }

  private formatEmail(job: NotificationJob): { subject: string; html: string } {
    const { type, data, recipient } = job

    switch (type) {
      case NOTIFICATION_TYPES.BOOKING_CONFIRMED:
        return {
          subject: 'Booking Confirmed - Flavor Entertainers',
          html: `
            <h2>🎉 Booking Confirmed!</h2>
            <p>Hi ${recipient.name || 'there'},</p>
            <p>Your booking has been confirmed with the following details:</p>
            <ul>
              <li><strong>Service:</strong> ${data.service}</li>
              <li><strong>Date:</strong> ${data.event_date}</li>
              <li><strong>Time:</strong> ${data.event_time}</li>
              <li><strong>Location:</strong> ${data.location}</li>
              <li><strong>Performer:</strong> ${data.performer_name}</li>
              <li><strong>Rate:</strong> $${data.rate}</li>
            </ul>
            <p>Thank you for choosing Flavor Entertainers!</p>
          `
        }

      case NOTIFICATION_TYPES.BOOKING_CANCELLED:
        return {
          subject: 'Booking Cancelled - Flavor Entertainers',
          html: `
            <h2>❌ Booking Cancelled</h2>
            <p>Your booking #${data.booking_id} scheduled for ${data.event_date} has been cancelled.</p>
            <p><strong>Reason:</strong> ${data.reason || 'Not specified'}</p>
            <p>If you paid a deposit, a refund will be processed within 3-5 business days.</p>
          `
        }

      case NOTIFICATION_TYPES.PAYMENT_REMINDER:
        return {
          subject: 'Payment Reminder - Flavor Entertainers',
          html: `
            <h2>💳 Payment Reminder</h2>
            <p>Hi ${recipient.name},</p>
            <p>This is a reminder that your balance of <strong>$${data.balance_due}</strong> is due on <strong>${data.balance_due_date}</strong>.</p>
            <p><strong>Booking Details:</strong></p>
            <ul>
              <li>Service: ${data.service}</li>
              <li>Date: ${data.event_date}</li>
              <li>Time: ${data.event_time}</li>
            </ul>
            <p>Please complete payment to confirm your booking.</p>
          `
        }

      default:
        return {
          subject: `Notification - ${job.type}`,
          html: job.template || `<p>Notification: ${job.type}</p>`
        }
    }
  }
}

export class NotificationService {
  private redis: Redis
  private queue: Queue
  private whatsappProvider: TwilioWhatsAppProvider
  private emailProvider: EmailProvider

  constructor() {
    this.redis = new Redis(config.REDIS_URL)
    this.queue = new Queue('notifications', { connection: this.redis })
    this.whatsappProvider = new TwilioWhatsAppProvider()
    this.emailProvider = new EmailProvider()

    this.setupWorker()
  }

  private setupWorker(): void {
    const worker = new Worker('notifications', async (job) => {
      const notificationJob = job.data as NotificationJob

      try {
        // Send WhatsApp if phone number provided
        if (notificationJob.recipient.phone) {
          await this.whatsappProvider.send(notificationJob)
        }

        // Send email if email address provided
        if (notificationJob.recipient.email) {
          await this.emailProvider.send(notificationJob)
        }

        logger.info({
          jobId: job.id,
          type: notificationJob.type,
          recipient: notificationJob.recipient
        }, 'Notification sent successfully')
      } catch (error) {
        logger.error({
          error,
          jobId: job.id,
          type: notificationJob.type
        }, 'Failed to send notification')
        throw error
      }
    }, {
      connection: this.redis,
      concurrency: 5,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 }
    })

    worker.on('failed', (job, err) => {
      logger.error({
        jobId: job?.id,
        error: err
      }, 'Notification job failed')
    })
  }

  async sendNotification(job: NotificationJob, delay?: number): Promise<void> {
    try {
      await this.queue.add('send-notification', job, {
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      })

      logger.debug({
        type: job.type,
        recipient: job.recipient,
        delay
      }, 'Notification queued')
    } catch (error) {
      logger.error({
        error,
        job
      }, 'Failed to queue notification')
      throw error
    }
  }

  async sendBookingConfirmed(data: {
    recipient: { phone?: string; email?: string; name?: string }
    booking: any
    performer: any
  }): Promise<void> {
    await this.sendNotification({
      type: NOTIFICATION_TYPES.BOOKING_CONFIRMED,
      recipient: data.recipient,
      data: {
        service: data.booking.service,
        event_date: data.booking.event_date,
        event_time: data.booking.event_time,
        location: data.booking.location,
        performer_name: data.performer.stage_name,
        rate: data.booking.rate
      }
    })
  }

  async sendDepositReceived(data: {
    recipient: { phone?: string; email?: string; name?: string }
    booking: any
    payment: any
  }): Promise<void> {
    await this.sendNotification({
      type: NOTIFICATION_TYPES.DEPOSIT_RECEIVED,
      recipient: data.recipient,
      data: {
        service: data.booking.service,
        event_date: data.booking.event_date,
        event_time: data.booking.event_time,
        client_initials: this.getInitials(data.booking.client_name),
        deposit_amount: data.payment.amount
      }
    })
  }

  async sendPaymentReminder(data: {
    recipient: { phone?: string; email?: string; name?: string }
    booking: any
  }): Promise<void> {
    // Send reminder 3 days before due date
    const reminderDate = new Date(data.booking.balance_due_date)
    reminderDate.setDate(reminderDate.getDate() - 3)
    const delay = reminderDate.getTime() - Date.now()

    if (delay > 0) {
      await this.sendNotification({
        type: NOTIFICATION_TYPES.PAYMENT_REMINDER,
        recipient: data.recipient,
        data: {
          balance_due: data.booking.balance_due,
          balance_due_date: data.booking.balance_due_date,
          service: data.booking.service,
          event_date: data.booking.event_date,
          event_time: data.booking.event_time
        }
      }, delay)
    }
  }

  private getInitials(fullName?: string): string {
    if (!fullName) return 'N/A'
    return fullName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .substring(0, 3)
  }
}

export const notificationService = new NotificationService()