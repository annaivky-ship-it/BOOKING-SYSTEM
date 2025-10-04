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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          age_group: string | null
          booking_reference: string
          client_id: string
          contract_signed_at: string | null
          created_at: string | null
          deposit_amount: number | null
          duration_hours: number
          event_date: string
          event_description: string | null
          event_type: string
          guest_count: number | null
          id: string
          location: Json
          performer_id: string
          special_requirements: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          age_group?: string | null
          booking_reference: string
          client_id: string
          contract_signed_at?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          duration_hours: number
          event_date: string
          event_description?: string | null
          event_type: string
          guest_count?: number | null
          id?: string
          location: Json
          performer_id: string
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          age_group?: string | null
          booking_reference?: string
          client_id?: string
          contract_signed_at?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          duration_hours?: number
          event_date?: string
          event_description?: string | null
          event_type?: string
          guest_count?: number | null
          id?: string
          location?: Json
          performer_id?: string
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_performer_id_fkey"
            columns: ["performer_id"]
            isOneToOne: false
            referencedRelation: "performers"
            referencedColumns: ["id"]
          },
        ]
      }
      do_not_serve_registry: {
        Row: {
          admin_notes: string | null
          client_email: string
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string | null
          description: string
          evidence_urls: Json | null
          expires_at: string | null
          id: string
          incident_date: string | null
          is_active: boolean | null
          report_type: Database["public"]["Enums"]["report_type"]
          reported_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          severity_level: number | null
          status: Database["public"]["Enums"]["report_status"] | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          client_email: string
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          description: string
          evidence_urls?: Json | null
          expires_at?: string | null
          id?: string
          incident_date?: string | null
          is_active?: boolean | null
          report_type: Database["public"]["Enums"]["report_type"]
          reported_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity_level?: number | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          client_email?: string
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          description?: string
          evidence_urls?: Json | null
          expires_at?: string | null
          id?: string
          incident_date?: string | null
          is_active?: boolean | null
          report_type?: Database["public"]["Enums"]["report_type"]
          reported_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity_level?: number | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "do_not_serve_registry_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "do_not_serve_registry_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "do_not_serve_registry_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_reports: {
        Row: {
          booking_id: string | null
          created_at: string | null
          description: string
          dns_entry_id: string | null
          evidence_files: Json | null
          follow_up_required: boolean | null
          id: string
          immediate_action_taken: string | null
          incident_date: string
          incident_type: Database["public"]["Enums"]["report_type"]
          location_details: string | null
          medical_attention_required: boolean | null
          police_report_filed: boolean | null
          police_report_number: string | null
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"] | null
          updated_at: string | null
          witness_information: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          description: string
          dns_entry_id?: string | null
          evidence_files?: Json | null
          follow_up_required?: boolean | null
          id?: string
          immediate_action_taken?: string | null
          incident_date: string
          incident_type: Database["public"]["Enums"]["report_type"]
          location_details?: string | null
          medical_attention_required?: boolean | null
          police_report_filed?: boolean | null
          police_report_number?: string | null
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
          witness_information?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          description?: string
          dns_entry_id?: string | null
          evidence_files?: Json | null
          follow_up_required?: boolean | null
          id?: string
          immediate_action_taken?: string | null
          incident_date?: string
          incident_type?: Database["public"]["Enums"]["report_type"]
          location_details?: string | null
          medical_attention_required?: boolean | null
          police_report_filed?: boolean | null
          police_report_number?: string | null
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
          witness_information?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_reports_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_dns_entry_id_fkey"
            columns: ["dns_entry_id"]
            isOneToOne: false
            referencedRelation: "do_not_serve_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      message_logs: {
        Row: {
          booking_id: string | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          message_content: string
          message_type: Database["public"]["Enums"]["communication_type"]
          read_at: string | null
          recipient_email: string | null
          recipient_id: string | null
          recipient_phone: string | null
          sender_id: string | null
          status: Database["public"]["Enums"]["message_status"] | null
          subject: string | null
          template_id: string | null
          template_variables: Json | null
          twilio_sid: string | null
          twilio_status: string | null
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content: string
          message_type: Database["public"]["Enums"]["communication_type"]
          read_at?: string | null
          recipient_email?: string | null
          recipient_id?: string | null
          recipient_phone?: string | null
          sender_id?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          subject?: string | null
          template_id?: string | null
          template_variables?: Json | null
          twilio_sid?: string | null
          twilio_status?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string
          message_type?: Database["public"]["Enums"]["communication_type"]
          read_at?: string | null
          recipient_email?: string | null
          recipient_id?: string | null
          recipient_phone?: string | null
          sender_id?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          subject?: string | null
          template_id?: string | null
          template_variables?: Json | null
          twilio_sid?: string | null
          twilio_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_logs_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_logs_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          message_type: Database["public"]["Enums"]["communication_type"]
          name: string
          subject: string | null
          template_key: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message_type: Database["public"]["Enums"]["communication_type"]
          name: string
          subject?: string | null
          template_key: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message_type?: Database["public"]["Enums"]["communication_type"]
          name?: string
          subject?: string | null
          template_key?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          message: string
          message_type: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          message_type?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          booking_confirmations: boolean | null
          booking_reminders: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          marketing_communications: boolean | null
          payment_notifications: boolean | null
          push_notifications: boolean | null
          safety_alerts: boolean | null
          sms_notifications: boolean | null
          sms_phone_number: string | null
          updated_at: string | null
          user_id: string
          whatsapp_notifications: boolean | null
          whatsapp_phone_number: string | null
        }
        Insert: {
          booking_confirmations?: boolean | null
          booking_reminders?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_communications?: boolean | null
          payment_notifications?: boolean | null
          push_notifications?: boolean | null
          safety_alerts?: boolean | null
          sms_notifications?: boolean | null
          sms_phone_number?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp_notifications?: boolean | null
          whatsapp_phone_number?: string | null
        }
        Update: {
          booking_confirmations?: boolean | null
          booking_reminders?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_communications?: boolean | null
          payment_notifications?: boolean | null
          push_notifications?: boolean | null
          safety_alerts?: boolean | null
          sms_notifications?: boolean | null
          sms_phone_number?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp_notifications?: boolean | null
          whatsapp_phone_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read_at: string | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payid_accounts: {
        Row: {
          account_name: string
          account_number: string | null
          bank_name: string | null
          bsb: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_used_at: string | null
          payid_identifier: string
          payid_type: string
          updated_at: string | null
          user_id: string
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          account_name: string
          account_number?: string | null
          bank_name?: string | null
          bsb?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_used_at?: string | null
          payid_identifier: string
          payid_type: string
          updated_at?: string | null
          user_id: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string | null
          bank_name?: string | null
          bsb?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_used_at?: string | null
          payid_identifier?: string
          payid_type?: string
          updated_at?: string | null
          user_id?: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payid_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          bank_reference: string | null
          booking_id: string
          created_at: string | null
          currency: string | null
          description: string | null
          due_date: string | null
          external_transaction_id: string | null
          failure_reason: string | null
          fee_amount: number | null
          id: string
          metadata: Json | null
          net_amount: number | null
          payer_id: string
          payid_identifier: string | null
          payid_name: string | null
          payment_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          recipient_id: string
          refund_reason: string | null
          refunded_amount: number | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_reference: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bank_reference?: string | null
          booking_id: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          external_transaction_id?: string | null
          failure_reason?: string | null
          fee_amount?: number | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          payer_id: string
          payid_identifier?: string | null
          payid_name?: string | null
          payment_date?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          recipient_id: string
          refund_reason?: string | null
          refunded_amount?: number | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bank_reference?: string | null
          booking_id?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          external_transaction_id?: string | null
          failure_reason?: string | null
          fee_amount?: number | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          payer_id?: string
          payid_identifier?: string | null
          payid_name?: string | null
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          recipient_id?: string
          refund_reason?: string | null
          refunded_amount?: number | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          currency: string | null
          id: string
          notes: string | null
          payid_identifier: string | null
          payid_transaction_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          proof_of_payment_url: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          payid_identifier?: string | null
          payid_transaction_id?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          proof_of_payment_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          payid_identifier?: string | null
          payid_transaction_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          proof_of_payment_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      performer_check_ins: {
        Row: {
          booking_id: string | null
          check_in_type: string
          created_at: string | null
          id: string
          is_safe: boolean | null
          location_lat: number | null
          location_lng: number | null
          notes: string | null
          performer_id: string
        }
        Insert: {
          booking_id?: string | null
          check_in_type: string
          created_at?: string | null
          id?: string
          is_safe?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          performer_id: string
        }
        Update: {
          booking_id?: string | null
          check_in_type?: string
          created_at?: string | null
          id?: string
          is_safe?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          performer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "performer_check_ins_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performer_check_ins_performer_id_fkey"
            columns: ["performer_id"]
            isOneToOne: false
            referencedRelation: "performers"
            referencedColumns: ["id"]
          },
        ]
      }
      performer_safety_preferences: {
        Row: {
          auto_check_in_required: boolean | null
          blocked_areas: Json | null
          created_at: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          enable_dns_notifications: boolean | null
          enable_location_sharing: boolean | null
          enable_safety_alerts: boolean | null
          id: string
          performer_id: string
          preferred_venues: Json | null
          safety_check_interval: number | null
          safety_notes: string | null
          updated_at: string | null
        }
        Insert: {
          auto_check_in_required?: boolean | null
          blocked_areas?: Json | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          enable_dns_notifications?: boolean | null
          enable_location_sharing?: boolean | null
          enable_safety_alerts?: boolean | null
          id?: string
          performer_id: string
          preferred_venues?: Json | null
          safety_check_interval?: number | null
          safety_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_check_in_required?: boolean | null
          blocked_areas?: Json | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          enable_dns_notifications?: boolean | null
          enable_location_sharing?: boolean | null
          enable_safety_alerts?: boolean | null
          id?: string
          performer_id?: string
          preferred_venues?: Json | null
          safety_check_interval?: number | null
          safety_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performer_safety_preferences_performer_id_fkey"
            columns: ["performer_id"]
            isOneToOne: true
            referencedRelation: "performers"
            referencedColumns: ["id"]
          },
        ]
      }
      performer_services: {
        Row: {
          created_at: string | null
          custom_rate: number | null
          id: string
          is_available: boolean | null
          performer_id: string
          service_id: string
          special_notes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_rate?: number | null
          id?: string
          is_available?: boolean | null
          performer_id: string
          service_id: string
          special_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_rate?: number | null
          id?: string
          is_available?: boolean | null
          performer_id?: string
          service_id?: string
          special_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performer_services_performer_id_fkey"
            columns: ["performer_id"]
            isOneToOne: false
            referencedRelation: "performers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performer_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      performers: {
        Row: {
          application_id: string
          availability_calendar: Json | null
          base_rate: number | null
          bio: string | null
          created_at: string | null
          featured: boolean | null
          hourly_rate: number | null
          id: string
          performance_types: Json | null
          rating: number | null
          service_areas: Json | null
          social_media_links: Json | null
          stage_name: string
          total_reviews: number | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          application_id: string
          availability_calendar?: Json | null
          base_rate?: number | null
          bio?: string | null
          created_at?: string | null
          featured?: boolean | null
          hourly_rate?: number | null
          id?: string
          performance_types?: Json | null
          rating?: number | null
          service_areas?: Json | null
          social_media_links?: Json | null
          stage_name: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          application_id?: string
          availability_calendar?: Json | null
          base_rate?: number | null
          bio?: string | null
          created_at?: string | null
          featured?: boolean | null
          hourly_rate?: number | null
          id?: string
          performance_types?: Json | null
          rating?: number | null
          service_areas?: Json | null
          social_media_links?: Json | null
          stage_name?: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "performers_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "vetting_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          client_id: string
          comment: string | null
          created_at: string | null
          id: string
          performer_id: string
          rating: number
          response: string | null
          response_at: string | null
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          client_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          performer_id: string
          rating: number
          response?: string | null
          response_at?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          client_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          performer_id?: string
          rating?: number
          response?: string | null
          response_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_performer_id_fkey"
            columns: ["performer_id"]
            isOneToOne: false
            referencedRelation: "performers"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          location_specific: string | null
          message: string
          severity_level: number | null
          target_audience: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location_specific?: string | null
          message: string
          severity_level?: number | null
          target_audience?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location_specific?: string | null
          message?: string
          severity_level?: number | null
          target_audience?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_alerts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          age_restricted: boolean | null
          base_rate: number
          booking_notes: string | null
          category: Database["public"]["Enums"]["service_category"]
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_private_only: boolean | null
          min_duration_minutes: number | null
          name: string
          rate_type: Database["public"]["Enums"]["rate_type"]
          requires_special_license: boolean | null
          updated_at: string | null
        }
        Insert: {
          age_restricted?: boolean | null
          base_rate: number
          booking_notes?: string | null
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_private_only?: boolean | null
          min_duration_minutes?: number | null
          name: string
          rate_type?: Database["public"]["Enums"]["rate_type"]
          requires_special_license?: boolean | null
          updated_at?: string | null
        }
        Update: {
          age_restricted?: boolean | null
          base_rate?: number
          booking_notes?: string | null
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_private_only?: boolean | null
          min_duration_minutes?: number | null
          name?: string
          rate_type?: Database["public"]["Enums"]["rate_type"]
          requires_special_license?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          email: string
          email_verified: boolean | null
          first_name: string | null
          id: string
          last_name: string | null
          metadata: Json | null
          organization_id: string | null
          phone: string | null
          phone_verified: boolean | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          email_verified?: boolean | null
          first_name?: string | null
          id: string
          last_name?: string | null
          metadata?: Json | null
          organization_id?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          organization_id?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vetting_applications: {
        Row: {
          approval_notes: string | null
          background_check_status: string | null
          created_at: string | null
          date_of_birth: string
          documents: Json | null
          email: string
          experience_years: number
          full_name: string
          id: string
          location: string
          performance_type: string
          phone: string
          portfolio_urls: Json | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approval_notes?: string | null
          background_check_status?: string | null
          created_at?: string | null
          date_of_birth: string
          documents?: Json | null
          email: string
          experience_years: number
          full_name: string
          id?: string
          location: string
          performance_type: string
          phone: string
          portfolio_urls?: Json | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approval_notes?: string | null
          background_check_status?: string | null
          created_at?: string | null
          date_of_birth?: string
          documents?: Json | null
          email?: string
          experience_years?: number
          full_name?: string
          id?: string
          location?: string
          performance_type?: string
          phone?: string
          portfolio_urls?: Json | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vetting_applications_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vetting_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          endpoint: string
          error_message: string | null
          headers: Json | null
          id: string
          method: string
          payload: Json | null
          processing_time_ms: number | null
          response_body: string | null
          response_status: number | null
          webhook_type: string
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          error_message?: string | null
          headers?: Json | null
          id?: string
          method: string
          payload?: Json | null
          processing_time_ms?: number | null
          response_body?: string | null
          response_status?: number | null
          webhook_type: string
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          error_message?: string | null
          headers?: Json | null
          id?: string
          method?: string
          payload?: Json | null
          processing_time_ms?: number | null
          response_body?: string | null
          response_status?: number | null
          webhook_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      service_stats: {
        Row: {
          avg_rate: number | null
          category: Database["public"]["Enums"]["service_category"] | null
          max_rate: number | null
          min_rate: number | null
          name: string | null
          performer_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_dns_status: {
        Args: { client_email_input: string }
        Returns: {
          active_reports: number
          entry_count: number
          highest_severity: number
          is_listed: boolean
          latest_incident: string
        }[]
      }
      create_payid_payment: {
        Args: {
          amount_input: number
          booking_id_input: string
          description_input?: string
          payer_id_input: string
          payid_identifier_input: string
          recipient_id_input: string
        }
        Returns: string
      }
      generate_booking_reference: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_performer_services: {
        Args: { performer_uuid: string }
        Returns: {
          age_restricted: boolean
          booking_notes: string
          category: Database["public"]["Enums"]["service_category"]
          description: string
          is_private_only: boolean
          min_duration_minutes: number
          rate: number
          rate_type: Database["public"]["Enums"]["rate_type"]
          service_id: string
          service_name: string
          special_notes: string
        }[]
      }
      get_safety_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_dns_entries: number
          high_severity_cases: number
          pending_reports: number
          this_month_incidents: number
          total_dns_entries: number
        }[]
      }
      get_services_by_category: {
        Args: {
          category_filter?: Database["public"]["Enums"]["service_category"]
        }
        Returns: {
          age_restricted: boolean
          base_rate: number
          booking_notes: string
          category: Database["public"]["Enums"]["service_category"]
          description: string
          display_order: number
          id: string
          is_private_only: boolean
          min_duration_minutes: number
          name: string
          rate_type: Database["public"]["Enums"]["rate_type"]
        }[]
      }
      send_automated_message: {
        Args: {
          booking_id_input?: string
          recipient_user_id: string
          sender_user_id?: string
          template_key_input: string
          template_vars?: Json
        }
        Returns: string
      }
    }
    Enums: {
      application_status:
        | "pending"
        | "needs_review"
        | "approved"
        | "rejected"
        | "expired"
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "disputed"
      communication_type: "sms" | "whatsapp" | "email" | "push_notification"
      message_status: "pending" | "sent" | "delivered" | "failed" | "read"
      payment_method: "payid" | "bank_transfer" | "cash"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
      rate_type: "per_hour" | "flat_rate" | "per_person"
      report_status:
        | "pending"
        | "under_review"
        | "verified"
        | "dismissed"
        | "resolved"
      report_type:
        | "inappropriate_behavior"
        | "non_payment"
        | "safety_concern"
        | "harassment"
        | "boundary_violation"
        | "intoxication"
        | "other"
      service_category: "waitressing" | "lap_dance" | "strip_show"
      user_role: "admin" | "performer" | "client"
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
    Enums: {
      application_status: [
        "pending",
        "needs_review",
        "approved",
        "rejected",
        "expired",
      ],
      booking_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "disputed",
      ],
      communication_type: ["sms", "whatsapp", "email", "push_notification"],
      message_status: ["pending", "sent", "delivered", "failed", "read"],
      payment_method: ["payid", "bank_transfer", "cash"],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
      ],
      rate_type: ["per_hour", "flat_rate", "per_person"],
      report_status: [
        "pending",
        "under_review",
        "verified",
        "dismissed",
        "resolved",
      ],
      report_type: [
        "inappropriate_behavior",
        "non_payment",
        "safety_concern",
        "harassment",
        "boundary_violation",
        "intoxication",
        "other",
      ],
      service_category: ["waitressing", "lap_dance", "strip_show"],
      user_role: ["admin", "performer", "client"],
    },
  },
} as const
