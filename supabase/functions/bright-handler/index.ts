// Follow this setup guide to integrate the Deno runtime for Supabase Edge Functions.
// https://supabase.com/docs/guides/functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

console.log("Bright Handler Function Started!")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse request body
    const { action, data } = await req.json();

    let result;

    switch (action) {
      case 'getPerformers':
        // Fetch available performers
        const { data: performers, error: performersError } = await supabase
          .from('performers')
          .select('*')
          .eq('status', 'available');

        if (performersError) throw performersError;
        result = { performers };
        break;

      case 'getServices':
        // Fetch all services
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('*');

        if (servicesError) throw servicesError;
        result = { services };
        break;

      case 'getBookings':
        // Fetch bookings (requires performer_id or client_email)
        const { performer_id, client_email } = data;
        let query = supabase.from('bookings').select('*');

        if (performer_id) {
          query = query.eq('performer_id', performer_id);
        } else if (client_email) {
          query = query.eq('client_email', client_email);
        }

        const { data: bookings, error: bookingsError } = await query;
        if (bookingsError) throw bookingsError;
        result = { bookings };
        break;

      case 'createBooking':
        // Create a new booking
        const { data: newBooking, error: bookingError } = await supabase
          .from('bookings')
          .insert(data)
          .select()
          .single();

        if (bookingError) throw bookingError;
        result = { booking: newBooking, message: 'Booking created successfully' };
        break;

      case 'updateBookingStatus':
        // Update booking status
        const { booking_id, status } = data;
        const { data: updatedBooking, error: updateError } = await supabase
          .from('bookings')
          .update({ status })
          .eq('id', booking_id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = { booking: updatedBooking, message: 'Booking status updated' };
        break;

      case 'health':
        // Health check endpoint
        result = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'bright-handler'
        };
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
})
