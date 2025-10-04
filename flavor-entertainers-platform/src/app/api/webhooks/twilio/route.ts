import { NextRequest, NextResponse } from 'next/server';
import { handleTwilioWebhook } from '@/lib/services/twilio';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Webhook endpoint for Twilio message status updates
 * This endpoint receives delivery status updates for SMS and WhatsApp messages
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse form data from Twilio webhook
    const formData = await request.formData();
    const webhookData: any = {};

    for (const [key, value] of formData.entries()) {
      webhookData[key] = value;
    }

    // Verify webhook signature for security
    if (process.env.TWILIO_AUTH_TOKEN) {
      const signature = request.headers.get('x-twilio-signature');
      const url = request.url;
      const body = new URLSearchParams(webhookData).toString();

      if (signature && !verifyTwilioSignature(signature, url, body)) {
        console.error('Invalid Twilio webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Handle the webhook
    await handleTwilioWebhook(webhookData);

    // Log successful webhook
    const processingTime = Date.now() - startTime;
    await supabase.from('webhook_logs').insert({
      webhook_type: 'twilio',
      endpoint: '/api/webhooks/twilio',
      method: 'POST',
      headers: Object.fromEntries(request.headers.entries()),
      payload: webhookData,
      response_status: 200,
      processing_time_ms: processingTime
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Twilio webhook error:', error);

    // Log error
    const processingTime = Date.now() - startTime;
    await supabase.from('webhook_logs').insert({
      webhook_type: 'twilio',
      endpoint: '/api/webhooks/twilio',
      method: 'POST',
      headers: Object.fromEntries(request.headers.entries()),
      response_status: 500,
      error_message: error.message,
      processing_time_ms: processingTime
    });

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'Twilio webhook endpoint active',
    timestamp: new Date().toISOString()
  });
}

/**
 * Verify Twilio webhook signature for security
 */
function verifyTwilioSignature(signature: string, url: string, body: string): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;

  const expectedSignature = crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(url + body, 'utf-8'))
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}