# Flavor Entertainers Platform - Supabase Backend Setup

## Overview
This guide will help you connect your Vercel frontend (https://booking-system-lrkd.vercel.app/) to your Supabase backend (qohyutlxwekppkrdlamp).

## Step 1: Get Supabase API Credentials

1. Go to your Supabase project dashboard:
   https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/settings/api

2. Copy the following values:
   - **Project URL**: `https://qohyutlxwekppkrdlamp.supabase.co`
   - **Anon/Public Key** (under "Project API keys" → anon public)
   - **Service Role Key** (under "Project API keys" → service_role) - Keep this secret!

## Step 2: Get Database Password

1. Go to your database settings:
   https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/settings/database

2. Either copy your existing password or reset it

3. Build your connection strings:
   - Pooler (Recommended): `postgresql://postgres.qohyutlxwekppkrdlamp:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
   - Direct: `postgresql://postgres.qohyutlxwekppkrdlamp:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`

## Step 3: Configure Vercel Environment Variables

Run this command to configure all Vercel environment variables:

```bash
cd flavor-entertainers-platform

# Set Supabase credentials
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter: https://qohyutlxwekppkrdlamp.supabase.co

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste your anon key

npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste your service role key

npx vercel env add DATABASE_URL production
# Paste your pooler connection string

npx vercel env add DIRECT_URL production
# Paste your direct connection string

# Set other required variables
npx vercel env add NEXTAUTH_URL production
# Enter: https://booking-system-lrkd.vercel.app

npx vercel env add NEXTAUTH_SECRET production
# Generate a random 32+ character string
```

## Step 4: Run Database Migrations

1. Make sure your Supabase project is active (unpause if needed)

2. Run migrations from your local machine:

```bash
cd flavor-entertainers-platform

# Link to your Supabase project
npx supabase link --project-ref qohyutlxwekppkrdlamp

# Push migrations to Supabase
npx supabase db push
```

Or manually run the migrations:

```bash
# Copy all migration files from supabase/migrations/*.sql
# Run them in order in your Supabase SQL editor:
# https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/sql/new
```

## Step 5: Deploy to Vercel

```bash
cd flavor-entertainers-platform

# Pull the latest environment variables
npx vercel env pull

# Deploy to production
npx vercel --prod
```

## Step 6: Verify the Connection

1. Visit your deployed app: https://booking-system-lrkd.vercel.app
2. Check the browser console for any errors
3. Try to sign up/login to test authentication
4. Check Supabase logs: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/logs/explorer

## Quick Setup Script

I've created a helper script for you. Fill in your credentials first:

```bash
# Edit this file with your actual credentials
nano .env.qohyutlxwekppkrdlamp.template

# Then run the setup
./scripts/setup-supabase-connection.sh
```

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Check Vercel environment variables are set correctly
- Redeploy after setting new environment variables

### Error: "Failed to connect to database"
- Verify your database password is correct
- Check if your Supabase project is paused
- Ensure connection strings use the correct region

### Error: "Invalid API key"
- Regenerate API keys in Supabase dashboard
- Update Vercel environment variables
- Redeploy

## Database Schema

The platform uses the following main tables:
- `users` - User accounts and profiles
- `performers` - Performer profiles and details
- `bookings` - Booking records
- `services` - Service offerings
- `payments` - Payment transactions
- `do_not_serve_list` - Blacklist management

All migrations are in `supabase/migrations/` directory.

## Need Help?

Check the logs:
- Vercel: https://vercel.com/laceandlusts-projects/booking-system/logs
- Supabase: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/logs
