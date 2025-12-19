# 🚀 Deploy Your Platform NOW - Complete Guide

Your Flavor Entertainers platform is **100% configured** and ready. Follow these steps to go live in **under 15 minutes**.

---

## ✅ What's Already Done

- ✅ Next.js application fully built
- ✅ Supabase credentials configured (`.env.local`)
- ✅ Twilio credentials configured (`.env.local`)
- ✅ Gemini API configured (`.env.local`)
- ✅ Database schema prepared (`supabase_schema.sql`)
- ✅ Edge Function prepared (`supabase/functions/send-message/`)
- ✅ All documentation created
- ✅ Deployment scripts ready

---

## 🎯 3 Steps to Go Live

### Step 1: Deploy Database Schema (5 minutes)

**Open Supabase SQL Editor:**
1. Go to: https://app.supabase.com/project/yhxnxoqztndvgudqqlmd
2. Click **"SQL Editor"** in left sidebar
3. Click **"New Query"** button

**Run the Schema:**
1. Open `supabase_schema.sql` in this repository
2. **Select All** (Ctrl+A / Cmd+A) and **Copy** (Ctrl+C / Cmd+C)
3. **Paste** into Supabase SQL Editor
4. Click **"Run"** button (or press Ctrl+Enter)
5. Wait for: ✅ **"Success. No rows returned"**

**Verify Tables Created:**
1. Click **"Table Editor"** in left sidebar
2. You should see 6 tables:
   - `profiles` - User roles
   - `performers` - Entertainer profiles
   - `bookings` - Booking records
   - `services` - Service catalog (7 pre-loaded)
   - `do_not_serve` - Blocked clients
   - `communications` - Message history

**Check Services Loaded:**
1. Click on **"services"** table
2. Should see **7 rows** with entertainment services:
   - Topless Waitressing ($200/hr)
   - Semi-Nude Waitressing ($250/hr)
   - Fully Nude Waitressing ($300/hr)
   - Topless Strip Show ($300)
   - Semi-Nude Strip Show ($350)
   - Fully Nude Strip Show ($400)
   - Promotional & Hosting ($150/hr)

✅ **Step 1 Complete!** Database is ready.

---

### Step 2: Deploy to Vercel (5 minutes)

