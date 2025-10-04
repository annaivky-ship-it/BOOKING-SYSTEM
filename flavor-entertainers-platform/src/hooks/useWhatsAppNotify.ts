'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface NotificationParams {
  type: 'sms' | 'whatsapp' | 'template';
  message?: string;
  to?: string;
  userId?: string;
  bookingId?: string;
  templateKey?: string;
  variables?: Record<string, string>;
}

interface NotificationResponse {
  success: boolean;
  messageId?: string;
  twilioSid?: string;
  error?: string;
}

export function useWhatsAppNotify() {
  const [isLoading, setIsLoading] = useState(false);

  const sendNotification = async (params: NotificationParams): Promise<NotificationResponse> => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Notification sent successfully');
      } else {
        toast.error(result.error || 'Failed to send notification');
      }

      return result;

    } catch (error) {
      console.error('Error sending notification:', error);
      const errorMessage = 'Failed to send notification';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const sendSMS = async (to: string, message: string, userId?: string, bookingId?: string) => {
    return sendNotification({
      type: 'sms',
      to,
      message,
      userId,
      bookingId
    });
  };

  const sendWhatsApp = async (to: string, message: string, userId?: string, bookingId?: string) => {
    return sendNotification({
      type: 'whatsapp',
      to,
      message,
      userId,
      bookingId
    });
  };

  const sendTemplate = async (
    templateKey: string,
    userId: string,
    variables?: Record<string, string>,
    bookingId?: string
  ) => {
    return sendNotification({
      type: 'template',
      templateKey,
      userId,
      variables,
      bookingId
    });
  };

  // Predefined booking notification templates
  const sendBookingConfirmation = async (userId: string, bookingData: any) => {
    return sendTemplate('booking_confirmation', userId, {
      client_name: bookingData.client_name,
      event_date: new Date(bookingData.event_date).toLocaleDateString('en-AU'),
      event_time: new Date(bookingData.event_date).toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      venue: bookingData.venue || 'TBD',
      service_type: bookingData.service_type,
      booking_reference: bookingData.booking_reference
    }, bookingData.id);
  };

  const sendPaymentReminder = async (userId: string, bookingData: any) => {
    return sendTemplate('payment_reminder', userId, {
      client_name: bookingData.client_name,
      amount: `$${bookingData.total_amount}`,
      booking_reference: bookingData.booking_reference,
      due_date: new Date(bookingData.event_date).toLocaleDateString('en-AU')
    }, bookingData.id);
  };

  const sendEventReminder = async (userId: string, bookingData: any) => {
    return sendTemplate('event_reminder', userId, {
      client_name: bookingData.client_name,
      event_date: new Date(bookingData.event_date).toLocaleDateString('en-AU'),
      event_time: new Date(bookingData.event_date).toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      venue: bookingData.venue || 'TBD',
      booking_reference: bookingData.booking_reference
    }, bookingData.id);
  };

  const sendSafetyAlert = async (userId: string, alertData: any) => {
    return sendTemplate('safety_alert', userId, {
      alert_title: alertData.title,
      alert_message: alertData.message,
      severity: alertData.severity_level >= 4 ? 'HIGH' : alertData.severity_level >= 3 ? 'MEDIUM' : 'LOW'
    });
  };

  const sendWelcomeMessage = async (userId: string, userData: any) => {
    return sendTemplate('welcome_performer', userId, {
      performer_name: userData.stage_name || userData.display_name,
      platform_name: 'Flavor Entertainers'
    });
  };

  return {
    sendNotification,
    sendSMS,
    sendWhatsApp,
    sendTemplate,
    sendBookingConfirmation,
    sendPaymentReminder,
    sendEventReminder,
    sendSafetyAlert,
    sendWelcomeMessage,
    isLoading
  };
}

// Legacy support - keeping for backward compatibility
export function useWhatsAppTemplates() {
  const getBookingTemplate = (type: string, data: any) => {
    const templates = {
      booking_submitted: {
        name: 'booking_submitted',
        message: `🎉 New booking request received!\n\nReference: ${data.reference}\nPerformer: ${data.performerName}\nDate: ${data.eventDate}\nService: ${data.service}\n\nPlease review and approve at your earliest convenience.`,
      },
      booking_approved: {
        name: 'booking_approved',
        message: `✅ Great news! Your booking has been approved.\n\nReference: ${data.reference}\nPerformer: ${data.performerName}\nDate: ${data.eventDate}\nLocation: ${data.location}\n\nYour performer will be in touch closer to the date.`,
      },
      booking_declined: {
        name: 'booking_declined',
        message: `❌ Unfortunately, your booking request has been declined.\n\nReference: ${data.reference}\nReason: ${data.reason || 'Performer unavailable'}\n\nPlease feel free to browse other available performers.`,
      },
      payment_verified: {
        name: 'payment_verified',
        message: `💰 Payment verified!\n\nAmount: $${data.amount} AUD\nBooking: ${data.reference}\n\nYour booking is now confirmed. Thank you!`,
      },
    };

    return templates[type as keyof typeof templates] || null;
  };

  const getSafetyTemplate = (type: string, data: any) => {
    const templates = {
      check_in_reminder: {
        name: 'check_in_reminder',
        message: `🔔 Safety Check-in Reminder\n\nPlease confirm you're safe at your current booking location.\n\nBooking: ${data.reference}\nTime: ${new Date().toLocaleTimeString()}`,
      },
      emergency_alert: {
        name: 'emergency_alert',
        message: `🚨 EMERGENCY ALERT 🚨\n\nPerformer: ${data.performerName}\nLocation: ${data.location}\nTime: ${new Date().toLocaleString()}\n\nImmediate assistance may be required. Please contact emergency services if needed.`,
      },
      safe_departure: {
        name: 'safe_departure',
        message: `✅ Safe Departure Confirmed\n\nPerformer: ${data.performerName}\nBooking: ${data.reference}\nTime: ${new Date().toLocaleTimeString()}\n\nBooking completed successfully.`,
      },
    };

    return templates[type as keyof typeof templates] || null;
  };

  return {
    getBookingTemplate,
    getSafetyTemplate,
  };
}