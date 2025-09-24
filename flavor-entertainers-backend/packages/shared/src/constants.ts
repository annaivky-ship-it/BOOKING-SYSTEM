export const ROLES = {
  ADMIN: 'admin',
  PERFORMER: 'performer',
  CLIENT: 'client'
} as const

export const BOOKING_STATUSES = {
  PENDING_REVIEW: 'pending_review',
  AWAITING_PAYMENT: 'awaiting_payment', // Updated to use PayID payment
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export const PAYMENT_METHODS = {
  PAYID: 'payid',
  STRIPE: 'stripe', // Fallback option
  CASH: 'cash'
} as const

export const PAYMENT_STATUSES = {
  REQUIRES_ACTION: 'requires_action',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const

export const VETTING_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied'
} as const

export const BLACKLIST_STATUSES = {
  ACTIVE: 'active',
  CLEARED: 'cleared'
} as const

export const SERVICES = {
  TOPLESS_WAITRESS: 'Topless Waitress',
  STRIPTEASE: 'Striptease',
  XXX_SHOW: 'XXX Show'
} as const

export const REGIONS = {
  PERTH_METRO: 'Perth Metro',
  PERTH_HILLS: 'Perth Hills',
  MANDURAH: 'Mandurah',
  ROCKINGHAM: 'Rockingham',
  JOONDALUP: 'Joondalup'
} as const

export const AUDIT_EVENTS = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_APPROVED: 'booking_approved',
  BOOKING_CANCELLED: 'booking_cancelled',
  PAYMENT_RECEIVED: 'payment_received',
  VETTING_SUBMITTED: 'vetting_submitted',
  VETTING_DECIDED: 'vetting_decided',
  BLACKLIST_ADDED: 'blacklist_added',
  PERFORMER_UPDATED: 'performer_updated'
} as const

export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  DEPOSIT_RECEIVED: 'deposit_received',
  BOOKING_CANCELLED: 'booking_cancelled',
  VETTING_REQUIRED: 'vetting_required',
  PAYMENT_REMINDER: 'payment_reminder'
} as const

export const RATE_LIMITS = {
  GLOBAL: 100,
  AUTH: 5,
  BOOKING: 10,
  UPLOAD: 3
} as const

export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf']
} as const

export const DEPOSIT_PERCENTAGE = 0.15 // 15%
export const DEFAULT_BOOKING_FEE = 25 // $25 AUD