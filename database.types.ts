Using workdir C:\Users\annai
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          client_email: string
          client_message: string | null
          client_name: string
          client_phone: string
          created_at: string | null
          deposit_receipt_path: string | null
          duration_hours: number
          event_address: string
          event_date: string
          event_time: string
          event_type: string
          id: string
          id_document_path: string | null
          number_of_guests: number
          performer_eta_minutes: number | null
          performer_id: number | null
          performer_reassigned_from_id: number | null
          referral_fee_amount: number | null
          referral_fee_paid: boolean | null
          referral_fee_receipt_path: string | null
          services_requested: string[]
          status: string
          verified_at: string | null
          verified_by_admin_name: string | null
        }
        Insert: {
          client_email: string
          client_message?: string | null
          client_name: string
          client_phone: string
          created_at?: string | null
          deposit_receipt_path?: string | null
          duration_hours: number
          event_address: string
          event_date: string
          event_time: string
          event_type: string
          id?: string
          id_document_path?: string | null
          number_of_guests: number
          performer_eta_minutes?: number | null
          performer_id?: number | null
          performer_reassigned_from_id?: number | null
          referral_fee_amount?: number | null
          referral_fee_paid?: boolean | null
          referral_fee_receipt_path?: string | null
          services_requested: string[]
          status?: string
          verified_at?: string | null
          verified_by_admin_name?: string | null
        }
        Update: {
          client_email?: string
          client_message?: string | null
          client_name?: string
          client_phone?: string
          created_at?: string | null
          deposit_receipt_path?: string | null
          duration_hours?: number
          event_address?: string
          event_date?: string
          event_time?: string
          event_type?: string
          id?: string
          id_document_path?: string | null
          number_of_guests?: number
          performer_eta_minutes?: number | null
          performer_id?: number | null
          performer_reassigned_from_id?: number | null
          referral_fee_amount?: number | null
          referral_fee_paid?: boolean | null
          referral_fee_receipt_path?: string | null
          services_requested?: string[]
          status?: string
          verified_at?: string | null
          verified_by_admin_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_performer_id_fkey"
            columns: ["performer_id"]
            isOneToOne: false
            referencedRelation: "performers"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          recipient: string
          sender: string
          type: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          recipient: string
          sender: string
          type?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          recipient?: string
          sender?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      do_not_serve_entries: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string
          created_at: string | null
          id: string
          reason: string
          status: string
          submitted_by_performer_id: number | null
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone: string
          created_at?: string | null
          id?: string
          reason: string
          status?: string
          submitted_by_performer_id?: number | null
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string
          created_at?: string | null
          id?: string
          reason?: string
          status?: string
          submitted_by_performer_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "do_not_serve_entries_submitted_by_performer_id_fkey"
            columns: ["submitted_by_performer_id"]
            isOneToOne: false
            referencedRelation: "performers"
            referencedColumns: ["id"]
          },
        ]
      }
      do_not_serve_list: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string
          created_at: string
          id: string
          reason: string
          status: string
          submitted_by_performer_id: number
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone: string
          created_at?: string
          id?: string
          reason: string
          status?: string
          submitted_by_performer_id: number
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          id?: string
          reason?: string
          status?: string
          submitted_by_performer_id?: number
        }
        Relationships: []
      }
      payment_reminders: {
        Row: {
          id: string
          payment_id: string
          reminder_type: string
          sent_at: string | null
          sms_id: string | null
          sms_status: string | null
        }
        Insert: {
          id?: string
          payment_id: string
          reminder_type: string
          sent_at?: string | null
          sms_id?: string | null
          sms_status?: string | null
        }
        Update: {
          id?: string
          payment_id?: string
          reminder_type?: string
          sent_at?: string | null
          sms_id?: string | null
          sms_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          booking_id: string
          created_at: string | null
          deposit_amount: number
          deposit_percentage: number
          due_date: string | null
          id: string
          payid_email: string
          payment_method: string | null
          payment_reference: string
          receipt_url: string | null
          refund_reason: string | null
          refunded_at: string | null
          remaining_amount: number
          status: string
          total_amount: number
          transaction_id: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          deposit_amount: number
          deposit_percentage?: number
          due_date?: string | null
          id?: string
          payid_email: string
          payment_method?: string | null
          payment_reference: string
          receipt_url?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          remaining_amount: number
          status?: string
          total_amount: number
          transaction_id?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          deposit_amount?: number
          deposit_percentage?: number
          due_date?: string | null
          id?: string
          payid_email?: string
          payment_method?: string | null
          payment_reference?: string
          receipt_url?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          remaining_amount?: number
          status?: string
          total_amount?: number
          transaction_id?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      performer_gallery: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          performer_id: number
          photo_type: string | null
          photo_url: string
          uploaded_at: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          performer_id: number
          photo_type?: string | null
          photo_url: string
          uploaded_at?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          performer_id?: number
          photo_type?: string | null
          photo_url?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performer_gallery_performer_id_fkey"
            columns: ["performer_id"]
            isOneToOne: false
            referencedRelation: "performers"
            referencedColumns: ["id"]
          },
        ]
      }
      performers: {
        Row: {
          bio: string
          created_at: string | null
          email: string | null
          id: number
          instagram: string | null
          name: string
          phone: string | null
          photo_url: string
          service_ids: string[] | null
          status: string
          tagline: string
        }
        Insert: {
          bio: string
          created_at?: string | null
          email?: string | null
          id: number
          instagram?: string | null
          name: string
          phone?: string | null
          photo_url: string
          service_ids?: string[] | null
          status?: string
          tagline: string
        }
        Update: {
          bio?: string
          created_at?: string | null
          email?: string | null
          id?: number
          instagram?: string | null
          name?: string
          phone?: string | null
          photo_url?: string
          service_ids?: string[] | null
          status?: string
          tagline?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          performer_id: number | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          performer_id?: number | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          performer_id?: number | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_performer_id_fkey"
            columns: ["performer_id"]
            isOneToOne: false
            referencedRelation: "performers"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          booking_notes: string | null
          category: string
          created_at: string | null
          description: string
          duration_minutes: number | null
          id: string
          min_duration_hours: number | null
          name: string
          rate: number
          rate_type: string
        }
        Insert: {
          booking_notes?: string | null
          category: string
          created_at?: string | null
          description: string
          duration_minutes?: number | null
          id: string
          min_duration_hours?: number | null
          name: string
          rate: number
          rate_type: string
        }
        Update: {
          booking_notes?: string | null
          category?: string
          created_at?: string | null
          description?: string
          duration_minutes?: number | null
          id?: string
          min_duration_hours?: number | null
          name?: string
          rate?: number
          rate_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      expire_overdue_payments: { Args: never; Returns: number }
      get_overdue_payments: {
        Args: never
        Returns: {
          booking_id: string
          client_name: string
          client_phone: string
          deposit_amount: number
          hours_overdue: number
          payid_email: string
          payment_id: string
          payment_reference: string
        }[]
      }
      get_performer_featured_photos: {
        Args: { p_performer_id: number }
        Returns: {
          caption: string
          display_order: number
          id: string
          photo_type: string
          photo_url: string
        }[]
      }
      get_performer_gallery: {
        Args: { p_performer_id: number }
        Returns: {
          caption: string
          display_order: number
          id: string
          is_featured: boolean
          photo_type: string
          photo_url: string
          uploaded_at: string
        }[]
      }
      get_performer_gallery_stats: {
        Args: { p_performer_id: number }
        Returns: {
          featured_photos: number
          photo_types: Json
          total_photos: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
A new version of Supabase CLI is available: v2.54.11 (currently installed v2.47.2)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
