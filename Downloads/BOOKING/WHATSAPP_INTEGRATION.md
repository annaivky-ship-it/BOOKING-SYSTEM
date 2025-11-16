# 📱 WhatsApp Business Integration Guide

## Overview

Your platform uses a **hybrid notification system**:
- 💚 **WhatsApp** → Internal (Performers & Admins)
- 💬 **SMS** → External (Clients)

This is more professional and cost-effective!

---

## 🎯 Notification Flow

### When a booking is created:

1. **Client** receives **SMS** confirmation (professional, reliable)
2. **Performer** receives **WhatsApp** notification (instant, free)
3. **Admin** receives **WhatsApp** alert (instant, free)

### Why this approach?

✅ **WhatsApp for internal:**
- Free messaging (no per-message cost)
- Rich formatting (bold, italics)
- Read receipts
- Instant delivery
- Group chat capability
- Media support (images, PDFs)

✅ **SMS for clients:**
- Professional appearance
- No app required
- Universal delivery
- Higher open rates
- Better for first contact

---

## 🚀 Quick Setup (20 minutes)

### Step 1: Set Up Twilio WhatsApp Sandbox

1. **Go to Twilio Console:**
   https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

2. **Activate WhatsApp Sandbox:**
   - Click "Try it Out" → "Send a WhatsApp Message"
   - You'll see a sandbox number (e.g., +1 415 523 8886)
   - You'll see a join code (e.g., "join abc-def")

3. **Join the Sandbox (for each performer/admin):**
   - Open WhatsApp on your phone
   - Send a message to the sandbox number: `join your-code-here`
   - You'll receive a confirmation: "You are all set!"

**Example:**
```
To: +1 415 523 8886
Message: join flavor-show
```

---

### Step 2: Configure Environment Variables

Add to `.env.local`:

```bash
# Twilio Configuration
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here

# For WhatsApp - use Twilio sandbox number
VITE_TWILIO_PHONE_NUMBER=+14155238886

# Admin WhatsApp (your number in +61 format)
VITE_ADMIN_WHATSAPP=+61412345678
```

**For Production (Vercel):**
Add the same variables in:
https://vercel.com/annaivky-ship-its-projects/flavor-entertainers-booking/settings/environment-variables

---

### Step 3: Configure Performer Phone Numbers

In your Supabase database, ensure performer phone numbers are formatted correctly:

```sql
-- Update performer phone numbers to WhatsApp format
UPDATE performers
SET phone = '+61412345678'  -- Australian mobile format
WHERE id = 5;

-- Verify
SELECT id, name, phone FROM performers;
```

**Important:** Each performer must:
1. Join the WhatsApp sandbox (send `join your-code`)
2. Have their number in database as `+61xxxxxxxxx`

---

### Step 4: Test WhatsApp Notifications

1. **Make sure you've joined the sandbox:**
   ```
   To: +1 415 523 8886
   Message: join flavor-show
   ```

2. **Create a test booking:**
   - Go to http://localhost:3000
   - Select a performer
   - Complete booking

3. **Check WhatsApp:**
   - Performer should receive formatted message
   - Admin should receive alert
   - Client gets SMS (not WhatsApp)

---

## 📱 WhatsApp Message Examples

### Performer Notification (WhatsApp)

```
🎭 *NEW BOOKING REQUEST!*

*Booking ID:* B-12345
*Client:* Sarah Williams
*Service:* Hot Cream Show
*Date:* 2025-11-25
*Time:* 8:00 PM
*Location:* Perth South
*Payment:* $450

Login to your dashboard to accept or decline:
https://flavor-entertainers-booking-jrtisfjkq.vercel.app

_- Flavor Entertainers_
```

### Admin Alert (WhatsApp)

```
🔔 *ADMIN ALERT: New Booking*

*Booking #B-12346*
*Client:* Michael Chen
*Performer:* April Flavor
*Amount:* $600

Review at: https://flavor-entertainers-booking-jrtisfjkq.vercel.app/admin
```

### Client Confirmation (SMS)

```
✅ BOOKING CONFIRMED!

Hi Sarah,

Your booking with April Flavor is confirmed!

Service: Hot Cream Show
Date: 2025-11-25
Time: 8:00 PM
Location: Perth South
Total: $450

Booking ID: B-12346

View details: https://flavor-entertainers-booking-jrtisfjkq.vercel.app

Thank you for choosing Flavor Entertainers! 🎉
```

---

## 💰 Cost Comparison

### WhatsApp (via Twilio):
- **Sandbox (Testing):** FREE unlimited messages
- **Production:** $0.005 USD per message (~$0.008 AUD)
- **95% cheaper than SMS!**

### SMS (for clients):
- **Australia:** $0.12 AUD per message

### Example Monthly Cost:
**50 bookings/month:**
- 50 client SMS: 50 × $0.12 = **$6 AUD**
- 100 WhatsApp (performer + admin): 100 × $0.008 = **$0.80 AUD**
- **Total: $6.80 AUD** vs $18 AUD (all SMS)

**Savings: 62%!**

---

## 🚀 Production Setup (WhatsApp Business API)

