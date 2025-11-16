# 📱 Twilio SMS Integration Setup Guide

## Overview

Your booking platform now has SMS notification support via Twilio! This enables:
- ✅ Notify performers of new booking requests
- ✅ Confirm bookings with clients
- ✅ Send booking reminders 24h before events
- ✅ Payment confirmations
- ✅ Admin alerts for new bookings
- ✅ Rejection notifications

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Create Twilio Account

1. **Sign up for Twilio:**
   - Go to: https://www.twilio.com/try-twilio
   - Sign up for a free account
   - Verify your email and phone number

2. **Get $15 free credit** to test SMS

3. **Complete setup wizard** (choose SMS as your product)

---

### Step 2: Get Your Credentials

1. **Go to Twilio Console:**
   https://console.twilio.com/

2. **Copy these values:**
   - **Account SID:** (looks like: `ACxxxxxxxxxxxxxxxxxxxx`)
   - **Auth Token:** Click "Show" and copy

3. **Get a Phone Number:**
   - Click "Get a Trial Number" or "Buy a Number"
   - For Australia: Choose a number starting with +61
   - Copy your new number (format: `+61xxxxxxxxx`)

---

### Step 3: Configure Environment Variables

#### For Local Development:

Add to `.env.local`:

```bash
# Twilio Configuration
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_TWILIO_PHONE_NUMBER=+61xxxxxxxxx
```

#### For Production (Vercel):

1. **Go to Vercel Dashboard:**
   https://vercel.com/annaivky-ship-its-projects/flavor-entertainers-booking/settings/environment-variables

2. **Add these environment variables:**
   - `VITE_TWILIO_ACCOUNT_SID` = Your Account SID
   - `VITE_TWILIO_AUTH_TOKEN` = Your Auth Token
   - `VITE_TWILIO_PHONE_NUMBER` = Your Twilio number (e.g., +61412345678)

3. **Select "Production" environment**

4. **Click "Save"**

5. **Redeploy:**
   ```bash
   cd C:\Users\annai\Downloads\BOOKING
   vercel --prod
   ```

---

### Step 4: Test SMS Integration

1. **Update your local `.env.local`** with Twilio credentials

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Make a test booking:**
   - Go to http://localhost:3000
   - Select a performer and service
   - Enter your phone number (format: 04xx xxx xxx)
   - Complete booking

4. **Check your phone** for SMS notification!

---

## 📋 SMS Notification Types

### 1. New Booking Alert (to Performer)
**Sent when:** Client creates a new booking

**Contains:**
- Booking ID
- Client name
- Service details
- Date, time, location
- Payment amount
- Link to dashboard

**Example:**
```
🎭 NEW BOOKING REQUEST!

Booking ID: B-12345
Client: John Smith
Service: Topless Waitress
Date: 2025-11-20
Time: 7:00 PM
Location: Perth North
Payment: $400

Login to your dashboard to accept or decline:
https://flavor-entertainers-booking-jrtisfjkq.vercel.app

- Flavor Entertainers
```

---

### 2. Booking Confirmation (to Client)
**Sent when:** Performer accepts booking

**Contains:**
- Confirmation message
- Performer name
- Service details
- Booking ID
- Dashboard link

**Example:**
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

### 3. Booking Reminder (24h before)
**Sent when:** 24 hours before booking

**Contains:**
- Reminder message
- All booking details
- Excitement message

**Example:**
```
⏰ BOOKING REMINDER

Hi Michael,

Your booking is tomorrow!

Performer: Scarlett
Service: Lingerie Waitress
Date: 2025-11-18
Time: 6:30 PM
Location: Fremantle

Looking forward to seeing you! 🎉

- Flavor Entertainers
```

---

### 4. Payment Confirmation
**Sent when:** Payment received

**Contains:**
- Payment amount
- Booking ID
- Receipt link

**Example:**
```
💰 PAYMENT RECEIVED

Hi Lisa,

We've received your payment of $320 for booking #B-12347.

Your booking is now fully confirmed!

Receipt available at: https://flavor-entertainers-booking-jrtisfjkq.vercel.app

Thank you! 🎉

- Flavor Entertainers
```

---

### 5. Admin Alert
**Sent when:** New booking created

**Contains:**
- Quick booking summary
- Admin dashboard link

**Example:**
```
🔔 ADMIN ALERT: New Booking

Booking #B-12348
Client: Emma Wilson
Performer: Jasmine
Amount: $600

Review at: https://flavor-entertainers-booking-jrtisfjkq.vercel.app/admin
```

---

## 🔧 Integration Points

SMS notifications are automatically triggered from:

### In `services/api.ts`:

```typescript
import twilioService from './twilioService';

// After creating booking
await twilioService.notifyPerformerNewBooking({
  to: performer.phone,
  bookingId: newBooking.id,
  clientName: booking.clientName,
  performerName: performer.name,
  service: selectedService.name,
  date: booking.date,
  time: booking.time,
  location: booking.location,
  totalCost: booking.totalCost
});

// After performer accepts
await twilioService.notifyClientBookingConfirmed({
  to: client.phone,
  // ... booking details
});

// After payment
await twilioService.notifyPaymentReceived(
  client.phone,
  client.name,
  amount,
  bookingId
);
```

