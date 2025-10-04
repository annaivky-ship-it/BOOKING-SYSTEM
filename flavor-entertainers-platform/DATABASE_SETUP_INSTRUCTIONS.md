
# Database Configuration Instructions

Your Supabase project is: fmezpefpletmnthrmupu

## Step 1: Get Your Database Password
1. Go to: https://supabase.com/dashboard/project/fmezpefpletmnthrmupu
2. Navigate to: Settings → Database
3. Copy the password (or reset it if needed)

## Step 2: Update Environment File
Replace 'your-database-password' in .env.local with your actual password:

DATABASE_URL=postgresql://postgres.fmezpefpletmnthrmupu:YOUR_ACTUAL_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.fmezpefpletmnthrmupu:YOUR_ACTUAL_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

## Step 3: Test Connection
npm run db:push

## Step 4: Seed Database
npm run db:seed

## Step 5: Test API
npm run test:api
