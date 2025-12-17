
// Follow this setup guide to integrate the Deno runtime for Supabase Edge Functions.
// https://supabase.com/docs/guides/functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Instructions:
// 1. Add your Twilio credentials to Supabase secrets:
//    supabase secrets set TWILIO_ACCOUNT_SID=your_sid
//    supabase secrets set TWILIO_AUTH_TOKEN=your_token
//    supabase secrets set TWILIO_PHONE_NUMBER=+1234567890 (Your bought SMS number)
//    supabase secrets set TWILIO_WHATSAPP_NUMBER=+14155238886 (Twilio Sandbox or approved number)

const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')!;
const smsNumber = Deno.env.get('TWILIO_PHONE_NUMBER')!;
const whatsappNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER')!;

// Simple helper to encode body for form-data
const urlEncodeBody = (params: Record<string, string>) => {
  return Object.keys(params)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
    .join('&');
};

serve(async (req) => {
  const { to, body, channel } = await req.json();

  if (!to || !body || !channel) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
  }

  const isWhatsapp = channel === 'whatsapp';
  const from = isWhatsapp ? `whatsapp:${whatsappNumber}` : smsNumber;
  const toAddress = isWhatsapp ? `whatsapp:${to}` : to;

  // We manually fetch because 'twilio' node package isn't fully Deno compatible by default
  // or requires more complex import mapping. Using fetch is lighter for Edge Functions.
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  try {
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
      },
      body: urlEncodeBody({
        From: from,
        To: toAddress,
        Body: body,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
    }

    return new Response(
      JSON.stringify({ success: true, sid: data.sid }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
})
