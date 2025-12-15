import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createBookingSchema } from '@/lib/validators';
import { logAction, AuditActions, getRequestMetadata } from '@/lib/audit';
import { isBlacklisted, hasValidVetting } from '@/lib/utils';
import { notifyAdminNewBooking } from '@/lib/whatsapp';

/**
 * POST /api/bookings
 * Create a new booking
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const serviceClient = createServiceClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role from auth metadata
    const userRole = user.user_metadata?.role || user.app_metadata?.role;
    const userEmail = user.email || '';
    const userPhone = user.user_metadata?.phone || user.phone || null;

    // Only clients can create bookings
    if (userRole !== 'client') {
      return NextResponse.json(
        { error: 'Only clients can create bookings' },
        { status: 403 }
      );
    }

    // Create a profile object for backwards compatibility
    const profile = { email: userEmail, phone: userPhone, role: userRole };

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createBookingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if client is blacklisted
    const blacklisted = await isBlacklisted(serviceClient, profile.email, profile.phone || undefined);
    if (blacklisted) {
      return NextResponse.json(
        { error: 'Unable to create booking. Please contact support.' },
        { status: 403 }
      );
    }

    // Check if client has valid vetting
    const vetted = await hasValidVetting(serviceClient, user.id);
    if (!vetted) {
      return NextResponse.json(
        { error: 'Please complete ID verification before booking' },
        { status: 403 }
      );
    }

    // Note: Performer validation would happen here with proper database schema
    // For now, we'll assume the performer_id is valid
    // TODO: Add performer validation once database schema is set up

    // Create booking
    const { data: booking, error: bookingError } = await (serviceClient as any)
      .from('bookings')
      .insert({
        client_id: user.id,
        performer_id: data.performer_id,
        event_date: data.event_date,
        event_start_time: data.event_start_time,
        event_end_time: data.event_end_time,
        event_location: data.event_location,
        event_type: data.event_type || null,
        special_requests: data.special_requests || null,
        deposit_amount: data.deposit_amount || null,
        total_amount: data.total_amount || null,
        status: 'payment_pending',
        payment_status: 'pending',
        eta_sent_to_client: false,
        eta_sent_to_admin: false,
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error('Booking creation error:', bookingError);
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    // Log the action
    const metadata = getRequestMetadata(request.headers);
    await logAction({
      user_id: user.id,
      action: AuditActions.BOOKING_CREATED,
      resource_type: 'booking',
      resource_id: booking.id,
      details: {
        booking_number: booking.booking_number,
        performer_id: data.performer_id,
        event_date: data.event_date,
      },
      ...metadata,
    });

    // Notify admin
    try {
      await notifyAdminNewBooking(booking.booking_number);
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
      // Don't fail the request if notification fails
    }

    // Generate signed URL for receipt upload
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from('receipts')
      .createSignedUploadUrl(`${user.id}/${booking.id}-receipt`);

    if (uploadError) {
      console.error('Upload URL generation error:', uploadError);
    }

    return NextResponse.json({
      booking,
      upload_url: uploadData?.signedUrl,
      upload_path: uploadData?.path,
    });
  } catch (error) {
    console.error('Booking creation exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/bookings
 * Get bookings for current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role from auth metadata
    const userRole = user.user_metadata?.role || user.app_metadata?.role;

    if (!userRole) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    let query = supabase
      .from('bookings')
      .select(`
        *,
        client:users!client_id(*),
        performer:users!performer_id(*)
      `)
      .order('created_at', { ascending: false });

    // Filter based on role
    if (userRole === 'client') {
      query = query.eq('client_id', user.id);
    } else if (userRole === 'performer') {
      query = query.eq('performer_id', user.id);
    }
    // Admins see all bookings (no filter)

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError) {
      console.error('Bookings fetch error:', bookingsError);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Bookings fetch exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
