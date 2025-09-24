# 🚀 Vercel Deployment Guide - Flavor Entertainers Backend

**Complete production deployment guide for Vercel hosting**

## 🔍 Backend Configuration Verified

✅ **PayID Payment System** - Australian banking integration
✅ **Fastify API Server** - Production-ready with middleware
✅ **Supabase Database** - PostgreSQL with RLS policies
✅ **Twilio WhatsApp** - Automated notifications
✅ **JWT Authentication** - Secure user sessions
✅ **Rate Limiting** - DDoS protection
✅ **File Uploads** - Receipt and ID document handling
✅ **Audit Logging** - Complete activity tracking
✅ **Clean Production Data** - No demo data included

## 📋 Prerequisites Checklist

Before deploying, ensure you have:

- [ ] **GitHub Account** - Repository at https://github.com/annaivky-ship-it/BOOKING-SYSTEM
- [ ] **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
- [ ] **Supabase Account** - Database hosting at [supabase.com](https://supabase.com)
- [ ] **Australian Business Bank Account** - For PayID payments
- [ ] **Twilio Account** - For WhatsApp notifications

## 🏃‍♂️ Quick Deployment (15 minutes)

### Step 1: Vercel Project Setup (3 minutes)

1. **Import from GitHub**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import `annaivky-ship-it/BOOKING-SYSTEM`
   - Name: `flavor-entertainers-backend`

2. **Build Configuration**:
   - Framework Preset: "Other"
   - Root Directory: Leave empty
   - Build Command: `pnpm install && pnpm build`
   - Output Directory: Leave empty
   - Install Command: `pnpm install`

### Step 2: Environment Variables (5 minutes)

In Vercel Dashboard → Settings → Environment Variables, add:

#### **Core Application**
```bash
NODE_ENV=production
PORT=3000
```

#### **Database (Supabase)**
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

#### **PayID Business Details**
```bash
PAYID_BUSINESS_EMAIL=bookings@lustandlace.com.au
PAYID_BUSINESS_NAME=Flavor Entertainers
PAYID_BSB=062-000
PAYID_ACCOUNT_NUMBER=12345678
```

#### **Twilio WhatsApp**
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+61470253286
```

#### **Admin Contact**
```bash
ADMIN_EMAIL=contact@lustandlace.com.au
ADMIN_WHATSAPP=whatsapp:+61470253286
```

#### **Security**
```bash
JWT_SECRET=your-base64-jwt-secret-here
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,application/pdf
LOG_LEVEL=info
```

### Step 3: Deploy & Configure URLs (3 minutes)

1. **Deploy**: Click "Deploy" in Vercel dashboard
2. **Get URL**: Copy your deployment URL (e.g., `https://flavor-entertainers-backend.vercel.app`)
3. **Update Environment Variables**:
   ```bash
   BASE_URL=https://your-deployment-url.vercel.app
   CORS_ORIGINS=https://lustandlace.com.au,https://app.lustandlace.com.au,https://your-deployment-url.vercel.app
   ```
4. **Redeploy**: Trigger new deployment with updated environment variables

### Step 4: Database Setup (4 minutes)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project: "flavor-entertainers-backend"
   - Select region: "Sydney (ap-southeast-2)"
   - Copy URL and API keys to Vercel environment variables

2. **Run Database Migrations**:
   ```bash
   # Local terminal with environment variables set
   cd flavor-entertainers-backend
   export SUPABASE_URL=https://your-project.supabase.co
   export SUPABASE_SERVICE_ROLE_KEY=your-service-key
   export NODE_ENV=production
   pnpm db:migrate
   pnpm db:seed
   ```

3. **Create Admin User** in Supabase SQL Editor:
   ```sql
   INSERT INTO auth.users (
       id, instance_id, email, encrypted_password,
       email_confirmed_at, created_at, updated_at, raw_user_meta_data
   ) VALUES (
       '00000000-0000-0000-0000-000000000001',
       '00000000-0000-0000-0000-000000000000',
       'admin@lustandlace.com.au',
       crypt('FlavorAdmin2024!', gen_salt('bf')),
       NOW(), NOW(), NOW(),
       '{"role": "admin"}'::jsonb
   );
   ```

## 🧪 Testing Deployment

### Health Check
```bash
curl https://your-deployment-url.vercel.app/healthz
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-XX",
  "version": "1.0.0",
  "environment": "production"
}
```

### API Documentation
Visit: `https://your-deployment-url.vercel.app/docs`

### Test Booking Creation
```bash
curl -X POST https://your-deployment-url.vercel.app/bookings/request \
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

## 🔧 Service Configurations

### Supabase Configuration
- **Authentication Settings**:
  - Site URL: `https://your-deployment-url.vercel.app`
  - Additional URLs: `https://lustandlace.com.au`
  - Email confirmation: Enabled

- **Storage Buckets**:
  - `receipts` (private, 10MB limit)
  - `id-documents` (private, 10MB limit)
  - `profile-images` (public, 5MB limit)

### Twilio WhatsApp Setup
1. **Sandbox Mode** (for testing):
   - Join sandbox at console.twilio.com
   - Add admin phone number to sandbox

2. **Business API** (for production):
   - Apply for WhatsApp Business API
   - Set webhook: `https://your-deployment-url.vercel.app/webhooks/twilio`

### PayID Business Account
- **Bank Account**: Australian business account with PayID enabled
- **PayID**: Use business email `bookings@lustandlace.com.au`
- **Testing**: Send small test payment to verify setup

## 📊 Monitoring & Logs

### Vercel Functions
- View logs: Vercel Dashboard → Functions → Logs
- Monitor performance and errors

### Database Monitoring
- Supabase Dashboard → Logs
- Query performance and API usage

### Health Monitoring
- Set up uptime monitoring for `/healthz` endpoint
- Configure alerts for failures

## 🔐 Security Considerations

✅ **Environment Variables**: All secrets stored in Vercel environment
✅ **HTTPS Only**: Enforced by Vercel
✅ **CORS Configuration**: Restricted to known domains
✅ **Rate Limiting**: Prevents API abuse
✅ **JWT Authentication**: Secure session management
✅ **Input Validation**: All endpoints use Zod schemas
✅ **SQL Injection Prevention**: Supabase client parameterized queries
✅ **Row Level Security**: Database-level access control

## 🌐 Custom Domain (Optional)

1. **Add Domain in Vercel**:
   - Dashboard → Settings → Domains
   - Add: `api.lustandlace.com.au`

2. **DNS Configuration**:
   - Add CNAME: `api` → `cname.vercel-dns.com`

3. **Update Environment Variables**:
   ```bash
   BASE_URL=https://api.lustandlace.com.au
   ```

## 🎯 Production URLs

After deployment, you'll have:

- **API Base**: `https://your-deployment-url.vercel.app`
- **Health Check**: `/healthz`
- **API Documentation**: `/docs`
- **Admin Endpoints**: `/admin/*`
- **Booking API**: `/bookings/*`
- **Payment API**: `/payments/*`
- **File Uploads**: `/upload/*`

## 🎉 Deployment Complete!

Your Flavor Entertainers backend is now live with:

✅ **PayID Payment Processing**
✅ **WhatsApp Notifications**
✅ **Admin Dashboard API**
✅ **Client Vetting System**
✅ **Audit Logging**
✅ **Production Security**
✅ **Clean Database** (no demo data)

### Admin Login Credentials
- **Email**: `admin@lustandlace.com.au`
- **Password**: `FlavorAdmin2024!`
- **⚠️ Change password after first login!**

## 🆘 Troubleshooting

### Build Failures
- Check Vercel build logs
- Verify `pnpm-lock.yaml` is committed
- Ensure Node.js version compatibility

### Runtime Errors
- Check Vercel function logs
- Verify environment variables are set
- Test database connection

### Database Connection Issues
- Verify Supabase URL and keys
- Check RLS policies are applied
- Ensure admin user exists

### Common Issues
- **Timeout**: Increase function timeout in vercel.json
- **Memory**: Check function memory usage
- **Cold Starts**: Expected for serverless functions

## 📞 Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **API Documentation**: `/docs` endpoint
- **Health Status**: `/healthz` endpoint

---

**🔗 Repository**: https://github.com/annaivky-ship-it/BOOKING-SYSTEM
**⚡ Powered by**: Vercel + Supabase + PayID + Twilio