import twilio from 'twilio';
import { config, features } from './config';
import { logger } from './logger';
import { retry } from './utils';

/**
 * WhatsApp Notification Service
 * Sends notifications via Twilio WhatsApp API
 */

// Initialize Twilio client only if configured
let client: ReturnType<typeof twilio> | null = null;

if (features.whatsappEnabled) {
  client = twilio(config.TWILIO_ACCOUNT_SID!, config.TWILIO_AUTH_TOKEN!);
}

export interface WhatsAppMessage {
  to: string;
  body: string;
}

/**
 * Send a WhatsApp message via Twilio
 */
export async function sendWhatsAppMessage(
  to: string,
  body: string
): Promise<void> {
  if (!features.whatsappEnabled) {
    logger.warn('WhatsApp notification requested but service not configured', { to });
    return; // Fail silently in development
  }

  if (!client) {
    throw new Error('Twilio client not initialized');
  }

  if (!to || !body) {
    throw new Error('Recipient and message body are required');
  }

  try {
    // Ensure phone number is in WhatsApp format
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    // Use retry logic for resilience
    await retry(
      async () => {
        const message = await client!.messages.create({
          from: config.TWILIO_WHATSAPP_NUMBER!,
          to: formattedTo,
          body,
        });

        logger.info('WhatsApp message sent', {
          to: formattedTo,
          sid: message.sid,
          status: message.status,
        });

        return message;
      },
      {
        maxAttempts: 3,
        delayMs: 1000,
      }
    );
  } catch (error) {
    logger.error('WhatsApp send error', error as Error, { to, body: body.substring(0, 50) });
    // Re-throw to allow caller to handle
    throw new Error('Failed to send WhatsApp message');
  }
}

/**
 * Send booking received notification to admin
 */
export async function notifyAdminNewBooking(
  bookingNumber: string
): Promise<void> {
  if (!features.whatsappEnabled) return;

  const message = [
    '🔔 New booking received!',
    '',
    `Booking #${bookingNumber} is awaiting deposit review.`,
    '',
    'Please check the admin dashboard.',
  ].join('\n');

  try {
    await sendWhatsAppMessage(config.ADMIN_WHATSAPP!, message);
    logger.businessEvent('admin_notified_new_booking', { bookingNumber });
  } catch (error) {
    logger.error('Failed to notify admin of new booking', error as Error, {
      bookingNumber,
    });
    // Don't throw - allow booking creation to succeed even if notification fails
  }
}

/**
 * Notify client that payment has been verified
 */
export async function notifyClientPaymentVerified(
  clientPhone: string,
  bookingNumber: string
): Promise<void> {
  if (!features.whatsappEnabled) return;

  const message = [
    '✅ Payment Verified!',
    '',
    `Your deposit for booking #${bookingNumber} has been verified.`,
    '',
    'Your performer will be notified shortly.',
  ].join('\n');

  try {
    await sendWhatsAppMessage(clientPhone, message);
    logger.businessEvent('client_notified_payment_verified', {
      bookingNumber,
      clientPhone,
    });
  } catch (error) {
    logger.error('Failed to notify client of payment verification', error as Error, {
      bookingNumber,
      clientPhone,
    });
  }
}

/**
 * Notify performer of new confirmed booking
 */
export async function notifyPerformerBookingConfirmed(
  performerPhone: string,
  bookingNumber: string,
  eventDate: string,
  eventTime: string
): Promise<void> {
  if (!features.whatsappEnabled) return;

  const message = [
    '📅 New Booking!',
    '',
    `Booking #${bookingNumber}`,
    `Date: ${eventDate}`,
    `Time: ${eventTime}`,
    '',
    'Please accept or decline in your dashboard.',
  ].join('\n');

  try {
    await sendWhatsAppMessage(performerPhone, message);
    logger.businessEvent('performer_notified_new_booking', {
      bookingNumber,
      performerPhone,
    });
  } catch (error) {
    logger.error('Failed to notify performer of booking', error as Error, {
      bookingNumber,
      performerPhone,
    });
  }
}

/**
 * Notify client that booking has been accepted
 */
export async function notifyClientBookingAccepted(
  clientPhone: string,
  bookingNumber: string,
  performerName: string
): Promise<void> {
  if (!features.whatsappEnabled) return;

  const message = [
    '🎉 Booking Accepted!',
    '',
    `${performerName} has accepted booking #${bookingNumber}.`,
    '',
    "You'll receive an ETA notification when they're on the way.",
  ].join('\n');

  try {
    await sendWhatsAppMessage(clientPhone, message);
    logger.businessEvent('client_notified_booking_accepted', {
      bookingNumber,
      clientPhone,
      performerName,
    });
  } catch (error) {
    logger.error('Failed to notify client of booking acceptance', error as Error, {
      bookingNumber,
      clientPhone,
    });
  }
}

/**
 * Notify client that booking has been declined
 */
