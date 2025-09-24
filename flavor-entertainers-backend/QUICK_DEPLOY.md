# 🚀 Quick Deploy - Flavor Entertainers Backend

**Deploy your Flavor Entertainers backend in 15 minutes!**

## 📋 Prerequisites
- ✅ Australian business bank account
- ✅ PayID set up (bookings@lustandlace.com.au)
- ✅ Phone number: +61470253286

## 🏃‍♂️ Quick Steps

### 1. Create Accounts (5 minutes)
**Supabase**: [supabase.com](https://supabase.com) → New Project → "flavor-entertainers-backend"
**Railway**: [railway.app](https://railway.app) → Sign up with GitHub
**Twilio**: [twilio.com](https://www.twilio.com) → Sign up → New Project

### 2. Deploy with One Command (5 minutes)
```bash
cd flavor-entertainers-backend
chmod +x deploy.sh
./deploy.sh
```

The script will:
- ✅ Build and deploy to Railway
- ✅ Set up all environment variables
- ✅ Add Redis addon
- ✅ Run database migrations
- ✅ Create seed data
- ✅ Test the deployment

### 3. Create Admin User (2 minutes)
In **Supabase → SQL Editor**:
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

### 4. Test Everything (3 minutes)
```bash
# Test API
curl https://your-railway-app.up.railway.app/healthz

# View documentation
open https://your-railway-app.up.railway.app/docs

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

## 🎯 What You Get

✅ **PayID Payment System** - Australian banking integration
✅ **WhatsApp Notifications** - Automated client communication
✅ **Admin Dashboard API** - Complete booking management
✅ **Client Vetting** - ID verification and blacklisting
✅ **Audit Logging** - Complete activity tracking
✅ **Production Security** - Rate limiting, validation, RLS
✅ **Auto-scaling** - Railway handles traffic spikes
✅ **Monitoring** - Built-in health checks and logging

## 🔑 Login Credentials

**Admin Login**:
- Email: `admin@lustandlace.com.au`
- Password: `FlavorAdmin2024!`
- 🔐 Change after first login!

**API Documentation**: `https://your-app.up.railway.app/docs`

## 🌐 URLs You'll Get

- **API Base**: `https://flavor-entertainers-backend-production.up.railway.app`
- **Health Check**: `/healthz`
- **Documentation**: `/docs`
- **Admin Endpoints**: `/admin/*`
- **Booking API**: `/bookings/*`
- **Payment API**: `/payments/*`

## 🎉 You're Live!

Your Flavor Entertainers backend is now running in production with:
- PayID payment processing
- WhatsApp notifications
- Complete booking management
- Admin dashboard
- Production security

**Next**: Connect your frontend app to start taking bookings!