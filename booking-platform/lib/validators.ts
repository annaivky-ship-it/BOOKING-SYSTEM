import { z } from 'zod';

// =====================================================
// ZOD VALIDATORS
// =====================================================

export const userRoleSchema = z.enum(['admin', 'performer', 'client']);
export const bookingStatusSchema = z.enum([
  'pending',
  'payment_pending',
  'payment_verified',
  'confirmed',
  'accepted',
  'declined',
  'completed',
  'cancelled',
]);
export const vettingStatusSchema = z.enum(['pending', 'approved', 'rejected', 'expired']);
export const paymentStatusSchema = z.enum(['pending', 'verified', 'rejected']);

// =====================================================
// BOOKING SCHEMAS
// =====================================================

export const createBookingSchema = z.object({
  performer_id: z.string().uuid('Invalid performer ID'),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  event_start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  event_end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  event_location: z.string().min(5, 'Location must be at least 5 characters'),
  event_type: z.string().optional(),
  special_requests: z.string().optional(),
  deposit_amount: z.number().positive('Deposit must be positive').optional(),
  total_amount: z.number().positive('Total must be positive').optional(),
});

export const acceptBookingSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
});

export const declineBookingSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').optional(),
});

export const submitETASchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
  eta: z.string().min(1, 'ETA is required').max(100, 'ETA too long'),
});

// =====================================================
// PAYMENT SCHEMAS
// =====================================================

export const verifyPaymentSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
  status: z.enum(['verified', 'rejected']),
  rejection_reason: z.string().optional(),
});

export const uploadReceiptSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
  file_name: z.string().min(1, 'File name is required'),
  file_type: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, 'Invalid file type'),
});

// =====================================================
// VETTING SCHEMAS
// =====================================================

export const submitVettingSchema = z.object({
  id_expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  file_name: z.string().min(1, 'File name is required'),
  file_type: z.string().regex(/^image\/(jpeg|jpg|png|webp)|application\/pdf$/, 'Invalid file type'),
});

export const reviewVettingSchema = z.object({
  application_id: z.string().uuid('Invalid application ID'),
  status: z.enum(['approved', 'rejected']),
  rejection_reason: z.string().optional(),
  notes: z.string().optional(),
});

// =====================================================
// BLACKLIST SCHEMAS
// =====================================================

export const addToBlacklistSchema = z.object({
  email: z.string().email('Invalid email').optional(),
  phone: z.string().min(10, 'Invalid phone number').optional(),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  notes: z.string().optional(),
}).refine(
  (data) => data.email || data.phone,
  { message: 'Either email or phone must be provided' }
);

export const removeFromBlacklistSchema = z.object({
  blacklist_id: z.string().uuid('Invalid blacklist ID'),
});

// =====================================================
// USER SCHEMAS
// =====================================================

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().min(10, 'Invalid phone number').optional(),
  avatar_url: z.string().url('Invalid URL').optional(),
  is_available: z.boolean().optional(), // For performers
});

export const updateUserRoleSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  role: userRoleSchema,
});

// =====================================================
// AUDIT LOG SCHEMA
// =====================================================

export const createAuditLogSchema = z.object({
  user_id: z.string().uuid().optional(),
  action: z.string().min(1, 'Action is required'),
  resource_type: z.string().min(1, 'Resource type is required'),
  resource_id: z.string().uuid().optional(),
  details: z.record(z.any()).optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
});

// =====================================================
// EXPORT TYPES FROM SCHEMAS
// =====================================================

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type AcceptBookingInput = z.infer<typeof acceptBookingSchema>;
export type DeclineBookingInput = z.infer<typeof declineBookingSchema>;
export type SubmitETAInput = z.infer<typeof submitETASchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type UploadReceiptInput = z.infer<typeof uploadReceiptSchema>;
export type SubmitVettingInput = z.infer<typeof submitVettingSchema>;
export type ReviewVettingInput = z.infer<typeof reviewVettingSchema>;
export type AddToBlacklistInput = z.infer<typeof addToBlacklistSchema>;
export type RemoveFromBlacklistInput = z.infer<typeof removeFromBlacklistSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
