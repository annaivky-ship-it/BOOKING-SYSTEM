# 🚀 Setup Your Supabase Backend NOW

## ⚡ Quick Interactive Setup

The automated script needs your database password. Follow these steps:

---

## Step 1: Get Your Database Password

### Option A: Find Existing Password
If you saved your password when creating the project, use that.

### Option B: Reset Password (Recommended)

1. **Open Supabase Dashboard:**
   https://app.supabase.com/project/wykwlstsfkiicusjyqiv/settings/database

2. **Click "Reset Database Password"**

3. **Copy the new password** (it looks like: `your-new-password-here`)

4. **Save it securely!**

---

## Step 2: Run Setup Command

Open a **new terminal** (separate from the dev server) and run:

```bash
npx supabase link --project-ref wykwlstsfkiicusjyqiv
```

When prompted for password, paste it and press Enter.

---

## Step 3: Push Migrations

After linking successfully, run:

```bash
npx supabase db push
```

This will:
- ✅ Create all 8 tables
- ✅ Add 6 demo performers
- ✅ Insert 15 services
- ✅ Set up RLS policies
- ✅ Configure triggers & functions

**Time:** 1-2 minutes

---

## Step 4: Create Storage Buckets

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Create booking-documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-documents', 'booking-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create deposit-receipts bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('deposit-receipts', 'deposit-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Create performer-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('performer-photos', 'performer-photos', true)
ON CONFLICT (id) DO NOTHING;
```

---

## Step 5: Verify Setup

Run the connection test:

```bash
npm run test:connection
```

Expected output:
```
✅ Connection successful!
✅ Found 6 performers
✅ Found 15 services
🎉 ALL TESTS PASSED!
```

---

## Step 6: View Your App!

Your app is already running at:
**http://localhost:3000**

You should now see:
- ✅ 6 real performers (from database)
- ✅ 15 services with pricing
- ✅ Working booking system

---

## 🎯 Full Command Sequence

Copy and paste these commands one at a time:

```bash
# 1. Link to project (enter password when prompted)
npx supabase link --project-ref wykwlstsfkiicusjyqiv

# 2. Push all migrations
npx supabase db push

# 3. Test connection
npm run test:connection
```

---

## 🐛 Troubleshooting

### "Invalid password" error
**Solution:** Reset your password in Supabase Dashboard

### "Already linked" message
**Solution:** Great! Skip to Step 3 (push migrations)

### "Migration failed" error
**Solution:** Reset and try again:
```bash
npx supabase db reset
npx supabase db push
```

### Tables already exist
**Solution:** Run cleanup first:
```bash
# In Supabase Dashboard SQL Editor, run:
# Copy contents of database-cleanup.sql
# Then push migrations again
npx supabase db push
```

---

## 💡 Important Notes

### Database Password vs API Keys
- **Database Password:** Used ONLY for CLI setup (keep secret!)
- **Anon Key:** Already configured in your app (safe for client)
- **Service Role Key:** For admin operations (never expose)

### One-Time Setup
You only need to do this once! After setup:
- Database persists in Supabase cloud
- App connects automatically
- No password needed for normal use

---

## ✅ Success Checklist

After completing all steps, you should have:

- [ ] Linked to Supabase project
- [ ] Pushed all migrations successfully
- [ ] Created 3 storage buckets
- [ ] Test connection passed
- [ ] Performers visible in app

---

## 🎊 You're Done!

Once all steps complete:

1. **Your backend is live** in Supabase cloud
2. **Your app connects automatically** using the configured keys
3. **Everything persists** - no need to re-run setup

**Open your app:** http://localhost:3000

**Enjoy your fully functional booking platform!** 🚀

---

## 📞 Need Help?

**Supabase Dashboard:** https://app.supabase.com/project/wykwlstsfkiicusjyqiv

**Documentation:**
- `AUTOMATED_SETUP.md` - Detailed guide
- `QUICK_REFERENCE.md` - Quick lookup
- `DATABASE_STRUCTURE.md` - Schema details
