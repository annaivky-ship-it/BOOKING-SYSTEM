import { NextRequest, NextResponse } from 'next/server';
import { sendSMS, sendWhatsApp, sendAutomatedMessage } from '@/lib/services/twilio';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types/database';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get current user (must be admin to send notifications)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { type, message, to, userId, bookingId, templateKey, variables } = body;

    let result;

    switch (type) {
      case 'sms':
        if (!message || !to) {
          return NextResponse.json({ error: 'Message and phone number required' }, { status: 400 });
        }
        result = await sendSMS({ to, message, userId, bookingId });
        break;

      case 'whatsapp':
        if (!message || !to) {
          return NextResponse.json({ error: 'Message and phone number required' }, { status: 400 });
        }
        result = await sendWhatsApp({ to, message, userId, bookingId });
        break;

      case 'template':
        if (!templateKey || !userId) {
          return NextResponse.json({ error: 'Template key and user ID required' }, { status: 400 });
        }
        result = await sendAutomatedMessage(templateKey, userId, variables || {}, user.id, bookingId);
        break;

      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        twilioSid: result.twilioSid
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Notifications API active',
    supportedTypes: ['sms', 'whatsapp', 'template'],
    timestamp: new Date().toISOString()
  });
}