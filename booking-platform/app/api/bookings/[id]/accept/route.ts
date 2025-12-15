import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { logAction, AuditActions, getRequestMetadata } from '@/lib/audit';
import { notifyClientBookingAccepted } from '@/lib/whatsapp';
import { formatPhoneForWhatsApp } from '@/lib/utils';

/**
 * POST /api/bookings/[id]/accept
 * Performer accepts a booking
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
      return NextResponse.json({ error: 'Only performers can accept bookings' }, { status: 403 });
    }

    // Create profile object for backwards compatibility
    const profile = { full_name: userName, role: userRole };

    // Get booking
    const { data: booking, error: bookingError } = await (serviceClient as any)
      .from('bookings')
      .select(`
        *,
        client:users!client_id(*)
      `)
      .eq('id', bookingId)
      .eq('performer_id', user.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if booking is in correct status
    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Booking must be confirmed before acceptance' },
        { status: 400 }
      );
    }

    // Update booking status
    const { data: updatedBooking, error: updateError } = await (serviceClient as any)
      .from('bookings')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Booking update error:', updateError);
      return NextResponse.json({ error: 'Failed to accept booking' }, { status: 500 });
    }

    // Log the action
    const metadata = getRequestMetadata(request.headers);
    await logAction({
      user_id: user.id,
      action: AuditActions.BOOKING_ACCEPTED,
      resource_type: 'booking',
      resource_id: bookingId,
      details: {
        booking_number: booking.booking_number,
      },
      ...metadata,
    });

    // Notify client
    if (booking.client && booking.client.phone) {
      try {
        const clientPhone = formatPhoneForWhatsApp(booking.client.phone);
        await notifyClientBookingAccepted(
          clientPhone,
          booking.booking_number,
          profile.full_name
        );
      } catch (error) {
        console.error('Failed to send WhatsApp notification:', error);
      }
    }

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Booking acceptance exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
