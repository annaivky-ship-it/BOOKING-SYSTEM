# 🚀 Quick Start Guide - Flavor Entertainers

Get your Flavor Entertainers platform up and running in **10 minutes**.

---

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ A Supabase account (sign up free at [supabase.com](https://supabase.com))
- ✅ Node.js 18+ installed
- ✅ A Vercel account (for deployment)

---

## 🎯 Option 1: Automated Setup (Recommended)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - Name: `flavor-entertainers`
   - Database Password: (choose a strong password and save it!)
   - Region: Select closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for initialization

### Step 2: Get Your API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these three values:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public** key
   - **service_role** key (keep this secret!)

### Step 3: Run Automated Setup

```bash
# Run the setup script
npm run setup:auto
```

Follow the prompts and enter your Supabase credentials when asked.

The script will:
- ✅ Connect to your Supabase project
- ✅ Create all database tables
- ✅ Set up Row Level Security policies
- ✅ Create storage buckets
- ✅ Insert default services
- ✅ Generate `.env.local` file
- ✅ Generate `.env.vercel` file

### Step 4: Test Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the age verification screen!

---

## 🔧 Option 2: Manual Setup

If automated setup fails, follow these steps:

### Step 1: Create Supabase Project

(Same as Option 1, Step 1)

### Step 2: Run Schema Manually

1. Open `supabase_schema.sql` in this repository
2. Copy the entire contents
3. In Supabase dashboard, go to **SQL Editor**
4. Click **"New Query"**
5. Paste the schema
6. Click **"Run"** (or press Ctrl+Enter)
7. Wait for "Success. No rows returned" message

### Step 3: Create Environment Files

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Test Locally

```bash
npm install
npm run dev
```

---

## 🌐 Deploy to Vercel

### Option A: Using .env.vercel File

1. The setup script created `.env.vercel` with your variables
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Select branch: `claude/fix-nextjs-vercel-detection-Rfi4T`
5. Add environment variables from `.env.vercel`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**

### Option B: Manual Vercel Setup

1. Go to your Vercel project
2. **Settings** → **Environment Variables**
3. Add these variables (apply to all environments):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key from Supabase |

4. **Redeploy** your application

---

## 👤 Create Your Admin Account

### Step 1: Sign Up

1. Open your deployed app
2. Click through the age verification
3. Sign up with your email
4. Verify your email (check inbox)

### Step 2: Make Yourself Admin

1. Go to Supabase dashboard → **SQL Editor**
2. Run these queries (replace with your email):

```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your@email.com';

-- Make yourself admin (use the ID from above)
INSERT INTO profiles (id, role)
VALUES ('paste-user-id-here', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

3. Refresh your app
4. You should now see the **Admin Dashboard** option!

---

## ✅ Verify Everything Works

### Test 1: Database Connection

1. Open your app
2. Check browser console (F12)
3. You should **NOT** see "Running in DEMO mode"
4. If you see it, check your environment variables

### Test 2: View Performers

1. Browse the performers gallery
2. Should be empty initially (no performers added yet)
3. This means database is working!

### Test 3: Create Test Performer (Admin)

1. Go to Admin Dashboard
2. Click "Add Performer"
3. Fill in details
4. Status will be "pending" until you approve it

### Test 4: Services Loaded

1. Click on "Book" for any performer
2. You should see 7 service options:
   - Topless Waitressing ($200/hr)
   - Semi-Nude Waitressing ($250/hr)
   - Fully Nude Waitressing ($300/hr)
   - Topless Strip Show ($300 flat)
   - Semi-Nude Strip Show ($350 flat)
   - Fully Nude Strip Show ($400 flat)
   - Promotional & Hosting ($150/hr)

If you see these, your database is fully set up! ✅

---

## 🐛 Troubleshooting

### "Running in DEMO mode"

**Problem**: App can't connect to Supabase

**Solutions**:
1. Check `.env.local` has correct values
2. Restart dev server: `npm run dev`
3. Verify Supabase URL format: `https://xxx.supabase.co` (no trailing slash)
4. Check Supabase project is active (not paused)

### "Permission denied" errors

**Problem**: Row Level Security blocking access

**Solutions**:
1. Verify you're logged in
2. Check user role in `profiles` table
3. Re-run schema SQL (might have failed partially)

### No services showing

**Problem**: Services table is empty

**Solutions**:
1. Go to Supabase SQL Editor
2. Run: `SELECT * FROM services;`
3. If empty, re-run the services INSERT from `supabase_schema.sql`

### Authentication not working

**Problem**: Email provider not configured

**Solutions**:
1. Supabase → **Authentication** → **Providers**
2. Enable **Email** provider
3. Set Site URL to your deployed URL
4. For development: `http://localhost:3000`
5. For production: `https://your-app.vercel.app`

### Build fails on Vercel

**Problem**: Next.js not detected or build errors

**Solutions**:
1. Check `vercel.json` exists in root
2. Verify branch has all Next.js files
3. Check build logs for specific errors
4. Ensure `next` is in `package.json` dependencies

---

## 📊 What You Get

After setup, your platform has:

### Frontend (Next.js)
- ✅ Age verification gate
- ✅ Performer gallery with filtering
- ✅ Booking system with 6-stage workflow
- ✅ Admin dashboard with analytics
- ✅ Performer dashboard
- ✅ User authentication
- ✅ File uploads (ID, receipts)
- ✅ Responsive design

### Backend (Supabase)
- ✅ 6 database tables with RLS
- ✅ User authentication
- ✅ Storage buckets
- ✅ 7 pre-configured services
- ✅ Role-based permissions
- ✅ Secure file storage

### Features
- ✅ Browse performers
- ✅ Book entertainment
- ✅ Upload verification documents
- ✅ Track booking status
- ✅ Admin approval workflow
- ✅ Do-not-serve list
- ✅ Communications system
- ✅ Analytics dashboard

---

## 🔐 Security Notes

- ✅ **Anon key is safe** to expose in client-side code
- ⚠️ **Service role key** must remain SECRET (never commit to git!)
- ✅ Row Level Security protects all data
- ✅ Files are private by default
- ✅ Email verification available

---

## 📚 Next Steps

1. **Add Test Data**:
   - Create test performers
   - Test booking flow
   - Try admin approval process

2. **Customize**:
   - Update service pricing in `services` table
   - Modify performer approval workflow
   - Add custom fields to forms

3. **Configure Optional Features**:
   - Google AI for suggestions: Add `NEXT_PUBLIC_GEMINI_API_KEY`
   - Twilio for SMS: Add `TWILIO_*` variables
   - Custom domain in Vercel

4. **Production Checklist**:
   - [ ] Test all user flows
   - [ ] Verify email templates
   - [ ] Set up custom SMTP (optional)
   - [ ] Configure rate limiting
   - [ ] Add monitoring
   - [ ] Backup database

---

## 🆘 Need More Help?

- **Full Setup Guide**: `SUPABASE_SETUP_GUIDE.md`
- **Environment Variables**: `.env.example`
- **Database Schema**: `supabase_schema.sql`
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

**You're all set! 🎉 Enjoy your Flavor Entertainers platform!**
