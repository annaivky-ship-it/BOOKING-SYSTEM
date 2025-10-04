import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const PayIDPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  paymentAmount: z.number().positive(),
  paymentReference: z.string().min(1),
  receiptUrl: z.string().url().optional(),
  paymentMethod: z.enum(['payid', 'bank_transfer']),
  transactionId: z.string().optional(),
  payerName: z.string().min(1),
  payerContact: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = PayIDPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid payment data',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const {
      bookingId,
      paymentAmount,
      paymentReference,
      receiptUrl,
      paymentMethod,
      transactionId,
      payerName,
      payerContact
    } = validation.data;

    // Verify booking exists and belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        performer:performers(stage_name, user_id)
      `)
      .eq('id', bookingId)
      .eq('client_id', session.user.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking is in correct status for payment
    if (booking.status !== 'quote_sent') {
      return NextResponse.json(
        { error: 'Booking is not ready for payment' },
        { status: 400 }
      );
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount: paymentAmount,
        payment_type: 'deposit',
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        transaction_id: transactionId,
        receipt_url: receiptUrl,
        status: 'pending_verification',
        payer_name: payerName,
        payer_contact: payerContact,
        payment_date: new Date().toISOString(),
        created_by: session.user.id
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return NextResponse.json(
        { error: 'Failed to record payment' },
        { status: 500 }
      );
    }

    // Update booking status
    const { error: bookingUpdateError } = await supabase
      .from('bookings')
      .update({
        status: 'deposit_pending',
        deposit_amount: paymentAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (bookingUpdateError) {
      console.error('Booking update error:', bookingUpdateError);
      // Note: In production, you might want to implement rollback logic here
    }

    // Create notification for admin
    await supabase
      .from('notifications')
      .insert({
        recipient_id: booking.performer.user_id,
        type: 'payment_received',
        title: 'Payment Received',
        message: `Deposit payment received for booking with ${booking.client_name}`,
        data: {
          bookingId: bookingId,
          paymentId: payment.id,
          amount: paymentAmount
        }
      });

    // Log the payment action
    await supabase
      .from('audit_log')
      .insert({
        user_id: session.user.id,
        action: 'payment_submitted',
        table_name: 'payments',
        record_id: payment.id,
        changes: {
          booking_id: bookingId,
          amount: paymentAmount,
          method: paymentMethod
        }
      });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        reference: payment.payment_reference
      },
      booking: {
        id: booking.id,
        status: 'deposit_pending'
      }
    });

  } catch (error) {
    console.error('PayID payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const bookingId = url.searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      );
    }

    // Get payment status for booking
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('payment_type', 'deposit')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch payment status' },
        { status: 500 }
      );
    }

    const latestPayment = payments?.[0];

    return NextResponse.json({
      paymentStatus: latestPayment?.status || 'not_found',
      payment: latestPayment ? {
        id: latestPayment.id,
        amount: latestPayment.amount,
        status: latestPayment.status,
        paymentDate: latestPayment.payment_date,
        reference: latestPayment.payment_reference
      } : null
    });

  } catch (error) {
    console.error('PayID status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Admin endpoint for verifying payments
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication and admin role
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { paymentId, status, notes } = body;

    if (!paymentId || !['verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid payment verification data' },
        { status: 400 }
      );
    }

    // Update payment status
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: status,
        verification_notes: notes,
        verified_at: status === 'verified' ? new Date().toISOString() : null,
        verified_by: status === 'verified' ? session.user.id : null
      })
      .eq('id', paymentId)
      .select('booking_id')
      .single();

    if (paymentError) {
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      );
    }

    // Update booking status based on payment verification
    const newBookingStatus = status === 'verified' ? 'confirmed' : 'payment_failed';

    await supabase
      .from('bookings')
      .update({
        status: newBookingStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.booking_id);

    // Log the verification
    await supabase
      .from('audit_log')
      .insert({
        user_id: session.user.id,
        action: 'payment_verified',
        table_name: 'payments',
        record_id: paymentId,
        changes: {
          status: status,
          notes: notes
        }
      });

    return NextResponse.json({
      success: true,
      payment: {
        id: paymentId,
        status: status
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}