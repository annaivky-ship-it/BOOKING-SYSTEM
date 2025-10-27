# Database Setup Guide

## Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard/project/qmedckkwtgkhrdihqrnd
2. Click **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run the Schema

1. Open the file `supabase/schema.sql` in your code editor
2. Copy **ALL** the contents (it's about 200 lines)
3. Paste into the SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. Wait for "Success. No rows returned" message

### Step 3: Run RLS Policies

1. Open the file `supabase/rls-policies.sql` in your code editor
2. Copy **ALL** the contents
3. Paste into a new query in SQL Editor
4. Click **Run**
5. Wait for "Success" message

### Step 4: Create Storage Buckets

1. Click **Storage** in the left sidebar
2. Click **New bucket**
3. Create these 3 buckets (all **private**):

   **Bucket 1: profiles**
   - Name: `profiles`
   - Public: ❌ (unchecked)
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg,image/png,image/webp`

   **Bucket 2: ids**
   - Name: `ids`
   - Public: ❌ (unchecked)
   - File size limit: 10MB
   - Allowed MIME types: `image/jpeg,image/png,image/webp,application/pdf`

   **Bucket 3: receipts**
   - Name: `receipts`
   - Public: ❌ (unchecked)
   - File size limit: 10MB
   - Allowed MIME types: `image/jpeg,image/png,image/webp`

### Step 5: Enable Realtime

1. Click **Database** → **Replication** in the left sidebar
2. Find the `bookings` table
3. Toggle **Realtime** to ON

### Step 6: Verify Setup

Run this query in SQL Editor to verify:

```sql
-- Check tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- You should see:
-- users
-- bookings
-- vetting_applications
-- blacklist
-- audit_log
```

---

## What This Creates

### Tables
- ✅ `users` - All users (admin, performer, client)
- ✅ `bookings` - Booking records with ETA tracking
- ✅ `vetting_applications` - Client ID verification
- ✅ `blacklist` - Blocked clients
- ✅ `audit_log` - Complete audit trail

### Security
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Role-based access policies
- ✅ Automatic audit logging

### Functions
- ✅ Auto-generate booking numbers
- ✅ Auto-update timestamps
- ✅ Helper functions for roles

---

## Default Admin User

The schema creates a default admin user. Update it with your details:

```sql
-- Update the admin user
UPDATE users
SET
  email = 'your-admin@example.com',
  phone = '+61400000000',
  full_name = 'Your Name'
WHERE role = 'admin' AND email = 'admin@example.com';
```

Then sign up in your app using this email address.

---

## Troubleshooting

### "relation already exists"
- Tables already created, skip schema.sql
- Just run rls-policies.sql

### "permission denied"
- Make sure you're logged into Supabase
- Refresh the page and try again

### "syntax error"
- Make sure you copied the ENTIRE file
- Check for any missing characters

---

## Next Steps

After setup is complete:

1. ✅ Database schema created
2. ✅ RLS policies applied
3. ✅ Storage buckets created
4. ✅ Realtime enabled

You're ready to run the app:

```bash
cd C:\Users\annai\booking-platform
npm install
npm run dev
```

Open http://localhost:3000 🎉
