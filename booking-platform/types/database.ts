// =====================================================
// DATABASE TYPES
// =====================================================

export type UserRole = 'admin' | 'performer' | 'client';
export type BookingStatus =
  | 'pending'
  | 'payment_pending'
  | 'payment_verified'
  | 'confirmed'
  | 'accepted'
  | 'declined'
  | 'completed'
  | 'cancelled';
export type VettingStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  is_active: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface VettingApplication {
  id: string;
  user_id: string;
  status: VettingStatus;
  id_document_url: string;
  id_expiry_date: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Blacklist {
  id: string;
  email: string | null;
  phone: string | null;
  reason: string;
  added_by: string;
  added_at: string;
  notes: string | null;
}

export interface Booking {
  id: string;
  booking_number: string;
  client_id: string;
  performer_id: string;
  status: BookingStatus;

  // Event details
  event_date: string;
  event_start_time: string;
  event_end_time: string;
  event_location: string;
  event_type: string | null;
  special_requests: string | null;

  // Payment details
  payment_status: PaymentStatus;
  deposit_amount: number | null;
  total_amount: number | null;
  payid_receipt_url: string | null;
  payment_verified_at: string | null;
  payment_verified_by: string | null;

  // Performer ETA
  performer_eta: string | null;
  eta_sent_at: string | null;
  eta_sent_to_client: boolean;
  eta_sent_to_admin: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  declined_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// =====================================================
// JOINED TYPES (for frontend display)
// =====================================================

export interface BookingWithRelations extends Booking {
  client?: User;
  performer?: User;
  payment_verified_by_user?: User;
}

export interface VettingApplicationWithRelations extends VettingApplication {
  user?: User;
  reviewed_by_user?: User;
}
