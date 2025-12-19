# 📱 Twilio SMS/WhatsApp Setup Guide

This guide will help you set up SMS and WhatsApp notifications for the Flavor Entertainers platform.

---

## ✅ Twilio Credentials Added

Your Twilio credentials have been configured:

- **Account SID**: `ACbe4fe93cad91172d1836bf0b1df21f9c`
- **Auth Token**: `00672b1766bef11e4d4cf8dc449c4bce`
- **Phone Number**: `+15088826327`

These are already in `.env.local` for local development.

---

## 🚀 Setup Steps

### Step 1: Add to Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add these variables:

```env
TWILIO_ACCOUNT_SID=ACbe4fe93cad91172d1836bf0b1df21f9c
TWILIO_AUTH_TOKEN=00672b1766bef11e4d4cf8dc449c4bce
TWILIO_PHONE_NUMBER=+15088826327
```

3. Apply to: **Production, Preview, Development**
4. **Redeploy** your application

### Step 2: Set Supabase Edge Function Secrets

The Twilio integration uses a Supabase Edge Function to securely send messages. You need to add the credentials as Supabase secrets.

#### Option A: Using Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **Edge Functions** → **Secrets**
3. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `TWILIO_ACCOUNT_SID` | `ACbe4fe93cad91172d1836bf0b1df21f9c` |
| `TWILIO_AUTH_TOKEN` | `00672b1766bef11e4d4cf8dc449c4bce` |
| `TWILIO_PHONE_NUMBER` | `+15088826327` |
| `TWILIO_WHATSAPP_NUMBER` | `+14155238886` (Twilio Sandbox) |

#### Option B: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Set Twilio secrets
supabase secrets set TWILIO_ACCOUNT_SID=ACbe4fe93cad91172d1836bf0b1df21f9c
supabase secrets set TWILIO_AUTH_TOKEN=00672b1766bef11e4d4cf8dc449c4bce
supabase secrets set TWILIO_PHONE_NUMBER=+15088826327
supabase secrets set TWILIO_WHATSAPP_NUMBER=+14155238886
```

### Step 3: Deploy Edge Function

The Edge Function is located at `supabase/functions/send-message/index.ts`

#### Deploy to Supabase:

```bash
# If using Supabase CLI
supabase functions deploy send-message
```

Or manually:
1. Go to **Edge Functions** in Supabase dashboard
2. Click **Create Function**
3. Name: `send-message`
4. Copy contents from `supabase/functions/send-message/index.ts`
5. Click **Deploy**

---

## 📲 WhatsApp Setup (Optional but Recommended)

### Twilio WhatsApp Sandbox (For Testing)

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Follow the instructions to join the sandbox
4. Sandbox number: `+14155238886` (already configured)
5. Test by sending "join [your-sandbox-code]" to the sandbox number

### Production WhatsApp (When Ready)

For production WhatsApp:
1. Apply for WhatsApp Business API access
2. Get your WhatsApp-enabled number approved
3. Update `TWILIO_WHATSAPP_NUMBER` secret with your approved number

---

## 🧪 Test the Integration

### Test 1: Create a Booking

1. Go to your deployed app
2. Browse performers and create a booking
3. Check your phone for SMS notification
4. Check server logs for Edge Function execution

### Test 2: Check Edge Function Logs

1. Go to Supabase → **Edge Functions** → `send-message`
2. Click **Logs** tab
3. Create a booking and watch logs update
4. Verify successful Twilio API calls

### Test 3: Manual Test via curl

```bash
# Test the Edge Function directly
curl -X POST \
  'https://your-project.supabase.co/functions/v1/send-message' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "+15088826327",
    "body": "Test message from Flavor Entertainers!",
    "channel": "sms"
  }'