For production, upgrade from sandbox to official WhatsApp Business API:

### Option 1: Twilio WhatsApp Business (Recommended)

1. **Apply for WhatsApp Business API:**
   https://www.twilio.com/whatsapp

2. **Requirements:**
   - Business verification
   - Facebook Business Manager account
   - Approval process (2-3 weeks)

3. **Benefits:**
   - Your own business number
   - No sandbox restrictions
   - Custom sender name
   - Higher rate limits

4. **Cost:**
   - Hosting: $15/month
   - Messages: $0.005 per message

### Option 2: Keep Sandbox (Quick Start)

For now, you can keep using sandbox:
- Free unlimited messages
- Works perfectly for testing
- All performers/admins join sandbox
- Upgrade later when needed

---

## 🔧 Advanced Features

### 1. Rich Media Messages

Send images with bookings:

```typescript
await client.messages.create({
  body: 'New booking confirmed!',
  from: `whatsapp:${twilioPhoneNumber}`,
  to: `whatsapp:${performer.phone}`,
  mediaUrl: ['https://yourdomain.com/performer-photo.jpg']
});
```

### 2. Interactive Buttons (WhatsApp Business API only)

```typescript
await client.messages.create({
  from: `whatsapp:${twilioPhoneNumber}`,
  to: `whatsapp:${performer.phone}`,
  contentSid: 'HX...',  // Template ID
  contentVariables: JSON.stringify({
    1: bookingId,
    2: clientName
  })
});
```

### 3. Group Notifications

Create admin group:
```typescript
const adminGroup = '+1234567890'; // WhatsApp group ID
await notifyAdminNewBooking(adminGroup, ...);
```

---

## 📊 Monitoring

### Track WhatsApp Delivery

**Twilio Console:**
https://console.twilio.com/monitor/logs/whatsapp

**Check:**
- Delivery status
- Read receipts (if enabled)
- Error messages
- Response times

### Common Status Codes:
- `delivered` - Message delivered to WhatsApp
- `read` - Message read by recipient
- `failed` - Delivery failed (check number format)
- `undelivered` - User not in sandbox

---

## 🐛 Troubleshooting

### WhatsApp message not received

**Check:**
1. Recipient joined sandbox: `join your-code`
2. Phone number format: `+61xxxxxxxxx`
3. Twilio credentials correct
4. WhatsApp installed on recipient's phone

**Debug:**
```typescript
// Check if number is in sandbox
// Go to Twilio Console → WhatsApp Sandbox
// See list of joined numbers
```

### "User is not subscribed to sandbox"

**Solution:** Recipient needs to send `join your-code` to sandbox number

### Invalid format error

**Solution:** Use `formatPhoneNumber()`:
```typescript
import { formatPhoneNumber } from './services/twilioService';
const phone = formatPhoneNumber('0412345678'); // +61412345678
```

---

## ✅ Setup Checklist

### For Testing (Sandbox):
- [ ] Create Twilio account
- [ ] Activate WhatsApp sandbox
- [ ] Get sandbox join code
- [ ] Join sandbox on your phone
- [ ] Add each performer/admin to sandbox
- [ ] Configure environment variables
- [ ] Test booking notification
- [ ] Verify WhatsApp received

### For Production:
- [ ] Apply for WhatsApp Business API
- [ ] Complete business verification
- [ ] Get approved number
- [ ] Update environment variables
- [ ] Test production notifications
- [ ] Train performers on system
- [ ] Monitor delivery rates

---

## 🎯 Best Practices

### 1. Onboarding Performers

Send them:
```
Welcome to Flavor Entertainers!

To receive booking notifications:
1. Save this number: +1 415 523 8886
2. Send message: "join flavor-show"
3. You'll get confirmation
4. Test booking will follow

Questions? Contact admin.
```

### 2. Message Templates

Keep messages:
- ✅ Under 1600 characters
- ✅ Clear and actionable
- ✅ Include booking ID
- ✅ Provide dashboard link
- ✅ Professional tone

### 3. Backup SMS

If WhatsApp fails, fall back to SMS:

```typescript
try {
  await notifyPerformerNewBooking(notification); // WhatsApp
} catch (error) {
  await sendSMSFallback(notification); // SMS backup
}
```

---

## 📞 Support Resources

**Twilio WhatsApp Docs:**
https://www.twilio.com/docs/whatsapp

**Sandbox Guide:**
https://www.twilio.com/docs/whatsapp/sandbox

**Business API:**
https://www.twilio.com/whatsapp/api

**Pricing:**
https://www.twilio.com/whatsapp/pricing

---

## 🎊 Summary

**What's Working:**
- ✅ WhatsApp for performers (instant, free)
- ✅ WhatsApp for admins (instant, free)
- ✅ SMS for clients (professional, reliable)
- ✅ Rich formatting with markdown
- ✅ Cost savings of 62%

**Next Steps:**
1. Join WhatsApp sandbox
2. Add performers to sandbox
3. Test booking notification
4. Monitor delivery for first week
5. Upgrade to Business API when ready

**Your hybrid notification system is configured and ready! 📱💚**
