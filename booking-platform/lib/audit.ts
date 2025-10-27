import { createServiceClient } from '@/lib/supabase/server';
import type { CreateAuditLogInput } from '@/lib/validators';

/**
 * Log an action to the audit log
 */
export async function logAction(input: CreateAuditLogInput): Promise<void> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase.from('audit_log').insert({
      user_id: input.user_id || null,
      action: input.action,
      resource_type: input.resource_type,
      resource_id: input.resource_id || null,
      details: input.details || null,
      ip_address: input.ip_address || null,
      user_agent: input.user_agent || null,
    });

    if (error) {
      console.error('Audit log error:', error);
      // Don't throw - audit failures shouldn't break the main operation
    }
  } catch (error) {
    console.error('Audit log exception:', error);
  }
}

/**
 * Helper to get IP and user agent from Next.js request
 */
export function getRequestMetadata(headers: Headers): {
  ip_address: string | null;
  user_agent: string | null;
} {
  return {
    ip_address: headers.get('x-forwarded-for') || headers.get('x-real-ip') || null,
    user_agent: headers.get('user-agent') || null,
  };
}

/**
 * Pre-defined audit actions
 */
export const AuditActions = {
  // Booking actions
  BOOKING_CREATED: 'booking_created',
  BOOKING_ACCEPTED: 'booking_accepted',
  BOOKING_DECLINED: 'booking_declined',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_COMPLETED: 'booking_completed',
  ETA_SUBMITTED: 'eta_submitted',

  // Payment actions
  PAYMENT_UPLOADED: 'payment_uploaded',
  PAYMENT_VERIFIED: 'payment_verified',
  PAYMENT_REJECTED: 'payment_rejected',

  // Vetting actions
  VETTING_SUBMITTED: 'vetting_submitted',
  VETTING_APPROVED: 'vetting_approved',
  VETTING_REJECTED: 'vetting_rejected',

  // Blacklist actions
  BLACKLIST_ADDED: 'blacklist_added',
  BLACKLIST_REMOVED: 'blacklist_removed',

  // User actions
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_ROLE_CHANGED: 'user_role_changed',
} as const;
