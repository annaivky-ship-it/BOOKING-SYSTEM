# Supabase Setup Guide for Flavor Entertainers

Complete guide to setting up Supabase backend for your Next.js application.

---

## 📋 Prerequisites

- A Supabase account (free tier works fine)
- Access to your Vercel deployment dashboard
- Basic understanding of SQL (optional but helpful)

---

## 🚀 Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `flavor-entertainers` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., Australia/Singapore)
   - **Pricing Plan**: Free (or Pro if needed)
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

---

## 🗄️ Step 2: Run Database Schema

### Option A: Using SQL Editor (Recommended)

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase_schema.sql` from this repository
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **"Run"** (or press `Ctrl+Enter`)
7. Wait for success message: ✅ "Success. No rows returned"

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### ✅ Verify Schema Creation

Go to **Table Editor** and verify these tables exist:
- ✅ `profiles`
- ✅ `performers`
- ✅ `bookings`
- ✅ `services`
- ✅ `do_not_serve`
- ✅ `communications`

---

## 🔐 Step 3: Get API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. You'll see two important keys:

### Public (Anon) Key
```
Project URL: https://abcdefghijklmnop.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Service Role Key (Secret)
```
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important**:
- The `anon` key is SAFE to expose in client-side code
- The `service_role` key must be kept SECRET (only use server-side)

---

## 🔧 Step 4: Configure Environment Variables

### For Local Development

1. Create `.env.local` file in your project root:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-key
   ```

3. Test locally:
   ```bash
   npm run dev
   ```

### For Vercel Production

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` (your anon key) | Production, Preview, Development |

4. (Optional) Add these for enhanced features:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Your Google AI key | Production, Preview |
| `TWILIO_ACCOUNT_SID` | Your Twilio SID | Production |
| `TWILIO_AUTH_TOKEN` | Your Twilio token | Production |
| `TWILIO_PHONE_NUMBER` | `+1234567890` | Production |

5. **Redeploy** your application for changes to take effect

---

## 📦 Step 5: Configure Storage Buckets

Storage buckets are used for file uploads (photos, documents, receipts).

### Check if Buckets Were Created

1. Go to **Storage** in Supabase dashboard
2. You should see these buckets (created by schema):
   - `performer-photos` (public)
   - `id-documents` (private)
   - `deposit-receipts` (private)
   - `referral-receipts` (private)

### If Buckets Don't Exist

Run this SQL in SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('performer-photos', 'performer-photos', true),
  ('id-documents', 'id-documents', false),
  ('deposit-receipts', 'deposit-receipts', false),
  ('referral-receipts', 'referral-receipts', false)
ON CONFLICT (id) DO NOTHING;
```

---

## 👥 Step 6: Set Up Authentication

### Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure settings:
   - ✅ Enable Email Confirmations (recommended)
   - ✅ Enable Email Change Confirmations
   - Set **Site URL**: `https://your-app.vercel.app`

### (Optional) Enable OAuth Providers

For Google/GitHub/etc login:

1. Go to **Authentication** → **Providers**
2. Enable desired provider (e.g., Google)
3. Add OAuth credentials from provider
4. Set redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-app.vercel.app/auth/callback`

### Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize these templates:
   - **Confirm Signup**: Welcome email
   - **Magic Link**: Passwordless login
   - **Change Email**: Email change confirmation
   - **Reset Password**: Password reset

Example variables you can use:
- `{{ .ConfirmationURL }}` - Confirmation link
- `{{ .SiteURL }}` - Your app URL
- `{{ .Email }}` - User's email

---

## 🧪 Step 7: Test the Setup

### Test Database Connection

1. Deploy or run your app locally
2. Check browser console for errors
3. If demo mode is active, you'll see: `"Running in DEMO mode"`

### Test Database Queries

Run this in SQL Editor to verify:

```sql
-- Check if services were inserted
SELECT * FROM services;