```

---

## 📧 What Gets Sent

### Client Notifications (SMS)

1. **Request Received**
   - Sent when booking is created
   - "Thanks for your request..."

2. **Performer Accepted**
   - Sent when performer accepts
   - "Great news! [Performer] is available..."

3. **Deposit Needed**
   - Sent when admin approves
   - "Booking Approved! Please pay deposit..."

4. **Booking Confirmed**
   - Sent when deposit is verified
   - "CONFIRMED! Your booking with [Performer]..."

5. **Booking Rejected**
   - Sent if booking is declined
   - "Unfortunately, we cannot proceed..."

### Performer Notifications (WhatsApp)

1. **New Request**
   - "🍑 NEW GIG REQUEST..."
   - Includes client name, date, event type

2. **Booking Confirmed**
   - "✅ BOOKING CONFIRMED..."
   - Includes full event details and address

### Admin Notifications (WhatsApp)

1. **New Request**
   - "📥 New Request..."

2. **Performer Accepted**
   - "⚠️ Action Required..."
   - Prompts admin to vet client

3. **Deposit Paid**
   - "💰 Deposit Submitted..."
   - Prompts admin to verify receipt

4. **Auto-Rejected**
   - "🚫 BLOCKED ATTEMPT..."
   - Client on do-not-serve list

---

## 🔧 Configuration

### Update Admin WhatsApp Number

In `services/twilioService.ts`, update the admin number:

```typescript
const ADMIN_WHATSAPP = '+15088826327'; // Your admin WhatsApp number
```

### Customize Message Templates

Edit messages in `services/twilioService.ts`:

```typescript
export const twilioService = {
  notifyClientRequestReceived: async (booking: Booking) => {
    const msg = `Your custom message here...`;
    await callEdgeFunction(booking.client_phone, msg, 'sms');
  },
  // ... other methods
};
```

---

## 💰 Pricing (Twilio)

### SMS Costs (Approximate)
- **Outbound SMS (US)**: $0.0079 per message
- **Outbound SMS (International)**: $0.05 - $0.30 per message

### WhatsApp Costs
- **Business-Initiated**: $0.005 - $0.01 per message
- **User-Initiated**: Free for 24 hours after user message

### Monthly Estimate
- 100 bookings/month = ~300 messages
- Cost: ~$2.50 - $5/month for SMS
- Cost: ~$1.50 - $3/month for WhatsApp

---

## 🐛 Troubleshooting

### "Edge Function Not Found"

**Problem**: The Edge Function hasn't been deployed

**Solution**:
1. Deploy the function from Supabase dashboard
2. Or use CLI: `supabase functions deploy send-message`

### "Missing Twilio Credentials"

**Problem**: Secrets not set in Supabase

**Solution**:
1. Check Supabase → **Edge Functions** → **Secrets**
2. Verify all 4 Twilio secrets are set
3. Redeploy the Edge Function after adding secrets

### "Invalid Phone Number"

**Problem**: Phone number format incorrect

**Solution**:
- Use E.164 format: `+15088826327`
- Include country code (+1 for US)
- No spaces or special characters

### "WhatsApp Not Delivering"

**Problem**: WhatsApp sandbox not joined or production number not approved

**Solution**:
- For testing: Join Twilio WhatsApp sandbox
- For production: Apply for WhatsApp Business API approval
- Check Twilio logs for delivery status

### Messages Not Sending (No Errors)

**Problem**: Running in demo mode

**Solution**:
1. Check browser console - messages logged there in demo mode
2. Verify Supabase connection (should not see "Running in DEMO mode")
3. Check Edge Function is deployed and accessible

---

## 📊 Monitor Usage

### Twilio Console

1. Go to [Twilio Console](https://console.twilio.com/)
2. **Monitor** → **Logs** → **Messages**
3. View all sent messages
4. Check delivery status
5. Monitor costs

### Supabase Logs

1. Go to **Edge Functions** → `send-message` → **Logs**
2. View function invocations
3. Check for errors
4. Monitor performance

---

## ✅ Setup Complete!

Your Twilio integration is now configured for:

- ✅ SMS notifications to clients
- ✅ WhatsApp notifications to performers
- ✅ WhatsApp notifications to admin
- ✅ Automatic booking workflow notifications
- ✅ Do-not-serve list alerts

**Next Steps:**
1. Add secrets to Vercel environment variables
2. Add secrets to Supabase Edge Functions
3. Deploy the Edge Function
4. Test with a real booking
5. Monitor Twilio console for delivery

---

## 📚 Additional Resources

- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [Twilio WhatsApp Documentation](https://www.twilio.com/docs/whatsapp)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Secrets Management](https://supabase.com/docs/guides/functions/secrets)

---

**Your Twilio integration is ready! 📱**
