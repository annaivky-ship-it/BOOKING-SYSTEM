# 🚀 Quick Reference - Flavor Entertainers Platform

## 📁 Project Files

### SQL Files (for Supabase)
- `supabase-schema-complete.sql` - Complete database schema (run first)
- `supabase-seed-data.sql` - Test data for development (run second)
- `supabase-storage-setup.sql` - Storage bucket configuration (run third)

### Documentation
- `SUPABASE_SETUP_GUIDE.md` - Complete setup instructions
- `PRESENTATION_OVERVIEW.md` - Business overview and sales pitch
- `README.md` - Project readme

### Configuration
- `.env.local` - Your API keys (already configured)
- `.env.example` - Template for environment variables

---

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔗 Important URLs

### Local Development
- **App:** http://localhost:3000
- **Network:** http://192.168.0.6:3000

### Supabase Dashboard
- **Login:** https://app.supabase.com
- **Your Project:** https://app.supabase.com/project/[your-project-id]

### API Endpoints (once Supabase is set up)
- **API URL:** `https://[your-project-id].supabase.co/rest/v1/`
- **Auth URL:** `https://[your-project-id].supabase.co/auth/v1/`
- **Storage URL:** `https://[your-project-id].supabase.co/storage/v1/`

---

## 🗂️ Database Tables

| Table | Rows | Purpose |
|-------|------|---------|
| services | 15 | Service catalog with pricing |
| performers | 6 | Entertainer profiles |
| bookings | 4 | Client booking requests |
| do_not_serve_list | 3 | Safety blocklist |
| communications | 3 | In-app messages |
| admins | 1 | Admin accounts |
| clients | - | VIP tracking |
| booking_audit_log | - | Change history |

---

## 👥 Demo Data

### Performers
1. **Scarlett** - Available (Perth North, South, Southwest)
2. **Jasmine** - Busy (Perth South)
3. **Amber** - Available (Perth North, Northwest)
4. **Chloe** - Offline (Southwest)
5. **April Flavor** - Available (Perth North, South)
6. **Anna Ivky** - Available (Perth South, Southwest)

### Services (15 total)
- **Waitressing:** Lingerie ($110/hr), Topless ($160/hr), Nude ($260/hr)
- **Strip Shows:** Hot Cream ($380), Pearl ($500), up to Absolute Works ($1000)
- **Promotional:** Promo Model ($100/hr), Atmospheric ($90/hr), Games Host ($120/hr)

### Admin Login
- **Email:** admin@flavorentertainers.com
- **Password:** admin123 (⚠️ change in production!)

### Blocked Clients (Do Not Serve)
- alex.blocked@example.com
- dan.the.man@email.com

---

## 🎨 Features Implemented

### ✅ Client Dashboard
- Browse performers by availability
- Filter by service area
- View detailed performer profiles
- Multi-service booking
- Cost calculator with deposit
- ID upload for verification
- PayID simulation

### ✅ Performer Dashboard
- View assigned bookings
- Accept/decline requests
- Set availability status
- Submit "Do Not Serve" entries
- View earnings
- Update ETA

### ✅ Admin Dashboard
- Manage all bookings
- Vet client applications
- Verify deposits
- Approve/reject DNS entries
- Override performer decisions
- Reassign bookings
- View analytics

### 🔒 Security Features
- Row Level Security (RLS) on all tables
- Auto-block for DNS list clients
- Secure file uploads
- VIP client detection (3+ bookings)
- Audit trail logging

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript
- **Styling:** TailwindCSS (inline)
- **Icons:** Lucide React
- **Backend:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **AI:** Google Gemini
- **Build Tool:** Vite 6
- **Deployment:** Vercel/Netlify ready

---

## 📦 Project Structure

```
BOOKING/
├── components/           # React components
│   ├── AdminDashboard.tsx
│   ├── PerformerDashboard.tsx
│   ├── ClientDashboard.tsx
│   ├── BookingProcess.tsx
│   └── ...
├── services/            # API services
│   ├── supabaseClient.ts
│   ├── geminiService.ts
│   └── api.ts
├── data/                # Mock data
│   └── mockData.ts
├── utils/               # Helper functions
│   └── bookingUtils.ts
├── types.ts             # TypeScript types
├── App.tsx              # Main app component
├── index.tsx            # Entry point
└── supabase-*.sql       # Database setup files
```

---

## 🚦 Setup Checklist

### Initial Setup
- [x] Install dependencies (`npm install`)
- [x] Configure Gemini API key
- [x] Start dev server

### Supabase Setup
- [ ] Create Supabase project
- [ ] Run `supabase-schema-complete.sql`
- [ ] Run `supabase-seed-data.sql`
- [ ] Create storage buckets
- [ ] Update API keys in code
- [ ] Test connection

### Deployment (Optional)
- [ ] Push to GitHub
- [ ] Connect to Vercel/Netlify
- [ ] Set environment variables
- [ ] Deploy!

---

## 🐛 Common Issues & Fixes

### Port 3000 already in use
```bash
# Kill the process on port 3000
npx kill-port 3000
# Then restart
npm run dev
```

### Supabase connection failed
1. Check your API keys are correct
2. Verify project URL format: `https://xxxxx.supabase.co`
3. Ensure tables exist in Supabase dashboard

### Performers not loading
1. Check `supabase-seed-data.sql` was run
2. Verify 6 rows in performers table
3. Check browser console for errors

### TypeScript errors
```bash
# Type check
npx tsc --noEmit

# Most errors can be ignored (false positives)
```

---

## 📊 Cost Breakdown

### Development (FREE)
- Supabase: Free tier (500MB database, 1GB storage)
- Gemini AI: Free tier (60 requests/minute)
- Vercel: Free tier (hobby projects)

### Production (Low Cost)
- Supabase Pro: $25/month (8GB database, 100GB storage)
- Twilio SMS: ~$0.0075 per SMS
- Vercel Pro: $20/month (optional)
- **Total:** ~$50-75/month for small-medium agency

---

## 🎯 Next Steps

1. **Complete Supabase Setup** (if not done)
   - Follow `SUPABASE_SETUP_GUIDE.md`

2. **Test the Platform**
   - Browse performers
   - Create test bookings
   - Try each dashboard role

3. **Customize**
   - Update performer photos
   - Adjust service pricing
   - Modify service areas

4. **Deploy**
   - Push to GitHub
   - Deploy to Vercel
   - Configure domain

5. **Go Live!**
   - Add real performers
   - Set up payment gateway
   - Enable SMS notifications

---

## 📞 Support

For issues or questions:
1. Check this quick reference
2. Read `SUPABASE_SETUP_GUIDE.md`
3. Review `PRESENTATION_OVERVIEW.md`
4. Check browser console logs
5. Review Supabase dashboard logs

---

**Built with ❤️ for Flavor Entertainers**
