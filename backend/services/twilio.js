const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Sends a standard SMS to a client
 */
const sendSMS = async (to, body) => {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    console.log(`[Twilio SMS] Sent to ${to}. SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error(`[Twilio SMS Error] to ${to}:`, error.message);
  }
};

/**
 * Sends a WhatsApp message (used for performers/admins)
 */
const sendWhatsApp = async (to, body) => {
  try {
    // Add prefix if missing
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const message = await client.messages.create({
      body,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: formattedTo
    });
    console.log(`[Twilio WhatsApp] Sent to ${to}. SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error(`[Twilio WhatsApp Error] to ${to}:`, error.message);
  }
};

module.exports = {
  sendSMS,
  sendWhatsApp
};