import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface PayIDVerificationRequest {
  payid_account_id: string;
  verification_code?: string;
  verification_method: 'email_verification' | 'sms_verification' | 'document_verification';
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

    const body: PayIDVerificationRequest = await request.json();
    const { payid_account_id, verification_code, verification_method } = body;

    // Get PayID account
    const { data: payidAccount, error: fetchError } = await supabase
      .from('payid_accounts')
      .select('*')
      .eq('id', payid_account_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !payidAccount) {
      return NextResponse.json(
        { error: 'PayID account not found' },
        { status: 404 }
      );
    }

    if (payidAccount.verification_status === 'verified') {
      return NextResponse.json(
        { error: 'PayID already verified' },
        { status: 400 }
      );
    }

    // Verify based on method
    let verificationResult;
    switch (verification_method) {
      case 'email_verification':
      case 'sms_verification':
        verificationResult = await verifyCode(payidAccount, verification_code);
        break;
      case 'document_verification':
        verificationResult = await processDocumentVerification(payidAccount);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid verification method' },
          { status: 400 }
        );
    }

    if (verificationResult.success) {
      // Update PayID account status
      const { error: updateError } = await supabase
        .from('payid_accounts')
        .update({
          verification_status: 'verified',
          is_verified: true,
          is_active: true,
          updated_at: new Date().toISOString(),
          verified_at: new Date().toISOString()
        })
        .eq('id', payid_account_id);

      if (updateError) {
        console.error('Verification update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update verification status' },
          { status: 500 }
        );
      }

      // Log verification event
      await logPayIDEvent(payidAccount.id, 'verified', {
        verification_method,
        verified_at: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        message: 'PayID verified successfully',
        verification_result: verificationResult
      });
    } else {
      return NextResponse.json({
        success: false,
        error: verificationResult.error || 'Verification failed'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('PayID verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function verifyCode(payidAccount: any, code?: string): Promise<{ success: boolean; error?: string }> {
  if (!code) {
    return { success: false, error: 'Verification code required' };
  }

  // In a real implementation, this would verify against the PayID Registry
  // For demo purposes, we'll accept a specific code
  const validCodes = ['123456', '000000', 'test123'];

  if (validCodes.includes(code)) {
    return { success: true };
  } else {
    return { success: false, error: 'Invalid verification code' };
  }
}

async function processDocumentVerification(payidAccount: any): Promise<{ success: boolean; error?: string }> {
  // In a real implementation, this would process uploaded documents
  // For demo purposes, we'll simulate automatic approval

  try {
    // Simulate document processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Document verification failed' };
  }
}

async function logPayIDEvent(payidAccountId: string, eventType: string, metadata: any) {
  // This would log events to an audit table
  console.log('PayID Event:', {
    payid_account_id: payidAccountId,
    event_type: eventType,
    metadata,
    timestamp: new Date().toISOString()
  });
}