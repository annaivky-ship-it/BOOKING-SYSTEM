import { z } from 'zod'
import * as schemas from './schemas'

// Database Types
export interface Profile {
  id: string
  email: string
  role: 'admin' | 'performer' | 'client'
  display_name?: string
  phone?: string
  created_at: string
}

export interface Performer {
  id: string
  stage_name: string
  region: string
  services: string[]
  whatsapp_number?: string
  rate_card: Record<string, number>
  available_now: boolean
  created_at: string
}

export interface Client {
  id: string
  first_name?: string
  last_name?: string
  notes?: string
  created_at: string
}

export interface Booking {
  id: string
  client_id: string
  performer_id?: string
  event_date: string
  event_time: string
  location: string
  service: string
  rate: number
  booking_fee: number
  total: number
  message?: string
  status: 'pending_review' | 'awaiting_deposit' | 'confirmed' | 'completed' | 'cancelled'
  payment_link_url?: string
  stripe_payment_intent_id?: string
  balance_due: number
  balance_due_date?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  booking_id: string
  amount: number
  currency: string
  method: 'stripe' | 'payid' | 'cash'
  status: 'requires_action' | 'succeeded' | 'failed' | 'refunded'
  provider_ref?: string
  receipt_file_id?: string
  created_at: string
}

export interface VettingApplication {
  application_id: string
  client_id?: string
  full_name: string
  email: string
  mobile: string
  event_date: string
  event_address: string
  event_type: string
  status: 'pending' | 'approved' | 'denied'
  reason?: string
  submission_time: string
  decision_time?: string
  decision_by?: string
  id_valid?: boolean
  file_id?: string
  discrepancies?: string
  ip_address?: string
  notes?: string
  last_updated: string
  expiry_date?: string
  created_by?: string
}

export interface BlacklistEntry {
  id: string
  full_name?: string
  email?: string
  phone?: string
  reason: string
  date_added: string
  added_by: string
  status: 'active' | 'cleared'
}

export interface ApprovedClient {
  id: string
  client_id: string
  approval_date: string
  expiry_date?: string
  approved_by: string
  last_updated: string
}

export interface AuditLog {
  id: number
  timestamp: string
  event_type: string
  action: string
  actor_user_id?: string
  actor_email?: string
  request_id?: string
  ip?: string
  details?: Record<string, any>
  booking_id?: string
  application_id?: string
  client_email?: string
  performer_id?: string
}

export interface Availability {
  id: string
  performer_id: string
  start_ts: string
  end_ts: string
  note?: string
  created_at: string
}

// API Types
export type CreateBookingRequest = z.infer<typeof schemas.CreateBookingRequestSchema>
export type CreateBookingResponse = z.infer<typeof schemas.CreateBookingResponseSchema>
export type BookingResponse = z.infer<typeof schemas.BookingResponseSchema>
export type PerformerSearchResponse = z.infer<typeof schemas.PerformerSearchResponseSchema>
export type VettingApplicationRequest = z.infer<typeof schemas.VettingApplicationRequestSchema>
export type VettingDecisionRequest = z.infer<typeof schemas.VettingDecisionRequestSchema>
export type AdminKPIsResponse = z.infer<typeof schemas.AdminKPIsResponseSchema>
export type BlacklistEntryRequest = z.infer<typeof schemas.BlacklistEntryRequestSchema>
export type AuthRegisterRequest = z.infer<typeof schemas.AuthRegisterRequestSchema>
export type AuthLoginRequest = z.infer<typeof schemas.AuthLoginRequestSchema>
export type PayIDReceiptRequest = z.infer<typeof schemas.PayIDReceiptRequestSchema>

// Error Types
export interface APIError {
  error: string
  message: string
  code?: string
  details?: Record<string, any>
}

// Notification Types
export interface NotificationTemplate {
  type: 'whatsapp' | 'email'
  template: string
  variables: Record<string, string>
}

export interface NotificationJob {
  id: string
  type: 'booking_confirmed' | 'deposit_received' | 'booking_cancelled' | 'vetting_required'
  recipient: string
  template: NotificationTemplate
  retries: number
  status: 'pending' | 'sent' | 'failed'
  created_at: string
}