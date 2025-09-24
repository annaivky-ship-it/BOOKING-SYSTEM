import { z } from 'zod'
import { ROLES, BOOKING_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, VETTING_STATUSES, SERVICES, REGIONS } from './constants'

// Common schemas
export const UUIDSchema = z.string().uuid()
export const EmailSchema = z.string().email()
export const PhoneSchema = z.string().regex(/^\+61[0-9]{9}$/, 'Must be valid Australian phone number')
export const DateSchema = z.string().date()
export const DateTimeSchema = z.string().datetime()

// Auth schemas
export const AuthRegisterRequestSchema = z.object({
  email: EmailSchema,
  password: z.string().min(8),
  role: z.enum([ROLES.PERFORMER, ROLES.CLIENT]),
  display_name: z.string().min(1).optional(),
  phone: PhoneSchema.optional()
})

export const AuthLoginRequestSchema = z.object({
  email: EmailSchema,
  password: z.string()
})

export const AuthMagicLinkRequestSchema = z.object({
  email: EmailSchema
})

// Booking schemas
export const CreateBookingRequestSchema = z.object({
  performer_id: UUIDSchema.optional(),
  name: z.string().min(1).max(100),
  email: EmailSchema,
  phone: PhoneSchema,
  event_date: DateSchema,
  event_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Must be valid time HH:MM'),
  location: z.string().min(1).max(500),
  service: z.enum([SERVICES.TOPLESS_WAITRESS, SERVICES.STRIPTEASE, SERVICES.XXX_SHOW]),
  rate: z.number().positive(),
  message: z.string().max(1000).optional()
})

export const CreateBookingResponseSchema = z.object({
  booking_id: UUIDSchema,
  status: z.enum([BOOKING_STATUSES.PENDING_REVIEW]),
  message: z.string()
})

export const BookingResponseSchema = z.object({
  id: UUIDSchema,
  client_id: UUIDSchema,
  performer_id: UUIDSchema.optional(),
  event_date: DateSchema,
  event_time: z.string(),
  location: z.string(),
  service: z.string(),
  rate: z.number(),
  booking_fee: z.number(),
  total: z.number(),
  message: z.string().optional(),
  status: z.enum([
    BOOKING_STATUSES.PENDING_REVIEW,
    BOOKING_STATUSES.AWAITING_PAYMENT,
    BOOKING_STATUSES.CONFIRMED,
    BOOKING_STATUSES.COMPLETED,
    BOOKING_STATUSES.CANCELLED
  ]),
  payment_link_url: z.string().optional(),
  balance_due: z.number(),
  balance_due_date: DateSchema.optional(),
  created_at: DateTimeSchema,
  updated_at: DateTimeSchema
})

export const BookingApprovalRequestSchema = z.object({
  performer_id: UUIDSchema.optional()
})

export const BookingSearchQuerySchema = z.object({
  status: z.enum([
    BOOKING_STATUSES.PENDING_REVIEW,
    BOOKING_STATUSES.AWAITING_PAYMENT,
    BOOKING_STATUSES.CONFIRMED,
    BOOKING_STATUSES.COMPLETED,
    BOOKING_STATUSES.CANCELLED
  ]).optional(),
  performer_id: UUIDSchema.optional(),
  client_id: UUIDSchema.optional(),
  date_from: DateSchema.optional(),
  date_to: DateSchema.optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0)
})

// Performer schemas
export const PerformerSearchQuerySchema = z.object({
  service: z.enum([SERVICES.TOPLESS_WAITRESS, SERVICES.STRIPTEASE, SERVICES.XXX_SHOW]).optional(),
  region: z.enum([REGIONS.PERTH_METRO, REGIONS.PERTH_HILLS, REGIONS.MANDURAH, REGIONS.ROCKINGHAM, REGIONS.JOONDALUP]).optional(),
  from: DateTimeSchema.optional(),
  to: DateTimeSchema.optional(),
  available_now: z.coerce.boolean().optional()
})

export const PerformerSearchResponseSchema = z.array(z.object({
  id: UUIDSchema,
  stage_name: z.string(),
  region: z.string(),
  services: z.array(z.string()),
  available_now: z.boolean(),
  rate_card: z.record(z.number())
}))

export const AvailabilityRequestSchema = z.object({
  start_ts: DateTimeSchema,
  end_ts: DateTimeSchema,
  note: z.string().max(200).optional()
})

export const AvailableNowToggleSchema = z.object({
  available_now: z.boolean()
})

// Vetting schemas
export const VettingApplicationRequestSchema = z.object({
  full_name: z.string().min(1).max(100),
  email: EmailSchema,
  mobile: PhoneSchema,
  event_date: DateSchema,
  event_address: z.string().min(1).max(500),
  event_type: z.string().min(1).max(100),
  id_file: z.string().optional() // File ID after upload
})

export const VettingDecisionRequestSchema = z.object({
  decision: z.enum([VETTING_STATUSES.APPROVED, VETTING_STATUSES.DENIED]),
  reason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional()
})

export const VettingSearchQuerySchema = z.object({
  status: z.enum([VETTING_STATUSES.PENDING, VETTING_STATUSES.APPROVED, VETTING_STATUSES.DENIED]).optional(),
  email: EmailSchema.optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0)
})

// Payment schemas
export const PayIDReceiptRequestSchema = z.object({
  receipt_file: z.string() // File ID after upload
})

export const PaymentResponseSchema = z.object({
  id: UUIDSchema,
  booking_id: UUIDSchema,
  amount: z.number(),
  currency: z.string(),
  method: z.enum([PAYMENT_METHODS.STRIPE, PAYMENT_METHODS.PAYID, PAYMENT_METHODS.CASH]),
  status: z.enum([
    PAYMENT_STATUSES.REQUIRES_ACTION,
    PAYMENT_STATUSES.SUCCEEDED,
    PAYMENT_STATUSES.FAILED,
    PAYMENT_STATUSES.REFUNDED
  ]),
  provider_ref: z.string().optional(),
  receipt_file_id: z.string().optional(),
  created_at: DateTimeSchema
})

// Admin schemas
export const AdminKPIsResponseSchema = z.object({
  bookings_last_30d: z.number(),
  total_revenue_last_30d: z.number(),
  deposit_conversion_rate: z.number(),
  avg_booking_value: z.number(),
  pending_vetting: z.number(),
  active_performers: z.number()
})

export const BlacklistEntryRequestSchema = z.object({
  full_name: z.string().max(100).optional(),
  email: EmailSchema.optional(),
  phone: PhoneSchema.optional(),
  reason: z.string().min(1).max(500)
})

export const BlacklistUpdateRequestSchema = z.object({
  status: z.enum(['active', 'cleared']),
  reason: z.string().max(500).optional()
})

export const ApprovedClientRequestSchema = z.object({
  client_id: UUIDSchema,
  expiry_date: DateSchema.optional()
})

export const AuditLogQuerySchema = z.object({
  actor_email: EmailSchema.optional(),
  event_type: z.string().optional(),
  action: z.string().optional(),
  date_from: DateSchema.optional(),
  date_to: DateSchema.optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
})

// File upload schemas
export const FileUploadResponseSchema = z.object({
  file_id: z.string(),
  url: z.string(),
  size: z.number(),
  type: z.string()
})

// Webhook schemas
export const StripeWebhookSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  type: z.string(),
  data: z.object({
    object: z.any()
  }),
  created: z.number()
})

// Generic response schemas
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional()
})

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional()
})

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) => z.object({
  data: z.array(itemSchema),
  pagination: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    has_more: z.boolean()
  })
})