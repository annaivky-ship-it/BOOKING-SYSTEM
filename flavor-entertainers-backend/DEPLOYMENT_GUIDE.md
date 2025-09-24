# 🚀 Flavor Entertainers Backend - Production Deployment Guide

This guide will walk you through deploying the Flavor Entertainers backend to production with all necessary services and environment variables.

## 📋 Prerequisites Checklist

Before starting, ensure you have accounts with:
- ✅ Supabase (Database & Auth)
- ✅ Railway (Hosting Platform)
- ✅ Twilio (WhatsApp Messaging)
- ✅ Australian Bank Account (for PayID)
- ✅ Redis Cloud or similar (Job Queue)
- ✅ Domain name (optional but recommended)

## 🗄️ Step 1: Set up Supabase Project

### Create New Project
1. Go to [supabase.com](https://supabase.com) → "New Project"
2. Organization: Create/select organization
3. Project Name: `flavor-entertainers-backend`
4. Database Password: Generate secure password (save this!)
5. Region: `Sydney` (closest to Western Australia)
6. Pricing Plan: `Pro` (recommended for production)

### Get Project Details
After project creation, go to Settings → API:
- **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ⚠️ Keep secret!

### Configure Authentication
1. Go to Authentication → Settings
2. **Site URL**: `https://your-domain.com` (or Railway URL)
3. **Email Auth**: Enable
4. **Email Templates**: Customize for Flavor Entertainers branding
5. **Rate Limiting**: Enable (default settings)

### Set up Storage
1. Go to Storage → "Create Bucket"
2. Bucket Names:
   - `receipts` (for PayID receipts)
   - `id-documents` (for vetting)
   - `profile-images` (for performers)
3. Set policies for secure access

## 🚄 Step 2: Deploy to Railway

### Install Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

### Initialize Project
```bash
cd flavor-entertainers-backend

# Initialize Railway project
railway init

# Select "Create new project"
# Project name: flavor-entertainers-backend
```

### Configure Environment Variables
```bash
# Set all environment variables
railway variables set NODE_ENV=production
railway variables set PORT=8080

# Database (Supabase)
railway variables set SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
railway variables set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PayID Business Details
railway variables set PAYID_BUSINESS_EMAIL=bookings@lustandlace.com.au
railway variables set PAYID_BUSINESS_NAME="Flavor Entertainers"
railway variables set PAYID_BSB=062-000
railway variables set PAYID_ACCOUNT_NUMBER=12345678

# Twilio (will set up in next step)
railway variables set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
railway variables set TWILIO_AUTH_TOKEN=your_auth_token
railway variables set TWILIO_WHATSAPP_FROM=whatsapp:+61470253286

# Admin Details
railway variables set ADMIN_EMAIL=contact@lustandlace.com.au
railway variables set ADMIN_WHATSAPP=whatsapp:+61470253286

# Application URLs
railway variables set BASE_URL=https://flavor-entertainers-backend-production.up.railway.app
railway variables set CORS_ORIGINS=https://lustandlace.com.au,https://app.lustandlace.com.au

# Redis (Railway Add-on)
railway add redis
# Redis URL will be automatically set

# Security
railway variables set JWT_SECRET=$(openssl rand -base64 64)
railway variables set BCRYPT_ROUNDS=12

# Rate Limiting
railway variables set RATE_LIMIT_MAX=100
railway variables set RATE_LIMIT_WINDOW=900000

# File Upload
railway variables set UPLOAD_MAX_SIZE=10485760
railway variables set UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,application/pdf

# Logging
railway variables set LOG_LEVEL=info
```

### Deploy to Railway
```bash
# Deploy the application
railway up

# Watch deployment logs
railway logs
```

## 📱 Step 3: Configure Twilio WhatsApp

### Set up Twilio Account
1. Go to [twilio.com](https://www.twilio.com) → Sign up/Login
2. Create new project: "Flavor Entertainers"
3. Get Account SID and Auth Token from Dashboard

### WhatsApp Business Setup
1. Go to Messaging → Try WhatsApp
2. **For Production**: Apply for WhatsApp Business API
   - Business verification required
   - Facebook Business Manager account needed
   - Can take 1-2 weeks for approval
3. **For Testing**: Use WhatsApp Sandbox
   - Join sandbox with your phone: Send `join <code>` to +1 415 523 8886
   - Add team phone numbers to sandbox

### Twilio Phone Number
1. Go to Phone Numbers → Manage → Buy a number
2. Select Australian number (+61)
3. Enable WhatsApp capability
4. Set webhook URL: `https://your-railway-app.up.railway.app/webhooks/twilio`

### Update Environment Variables
```bash
railway variables set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
railway variables set TWILIO_AUTH_TOKEN=your_auth_token_here
railway variables set TWILIO_WHATSAPP_FROM=whatsapp:+61470253286
```

## 💳 Step 4: Configure PayID Business Details

### Set up Business PayID
1. **Open Business Bank Account** (if not already done)
   - Recommended: NAB, CBA, ANZ, Westpac
   - Account name: "Flavor Entertainers" or business name
   - Get BSB and Account Number

2. **Register PayID**
   - Use your business phone number: `+61470253286`
   - Or business email: `bookings@lustandlace.com.au`
   - Link to business bank account

3. **Test PayID**
   ```bash
   # Test with small amount from personal account
   # Send $1 to bookings@lustandlace.com.au
   # Verify it appears in business account
   ```

### Update PayID Variables
```bash
# Update with real banking details
railway variables set PAYID_BUSINESS_EMAIL=bookings@lustandlace.com.au
railway variables set PAYID_BUSINESS_NAME="Flavor Entertainers Pty Ltd"
railway variables set PAYID_BSB=062-000  # Replace with real BSB
railway variables set PAYID_ACCOUNT_NUMBER=12345678  # Replace with real account
```

## 🗄️ Step 5: Run Database Migrations

### Connect to Database
```bash
# Install dependencies locally
cd flavor-entertainers-backend
pnpm install

# Set local environment for migration
export SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Run Migrations
```bash
# Run database migrations
pnpm db:migrate

# Seed initial data (admin user, test performers, etc.)
pnpm db:seed
```

### Verify Database
1. Go to Supabase Dashboard → Table Editor
2. Verify tables are created:
   - ✅ profiles
   - ✅ performers
   - ✅ clients
   - ✅ bookings
   - ✅ payments
   - ✅ vetting_applications
   - ✅ blacklist
   - ✅ approved_clients
   - ✅ audit_log

### Create Admin User
```sql
-- Run in Supabase SQL Editor
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@lustandlace.com.au',
    crypt('Admin@2024!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"role": "admin"}'::jsonb
);
```

## 🔧 Step 6: Configure Custom Domain (Optional)

### Set up Domain
1. **Purchase domain** (if not already owned)
   - Recommended: `api.lustandlace.com.au`

2. **Railway Domain Setup**
   ```bash
   # Add custom domain in Railway
   railway domain add api.lustandlace.com.au
   ```

3. **Update DNS Records**
   - Add CNAME record: `api` → `flavor-entertainers-backend-production.up.railway.app`

4. **Update Environment Variables**
   ```bash
   railway variables set BASE_URL=https://api.lustandlace.com.au
   railway variables set CORS_ORIGINS=https://lustandlace.com.au,https://app.lustandlace.com.au
   ```

## 📧 Step 7: Set up Email Service (Optional)

### Resend Setup
1. Go to [resend.com](https://resend.com) → Sign up
2. Verify domain: `lustandlace.com.au`
3. Add DNS records for email authentication
4. Get API key

```bash
railway variables set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

## ✅ Step 8: Verify Deployment

### Health Check
```bash
# Check if API is running
curl https://your-railway-app.up.railway.app/healthz

# Should return:
# {"status":"healthy","timestamp":"2024-01-15T10:00:00Z","version":"1.0.0","environment":"production"}
```

### API Documentation
Visit: `https://your-railway-app.up.railway.app/docs`

### Test Endpoints
```bash
# Test booking creation
curl -X POST https://your-railway-app.up.railway.app/bookings/request \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Client",
    "email": "test@example.com",
    "phone": "+61412345678",
    "event_date": "2024-12-31",
    "event_time": "20:00",
    "location": "Perth WA",
    "service": "Topless Waitress",
    "rate": 500
  }'
```

## 🔒 Step 9: Security Checklist

### Environment Variables Security
- ✅ All secrets set in Railway (not in code)
- ✅ Service role key only in backend
- ✅ Strong JWT secret generated
- ✅ CORS origins properly configured

### Database Security
- ✅ RLS enabled on all tables
- ✅ Proper policies configured
- ✅ Admin user created securely

### API Security
- ✅ Rate limiting enabled
- ✅ Input validation with Zod
- ✅ Helmet security headers
- ✅ HTTPS enforced

## 📊 Step 10: Monitoring Setup

### Railway Monitoring
1. **Metrics**: View in Railway dashboard
2. **Logs**: `railway logs --tail`
3. **Alerts**: Set up in Railway settings

### Uptime Monitoring
1. **UptimeRobot** or **Pingdom**
2. Monitor: `https://your-railway-app.up.railway.app/healthz`
3. Alert email: `admin@lustandlace.com.au`

## 🎯 Production Environment Variables Summary

```bash
# Core Application
NODE_ENV=production
PORT=8080
BASE_URL=https://api.lustandlace.com.au
CORS_ORIGINS=https://lustandlace.com.au,https://app.lustandlace.com.au

# Database & Auth
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PayID Business Details
PAYID_BUSINESS_EMAIL=bookings@lustandlace.com.au
PAYID_BUSINESS_NAME=Flavor Entertainers Pty Ltd
PAYID_BSB=062-000
PAYID_ACCOUNT_NUMBER=12345678

# Messaging
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+61470253286

# Admin Contact
ADMIN_EMAIL=contact@lustandlace.com.au
ADMIN_WHATSAPP=whatsapp:+61470253286

# Redis (Auto-configured by Railway)
REDIS_URL=redis://red-xxxxxxxxxxxx:6379

# Security
JWT_SECRET=base64-encoded-secret-key
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,application/pdf

# Logging
LOG_LEVEL=info

# Email (Optional)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

## 🎉 You're Ready!

Your Flavor Entertainers backend is now deployed and ready for production use!

**Next Steps:**
1. Test the complete booking flow
2. Train team on admin dashboard
3. Set up monitoring alerts
4. Create backup procedures
5. Document operational procedures

**Support:** If you need help, check the logs with `railway logs` or contact the development team.