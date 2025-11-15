# 🚀 Automated Supabase Setup

## One-Command Setup!

Your Flavor Entertainers platform can now be set up automatically using the Supabase CLI!

---

## ⚡ Quick Start (5 minutes)

### Windows Users

```bash
npm run setup:supabase:win
```

### Mac/Linux Users

```bash
npm run setup:supabase
```

That's it! The script will:
1. ✅ Install Supabase CLI
2. ✅ Link to your remote project
3. ✅ Apply all database migrations
4. ✅ Create storage buckets
5. ✅ Verify the setup

---

## 📋 What You'll Need

### 1. Supabase Database Password

You'll be asked for your database password during setup. Find it here:

1. Go to: https://app.supabase.com/project/wykwlstsfkiicusjyqiv
2. Click **Settings** → **Database**
3. Look for **Connection String** section
4. Your password is in the connection string: `postgresql://postgres:[YOUR-PASSWORD]@...`

**Don't have it?** Reset it:
1. Settings → Database → Reset database password
2. Save the new password securely

---

## 🎯 Step-by-Step Process

### Step 1: Run the Setup Command

**Windows:**
```bash
npm run setup:supabase:win
```

**Mac/Linux:**
```bash
npm run setup:supabase
```

### Step 2: Enter Your Database Password

When prompted:
```
Enter your database password:
```

Paste your password and press Enter.

### Step 3: Wait for Setup to Complete

The script will automatically:

```
🚀 Flavor Entertainers - Automated Supabase Setup
==================================================

[Step 1] Checking Supabase CLI...
✅ Supabase CLI ready

[Step 2] Linking to your Supabase project...
✅ Successfully linked to remote project

[Step 3] Pushing database migrations...
✅ Migrations applied successfully!

[Step 4] Creating storage buckets...
✅ Storage buckets created

[Step 5] Verifying setup...
✅ Found 6 performers
✅ Found 15 services

🎉 SETUP COMPLETE!
```

### Step 4: Start Using Your App!

Open http://localhost:3000 and you'll see:
- ✅ 6 real performers (from database, not mock data)
- ✅ 15 services with pricing
- ✅ Working booking system
- ✅ All 3 dashboards functional

---

## 📦 What Gets Created

### Database Tables (8)
- **services** - 15 pre-configured offerings
- **performers** - 6 demo entertainers
- **bookings** - Booking management
- **do_not_serve_list** - Safety blocklist
- **communications** - In-app messaging
- **clients** - VIP tracking
- **admins** - Admin accounts
- **booking_audit_log** - Change history

### Storage Buckets (3)
- **booking-documents** (private) - ID uploads
- **deposit-receipts** (private) - Payment receipts
- **performer-photos** (public) - Profile images

### Features
- ✅ Row Level Security (RLS)
- ✅ Auto-blocking of problem clients
- ✅ VIP client detection
- ✅ Automated triggers
- ✅ Helper functions

---

## 🔧 Available Commands

### Main Setup
```bash
# Full automated setup
npm run setup:supabase        # Mac/Linux
npm run setup:supabase:win    # Windows
```

### Individual Commands
```bash
# Link to remote project
npm run supabase:link

# Push migrations to database
npm run supabase:push

# Reset database (WARNING: Deletes all data!)
npm run supabase:reset

# Test your connection
npm run test:connection
```

---

## 🐛 Troubleshooting

### "Failed to link" Error

**Problem:** Wrong password or connection issue

**Solution:**
1. Check your database password
2. Reset it if needed (Settings → Database → Reset)
3. Try again: `npm run supabase:link`

### "Migration failed" Error

**Problem:** Tables might already exist or SQL error

**Solution 1 - Reset and retry:**
```bash
npm run supabase:reset
npm run supabase:push
```

**Solution 2 - Clean database:**
1. Go to Supabase Dashboard → SQL Editor
2. Run `database-cleanup.sql`
3. Run `npm run supabase:push`

### "Storage bucket already exists" Error

**Problem:** Buckets were created manually

**Solution:** This is fine! The script continues anyway.

### "tsx not found" Error

**Problem:** Missing TypeScript executor

**Solution:**
```bash
npm install -D tsx
npm run test:connection
```

---

## 🔄 Reset Database

If you want to start fresh:

```bash
# WARNING: This deletes ALL data!
npm run supabase:reset
```

This will:
1. Drop all tables
2. Delete all data
3. Re-apply migrations
4. Reseed with demo data

---

## 📊 Verify Your Setup

After setup completes, verify everything works:

```bash
npm run test:connection
```

Expected output:
```
✅ Connection successful!
✅ Found 6 performers
✅ Found 15 services

Performers:
  - April Flavor (available)
  - Anna Ivky (available)
  - Scarlett (available)
  ...

🎉 ALL TESTS PASSED!
```

---

## 📁 Project Structure

```
BOOKING/
├── supabase/
│   ├── config.toml              # Supabase configuration
│   ├── migrations/              # Database migrations
│   │   ├── 20241115000001_initial_schema.sql
│   │   ├── 20241115000002_seed_data.sql
│   │   └── 20241115000003_storage_setup.sql
│   └── .temp/                   # CLI temp files
├── scripts/
│   ├── setup-supabase.sh        # Mac/Linux setup script
│   └── setup-supabase.bat       # Windows setup script
└── package.json                 # npm scripts
```

---

## 🎓 Manual Setup (Alternative)

If you prefer manual setup or automation fails:

1. **Link to project:**
   ```bash
   npx supabase link --project-ref wykwlstsfkiicusjyqiv
   ```

2. **Push migrations:**
   ```bash
   npx supabase db push
   ```

3. **Verify:**
   ```bash
   npm run test:connection
   ```

---

## 🌐 Your Supabase Project

**URL:** https://wykwlstsfkiicusjyqiv.supabase.co
**Dashboard:** https://app.supabase.com/project/wykwlstsfkiicusjyqiv
**Status:** ✅ Ready for automated setup

---

## ✨ What's Next?

After successful setup:

### Immediate
- ✅ Open http://localhost:3000
- ✅ Browse the 6 performers
- ✅ Test the booking flow
- ✅ Try different dashboards

### Customization
- Update performer photos
- Modify service pricing
- Add more services
- Change admin password

### Deployment
- Deploy to Vercel/Netlify
- Set up custom domain
- Configure production env vars
- Enable real payment processing

---

## 📖 Additional Resources

**Documentation:**
- `QUICK_REFERENCE.md` - Quick lookup guide
- `DATABASE_STRUCTURE.md` - Schema details
- `SUPABASE_SETUP_GUIDE.md` - Manual setup (if needed)

**Test Files:**
- `test-supabase-connection.ts` - Connection verification

**SQL Files:**
- `supabase-schema-complete.sql` - Full schema
- `supabase-seed-data.sql` - Demo data
- `database-cleanup.sql` - Reset script

---

## 🎉 Success!

Once the script completes, you have:

✅ **Production-ready database**
✅ **6 demo performers**
✅ **15 service offerings**
✅ **Full security setup**
✅ **Storage buckets configured**
✅ **Everything automated!**

**Total setup time:** 5-10 minutes (mostly waiting for migrations)
**Manual work required:** Just enter your database password!

---

## 💡 Pro Tips

1. **Save your database password** - You'll need it for the setup
2. **Use WSL on Windows** - For better bash script support
3. **Check Supabase status** - https://status.supabase.com
4. **Enable 2FA** - Protect your Supabase account
5. **Backup regularly** - Use `npx supabase db dump`

---

**Ready? Run the command and watch the magic happen! 🚀**

```bash
npm run setup:supabase:win
```
