# 🚀 Quick Start Guide

Get your booking platform running in 10 minutes!

## ✅ Prerequisites Complete

- ✅ Supabase URL: `https://qmedckkwtgkhrdihqrnd.supabase.co`
- ✅ Anon Key: Configured
- ✅ Service Role Key: Configured
- ✅ Encryption Key: Generated
- ✅ Project files: Ready

---

## 📋 Setup Steps

### Step 1: Install Dependencies (2 min)

```bash
cd C:\Users\annai\booking-platform
npm install
```

### Step 2: Verify Setup (30 sec)

```bash
npm run verify
```

This will check if everything is configured correctly.

### Step 3: Set Up Database (5 min)

Follow the instructions in **`setup-database.md`**:

1. Go to https://supabase.com/dashboard/project/qmedckkwtgkhrdihqrnd
2. Open SQL Editor
3. Copy and run `supabase/schema.sql`
4. Copy and run `supabase/rls-policies.sql`
5. Create 3 storage buckets: `profiles`, `ids`, `receipts`
6. Enable Realtime on `bookings` table

### Step 4: Start Development Server (30 sec)

```bash
npm run dev
```

Open http://localhost:3000

---

## 🎉 You're Ready!

Your booking platform is now running with:

✅ Complete database with 5 tables
✅ Row Level Security (RLS) enabled
✅ API routes for all operations
✅ Real-time updates
✅ Secure file encryption
✅ Audit logging

---

## 🔧 Optional: WhatsApp Notifications

To enable WhatsApp notifications, add these to `.env.local`:

```env
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+61XXXXXXXXX
ADMIN_WHATSAPP=whatsapp:+61XXXXXXXXX
```

Get credentials from: https://www.twilio.com/console

---

## 📱 Test the Platform

### Create Admin User

1. Run this SQL in Supabase SQL Editor:

```sql
UPDATE users
SET
  email = 'your-email@example.com',
  phone = '+61400000000',
  full_name = 'Your Name'
WHERE role = 'admin';
```

2. Sign up at http://localhost:3000/signup using this email

### Test API Routes

The following API routes are ready to use:

**Bookings**
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List bookings
- `POST /api/bookings/[id]/accept` - Accept
- `POST /api/bookings/[id]/decline` - Decline
- `POST /api/bookings/[id]/eta` - Submit ETA ⭐

**Payments**
- `POST /api/payid/verify` - Verify payment

**Vetting**
- `POST /api/vetting` - Submit ID
- `GET /api/vetting` - List applications
- `PATCH /api/vetting` - Review application

**Blacklist**
- `GET /api/blacklist` - List
- `POST /api/blacklist` - Add
- `DELETE /api/blacklist` - Remove

---

## 📚 Next Steps

1. **Build Frontend Components** (see `IMPLEMENTATION_GUIDE.md`)
   - BookingForm
   - AdminDashboard
   - ETAForm
   - etc.

2. **Deploy to Vercel**
   - Connect GitHub repo
   - Add environment variables
   - Deploy!

3. **Set Up Twilio**
   - Configure WhatsApp notifications
   - Test message delivery

---

## 🆘 Need Help?

- **Setup Issues**: See `setup-database.md`
- **Complete Guide**: See `README.md`
- **Implementation**: See `IMPLEMENTATION_GUIDE.md`
- **Project Structure**: See `PROJECT_STRUCTURE.md`

---

## 🎯 What's Working Now

### ✅ Backend (100% Complete)
- Database schema with all tables
- RLS policies for security
- 12 API routes fully functional
- WhatsApp integration ready
- Encryption for sensitive files
- Audit logging system
- Real-time updates

### ⏳ Frontend (Needs Work)
- Home page ✅
- PerformerGrid component ✅
- Other components pending (see IMPLEMENTATION_GUIDE.md)

---

## 💡 Pro Tips

1. **Use the MCP Supabase integration** - You have it configured!
2. **Check audit logs** - Every action is tracked
3. **Test with blacklist** - Add an email and try booking
4. **Monitor real-time** - Watch performer availability update live

---

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Verify setup
npm run verify

# Start development
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

---

Happy coding! 🚀
