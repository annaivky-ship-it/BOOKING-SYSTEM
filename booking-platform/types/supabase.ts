// Supabase Database types
// This is a simplified version - in production, generate this with:
// npx supabase gen types typescript --project-id your-project-id > types/supabase.ts

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          role: 'admin' | 'performer' | 'client';
          full_name: string;
          avatar_url: string | null;
          is_active: boolean;
          is_available: boolean;
          created_at: string;
          updated_at: string;
          last_login: string | null;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          booking_number: string;
          client_id: string;
          performer_id: string;
          status: string;
          event_date: string;
          event_start_time: string;
          event_end_time: string;
          event_location: string;
          event_type: string | null;
          special_requests: string | null;
          payment_status: string;
          deposit_amount: number | null;
          total_amount: number | null;
          payid_receipt_url: string | null;
          payment_verified_at: string | null;
          payment_verified_by: string | null;
          performer_eta: string | null;
          eta_sent_at: string | null;
          eta_sent_to_client: boolean;
          eta_sent_to_admin: boolean;
          created_at: string;
          updated_at: string;
          accepted_at: string | null;
          declined_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
        };
        Insert: Omit<
          Database['public']['Tables']['bookings']['Row'],
          'id' | 'booking_number' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      vetting_applications: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          id_document_url: string;
          id_expiry_date: string;
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          rejection_reason: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['vetting_applications']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['vetting_applications']['Insert']>;
      };
      blacklist: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          reason: string;
          added_by: string;
          added_at: string;
          notes: string | null;
        };
        Insert: Omit<Database['public']['Tables']['blacklist']['Row'], 'id' | 'added_at'>;
        Update: Partial<Database['public']['Tables']['blacklist']['Insert']>;
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          details: Record<string, any> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_log']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['audit_log']['Insert']>;
      };
    };
  };
};