---

## 📞 Phone Number Formatting

The service automatically formats Australian phone numbers:

```typescript
import { formatPhoneNumber } from './services/twilioService';

// Converts these:
formatPhoneNumber('0412345678')  // → '+61412345678'
formatPhoneNumber('04 1234 5678') // → '+61412345678'
formatPhoneNumber('+61412345678') // → '+61412345678'
```

---

## 💰 Pricing

### Twilio SMS Costs (Australia):
- **Outbound SMS:** ~$0.12 AUD per message
- **Inbound SMS:** ~$0.02 AUD per message
- **Free trial credit:** $15 USD (~200 messages)

### Estimated Monthly Costs:
- **10 bookings/month:** ~$3 AUD (2 SMS per booking)
- **50 bookings/month:** ~$15 AUD
- **100 bookings/month:** ~$30 AUD

**Note:** Trial accounts can only send to verified numbers. Upgrade to paid account ($20 USD minimum) to send to any number.

---

## 🔐 Security Best Practices

### Environment Variables
✅ **DO:**
- Store credentials in `.env.local` (never commit!)
- Use Vercel environment variables for production
- Keep Auth Token secret

❌ **DON'T:**
- Commit credentials to Git
- Share Auth Token publicly
- Hardcode credentials in code

### Rate Limiting
Consider implementing:
- Max 5 SMS per booking
- Cooldown between notifications
- Prevent spam/abuse

---

## 🧪 Testing

### Test Mode (Free)

1. **Verify test phone numbers** in Twilio Console
2. **Send test SMS** to verified numbers only
3. **Check Twilio logs** for delivery status

### Production Mode

1. **Upgrade Twilio account** ($20 minimum)
2. **Enable international SMS** if needed
3. **Monitor usage** in Twilio Console
4. **Set up billing alerts**

---

## 🐛 Troubleshooting

### SMS not sending
**Check:**
1. Twilio credentials are correct
2. Phone number format is valid (+61...)
3. Trial account has credit remaining
4. Recipient number is verified (trial mode)

**Debug:**
```typescript
import { isTwilioConfigured } from './services/twilioService';

if (isTwilioConfigured()) {
  console.log('✅ Twilio configured');
} else {
  console.log('❌ Twilio not configured');
}
```

### Invalid phone number error
**Solution:** Use `formatPhoneNumber()` to ensure correct format

### Delivery failed
**Check Twilio logs:**
1. Go to: https://console.twilio.com/monitor/logs/sms
2. Find failed message
3. Check error code and description

---

## 🚀 Advanced Features

### Custom Message Templates
Edit templates in `twilioService.ts`:

```typescript
const message = `
🎭 YOUR CUSTOM MESSAGE

${booking.details}

- Your Brand
`.trim();
```

### Scheduled Reminders
Use cron jobs or Vercel Cron to send reminders:

```typescript
// Check bookings 24h from now
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

// Send reminders
for (const booking of upcomingBookings) {
  await twilioService.sendBookingReminder({
    // ... booking details
  });
}
```

### Two-Way SMS
Enable clients to respond via SMS:
1. Configure webhook in Twilio Console
2. Point to your API endpoint
3. Process incoming messages

---

## 📊 Monitoring

### Track SMS Usage
- **Twilio Console:** https://console.twilio.com/monitor/logs/sms
- **View sent messages:** Last 30 days
- **Check delivery status:** Delivered, Failed, Queued
- **Monitor costs:** Billing dashboard

### Analytics
Track in your app:
- SMS sent per booking
- Delivery success rate
- Response times
- Cost per customer

---

## ✅ Setup Checklist

- [ ] Create Twilio account
- [ ] Get Account SID, Auth Token, Phone Number
- [ ] Add credentials to `.env.local`
- [ ] Add credentials to Vercel environment variables
- [ ] Test SMS locally
- [ ] Deploy to production
- [ ] Verify production SMS
- [ ] Set up billing alerts
- [ ] Monitor first 10 bookings
- [ ] Upgrade account if needed

---

## 🎯 Next Steps

1. **Complete Twilio setup** using this guide
2. **Test with a real booking** on localhost
3. **Deploy to production:** `vercel --prod`
4. **Verify production SMS** with test booking
5. **Monitor usage** in Twilio Console
6. **Customize message templates** as needed

---

## 📞 Support

**Twilio Support:**
- Documentation: https://www.twilio.com/docs/sms
- Support: https://support.twilio.com

**Platform Support:**
- See `DEPLOYMENT_COMPLETE.md` for deployment help
- Check `QUICK_REFERENCE.md` for API details

---

**SMS integration complete! Your platform can now send professional notifications to clients and performers! 📱**