**Add Environment Variables:**
1. Go to: https://vercel.com (log in to your account)
2. Select your project
3. Go to: **Settings** → **Environment Variables**
4. Add these variables (copy from `.env.vercel`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yhxnxoqztndvgudqqlmd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloeG54b3F6dG5kdmd1ZHFxbG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMjQzMTEsImV4cCI6MjA4MTcwMDMxMX0.oTUfU7UmALth1D8bP_luIAMKrOqFUjXlQMvbbuG53rM

# Twilio
TWILIO_ACCOUNT_SID=ACbe4fe93cad91172d1836bf0b1df21f9c
TWILIO_AUTH_TOKEN=00672b1766bef11e4d4cf8dc449c4bce
TWILIO_PHONE_NUMBER=+15088826327

# Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDsfcZxKAAoZNFZqit9-eC_XJsPdw_ai-k
```

**Apply to All Environments:**
- Check: ✅ Production
- Check: ✅ Preview
- Check: ✅ Development

**Redeploy:**
1. Click **"Deployments"** tab
2. Click **"Redeploy"** on latest deployment
3. Wait for build to complete (~2-3 minutes)

✅ **Step 2 Complete!** App is live on Vercel.

---

### Step 3: Deploy Edge Function (5 minutes)

**Set Twilio Secrets in Supabase:**
1. Go to: https://app.supabase.com/project/yhxnxoqztndvgudqqlmd
2. Navigate to: **Edge Functions** → **Secrets**
3. Click **"Add Secret"** for each:

| Secret Name | Value |
|-------------|-------|
| `TWILIO_ACCOUNT_SID` | `ACbe4fe93cad91172d1836bf0b1df21f9c` |
| `TWILIO_AUTH_TOKEN` | `00672b1766bef11e4d4cf8dc449c4bce` |
| `TWILIO_PHONE_NUMBER` | `+15088826327` |
| `TWILIO_WHATSAPP_NUMBER` | `+14155238886` |

**Deploy the Function:**
1. Stay in **Edge Functions** section
2. Click **"Create Function"**
3. Name: `send-message`
4. Open `supabase/functions/send-message/index.ts` in this repo
5. Copy **entire contents**
6. Paste into Supabase editor
7. Click **"Deploy"**
8. Wait for: ✅ **"Function deployed successfully"**

**Verify Deployment:**
1. Click on `send-message` function
2. Go to **"Logs"** tab
3. Logs should be empty (no errors)

✅ **Step 3 Complete!** SMS/WhatsApp notifications enabled.

---

## 🧪 Test Your Platform (5 minutes)

### Test 1: Local Development

```bash
npm run dev
```

Open: http://localhost:3000

**Expected:**
- ✅ Age verification screen loads
- ✅ Clean design with no errors
- ✅ Console shows: "Connected to Supabase"
- ✅ NO "Running in DEMO mode" message

### Test 2: Vercel Deployment

Open your Vercel URL (e.g., `your-app.vercel.app`)

**Expected:**
- ✅ Same as local (age gate, clean design)
- ✅ Database connection working
- ✅ Can browse performers (empty initially)

### Test 3: Create Admin Account

1. Go to your deployed site
2. Click **"Sign Up"** (or "Sign In")
3. Create account with your email
4. Check email for Supabase confirmation
5. Click confirmation link
6. Go back to Supabase SQL Editor
7. Run this query:

```sql
-- Get your user ID
SELECT id, email FROM auth.users WHERE email = 'your@email.com';

-- Make yourself admin (replace USER_ID with the ID from above)
INSERT INTO profiles (id, role)
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

8. Refresh your site
9. **Admin Dashboard** should appear in navigation

✅ **You're now an admin!**

### Test 4: Create Test Performer

1. Go to **Admin Dashboard**
2. Click **"Add Performer"**
3. Fill in details:
   - Name: "Test Performer"
   - Tagline: "Test tagline"
   - Bio: "Test bio"
   - Phone: "+15551234567"
   - Upload photo or use placeholder
4. Select services
5. Click **"Create Performer"**
6. Approve performer (set status to "available")

### Test 5: Create Test Booking

1. Browse performers
2. Click on test performer
3. Click **"Book Now"**
4. Fill in booking form
5. Submit booking
6. Check Twilio logs for SMS notification
7. Check Edge Function logs in Supabase

---

## 📊 What You Have Now

### Frontend Features
- ✅ Age-restricted access
- ✅ Performer gallery with filtering
- ✅ Complete booking workflow
- ✅ Admin dashboard with analytics
- ✅ Performer dashboard
- ✅ User authentication
- ✅ File uploads (ID, receipts)
- ✅ Responsive mobile design
- ✅ SMS/WhatsApp notifications

### Backend Features
- ✅ PostgreSQL database (Supabase)
- ✅ Row Level Security
- ✅ User authentication (Supabase Auth)
- ✅ File storage (Supabase Storage)
- ✅ Edge Functions (serverless)
- ✅ Real-time updates ready
- ✅ 7 pre-configured services

### Integrations
- ✅ Twilio SMS for clients
- ✅ Twilio WhatsApp for performers
- ✅ Google Gemini AI (configured)
- ✅ Vercel deployment
- ✅ Supabase backend

---

## 🔧 Optional: Twilio WhatsApp Sandbox

To test WhatsApp notifications:

1. Go to: https://console.twilio.com/
2. Navigate to: **Messaging** → **Try it out** → **Send a WhatsApp message**
3. You'll see a sandbox code like: `join yellow-tiger`
4. Send that message to: `+14155238886` (Twilio sandbox)
5. You're now connected to the WhatsApp sandbox
6. Test by creating a booking as a performer

**For Production:**
- Apply for WhatsApp Business API approval
- Get your number approved (+15088826327)
- Update `TWILIO_WHATSAPP_NUMBER` secret

---

## 📱 Quick Reference Commands

**Local Development:**
```bash
npm run dev          # Start dev server
npm run build        # Test production build
npm run start        # Run production build locally
```

**Database:**
```bash
node setup-database.js       # Verify database setup
node verify-supabase.js      # Test Supabase connection
```

**Edge Functions:**
```bash
node deploy-edge-function.js # Show deployment guide
```

---

## 🐛 Troubleshooting

### Issue: "Running in DEMO mode"
**Solution:**
1. Check `.env.local` has correct credentials ✓ (already set)
2. Restart: `npm run dev`
3. Verify schema is deployed in Supabase

### Issue: "Table doesn't exist"
**Solution:**
1. Run `supabase_schema.sql` in Supabase SQL Editor
2. Verify tables in Table Editor

### Issue: "Build fails on Vercel"
**Solution:**
1. Add ALL environment variables from `.env.vercel`
2. Apply to all environments
3. Redeploy

### Issue: "SMS not sending"
**Solution:**
1. Check Twilio secrets in Supabase Edge Functions
2. Verify Edge Function is deployed
3. Check Edge Function logs for errors
4. Verify Twilio account has sufficient balance

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `DEPLOY_NOW.md` | **This file** - Quick deployment guide |
| `DEPLOYMENT_READY.md` | Complete setup summary |
| `QUICK_START.md` | 10-minute setup guide |
| `SUPABASE_SETUP_GUIDE.md` | Detailed Supabase guide |
| `TWILIO_SETUP.md` | SMS/WhatsApp setup |
| `supabase_schema.sql` | Database schema |
| `.env.vercel` | Vercel environment variables |
| `setup-database.js` | Database setup helper |
| `deploy-edge-function.js` | Edge Function deployment helper |
| `verify-supabase.js` | Connection test script |

---

## ✅ Deployment Checklist

- [ ] **Step 1:** Run `supabase_schema.sql` in Supabase SQL Editor
- [ ] **Step 1:** Verify 6 tables created in Table Editor
- [ ] **Step 1:** Verify 7 services loaded in services table
- [ ] **Step 2:** Add environment variables to Vercel
- [ ] **Step 2:** Apply to all environments (Prod/Preview/Dev)
- [ ] **Step 2:** Redeploy Vercel application
- [ ] **Step 3:** Add Twilio secrets to Supabase
- [ ] **Step 3:** Deploy `send-message` Edge Function
- [ ] **Test:** Sign up and create admin account
- [ ] **Test:** Create test performer
- [ ] **Test:** Create test booking
- [ ] **Test:** Verify SMS notifications
- [ ] **Optional:** Set up WhatsApp sandbox
- [ ] **Optional:** Configure custom domain in Vercel
- [ ] **Optional:** Customize email templates in Supabase

---

## 🎉 You're Ready to Launch!

**Everything is configured.** Just run the 3 steps above and your platform will be live.

**Estimated Time:** 15 minutes
**Difficulty:** Easy (copy & paste)

**Need Help?**
- Test connection: `node verify-supabase.js`
- Check setup: `node setup-database.js`
- Full docs: See `DEPLOYMENT_READY.md`

**🚀 Let's go!**
