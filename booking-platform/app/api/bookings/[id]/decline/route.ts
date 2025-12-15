import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { declineBookingSchema } from '@/lib/validators';
import { logAction, AuditActions, getRequestMetadata } from '@/lib/audit';
import { notifyAdminBookingDeclined } from '@/lib/whatsapp';

/**
 * POST /api/bookings/[id]/decline
 * Performer declines a booking
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
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
    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Performer';

    if (userRole !== 'performer') {
      return NextResponse.json({ error: 'Only performers can decline bookings' }, { status: 403 });
    }

    // Create profile object for backwards compatibility
    const profile = { full_name: userName, role: userRole };

    // Parse request body
    const body = await request.json();
    const validationResult = declineBookingSchema.safeParse({
      booking_id: bookingId,
      reason: body.reason,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Get booking
    const { data: booking, error: bookingError } = await (serviceClient as any)
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('performer_id', user.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if booking can be declined
    if (!['confirmed', 'payment_verified'].includes(booking.status)) {
      return NextResponse.json(
        { error: 'Booking cannot be declined in current status' },
        { status: 400 }
      );
    }

    // Update booking status
    const { data: updatedBooking, error: updateError } = await (serviceClient as any)
      .from('bookings')
      .update({
        status: 'declined',
        declined_at: new Date().toISOString(),
        cancellation_reason: body.reason || null,
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Booking update error:', updateError);
      return NextResponse.json({ error: 'Failed to decline booking' }, { status: 500 });
    }

    // Log the action
    const metadata = getRequestMetadata(request.headers);
    await logAction({
      user_id: user.id,
      action: AuditActions.BOOKING_DECLINED,
      resource_type: 'booking',
      resource_id: bookingId,
      details: {
        booking_number: booking.booking_number,
        reason: body.reason,
      },
      ...metadata,
    });

    // Notify admin
    try {
      await notifyAdminBookingDeclined(booking.booking_number, profile.full_name);
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
    }

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Booking decline exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
