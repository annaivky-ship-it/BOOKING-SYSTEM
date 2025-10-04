import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface PayIDSetupRequest {
  payid_identifier: string;
  payid_type: 'email' | 'phone' | 'abn';
  account_name: string;
  bank_name: string;
  bsb?: string;
  account_number?: string;
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

    const body: PayIDSetupRequest = await request.json();
    const { payid_identifier, payid_type, account_name, bank_name, bsb, account_number } = body;

    // Validate required fields
    if (!payid_identifier || !payid_type || !account_name || !bank_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate PayID format based on type
    const isValid = validatePayIDFormat(payid_identifier, payid_type);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid PayID format' },
        { status: 400 }
      );
    }

    // Check if PayID already exists
    const { data: existingPayID } = await supabase
      .from('payid_accounts')
      .select('id')
      .eq('payid_identifier', payid_identifier)
      .single();

    if (existingPayID) {
      return NextResponse.json(
        { error: 'PayID already registered' },
        { status: 409 }
      );
    }

    // Create PayID account record
    const { data: payidAccount, error: insertError } = await supabase
      .from('payid_accounts')
      .insert({
        user_id: user.id,
        payid_identifier,
        payid_type,
        account_name,
        bank_name,
        bsb,
        account_number,
        verification_status: 'pending',
        is_verified: false,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('PayID setup error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create PayID account' },
        { status: 500 }
      );
    }

    // Initiate verification process
    const verificationResult = await initiatePayIDVerification(payidAccount);

    return NextResponse.json({
      success: true,
      payid_account: payidAccount,
      verification: verificationResult
    });

  } catch (error) {
    console.error('PayID setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validatePayIDFormat(identifier: string, type: 'email' | 'phone' | 'abn'): boolean {
  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(identifier);

    case 'phone':
      // Australian phone number format
      const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
      return phoneRegex.test(identifier.replace(/\s+/g, ''));

    case 'abn':
      // Australian Business Number format (11 digits)
      const abnRegex = /^\d{11}$/;
      return abnRegex.test(identifier.replace(/\s+/g, ''));

    default:
      return false;
  }
}

async function initiatePayIDVerification(payidAccount: any) {
  // In a real implementation, this would integrate with the PayID Registry
  // For now, we'll simulate the verification process

  try {
    // Simulate API call to PayID Registry for verification
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock verification response
    return {
      verification_id: `verify_${Date.now()}`,
      status: 'pending',
      estimated_completion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      verification_method: payidAccount.payid_type === 'email' ? 'email_verification' :
                          payidAccount.payid_type === 'phone' ? 'sms_verification' : 'document_verification'
    };
  } catch (error) {
    console.error('Verification initiation error:', error);
    throw error;
  }
}