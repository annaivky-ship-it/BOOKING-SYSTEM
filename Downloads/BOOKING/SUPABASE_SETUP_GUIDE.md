# 🚀 Supabase Backend Setup Guide - Flavor Entertainers

This guide will walk you through setting up the complete Supabase backend for your Flavor Entertainers booking platform.

## 📋 Prerequisites

- A Supabase account (free tier works fine)
- Your Supabase project URL and anon key
- 15-20 minutes of setup time

---

## 🎯 Quick Start (5 Steps)

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Project Name:** Flavor Entertainers
   - **Database Password:** (choose a strong password and save it)
   - **Region:** Choose closest to Western Australia (e.g., Sydney)
4. Click **"Create new project"** and wait 2-3 minutes for setup

---

### Step 2: Run the Database Schema

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open the file `supabase-schema-complete.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. Wait for completion - you should see "Success. No rows returned"

**What this does:**
- Creates 8 tables (services, performers, bookings, etc.)
- Sets up Row Level Security (RLS) policies
- Creates helper functions and triggers
- Sets up indexes for performance

---

### Step 3: Seed the Database with Test Data

1. Click **"New Query"** in the SQL Editor
2. Open the file `supabase-seed-data.sql` from this project
3. Copy the entire contents and paste into the SQL Editor
4. Click **"Run"**
5. You should see "Success" messages

**What this does:**
- Adds all 15 service offerings
- Creates 6 demo performers (Scarlett, Jasmine, Amber, Chloe, April, Anna)
- Adds 4 sample bookings
- Creates 3 "Do Not Serve" entries
- Adds demo admin account

---

### Step 4: Set Up Storage Buckets

#### Option A: Using the Dashboard (Recommended)

1. Click **"Storage"** in the left sidebar
2. Click **"New bucket"**
3. Create these three buckets:

**Bucket 1: booking-documents**
- Name: `booking-documents`
- Public: ❌ No (Private)
- Click "Create bucket"

**Bucket 2: deposit-receipts**
- Name: `deposit-receipts`
- Public: ❌ No (Private)
- Click "Create bucket"

**Bucket 3: performer-photos**
- Name: `performer-photos`
- Public: ✅ Yes (Public)
- Click "Create bucket"

#### Option B: Using SQL

1. In SQL Editor, run the contents of `supabase-storage-setup.sql`
2. This creates the buckets and sets up access policies

---

### Step 5: Update Your App Configuration

1. In your Supabase dashboard, click **"Settings"** → **"API"**
2. Copy your **Project URL** and **anon public key**
3. Update `services/supabaseClient.ts` with your credentials:

```typescript
process.env.SUPABASE_URL = 'YOUR_PROJECT_URL_HERE';
process.env.SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
```

Or better yet, use environment variables in `.env.local`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

---

## ✅ Verify Your Setup

### Test 1: Check Tables Were Created

1. In Supabase, click **"Table Editor"** in the sidebar
2. You should see these tables:
   - ✓ services (15 rows)
   - ✓ performers (6 rows)
   - ✓ bookings (4 rows)
   - ✓ do_not_serve_list (3 rows)
   - ✓ communications (3 rows)
   - ✓ admins (1 row)
   - ✓ clients
   - ✓ booking_audit_log

### Test 2: Check Storage Buckets

1. Click **"Storage"** in the sidebar
2. You should see:
   - ✓ booking-documents (private)
   - ✓ deposit-receipts (private)
   - ✓ performer-photos (public)

### Test 3: Test from Your App

1. Restart your dev server if it's running
2. Go to http://localhost:3000
3. You should see 6 performers in the gallery
4. Click on any performer to view their profile
5. Try selecting services and viewing prices

---

## 📊 Database Schema Overview

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **services** | Service catalog (waitressing, shows, etc.) | 15 pre-configured services with pricing |
| **performers** | Entertainer profiles | Status tracking, service areas, availability |
| **bookings** | Client booking requests | Multi-stage workflow, cost tracking |
| **do_not_serve_list** | Safety blocklist | Performer-submitted, admin-approved |
| **communications** | In-app messaging | Booking notifications, alerts |
| **clients** | Client tracking | VIP status after 3+ bookings |
| **admins** | Admin accounts | Dashboard access control |

### Key Features Implemented

#### 🔒 Row Level Security (RLS)
- ✅ Public can view performers and services
- ✅ Clients can only see their own bookings
- ✅ Performers can only see assigned bookings
- ✅ Admin access through service role key

#### 🎯 Business Logic
- ✅ Auto-blocks clients on "Do Not Serve" list
- ✅ Auto-upgrades clients to VIP after 3 confirmed bookings
- ✅ Tracks booking audit trail
- ✅ Automated timestamp updates

#### 📁 File Storage
- ✅ Secure upload for ID documents
- ✅ Secure upload for deposit receipts
- ✅ Public CDN for performer photos

---

## 🔐 Security Best Practices

### RLS Policies Active
All tables have Row Level Security enabled. Users can only access data they're authorized to see.

### API Keys
- **Anon Key:** Safe to use in client-side code (already configured)
- **Service Role Key:** ⚠️ NEVER expose this! Use only in secure backend functions

### File Uploads
- ID documents and receipts are private (only uploader can view)
- Performer photos are public (cached on CDN)
- 5MB file size limit enforced

---

## 🧪 Demo Accounts

### Admin Account
- **Email:** admin@flavorentertainers.com
- **Password:** admin123
- ⚠️ **Change this immediately in production!**

### Test Clients (for booking)
Use these details to test the "Do Not Serve" blocking:
- **Blocked:** alex.blocked@example.com (should be auto-rejected)
- **Allowed:** any other email

---

## 🔧 Troubleshooting

### Error: "relation does not exist"
**Solution:** You haven't run the schema SQL yet. Go back to Step 2.

### Error: "permission denied for table"
**Solution:** RLS is blocking access. Make sure you're using the correct API key.

### Storage uploads failing
**Solution:**
1. Check buckets exist in Storage tab
2. Verify bucket names match exactly
3. Check file size is under 5MB

### No performers showing up
**Solution:**
1. Check Table Editor → performers table has 6 rows
2. Verify `supabase-seed-data.sql` was run successfully
3. Check browser console for API errors

---

## 📱 Next Steps

### 1. Enable Authentication (Optional)
If you want performer/admin login:

```sql
-- In SQL Editor
CREATE OR REPLACE FUNCTION auth.email() RETURNS text AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'email', '')::text;
$$ LANGUAGE sql STABLE;
```

### 2. Set Up Edge Functions (Optional)
For SMS notifications via Twilio:
1. Install Supabase CLI: `npm install -g supabase`
2. Create edge function: `supabase functions new send-sms`

### 3. Configure Webhooks (Optional)
For payment integrations or external notifications.

### 4. Set Up Backups
Supabase Pro tier includes automatic daily backups.

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

## 🎉 You're All Set!

Your Supabase backend is now fully configured! The app should be able to:
- ✅ Display performers from the database
- ✅ Show service offerings with pricing
- ✅ Handle booking submissions
- ✅ Block clients on the "Do Not Serve" list
- ✅ Track VIP clients
- ✅ Store uploaded files securely

**Happy booking! 🎊**

---

## 📞 Need Help?

If you run into issues:
1. Check the Supabase logs (Dashboard → Logs)
2. Verify your API keys are correct
3. Ensure all SQL scripts ran without errors
4. Check browser console for client-side errors

Remember: Your Supabase URL should be in this format:
`https://yourprojectid.supabase.co`
