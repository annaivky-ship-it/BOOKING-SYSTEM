import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface PayIDTransactionRequest {
  recipient_payid: string;
  amount: number;
  description: string;
  reference?: string;
  booking_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: PayIDTransactionRequest = await request.json();
    const { recipient_payid, amount, description, reference, booking_id } = body;

    // Validate required fields
    if (!recipient_payid || !amount || amount <= 0 || !description) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    // Validate amount limits (Australian PayID limits)
    if (amount > 100000) {
      return NextResponse.json(
        { error: 'Amount exceeds PayID transaction limit (AUD $100,000)' },
        { status: 400 }
      );
    }

    // Get sender's PayID account
    const { data: senderPayID } = await supabase
      .from('payid_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_verified', true)
      .eq('is_active', true)
      .single();

    if (!senderPayID) {
      return NextResponse.json(
        { error: 'No verified PayID account found' },
        { status: 400 }
      );
    }

    // Look up recipient PayID
    const { data: recipientPayID } = await supabase
      .from('payid_accounts')
      .select('*')
      .eq('payid_identifier', recipient_payid)
      .eq('is_verified', true)
      .eq('is_active', true)
      .single();

    if (!recipientPayID) {
      return NextResponse.json(
        { error: 'Recipient PayID not found or not verified' },
        { status: 404 }
      );
    }

    // Create transaction record with cryptographically secure random ID
    const crypto = require('crypto');
    const transactionId = `payid_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;

    const { data: transaction, error: transactionError } = await supabase
      .from('payid_transactions')
      .insert({
        id: transactionId,
        sender_payid_id: senderPayID.id,
        recipient_payid_id: recipientPayID.id,
        amount: amount,
        currency: 'AUD',
        description: description,
        reference: reference || `FE-${Date.now()}`,
        booking_id: booking_id,
        status: 'pending',
        transaction_type: 'payment',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      );
    }

    // Process PayID payment
    const paymentResult = await processPayIDPayment(transaction, senderPayID, recipientPayID);

    // Update transaction status
    const { error: updateError } = await supabase
      .from('payid_transactions')
      .update({
        status: paymentResult.success ? 'completed' : 'failed',
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        failure_reason: paymentResult.success ? null : paymentResult.error,
        external_transaction_id: paymentResult.external_transaction_id
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Transaction update error:', updateError);
    }

    // Update booking payment status if applicable
    if (booking_id && paymentResult.success) {
      await updateBookingPaymentStatus(booking_id, 'paid', transactionId);
    }

    return NextResponse.json({
      success: paymentResult.success,
      transaction_id: transactionId,
      status: paymentResult.success ? 'completed' : 'failed',
      message: paymentResult.success ? 'Payment completed successfully' : paymentResult.error,
      transaction: {
        ...transaction,
        status: paymentResult.success ? 'completed' : 'failed',
        processed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('PayID transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // Get user's PayID accounts
    const { data: payidAccounts } = await supabase
      .from('payid_accounts')
      .select('id')
      .eq('user_id', user.id);

    if (!payidAccounts || payidAccounts.length === 0) {
      return NextResponse.json({
        transactions: [],
        total: 0,
        has_more: false
      });
    }

    const payidAccountIds = payidAccounts.map(account => account.id);

    // Build query - Fixed SQL injection: use multiple queries instead of OR with string interpolation
    const senderQuery = supabase
      .from('payid_transactions')
      .select(`
        *,
        sender_payid:payid_accounts!sender_payid_id(payid_identifier, account_name),
        recipient_payid:payid_accounts!recipient_payid_id(payid_identifier, account_name)
      `)
      .in('sender_payid_id', payidAccountIds);

    const recipientQuery = supabase
      .from('payid_transactions')
      .select(`
        *,
        sender_payid:payid_accounts!sender_payid_id(payid_identifier, account_name),
        recipient_payid:payid_accounts!recipient_payid_id(payid_identifier, account_name)
      `)
      .in('recipient_payid_id', payidAccountIds);

    if (status) {
      senderQuery.eq('status', status);
      recipientQuery.eq('status', status);
    }

    const [senderResult, recipientResult] = await Promise.all([senderQuery, recipientQuery]);

    if (senderResult.error && recipientResult.error) {
      console.error('Transaction fetch error:', senderResult.error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    // Merge and deduplicate results
    const allTransactions = [
      ...(senderResult.data || []),
      ...(recipientResult.data || [])
    ];
    const uniqueTransactions = Array.from(
      new Map(allTransactions.map(t => [t.id, t])).values()
    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Apply pagination manually
    const paginatedTransactions = uniqueTransactions.slice(offset, offset + limit);

    return NextResponse.json({
      transactions: paginatedTransactions,
      total: uniqueTransactions.length,
      has_more: uniqueTransactions.length > offset + limit
    });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processPayIDPayment(transaction: any, senderPayID: any, recipientPayID: any) {
  // TODO: CRITICAL - Implement real PayID/NPP payment processing
  // This must integrate with:
  // 1. PayID Registry for recipient resolution
  // 2. Bank APIs for actual fund transfers
  // 3. NPP (New Payments Platform) for real-time payments
  //
  // DO NOT use in production without implementing actual payment processing
  // Current implementation is a placeholder only

  return {
    success: false,
    error: 'PayID payment processing not yet implemented. Please contact support to set up payment integration.'
  };
}

async function updateBookingPaymentStatus(bookingId: string, status: string, transactionId: string) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    await supabase
      .from('bookings')
      .update({
        payment_status: status,
        payment_method: 'payid',
        payment_transaction_id: transactionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);
  } catch (error) {
    console.error('Booking payment status update error:', error);
  }
}