export async function notifyClientBookingDeclined(
  clientPhone: string,
  bookingNumber: string,
  performerName: string,
  reason?: string
): Promise<void> {
  if (!features.whatsappEnabled) return;

  const messageParts = [
    '❌ Booking Declined',
    '',
    `${performerName} has declined booking #${bookingNumber}.`,
  ];

  if (reason) {
    messageParts.push('', `Reason: ${reason}`);
  }

  messageParts.push('', 'Please contact support if you have questions.');

  const message = messageParts.join('\n');

  try {
    await sendWhatsAppMessage(clientPhone, message);
    logger.businessEvent('client_notified_booking_declined', {
      bookingNumber,
      clientPhone,
      performerName,
    });
  } catch (error) {
    logger.error('Failed to notify client of booking decline', error as Error, {
      bookingNumber,
      clientPhone,
    });
  }
}

/**
 * Notify client with performer ETA
 */
export async function notifyClientPerformerETA(
  clientPhone: string,
  bookingNumber: string,
  performerName: string,
  eta: string
): Promise<void> {
  if (!features.whatsappEnabled) return;

  const message = [
    '🚗 Performer On The Way!',
    '',
    `${performerName} is on the way to booking #${bookingNumber}.`,
    '',
    `ETA: ${eta}`,
  ].join('\n');

  try {
    await sendWhatsAppMessage(clientPhone, message);
    logger.businessEvent('client_notified_eta', {
      bookingNumber,
      clientPhone,
      performerName,
      eta,
    });
  } catch (error) {
    logger.error('Failed to notify client of ETA', error as Error, {
      bookingNumber,
      clientPhone,
    });
  }
}

/**
 * Notify admin with performer ETA
 */
export async function notifyAdminPerformerETA(
  bookingNumber: string,
  performerName: string,
  eta: string
): Promise<void> {
  if (!features.whatsappEnabled) return;

  const message = [
    '🚗 Performer ETA Update',
    '',
    `${performerName} is en route to booking #${bookingNumber}.`,
    '',
    `ETA: ${eta}`,
  ].join('\n');

  try {
    await sendWhatsAppMessage(config.ADMIN_WHATSAPP!, message);
    logger.businessEvent('admin_notified_eta', {
      bookingNumber,
      performerName,
      eta,
    });
  } catch (error) {
    logger.error('Failed to notify admin of ETA', error as Error, {
      bookingNumber,
      performerName,
    });
  }
}

/**
 * Send bulk notifications (with rate limiting)
 */
export async function sendBulkNotifications(
  messages: WhatsAppMessage[],
  delayMs: number = 1000
): Promise<{ sent: number; failed: number }> {
  if (!features.whatsappEnabled) {
    logger.warn('Bulk WhatsApp notifications requested but service not configured');
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  for (const { to, body } of messages) {
    try {
      await sendWhatsAppMessage(to, body);
      sent++;

      // Add delay to avoid rate limiting
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      failed++;
      logger.error('Bulk notification failed', error as Error, { to });
    }
  }

  logger.info('Bulk notifications complete', { sent, failed, total: messages.length });

  return { sent, failed };
}

/**
 * Notify admin when booking is declined by performer
 */
export async function notifyAdminBookingDeclined(
  bookingNumber: string,
  performerName: string
): Promise<void> {
  if (!features.whatsappEnabled) return;

  const message = [
    '❌ Booking Declined',
    '',
    `${performerName} has declined booking #${bookingNumber}.`,
    '',
    'Please check the admin dashboard.',
  ].join('\n');

  try {
    await sendWhatsAppMessage(config.ADMIN_WHATSAPP!, message);
    logger.businessEvent('admin_notified_booking_declined', {
      bookingNumber,
      performerName,
    });
  } catch (error) {
    logger.error('Failed to notify admin of booking decline', error as Error, {
      bookingNumber,
      performerName,
    });
  }
}

/**
 * Notify client with ETA (alias for notifyClientPerformerETA)
 */
export async function notifyClientETA(
  clientPhone: string,
  bookingNumber: string,
  performerName: string,
  eta: string
): Promise<void> {
  return notifyClientPerformerETA(clientPhone, bookingNumber, performerName, eta);
}

/**
 * Notify admin with ETA (alias for notifyAdminPerformerETA)
 */
export async function notifyAdminETA(
  bookingNumber: string,
  performerName: string,
  eta: string
): Promise<void> {
  return notifyAdminPerformerETA(bookingNumber, performerName, eta);
}

/**
 * Notify client of vetting status (approved or rejected)
 */
export async function notifyClientVettingStatus(
  clientPhone: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<void> {
  if (!features.whatsappEnabled) return;

  const messageParts = [
    status === 'approved' ? '✅ ID Verification Approved!' : '❌ ID Verification Rejected',
    '',
  ];

  if (status === 'approved') {
    messageParts.push(
      'Your ID has been verified successfully.',
      '',
      'You can now create bookings on our platform.'
    );
  } else {
    messageParts.push('Your ID verification was not approved.');

    if (rejectionReason) {
      messageParts.push('', `Reason: ${rejectionReason}`);
    }

    messageParts.push('', 'Please contact support if you have questions.');
  }

  const message = messageParts.join('\n');

  try {
    await sendWhatsAppMessage(clientPhone, message);
    logger.businessEvent('client_notified_vetting_status', {
      clientPhone,
      status,
    });
  } catch (error) {
    logger.error('Failed to notify client of vetting status', error as Error, {
      clientPhone,
      status,
    });
  }
}
