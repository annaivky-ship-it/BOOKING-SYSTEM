
import { supabase } from './supabaseClient';
import type { Booking } from '../types';

// Admin number configuration (in a real app, this is likely in Supabase secrets/env)
const ADMIN_WHATSAPP = '+61400000000'; // Replace with real admin number

// In a real application, you would call a Supabase Edge Function to protect API keys.
// The Edge Function handles the Twilio SDK.
const callEdgeFunction = async (to: string, body: string, channel: 'sms' | 'whatsapp') => {
  if (supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('send-message', {
        body: { to, body, channel },
      });
      if (error) console.error('Twilio Function Error:', error);
      else console.log('Twilio Sent:', data);
    } catch (err) {
      console.error('Twilio Call Failed:', err);
    }
  } else {
    // DEMO MODE: Simulate the message in console
    const color = channel === 'whatsapp' ? '#25D366' : '#3b82f6'; // WA green vs SMS blue
    console.log(
      `%c[Twilio ${channel.toUpperCase()}] To: ${to}\nMessage: ${body}`,
      `background: ${color}; color: white; padding: 4px; border-radius: 4px; font-weight: bold;`
    );
  }
};

export const twilioService = {
  // --- CLIENT NOTIFICATIONS (SMS) ---
  
  notifyClientRequestReceived: async (booking: Booking) => {
    const msg = `Hi ${booking.client_name}, thanks for your request with Flavor Entertainers! We have notified ${booking.performer?.name}. We will update you shortly.`;
    await callEdgeFunction(booking.client_phone, msg, 'sms');
  },

  notifyClientPerformerAccepted: async (booking: Booking) => {
    const msg = `Great news! ${booking.performer?.name} is available for your event on ${new Date(booking.event_date).toLocaleDateString()}. Admin is now reviewing your details.`;
    await callEdgeFunction(booking.client_phone, msg, 'sms');
  },

  notifyClientDepositNeeded: async (booking: Booking) => {
    const msg = `Booking Approved! Please log in to Flavor Entertainers to pay your deposit and secure your date with ${booking.performer?.name}.`;
    await callEdgeFunction(booking.client_phone, msg, 'sms');
  },

  notifyClientConfirmed: async (booking: Booking, balance: number) => {
    const msg = `CONFIRMED! Your booking with ${booking.performer?.name} is locked in. Balance due on arrival: $${balance}. See you there!`;
    await callEdgeFunction(booking.client_phone, msg, 'sms');
  },

  notifyClientRejected: async (booking: Booking) => {
    const msg = `Update on your booking request: Unfortunately, we cannot proceed with your booking at this time. Please contact us for more info.`;
    await callEdgeFunction(booking.client_phone, msg, 'sms');
  },

  // --- PERFORMER NOTIFICATIONS (WhatsApp) ---

  notifyPerformerNewRequest: async (booking: Booking, performerPhone: string) => {
    const msg = `🍑 NEW GIG REQUEST\n\nClient: ${booking.client_name}\nDate: ${new Date(booking.event_date).toLocaleDateString()} @ ${booking.event_time}\nType: ${booking.event_type}\n\nPlease accept or decline in your dashboard ASAP.`;
    await callEdgeFunction(performerPhone, msg, 'whatsapp');
  },

  notifyPerformerConfirmed: async (booking: Booking, performerPhone: string) => {
    const msg = `✅ BOOKING CONFIRMED\n\nThe deposit for ${booking.client_name} has been paid.\n\nDate: ${new Date(booking.event_date).toLocaleDateString()}\nTime: ${booking.event_time}\nAddress: ${booking.event_address}\n\nGood luck!`;
    await callEdgeFunction(performerPhone, msg, 'whatsapp');
  },

  // --- ADMIN NOTIFICATIONS (WhatsApp) ---

  notifyAdminNewRequest: async (booking: Booking) => {
    const msg = `📥 New Request\n\nClient: ${booking.client_name}\nPerformer: ${booking.performer?.name}\nDate: ${booking.event_date}\n\nStatus: Waiting for performer acceptance.`;
    await callEdgeFunction(ADMIN_WHATSAPP, msg, 'whatsapp');
  },

  notifyAdminPerformerAccepted: async (booking: Booking) => {
    const msg = `⚠️ Action Required\n\n${booking.performer?.name} has ACCEPTED the gig for ${booking.client_name}.\n\nPlease vet the client and approve/reject.`;
    await callEdgeFunction(ADMIN_WHATSAPP, msg, 'whatsapp');
  },

  notifyAdminDepositPaid: async (booking: Booking) => {
    const msg = `💰 Deposit Submitted\n\nClient: ${booking.client_name}\n\nPlease check receipt and confirm booking.`;
    await callEdgeFunction(ADMIN_WHATSAPP, msg, 'whatsapp');
  },
  
  notifyAdminConfirmed: async (booking: Booking) => {
    const msg = `✅ Booking Finalized\n\n${booking.client_name} with ${booking.performer?.name} is fully confirmed.`;
    await callEdgeFunction(ADMIN_WHATSAPP, msg, 'whatsapp');
  },

  notifyAdminAutoRejected: async (clientName: string, reason: string) => {
    const msg = `🚫 BLOCKED ATTEMPT\n\nClient: ${clientName}\nReason: Matches 'Do Not Serve' list.\n\nSystem auto-rejected this request.`;
    await callEdgeFunction(ADMIN_WHATSAPP, msg, 'whatsapp');
  }
};