-- Should return 7 services
```

### Test Authentication

1. Try signing up with a test email
2. Check **Authentication** → **Users** in Supabase
3. Verify user appears in the list

### Test Row Level Security

Try accessing data:
- Unauthenticated users should only see approved performers
- Authenticated users should see their own bookings
- Admins should see everything

---

## 🔒 Step 8: Security Configuration

### Enable Row Level Security (Already Done)

The schema automatically enables RLS on all tables. Verify:

1. Go to **Authentication** → **Policies**
2. Each table should have policies listed
3. If missing, re-run the schema SQL

### Set Up Realtime (Optional)

For live updates:

1. Go to **Database** → **Replication**
2. Enable replication for tables you want real-time:
   - `bookings`
   - `communications`
   - `performers`

### Configure Rate Limiting

1. Go to **Settings** → **API**
2. Under **Rate Limiting**, configure:
   - Anonymous requests: 100/hour
   - Authenticated requests: 1000/hour

---

## 👤 Step 9: Create Admin User

### Create Your First Admin

1. Sign up normally through your app
2. Go to Supabase **SQL Editor**
3. Run this query (replace email with your email):

```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Create admin profile (use the ID from above)
INSERT INTO profiles (id, role)
VALUES ('user-uuid-here', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

4. Refresh your app - you should now have admin access!

---

## 📊 Step 10: Add Initial Data (Optional)

### Add Test Performers

```sql
INSERT INTO performers (name, tagline, photo_url, bio, service_ids, status, phone)
VALUES
  ('Emma Stone', 'Professional Entertainer', 'https://via.placeholder.com/400', 'Experienced performer with 5+ years', ARRAY['topless-waitressing', 'strip-show-topless'], 'available', '+61412345678'),
  ('Sophie Turner', 'Elite Host', 'https://via.placeholder.com/400', 'Specialized in high-end events', ARRAY['promo-hosting'], 'available', '+61412345679');
```

### Verify Services

```sql
SELECT * FROM services ORDER BY category, rate;
```

Should show:
- 3 Waitressing services ($200-$300/hour)
- 3 Strip Show services ($300-$400 flat)
- 1 Promotional service ($150/hour)

---

## 🎯 Step 11: Deployment Checklist

Before going live, verify:

- ✅ All tables created successfully
- ✅ Row Level Security policies working
- ✅ Storage buckets configured
- ✅ Environment variables set in Vercel
- ✅ Authentication working (signup/login)
- ✅ Admin user created
- ✅ Services data populated
- ✅ SSL/HTTPS enabled (automatic with Vercel)
- ✅ Test booking flow end-to-end
- ✅ Test file uploads (ID, receipts)

---

## 🐛 Troubleshooting

### "Running in DEMO mode"

**Cause**: Environment variables not set or incorrect

**Fix**:
1. Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Restart dev server: `npm run dev`
3. Check Vercel environment variables if deployed

### "Failed to fetch" / Connection errors

**Cause**: Supabase project not accessible or wrong URL

**Fix**:
1. Verify project is active in Supabase dashboard
2. Check URL format: `https://abcdef.supabase.co` (no trailing slash)
3. Check network/firewall settings

### "Permission denied" / RLS errors

**Cause**: Row Level Security policies blocking access

**Fix**:
1. Check if user is authenticated: `supabase.auth.getSession()`
2. Verify user has correct role in `profiles` table
3. Review policies in **Authentication** → **Policies**

### "Storage bucket not found"

**Cause**: Storage buckets not created

**Fix**:
1. Run storage bucket creation SQL (Step 5)
2. Verify buckets exist in **Storage** dashboard

### Authentication emails not sending

**Cause**: Email provider not configured

**Fix**:
1. For development: Check Supabase logs for "Confirmation URL"
2. For production: Configure custom SMTP in **Settings** → **Auth**

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Realtime](https://supabase.com/docs/guides/realtime)

---

## 🆘 Need Help?

If you encounter issues:

1. Check Supabase logs: **Logs** → **Database** or **Auth**
2. Test queries in SQL Editor
3. Verify environment variables are correct
4. Check browser console for client-side errors
5. Review network tab for failed requests

---

**Setup Complete! 🎉**

Your Flavor Entertainers platform is now connected to Supabase and ready to handle real users, bookings, and payments!
