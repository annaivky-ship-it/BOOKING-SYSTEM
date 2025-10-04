import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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

    // Get user's PayID accounts
    const { data: payidAccounts, error: fetchError } = await supabase
      .from('payid_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('PayID accounts fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch PayID accounts' },
        { status: 500 }
      );
    }

    // Get transaction statistics for each account
    const accountsWithStats = await Promise.all(
      (payidAccounts || []).map(async (account) => {
        const { data: stats } = await supabase
          .from('payid_transactions')
          .select('status, amount')
          .or(`sender_payid_id.eq.${account.id},recipient_payid_id.eq.${account.id}`);

        const totalTransactions = stats?.length || 0;
        const completedTransactions = stats?.filter(t => t.status === 'completed').length || 0;
        const totalAmount = stats?.filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        return {
          ...account,
          transaction_stats: {
            total_transactions: totalTransactions,
            completed_transactions: completedTransactions,
            total_amount: totalAmount,
            success_rate: totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0
          }
        };
      })
    );

    return NextResponse.json({
      accounts: accountsWithStats,
      total: accountsWithStats.length
    });

  } catch (error) {
    console.error('PayID accounts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID required' },
        { status: 400 }
      );
    }

    // Check if account belongs to user
    const { data: account, error: fetchError } = await supabase
      .from('payid_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !account) {
      return NextResponse.json(
        { error: 'PayID account not found' },
        { status: 404 }
      );
    }

    // Check if account has pending transactions
    const { data: pendingTransactions } = await supabase
      .from('payid_transactions')
      .select('id')
      .or(`sender_payid_id.eq.${accountId},recipient_payid_id.eq.${accountId}`)
      .in('status', ['pending', 'processing']);

    if (pendingTransactions && pendingTransactions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete account with pending transactions' },
        { status: 400 }
      );
    }

    // Deactivate account instead of deleting to maintain transaction history
    const { error: updateError } = await supabase
      .from('payid_accounts')
      .update({
        is_active: false,
        verification_status: 'expired',
        updated_at: new Date().toISOString(),
        deactivated_at: new Date().toISOString()
      })
      .eq('id', accountId);

    if (updateError) {
      console.error('PayID account deactivation error:', updateError);
      return NextResponse.json(
        { error: 'Failed to deactivate PayID account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'PayID account deactivated successfully'
    });

  } catch (error) {
    console.error('PayID account deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { account_id, action } = body;

    if (!account_id || !action) {
      return NextResponse.json(
        { error: 'Account ID and action required' },
        { status: 400 }
      );
    }

    // Check if account belongs to user
    const { data: account, error: fetchError } = await supabase
      .from('payid_accounts')
      .select('*')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !account) {
      return NextResponse.json(
        { error: 'PayID account not found' },
        { status: 404 }
      );
    }

    let updateData: any = {
      updated_at: new Date().toISOString()
    };

    switch (action) {
      case 'activate':
        if (!account.is_verified) {
          return NextResponse.json(
            { error: 'Account must be verified before activation' },
            { status: 400 }
          );
        }
        updateData.is_active = true;
        break;

      case 'deactivate':
        updateData.is_active = false;
        break;

      case 'set_primary':
        // First, unset all other accounts as primary
        await supabase
          .from('payid_accounts')
          .update({ is_primary: false })
          .eq('user_id', user.id);

        updateData.is_primary = true;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const { error: updateError } = await supabase
      .from('payid_accounts')
      .update(updateData)
      .eq('id', account_id);

    if (updateError) {
      console.error('PayID account update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update PayID account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `PayID account ${action} successful`
    });

  } catch (error) {
    console.error('PayID account update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}