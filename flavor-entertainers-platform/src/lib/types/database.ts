export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'client' | 'performer' | 'admin';
  avatar_url?: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithStats extends User {
  total_bookings: number;
  total_revenue: number;
  last_booking_date?: string;
  rating?: number;
  email_verified: boolean;
  phone_verified: boolean;
  profile_picture_url?: string;
}

export interface Performer extends User {
  user_id: string;
  stage_name: string;
  bio?: string;
  hourly_rate: number;
  availability_status: 'available' | 'busy' | 'unavailable';
  verification_status: 'pending' | 'verified' | 'rejected';
  specialties: string[];
  location: string;
  profile_images: string[];
  experience_years: number;
  languages: string[];
}

export interface PerformerWithStats extends Performer {
  total_bookings: number;
  average_rating: number;
  total_earnings: number;
  completed_bookings: number;
  cancelled_bookings: number;
}

export interface Client extends User {
  user_id: string;
  company_name?: string;
  billing_address?: string;
  payment_method?: string;
  preferred_contact_method: 'email' | 'phone' | 'sms';
}

export interface ClientWithStats extends Client {
  total_bookings: number;
  total_spent: number;
  last_booking_date?: string;
  average_booking_value: number;
}

export interface Booking {
  id: string;
  client_id: string;
  performer_id: string;
  booking_reference: string;
  event_type: string;
  event_description?: string;
  event_date: string;
  event_time: string;
  duration_hours: number;
  guest_count: number;
  venue_address: string;
  special_requirements?: string;
  total_amount: number;
  deposit_amount: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'deposit_paid' | 'fully_paid' | 'refunded';
  payment_method?: 'payid' | 'bank_transfer' | 'cash' | 'other';
  payment_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetails extends Booking {
  client: Client;
  performer: Performer;
  services: BookingService[];
}

export interface BookingService {
  id: string;
  booking_id: string;
  service_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  service: Service;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  duration_minutes: number;
  requirements?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  services: Service[];
}

export interface DoNotServeEntry {
  id: string;
  client_name: string;
  client_phone?: string;
  client_email?: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reported_by: string;
  incident_date: string;
  details: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SafetyIncident {
  id: string;
  performer_id: string;
  booking_id?: string;
  incident_type: 'harassment' | 'safety_concern' | 'payment_issue' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  incident_date: string;
  status: 'reported' | 'investigating' | 'resolved' | 'escalated';
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: 'payid' | 'bank_transfer' | 'cash' | 'other';
  payment_reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  booking_updates: boolean;
  payment_reminders: boolean;
  marketing_communications: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocationCheckin {
  id: string;
  performer_id: string;
  booking_id?: string;
  latitude: number;
  longitude: number;
  address: string;
  checkin_type: 'arrival' | 'departure' | 'safety_check';
  notes?: string;
  created_at: string;
}

export interface AnalyticsData {
  total_bookings: number;
  total_revenue: number;
  total_performers: number;
  total_clients: number;
  booking_growth: number;
  revenue_growth: number;
  performer_growth: number;
  client_growth: number;
  popular_services: Array<{
    service_name: string;
    booking_count: number;
    revenue: number;
  }>;
  booking_trends: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
  performer_ratings: Array<{
    performer_name: string;
    average_rating: number;
    booking_count: number;
  }>;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      performers: {
        Row: Performer;
        Insert: Omit<Performer, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Performer, 'user_id' | 'created_at' | 'updated_at'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Client, 'user_id' | 'created_at' | 'updated_at'>>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>;
      };
      services: {
        Row: Service;
        Insert: Omit<Service, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>;
      };
      do_not_serve: {
        Row: DoNotServeEntry;
        Insert: Omit<DoNotServeEntry, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DoNotServeEntry, 'id' | 'created_at' | 'updated_at'>>;
      };
      safety_incidents: {
        Row: SafetyIncident;
        Insert: Omit<SafetyIncident, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SafetyIncident, 'id' | 'created_at' | 'updated_at'>>;
      };
      payment_records: {
        Row: PaymentRecord;
        Insert: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>>;
      };
      notification_preferences: {
        Row: NotificationPreferences;
        Insert: Omit<NotificationPreferences, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NotificationPreferences, 'id' | 'created_at' | 'updated_at'>>;
      };
      location_checkins: {
        Row: LocationCheckin;
        Insert: Omit<LocationCheckin, 'id' | 'created_at'>;
        Update: Partial<Omit<LocationCheckin, 'id' | 'created_at'>>;
      };
    };
  };
}
export interface VettingApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  performance_type: string;
  location: string;
  experience_years: number;
  portfolio_urls: string[];
  references: string[];
  background_check_consent: boolean;
  terms_accepted: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VettingApplicationWithUser extends VettingApplication {
  user: User;
}

export interface PayIDAccount {
  id: string;
  user_id: string;
  payid_identifier: string;
  payid_type: 'email' | 'phone' | 'abn';
  account_name: string;
  bank_name: string;
  bsb?: string;
  account_number?: string;
  is_verified: boolean;
  is_active: boolean;
  is_primary: boolean;
  verification_status: 'pending' | 'verified' | 'failed' | 'expired';
  created_at: string;
  updated_at: string;
  verified_at?: string;
  last_used?: string;
  deactivated_at?: string;
}

export interface PayIDTransaction {
  id: string;
  sender_payid_id?: string;
  recipient_payid_id?: string;
  booking_id?: string;
  amount: number;
  currency: string;
  description: string;
  reference?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transaction_type: 'payment' | 'refund' | 'chargeback';
  external_transaction_id?: string;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface PayIDEvent {
  id: string;
  payid_account_id?: string;
  transaction_id?: string;
  event_type: string;
  event_data?: any;
  created_at: string;
  user_agent?: string;
  ip_address?: string;
}

export interface PayIDTransactionWithDetails extends PayIDTransaction {
  sender_payid?: PayIDAccount;
  recipient_payid?: PayIDAccount;
  booking?: Booking;
}


// Database schema enums
export type UserRole = 'client' | 'performer' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'deposit_paid' | 'fully_paid' | 'refunded';
export type VettingStatus = 'pending' | 'approved' | 'rejected' | 'under_review';
export type AvailabilityStatus = 'available' | 'busy' | 'unavailable';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type PayIDType = 'email' | 'phone' | 'abn';
export type PayIDVerificationStatus = 'pending' | 'verified' | 'failed' | 'expired';
export type PayIDTransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type PayIDTransactionType = 'payment' | 'refund' | 'chargeback';

// Extend Database interface with missing tables
export interface DatabaseExtended extends Database {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      vetting_applications: {
        Row: VettingApplication;
        Insert: Omit<VettingApplication, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<VettingApplication, 'id' | 'created_at' | 'updated_at'>>;
      };
      payid_accounts: {
        Row: PayIDAccount;
        Insert: Omit<PayIDAccount, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PayIDAccount, 'id' | 'created_at' | 'updated_at'>>;
      };
      payid_transactions: {
        Row: PayIDTransaction;
        Insert: Omit<PayIDTransaction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PayIDTransaction, 'id' | 'created_at' | 'updated_at'>>;
      };
      payid_events: {
        Row: PayIDEvent;
        Insert: Omit<PayIDEvent, 'id' | 'created_at'>;
        Update: never;
      };
      payment_transactions: {
        Row: {
          id: string;
          booking_id: string;
          payer_id: string;
          recipient_id: string;
          payment_method: string;
          amount: number;
          currency: string;
          payid_identifier: string;
          payid_name: string;
          fee_amount: number;
          net_amount: number;
          status: string;
          description: string;
          due_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<DatabaseExtended['public']['Tables']['payment_transactions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseExtended['public']['Tables']['payment_transactions']['Row'], 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Enums: {
      user_role: UserRole;
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
      vetting_status: VettingStatus;
      availability_status: AvailabilityStatus;
      verification_status: VerificationStatus;
      payid_type: PayIDType;
      payid_verification_status: PayIDVerificationStatus;
      payid_transaction_status: PayIDTransactionStatus;
      payid_transaction_type: PayIDTransactionType;
    };
  };
}
export * from './supabase'
