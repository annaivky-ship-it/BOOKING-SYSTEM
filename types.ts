// Import the auto-generated database types
import { Database } from './database.types';

// Re-export Database type for Supabase client usage
export type { Database };

// Convenience type exports from generated database types
export type DbBooking = Database['public']['Tables']['bookings']['Row'];
export type DbPerformer = Database['public']['Tables']['performers']['Row'];
export type DbService = Database['public']['Tables']['services']['Row'];
export type DbCommunication = Database['public']['Tables']['communications']['Row'];
export type DbDoNotServeEntry = Database['public']['Tables']['do_not_serve_entries']['Row'];
export type DbProfile = Database['public']['Tables']['profiles']['Row'];
export type DbPayment = Database['public']['Tables']['payments']['Row'];
export type DbPaymentReminder = Database['public']['Tables']['payment_reminders']['Row'];
export type DbPerformerGallery = Database['public']['Tables']['performer_gallery']['Row'];

// Application-specific types and enums
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

export type PaymentStatus = 
  | 'pending'
  | 'deposit_paid'
  | 'fully_paid'
  | 'expired'
  | 'refunded'
  | 'cancelled';

export type PaymentMethod = 'payid' | 'bank_transfer' | 'cash' | 'card';

export type PhotoType = 'profile' | 'gallery' | 'event' | 'promo';

// Enhanced application interfaces with computed fields
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

export interface Performer extends DbPerformer {
  // Adding type refinements for UI usage
  status: PerformerStatus;
  service_ids: string[];
  email?: string | null;
  phone?: string | null;
  instagram?: string | null;
}

export interface Booking extends Omit<DbBooking, 'performer'> {
  // Enhanced with relationship data
  performer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface Payment extends DbPayment {
  // Enhanced payment interface with type refinements
  status: PaymentStatus;
  payment_method?: PaymentMethod | null;
}

export interface PaymentReminder extends DbPaymentReminder {
  reminder_type: 'initial' | '24h' | '12h' | '6h' | 'final';
  sms_status?: 'queued' | 'sent' | 'delivered' | 'failed' | null;
}

export interface PerformerGallery extends DbPerformerGallery {
  photo_type?: PhotoType | null;
}

export interface DoNotServeEntry extends DbDoNotServeEntry {
  status: DoNotServeStatus;
  performer?: {
    name: string;
  };
}

export interface Communication extends DbCommunication {
  type?: 'booking_update' | 'booking_confirmation' | 'admin_message' | 'system_alert' | null;
}

export interface Profile extends DbProfile {
  role: Role;
}

// UI-specific types
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

export interface WalkthroughStep {
  elementSelector: string;
  title: string;
  content: string;
  before?: () => void | Promise<void>;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// Payment-related helper types
export interface OverduePayment {
  payment_id: string;
  booking_id: string;
  client_name: string;
  client_phone: string;
  deposit_amount: number;
  payid_email: string;
  payment_reference: string;
  hours_overdue: number;
}

export interface GalleryPhoto {
  id: string;
  photo_url: string;
  photo_type: PhotoType;
  caption: string;
  display_order: number;
  is_featured?: boolean;
  uploaded_at?: string;
}

export interface GalleryStats {
  total_photos: number;
  featured_photos: number;
  photo_types: Record<string, number>;
}
