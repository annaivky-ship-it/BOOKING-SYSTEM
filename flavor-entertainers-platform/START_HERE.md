# 🎯 START HERE - Connect Your Frontend to Backend

## What's Been Done

✅ All configuration files prepared  
✅ All database migration scripts ready  
✅ Automated setup scripts created  
✅ Complete documentation written  
✅ Environment templates configured  

## Your Next Step (Takes 5 Minutes)

### 🚀 Run the Automated Setup

```bash
cd flavor-entertainers-platform
./scripts/setup-supabase-connection.sh
```

This will:
1. Ask for your Supabase credentials
2. Configure Vercel environment variables
3. Set up your local environment
4. Prepare everything for deployment

### 📋 What You'll Need

Open these tabs in your browser:

1. **Get API Keys**:  
   https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/settings/api
   
   Copy:
   - Anon Key
   - Service Role Key

2. **Get Database Password**:  
   https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/settings/database
   
   Use existing password OR click "Reset database password"

### ⚡ Quick Manual Setup (If Script Fails)

If you prefer to do it manually or the script doesn't work:

```bash
cd flavor-entertainers-platform

# 1. Configure Vercel environment variables
echo "YOUR_ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "YOUR_SERVICE_ROLE_KEY" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo "https://qohyutlxwekppkrdlamp.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "postgresql://postgres.qohyutlxwekppkrdlamp:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" | npx vercel env add DATABASE_URL production
echo "https://booking-system-lrkd.vercel.app" | npx vercel env add NEXTAUTH_URL production
echo "$(openssl rand -base64 32)" | npx vercel env add NEXTAUTH_SECRET production

# 2. Apply database migrations
# Go to: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/sql/new
# Copy and paste the content of: supabase/migrations/CONSOLIDATED_SCHEMA.sql

# 3. Deploy
npx vercel --prod
```

## 🔍 Verify It Works

After deployment, check:

1. **Frontend loads**: https://booking-system-lrkd.vercel.app
2. **No errors** in browser console (F12)
3. **Can sign up/login** (test creating an account)

## 📚 Documentation Reference

- **QUICK_START.md** - Fast setup guide (recommended to read first)
- **SETUP_INSTRUCTIONS.md** - Detailed step-by-step guide
- **CONNECTION_SUMMARY.md** - Complete overview of setup
- **DATABASE_SETUP.md** - Database schema details

## 🆘 Having Issues?

1. Check if Supabase project is paused (unpause if needed)
2. Verify API keys are copied correctly (no extra spaces)
3. Check Vercel logs: `npx vercel logs`
4. Check Supabase logs: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/logs

## 🎬 Ready? Let's Go!

```bash
cd flavor-entertainers-platform
./scripts/setup-supabase-connection.sh
```

Or read the detailed guide first:
```bash
cat QUICK_START.md
```

---

**Project Configuration:**
- Frontend: https://booking-system-lrkd.vercel.app
- Backend: https://qohyutlxwekppkrdlamp.supabase.co
- Supabase Dashboard: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp
- Vercel Dashboard: https://vercel.com/dashboard
