# ✅ Supabase Setup Checklist

Use this checklist to set up your Supabase backend step-by-step.

---

## 🎯 Phase 1: Create Supabase Project (5 minutes)

- [ ] Go to https://supabase.com and sign in
- [ ] Click "New Project"
- [ ] Enter project name: **Flavor Entertainers**
- [ ] Set a strong database password (save it!)
- [ ] Select region: **Sydney** (closest to Perth, WA)
- [ ] Click "Create new project"
- [ ] ⏳ Wait 2-3 minutes for project setup

---

## 🗄️ Phase 2: Set Up Database Schema (3 minutes)

- [ ] Click "SQL Editor" in left sidebar
- [ ] Click "New Query"
- [ ] Open file: `supabase-schema-complete.sql`
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Click "Run" (or Ctrl+Enter)
- [ ] ✅ Verify "Success. No rows returned" message

### What this created:
- [ ] 8 database tables
- [ ] Row Level Security policies
- [ ] Helper functions
- [ ] Triggers and indexes

---

## 🌱 Phase 3: Seed Test Data (2 minutes)

- [ ] Click "New Query" in SQL Editor
- [ ] Open file: `supabase-seed-data.sql`
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] ✅ Verify "Success" messages

### What this created:
- [ ] 15 services (waitressing, shows, etc.)
- [ ] 6 demo performers
- [ ] 4 sample bookings
- [ ] 3 "Do Not Serve" entries
- [ ] 3 communications
- [ ] 1 admin account

---

## 📁 Phase 4: Create Storage Buckets (3 minutes)

### Bucket 1: booking-documents
- [ ] Click "Storage" in left sidebar
- [ ] Click "New bucket"
- [ ] Name: `booking-documents`
- [ ] Public: **No** (uncheck)
- [ ] Click "Create bucket"

### Bucket 2: deposit-receipts
- [ ] Click "New bucket"
- [ ] Name: `deposit-receipts`
- [ ] Public: **No** (uncheck)
- [ ] Click "Create bucket"

### Bucket 3: performer-photos
- [ ] Click "New bucket"
- [ ] Name: `performer-photos`
- [ ] Public: **Yes** (check)
- [ ] Click "Create bucket"

---

## 🔧 Phase 5: Configure Storage Policies (2 minutes)

- [ ] Click "SQL Editor"
- [ ] Click "New Query"
- [ ] Open file: `supabase-storage-setup.sql`
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] ✅ Verify success

---

## 🔑 Phase 6: Get Your API Keys (1 minute)

- [ ] Click "Settings" in left sidebar
- [ ] Click "API"
- [ ] Copy your **Project URL**
- [ ] Copy your **anon public** key
- [ ] Keep this tab open (you'll need these next)

---

## ⚙️ Phase 7: Update Your App (2 minutes)

### Option A: Update Code Directly
- [ ] Open file: `services/supabaseClient.ts`
- [ ] Find line 13: `process.env.SUPABASE_URL = '...'`
- [ ] Replace with your Project URL
- [ ] Find line 14: `process.env.SUPABASE_ANON_KEY = '...'`
- [ ] Replace with your anon key
- [ ] Save file

### Option B: Use Environment Variables (Recommended)
- [ ] Open file: `.env.local`
- [ ] Add these lines:
```
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
```
- [ ] Update `vite.config.ts` to read these variables
- [ ] Save file

---

## ✅ Phase 8: Verify Everything Works (5 minutes)

### Check Database Tables
- [ ] Go to Supabase Dashboard
- [ ] Click "Table Editor"
- [ ] Verify you see these tables with data:
  - [ ] services (15 rows)
  - [ ] performers (6 rows)
  - [ ] bookings (4 rows)
  - [ ] do_not_serve_list (3 rows)
  - [ ] communications (3 rows)
  - [ ] admins (1 row)

### Check Storage Buckets
- [ ] Click "Storage" in left sidebar
- [ ] Verify you see these 3 buckets:
  - [ ] booking-documents (🔒 private)
  - [ ] deposit-receipts (🔒 private)
  - [ ] performer-photos (🌐 public)

### Test Your App
- [ ] Restart your dev server (Ctrl+C, then `npm run dev`)
- [ ] Go to http://localhost:3000
- [ ] You should see 6 performers in the gallery
- [ ] Click on "April Flavor" to view profile
- [ ] Services should load with pricing
- [ ] Click "Book Now" to test booking flow

---

## 🎉 Success Criteria

Your setup is complete when:
- ✅ All tables show data in Supabase Table Editor
- ✅ All 3 storage buckets exist
- ✅ Performers load on homepage
- ✅ No console errors in browser
- ✅ Booking form calculates costs correctly

---

## 🐛 Troubleshooting

### ❌ "relation does not exist" error
**Fix:** You didn't run the schema SQL. Go back to Phase 2.

### ❌ No performers showing
**Fix:**
1. Run `supabase-seed-data.sql` (Phase 3)
2. Check Table Editor → performers has 6 rows
3. Verify API keys are correct

### ❌ Storage upload fails
**Fix:**
1. Verify buckets exist (Phase 4)
2. Run storage policy SQL (Phase 5)
3. Check bucket names match exactly

### ❌ CORS errors
**Fix:**
1. Verify you're using the correct Project URL
2. Check Supabase Dashboard → Settings → API → Allow all origins (for development)

### ❌ App won't start
**Fix:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📊 Time Estimate

| Phase | Time | Difficulty |
|-------|------|------------|
| 1. Create project | 5 min | Easy |
| 2. Schema setup | 3 min | Easy |
| 3. Seed data | 2 min | Easy |
| 4. Storage buckets | 3 min | Easy |
| 5. Storage policies | 2 min | Easy |
| 6. Get API keys | 1 min | Easy |
| 7. Update app | 2 min | Easy |
| 8. Verify | 5 min | Easy |
| **TOTAL** | **~23 min** | **Easy** |

---

## 🎯 What's Next?

After completing this checklist:

### Immediate Next Steps
- [ ] Read `QUICK_REFERENCE.md` for project overview
- [ ] Review `PRESENTATION_OVERVIEW.md` for business context
- [ ] Test all three dashboards (Client, Performer, Admin)

### Customization
- [ ] Update performer photos (use real photos)
- [ ] Adjust service pricing for your market
- [ ] Modify service areas (if not in Perth)
- [ ] Add more performers

### Production Deployment
- [ ] Change admin password
- [ ] Set up custom domain
- [ ] Configure production environment variables
- [ ] Enable Supabase Auth (optional)
- [ ] Set up payment gateway (Stripe, PayID)
- [ ] Enable SMS notifications (Twilio)

---

## 📞 Need Help?

1. ✅ Check this checklist
2. 📖 Read `SUPABASE_SETUP_GUIDE.md`
3. 🔍 Check Supabase logs (Dashboard → Logs)
4. 💻 Check browser console (F12)
5. 📧 Check Supabase community forum

---

**You've got this! 🚀**

Each phase is simple and clearly documented. Just follow the checkboxes and you'll have a fully functional backend in under 30 minutes.
