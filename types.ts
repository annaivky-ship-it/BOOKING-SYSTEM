
import React from 'react';

export type PerformerStatus = 'available' | 'busy' | 'offline';
export type Role = 'user' | 'performer' | 'admin';

export type BookingStatus = 
  | 'pending_performer_acceptance'
  | 'pending_vetting'
  | 'deposit_pending'
  | 'pending_deposit_confirmation'
  | 'confirmed'
  | 'rejected';

export type DoNotServeStatus = 'pending' | 'approved' | 'rejected';

export interface Service {
  id: string;
  category: 'Waitressing' | 'Strip Show' | 'Promotional & Hosting';
  name: string;
  description: string;
  rate: number;
  rate_type: 'per_hour' | 'flat';
  min_duration_hours?: number;
  duration_minutes?: number;
  booking_notes?: string;
}

export interface Performer {
  id: number;
  name:string;
  tagline: string;
  photo_url: string; // matches Supabase column
  gallery_urls: string[]; // Additional photos
  bio: string;
  service_ids: string[];
  status: PerformerStatus;
  created_at: string;
  phone: string; // Added for WhatsApp notifications
}

export interface Booking {
    id: string; // UUID
    performer_id: number;
    client_name: string;
    client_email: string;
    client_phone: string;
    event_date: string;
    event_time: string;
    event_address: string;
    event_type: string;
    status: BookingStatus;
    id_document_path: string | null;
    deposit_receipt_path: string | null;
    created_at: string;
    duration_hours: number;
    number_of_guests: number;
    services_requested: string[]; // These will be service IDs
    verified_by_admin_name: string | null;
    verified_at: string | null;
    client_message?: string | null;
    performer_reassigned_from_id?: number | null;
    performer_eta_minutes?: number | null;
    // This is from the join
    performer?: {
        id: number;
        name: string;
        phone?: string;
    }
    referral_fee_amount?: number | null;
    referral_fee_paid?: boolean;
    referral_fee_receipt_path?: string | null;
}

export interface DoNotServeEntry {
  id: string; // UUID
  client_name: string;
  client_email: string;
  client_phone: string;
  reason: string;
  status: DoNotServeStatus;
  submitted_by_performer_id: number;
  created_at: string;
  performer?: {
      name: string;
  }
}

export interface Communication {
  id: string;
  sender: 'System' | Performer['name'] | 'Admin';
  recipient: Role | number; // 'user', 'admin', or performer_id
  message: string;
  created_at: string;
  read: boolean;
  booking_id?: string;
  type?: 'booking_update' | 'booking_confirmation' | 'admin_message' | 'system_alert';
}

export interface PhoneMessageAction {
  label: string;
  onClick: () => void;
  style?: 'primary' | 'secondary';
}

export type PhoneMessage = {
  for: 'Client' | 'Performer' | 'Admin';
  content: React.ReactNode;
  actions?: PhoneMessageAction[];
} | null;

export interface Profile {
  id: string; // Supabase user UUID
  role: Role;
  performer_id?: number | null; // Link to the performer entry if role is 'performer'
}
