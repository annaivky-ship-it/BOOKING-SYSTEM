# Remove Demo Content & Fix Supabase Connection

## 🔍 Current Issues Found:

### 1. ❌ RLS (Row Level Security) Blocking Access
**Problem**: Database tables have RLS enabled but no policies, blocking all access.

**Solution**: Apply RLS policies to allow public read access to performers/services.

### 2. ✅ No Demo Content Found
**Status**: The frontend is already clean - no hardcoded demo data.
It only shows data from the database (which is currently empty).

---

## 🔧 Fix Steps:

### Step 1: Apply RLS Policies

1. **Open Supabase SQL Editor**:
   https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/sql/new

2. **Copy and run this SQL**:

```sql
-- Fix RLS policies to allow public read access

-- Enable RLS on tables
ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow public read access to performers (for browsing)
DROP POLICY IF EXISTS "Public can view active performers" ON public.performers;
CREATE POLICY "Public can view active performers" 
  ON public.performers 
  FOR SELECT 
  USING (true);

-- Allow public read access to services
DROP POLICY IF EXISTS "Public can view services" ON public.services;
CREATE POLICY "Public can view services" 
  ON public.services 
  FOR SELECT 
  USING (true);

-- Users can read their own data
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own data
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow authenticated users to insert their own user record
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Performers can update their own profile
DROP POLICY IF EXISTS "Performers can update own profile" ON public.performers;
CREATE POLICY "Performers can update own profile" 
  ON public.performers 
  FOR UPDATE 
  USING (user_id = auth.uid());
```

3. **Click RUN**

4. **Verify policies created**:
   - Go to: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/auth/policies
   - Check `performers`, `services`, `users` tables have policies

### Step 2: Test Connection

After applying RLS policies:

```bash
cd flavor-entertainers-platform
node test-supabase-connection.js
```

Should now show:
```
✅ Success! Performers table accessible
✅ Success! Users table accessible
```

### Step 3: Test Frontend

1. Visit: https://booking-system-lrkd.vercel.app
2. Open browser console (F12)
3. Check for errors
4. Browse to /performers page
5. Should show "No performers found" (not permission errors)

---

## 📊 What's Actually On The Site:

### Homepage (`/`):
- ✅ Hero section (no demo data)
- ✅ "Available Now" section (pulls from database)
- ✅ Shows empty state if no performers

### Performers Page (`/performers`):
- ✅ Grid layout (no demo data)
- ✅ Filters (no demo data)
- ✅ Shows empty state if no performers

### Database:
- ✅ All tables created
- ✅ No demo/test data exists
- ❌ RLS policies blocking access (fix above)

---

## ✅ After Fixing RLS:

### Test Signup:
1. Go to site and sign up
2. Check Supabase Auth: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/auth/users
3. User should appear

### Add Test Performer:
1. Go to Supabase SQL Editor
2. Insert test performer:

```sql
-- First, create a test user in auth (or use your signed-up user)
-- Then insert into users table
INSERT INTO public.users (id, email, role, first_name, last_name)
VALUES (
  'YOUR-AUTH-USER-UUID-HERE',
  'test@example.com',
  'performer',
  'Test',
  'Performer'
);

-- Create vetting application
INSERT INTO public.vetting_applications (
  user_id, full_name, email, phone, date_of_birth, location,
  performance_type, experience_years, status
)
VALUES (
  'YOUR-AUTH-USER-UUID-HERE',
  'Test Performer',
  'test@example.com',
  '+61400000000',
  '1990-01-01',
  'Sydney, NSW',
  'Entertainment',
  5,
  'approved'
)
RETURNING id;

-- Create performer profile (use the ID from above insert)
INSERT INTO public.performers (
  application_id, user_id, stage_name, bio, 
  base_rate, hourly_rate, featured, verified
)
VALUES (
  'APPLICATION-ID-FROM-ABOVE',
  'YOUR-AUTH-USER-UUID-HERE',
  'Test Entertainer',
  'Professional entertainer for your events',
  500.00,
  150.00,
  true,
  true
);
```

---

## 🔍 Verify Everything Works:

### Checklist:
- [ ] RLS policies applied
- [ ] Test connection script passes
- [ ] Can sign up on site
- [ ] User appears in Supabase Auth
- [ ] No console errors on homepage
- [ ] Performers page loads without errors
- [ ] Add test performer shows on site

---

## 🆘 Still Having Issues?

### Check These:

1. **Supabase Logs**:
   https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/logs

2. **Browser Console** (F12):
   Look for red errors

3. **Vercel Logs**:
   ```bash
   npx vercel logs
   ```

4. **Environment Variables**:
   ```bash
   npx vercel env ls
   ```

---

**The SQL file is ready**: `fix-rls-policies.sql`

**Run it in Supabase SQL Editor to fix permissions!**
