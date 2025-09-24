# 🔧 Service Setup Guide - Step by Step

This guide provides exact steps to set up all required services for Flavor Entertainers backend.

## 1. 🗄️ Supabase Setup (Database & Auth)

### Create Project
1. **Visit**: [supabase.com](https://supabase.com)
2. **Sign up/Login** with GitHub or email
3. **Create Organization**: "Flavor Entertainers" or use existing
4. **New Project**:
   - Name: `flavor-entertainers-backend`
   - Database Password: Generate strong password (save in password manager)
   - Region: `Sydney` (ap-southeast-2)
   - Plan: `Pro` ($25/month - recommended for production)

### Get API Keys (COPY THESE!)
Go to **Settings → API**:

```bash
# Copy these values - you'll need them for Railway
PROJECT_URL=https://xxxxxxxxxxxxxxxxx.supabase.co
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIs...
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIs...
```

⚠️ **IMPORTANT**: Keep the Service Role Key secret!

### Configure Auth Settings
Go to **Authentication → Settings**:
- **Site URL**: `https://your-railway-app.up.railway.app` (update after Railway deployment)
- **Additional URLs**: Add your main website
- **Email Confirm**: Enable
- **Email Rate Limit**: 100 per hour

### Create Storage Buckets
Go to **Storage**:
1. **Create Bucket**: `receipts`
   - Public: No
   - File size limit: 10MB
   - Allowed MIME types: image/jpeg, image/png, application/pdf

2. **Create Bucket**: `id-documents`
   - Public: No
   - File size limit: 10MB

3. **Create Bucket**: `profile-images`
   - Public: Yes
   - File size limit: 5MB

## 2. 🚄 Railway Deployment

### Install Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Or with curl
curl -fsSL https://railway.app/install.sh | sh
```

### Deploy with Our Script
```bash
cd flavor-entertainers-backend

# Make script executable
chmod +x deploy.sh

# Run deployment script (interactive)
./deploy.sh
```

The script will ask you for:
- Supabase URL, Service Role Key, Anon Key
- PayID business details (email, BSB, account number)
- Twilio credentials
- Admin contact details

### Manual Railway Setup (Alternative)
If you prefer manual setup:

```bash
# Login to Railway
railway login

# Initialize project
railway init flavor-entertainers-backend

# Add Redis addon
railway add redis

# Set environment variables (see .env.production file)
railway variables set NODE_ENV=production
# ... (copy all variables from .env.production)

# Deploy
railway up
```

## 3. 💳 PayID Business Setup

### Banking Requirements
You need an Australian business bank account:

**Recommended Banks:**
- Commonwealth Bank (CBA) - Great PayID support
- NAB - Excellent business features
- ANZ - Good online banking
- Westpac - Reliable service

### Account Setup
1. **Open Business Account**:
   - Account Name: "Flavor Entertainers" or your business name
   - Account Type: Business Transaction Account
   - Get BSB and Account Number

2. **Register PayID**:
   - **Option 1**: Use business phone `+61470253286`
   - **Option 2**: Use business email `bookings@lustandlace.com.au`
   - Link to your business account

3. **Test PayID**:
   ```bash
   # Send $1 test payment from personal account
   # Recipient: bookings@lustandlace.com.au
   # Reference: TEST
   ```

### Update Environment Variables
```bash
# Update Railway with real banking details
railway variables set PAYID_BUSINESS_EMAIL=bookings@lustandlace.com.au
railway variables set PAYID_BSB=062-000  # Your real BSB
railway variables set PAYID_ACCOUNT_NUMBER=12345678  # Your real account number
```

## 4. 📱 Twilio WhatsApp Setup

### Create Twilio Account
1. **Visit**: [twilio.com](https://www.twilio.com)
2. **Sign up** with business email
3. **Verify** phone number: `+61470253286`
4. **Create Project**: "Flavor Entertainers"

### Get Credentials
From **Console Dashboard**:
```bash
ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_TOKEN=your_auth_token_here
```

### WhatsApp Setup Options

#### Option A: WhatsApp Sandbox (Quick Start)
1. **Go to**: Messaging → Try WhatsApp
2. **Join Sandbox**:
   - Send `join <code>` to `+1 415 523 8886`
   - Add team phone numbers to sandbox
3. **For Testing Only** - Limited to verified numbers

#### Option B: WhatsApp Business API (Production)
1. **Go to**: Messaging → WhatsApp
2. **Apply for Business API**:
   - Requires Facebook Business Manager account
   - Business verification process (1-2 weeks)
   - Template approval needed

3. **Phone Number Setup**:
   - Buy Australian number: `+61` prefix
   - Enable WhatsApp capability
   - Set webhook: `https://your-railway-app.up.railway.app/webhooks/twilio`

### Update Environment Variables
```bash
railway variables set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
railway variables set TWILIO_AUTH_TOKEN=your_auth_token_here
railway variables set TWILIO_WHATSAPP_FROM=whatsapp:+61470253286
```

## 5. 🗄️ Database Migration

### Install Dependencies Locally
```bash
cd flavor-entertainers-backend
pnpm install
```

### Run Migrations
```bash
# Set environment variables for migration
export SUPABASE_URL=https://xxxxxxxxxxxxxxxxx.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Run migrations
pnpm db:migrate

# Seed initial data
pnpm db:seed
```

### Create Admin User
In **Supabase → SQL Editor**, run:
```sql
-- Insert admin user into auth.users
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
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@lustandlace.com.au',
    crypt('FlavorAdmin2024!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"role": "admin"}'::jsonb
);
```

**Admin Login Credentials**:
- Email: `admin@lustandlace.com.au`
- Password: `FlavorAdmin2024!`
- ⚠️ Change password after first login!

## 6. 🌐 Custom Domain (Optional)

### Domain Setup
If you want `api.lustandlace.com.au`:

1. **Railway Dashboard**:
   - Go to your project
   - Settings → Domains
   - Add: `api.lustandlace.com.au`

2. **DNS Configuration**:
   - Add CNAME record: `api` → `your-project.up.railway.app`

3. **Update Environment Variables**:
   ```bash
   railway variables set BASE_URL=https://api.lustandlace.com.au
   railway variables set CORS_ORIGINS=https://lustandlace.com.au,https://app.lustandlace.com.au
   ```

## 7. ✅ Verification Checklist

### Test API Endpoints
```bash
# Health check
curl https://your-railway-app.up.railway.app/healthz

# API documentation
open https://your-railway-app.up.railway.app/docs

# Create test booking
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

### Test PayID Payment Flow
1. **Create booking** (via API or Postman)
2. **Login as admin** and approve booking
3. **Verify PayID instructions** are generated
4. **Test small PayID payment** to your business account
5. **Upload receipt** and verify admin can see it
6. **Approve payment** and verify booking status changes

### Test WhatsApp Notifications
1. **Add your phone** to Twilio sandbox
2. **Trigger notification** (booking approval)
3. **Verify message** is received

## 📞 Support & Troubleshooting

### Common Issues

**Migration Fails**:
```bash
# Check database connection
SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
client.from('profiles').select('count').then(console.log).catch(console.error);
"
```

**Railway Deployment Issues**:
```bash
# Check deployment logs
railway logs --tail

# Check service status
railway status
```

**WhatsApp Not Working**:
- Verify sandbox setup
- Check phone number format (+61...)
- Confirm Twilio credentials

**PayID Issues**:
- Test manual PayID transfer
- Verify BSB/Account number format
- Check business account is active

### Getting Help
- **Railway Logs**: `railway logs --tail`
- **Supabase Logs**: Dashboard → Logs
- **API Documentation**: `https://your-app.up.railway.app/docs`
- **Health Check**: `https://your-app.up.railway.app/healthz`

## 🎉 You're Ready!

Once all services are set up and verified, your Flavor Entertainers backend will be fully operational with:

✅ **PayID payment processing**
✅ **WhatsApp notifications**
✅ **Admin dashboard API**
✅ **Client vetting system**
✅ **Audit logging**
✅ **Production security**

**Next**: Set up your frontend application to consume the API!