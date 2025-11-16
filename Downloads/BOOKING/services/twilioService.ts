// Twilio SMS Service
import twilio from 'twilio';

// Twilio configuration
const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID || '';
const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN || '';
const twilioPhoneNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER || '';

// Initialize Twilio client
let twilioClient: twilio.Twilio | null = null;

const initTwilio = () => {
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.warn('⚠️ Twilio not configured. SMS notifications disabled.');
    return null;
  }

  if (!twilioClient) {
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
};

// SMS notification types
export interface BookingNotification {
  to: string;
  bookingId: string;
  clientName: string;
  performerName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  totalCost: number;
}

export interface ConfirmationNotification {
  to: string;
  bookingId: string;
  confirmationCode: string;
}

// Send new booking notification to performer via WhatsApp
export const notifyPerformerNewBooking = async (notification: BookingNotification): Promise<boolean> => {
  const client = initTwilio();
  if (!client) return false;

  try {
    const message = `
🎭 *NEW BOOKING REQUEST!*

*Booking ID:* ${notification.bookingId}
*Client:* ${notification.clientName}
*Service:* ${notification.service}
*Date:* ${notification.date}
*Time:* ${notification.time}
*Location:* ${notification.location}
*Payment:* $${notification.totalCost}

Login to your dashboard to accept or decline:
https://flavor-entertainers-booking-jrtisfjkq.vercel.app

_- Flavor Entertainers_
    `.trim();

    await client.messages.create({
      body: message,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${notification.to}`
    });

    console.log('✅ WhatsApp sent to performer:', notification.to);
    return true;
  } catch (error) {
    console.error('❌ Failed to send WhatsApp to performer:', error);
    return false;
  }
};

// Send booking confirmation to client
export const notifyClientBookingConfirmed = async (notification: BookingNotification): Promise<boolean> => {
  const client = initTwilio();
  if (!client) return false;

  try {
    const message = `
✅ BOOKING CONFIRMED!

Hi ${notification.clientName},

Your booking with ${notification.performerName} is confirmed!

Service: ${notification.service}
Date: ${notification.date}
Time: ${notification.time}
Location: ${notification.location}
Total: $${notification.totalCost}

Booking ID: ${notification.bookingId}

View details: https://flavor-entertainers-booking-jrtisfjkq.vercel.app

Thank you for choosing Flavor Entertainers! 🎉
    `.trim();

    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: notification.to
    });

    console.log('✅ SMS sent to client:', notification.to);
    return true;
  } catch (error) {
    console.error('❌ Failed to send SMS to client:', error);
    return false;
  }
};

// Send booking rejection notification to client
export const notifyClientBookingRejected = async (
  to: string,
  bookingId: string,
  clientName: string,
  reason?: string
): Promise<boolean> => {
  const client = initTwilio();
  if (!client) return false;

  try {
    const message = `
❌ BOOKING UPDATE

Hi ${clientName},

Unfortunately, your booking (#${bookingId}) could not be confirmed.

${reason ? `Reason: ${reason}` : ''}

Please contact us at https://flavor-entertainers-booking-jrtisfjkq.vercel.app to discuss alternative options.

- Flavor Entertainers
    `.trim();

    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    console.log('✅ Rejection SMS sent to client:', to);
    return true;
  } catch (error) {
    console.error('❌ Failed to send rejection SMS:', error);
    return false;
  }
};

// Send reminder notification (24 hours before booking)
export const sendBookingReminder = async (notification: BookingNotification): Promise<boolean> => {
  const client = initTwilio();
  if (!client) return false;

  try {
    const message = `
⏰ BOOKING REMINDER

Hi ${notification.clientName},

Your booking is tomorrow!

Performer: ${notification.performerName}
Service: ${notification.service}
Date: ${notification.date}
Time: ${notification.time}
Location: ${notification.location}

Looking forward to seeing you! 🎉

- Flavor Entertainers
    `.trim();

    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: notification.to
    });

    console.log('✅ Reminder SMS sent:', notification.to);
    return true;
  } catch (error) {
    console.error('❌ Failed to send reminder SMS:', error);
    return false;
  }
};

// Send payment confirmation
export const notifyPaymentReceived = async (
  to: string,
  clientName: string,
  amount: number,
  bookingId: string
): Promise<boolean> => {
  const client = initTwilio();
  if (!client) return false;

  try {
    const message = `
💰 PAYMENT RECEIVED

Hi ${clientName},

We've received your payment of $${amount} for booking #${bookingId}.

Your booking is now fully confirmed!

Receipt available at: https://flavor-entertainers-booking-jrtisfjkq.vercel.app

Thank you! 🎉

- Flavor Entertainers
    `.trim();

    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    console.log('✅ Payment confirmation SMS sent:', to);
    return true;
  } catch (error) {
    console.error('❌ Failed to send payment SMS:', error);
    return false;
  }
};

// Send admin alert for new booking via WhatsApp
export const notifyAdminNewBooking = async (
  adminPhone: string,
  bookingId: string,
  clientName: string,
  performerName: string,
  totalCost: number
): Promise<boolean> => {
  const client = initTwilio();
  if (!client) return false;

  try {
    const message = `
🔔 *ADMIN ALERT: New Booking*

*Booking #${bookingId}*
*Client:* ${clientName}
*Performer:* ${performerName}
*Amount:* $${totalCost}

Review at: https://flavor-entertainers-booking-jrtisfjkq.vercel.app/admin
    `.trim();

    await client.messages.create({
      body: message,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${adminPhone}`
    });

    console.log('✅ Admin WhatsApp alert sent');
    return true;
  } catch (error) {
    console.error('❌ Failed to send admin WhatsApp alert:', error);
    return false;
  }
};

// Verify phone number format (Australian format)
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 0, replace with +61
  if (cleaned.startsWith('0')) {
    cleaned = '+61' + cleaned.substring(1);
  }

  // If doesn't start with +, add +61
  if (!cleaned.startsWith('+')) {
    cleaned = '+61' + cleaned;
  }

  return cleaned;
};

// Check if Twilio is configured
export const isTwilioConfigured = (): boolean => {
  return !!(accountSid && authToken && twilioPhoneNumber);
};

export default {
  notifyPerformerNewBooking,
  notifyClientBookingConfirmed,
  notifyClientBookingRejected,
  sendBookingReminder,
  notifyPaymentReceived,
  notifyAdminNewBooking,
  formatPhoneNumber,
  isTwilioConfigured
};
