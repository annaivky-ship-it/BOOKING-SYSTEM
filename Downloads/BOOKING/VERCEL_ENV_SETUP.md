# 🔧 Vercel Environment Variables Setup

## Required Environment Variables for Production

Go to: https://vercel.com/annaivky-ship-its-projects/flavor-entertainers-booking/settings/environment-variables

Add these variables:

### 1. Gemini AI
```
GEMINI_API_KEY=AIzaSyApHSVdhgUlJkLKAo0xaziYb5vYMVYIcqI
```

### 2. Supabase
```
SUPABASE_URL=https://wykwlstsfkiicusjyqiv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5a3dsc3RzZmtpaWN1c2p5cWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMDAyOTQsImV4cCI6MjA3ODU3NjI5NH0.WQ9xDhYbtymSIgwbglXZh3qlENH6pFOUIELc2RaUMvQ
```

### 3. Twilio (SMS/WhatsApp)
```
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
VITE_TWILIO_PHONE_NUMBER=+1234567890
```

**Note:** Get your actual credentials from https://console.twilio.com/

### 4. Admin Contact
```
VITE_ADMIN_WHATSAPP=+61412345678
```

## Steps to Add

1. **Go to Vercel Dashboard:**
   https://vercel.com/annaivky-ship-its-projects/flavor-entertainers-booking/settings/environment-variables

2. **For each variable:**
   - Click "Add New"
   - Enter Key (e.g., `VITE_TWILIO_ACCOUNT_SID`)
   - Enter Value
   - Select "Production" environment
   - Click "Save"

3. **Redeploy:**
   ```bash
   cd C:\Users\annai\Downloads\BOOKING
   vercel --prod
   ```

## Verify Setup

After deploying, test notifications:
1. Create a booking on production site
2. Check if WhatsApp messages are sent
3. Verify SMS to clients works

## Security Notes

- ✅ `.env.local` is in `.gitignore` (never committed)
- ✅ `.env.example` shows structure only (no real values)
- ✅ Vercel environment variables are encrypted
- ⚠️ Never share Auth Token publicly

## Twilio Dashboard

Monitor usage and messages:
https://console.twilio.com/

**Your Twilio Number:** (see Twilio Console)

## WhatsApp Sandbox

To enable WhatsApp notifications:
1. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. Send message to sandbox number: `join your-code`
3. Each performer/admin must join sandbox

See `WHATSAPP_INTEGRATION.md` for full details.
