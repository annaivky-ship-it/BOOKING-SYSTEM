import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER!;
const adminWhatsapp = process.env.ADMIN_WHATSAPP!;

const client = twilio(accountSid, authToken);

export interface WhatsAppMessage {
  to: string;
  body: string;
}

/**
 * Send a WhatsApp message via Twilio
 */
export async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  try {
    // Ensure phone number is in WhatsApp format
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    await client.messages.create({
      from: whatsappNumber,
      to: formattedTo,
      body,
    });

    console.log(`WhatsApp message sent to ${formattedTo}`);
  } catch (error) {
    console.error('WhatsApp send error:', error);
    throw new Error('Failed to send WhatsApp message');
  }
}

/**
 * Send booking received notification to admin
 */
export async function notifyAdminNewBooking(bookingNumber: string): Promise<void> {
  const message = `🔔 New booking received!\n\nBooking #${bookingNumber} is awaiting deposit review.\n\nPlease check the admin dashboard.`;
  await sendWhatsAppMessage(adminWhatsapp, message);
}

/**
 * Notify client that payment has been verified
 */
export async function notifyClientPaymentVerified(
  clientPhone: string,
  bookingNumber: string
): Promise<void> {
  const message = `✅ Payment Verified!\n\nYour deposit for booking #${bookingNumber} has been verified.\n\nYour performer will be notified shortly.`;
  await sendWhatsAppMessage(clientPhone, message);
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
  const message = `📅 New Booking!\n\nBooking #${bookingNumber}\nDate: ${eventDate}\nTime: ${eventTime}\n\nPlease accept or decline in your dashboard.`;
  await sendWhatsAppMessage(performerPhone, message);
}

/**
 * Notify client that booking has been accepted
 */
export async function notifyClientBookingAccepted(
  clientPhone: string,
  bookingNumber: string,
  performerName: string
): Promise<void> {
  const message = `🎉 Booking Accepted!\n\n${performerName} has accepted booking #${bookingNumber}.\n\nYou'll receive an ETA notification when they're on the way.`;
  await sendWhatsAppMessage(clientPhone, message);
}

/**
 * Notify client of performer ETA
 */
export async function notifyClientETA(
  clientPhone: string,
  bookingNumber: string,
  performerName: string,
  eta: string
): Promise<void> {
  const message = `🚗 Your performer is on the way!\n\nBooking #${bookingNumber}\nPerformer: ${performerName}\nETA: ${eta}\n\nSee you soon!`;
  await sendWhatsAppMessage(clientPhone, message);
}

/**
 * Notify admin of performer ETA
 */
export async function notifyAdminETA(
  bookingNumber: string,
  performerName: string,
  eta: string
): Promise<void> {
  const message = `🚗 Performer ETA Update\n\nBooking #${bookingNumber}\nPerformer: ${performerName}\nETA: ${eta}`;
  await sendWhatsAppMessage(adminWhatsapp, message);
}

/**
 * Notify client of booking cancellation
 */
export async function notifyClientCancellation(
  clientPhone: string,
  bookingNumber: string,
  reason?: string
): Promise<void> {
  const reasonText = reason ? `\n\nReason: ${reason}` : '';
  const message = `❌ Booking Cancelled\n\nBooking #${bookingNumber} has been cancelled.${reasonText}\n\nPlease contact support if you have questions.`;
  await sendWhatsAppMessage(clientPhone, message);
}

/**
 * Notify performer of booking cancellation
 */
export async function notifyPerformerCancellation(
  performerPhone: string,
  bookingNumber: string,
  reason?: string
): Promise<void> {
  const reasonText = reason ? `\n\nReason: ${reason}` : '';
  const message = `❌ Booking Cancelled\n\nBooking #${bookingNumber} has been cancelled.${reasonText}`;
  await sendWhatsAppMessage(performerPhone, message);
}

/**
 * Notify admin when performer declines booking
 */
export async function notifyAdminBookingDeclined(
  bookingNumber: string,
  performerName: string
): Promise<void> {
  const message = `⚠️ Booking Declined\n\nBooking #${bookingNumber} was declined by ${performerName}.\n\nPlease reassign or contact the client.`;
  await sendWhatsAppMessage(adminWhatsapp, message);
}

/**
 * Notify client of ID verification status
 */
export async function notifyClientVettingStatus(
  clientPhone: string,
  status: 'approved' | 'rejected',
  reason?: string
): Promise<void> {
  if (status === 'approved') {
    const message = `✅ ID Verified!\n\nYour identification has been approved.\n\nYou can now make bookings.`;
    await sendWhatsAppMessage(clientPhone, message);
  } else {
    const reasonText = reason ? `\n\nReason: ${reason}` : '';
    const message = `❌ ID Verification Failed\n\nYour identification could not be verified.${reasonText}\n\nPlease resubmit or contact support.`;
    await sendWhatsAppMessage(clientPhone, message);
  }
}
