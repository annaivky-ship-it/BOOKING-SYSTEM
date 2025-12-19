# 🎯 Complete Setup - Step by Step

**Last Updated**: 2025-12-13  
**Status**: Ready to Complete Setup

---

## ✅ What's Already Done

- ✅ Project cloned from GitHub
- ✅ Dependencies installed (`node_modules` exists)
- ✅ `.env.local` file created
- ✅ Database schema files ready (`supabase/schema.sql` and `supabase/rls-policies.sql`)
- ✅ Project structure in place

---

## 🚀 Remaining Steps to Complete Setup

### Step 1: Configure Supabase Credentials

You need to add your actual Supabase API keys to `.env.local`.

#### 1.1 Get Your Supabase Credentials

1. Open your browser and go to: **https://app.supabase.com/**
2. Sign in to your account
3. Select your project: **`lpnvtoysppumesllsgra`**
4. Click on **Settings** (gear icon in left sidebar)
5. Click on **API** in the Settings menu

#### 1.2 Copy Your API Keys

You'll see two important keys:

- **Project URL**: `https://lpnvtoysppumesllsgra.supabase.co` (already set)
- **anon public key**: A long JWT token starting with `eyJhbG...`
- **service_role key**: Another long JWT token (⚠️ Keep this secret!)

#### 1.3 Update .env.local

Open `.env.local` in your editor and replace the placeholder values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lpnvtoysppumesllsgra.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste your anon public key here>
SUPABASE_SERVICE_ROLE_KEY=<paste your service_role key here>

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional: Generate an encryption key (recommended)
ENCRYPTION_KEY=<see below for how to generate>
```

#### 1.4 Generate Encryption Key (Optional but Recommended)

Run this command in PowerShell to generate a secure encryption key:

```powershell
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Copy the output and paste it as the `ENCRYPTION_KEY` value in `.env.local`.

---

### Step 2: Set Up Database Schema

You need to create the database tables in your Supabase project.

#### Option A: Using Supabase Dashboard (Easiest) ⭐

1. Go to **https://app.supabase.com/**
2. Select your project: **`lpnvtoysppumesllsgra`**
3. Click on **SQL Editor** in the left sidebar
4. Click **+ New query**

**First, run the schema:**

5. Open the file `supabase/schema.sql` in your code editor
6. Copy ALL the contents
7. Paste into the Supabase SQL Editor
8. Click **Run** (or press Ctrl+Enter)
9. Wait for "Success. No rows returned" message

**Then, run the RLS policies:**

10. Click **+ New query** again
11. Open the file `supabase/rls-policies.sql` in your code editor
12. Copy ALL the contents
13. Paste into the Supabase SQL Editor
14. Click **Run** (or press Ctrl+Enter)
15. Wait for "Success" message

#### Option B: Using Supabase CLI (Advanced)

If you prefer using the command line:

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref lpnvtoysppumesllsgra

# Push database schema
npx supabase db push
```

---

### Step 3: Verify Setup

Run the verification script to check if everything is configured correctly:

```bash
npm run verify
```

You should see:
```
✅ Setup verification passed!
```

If you see errors, go back and check:
- `.env.local` has all required variables
- Supabase credentials are correct (no typos)
- Database schema was successfully applied

---

### Step 4: Start Development Server

Once verification passes, start the development server:

```bash
npm run dev
```

You should see:
```
✓ Ready in X seconds
○ Local: http://localhost:3000
```

---

### Step 5: Test the Application

1. Open your browser to: **http://localhost:3000**
2. You should see the Flavor Entertainers homepage
3. Try navigating to different pages
4. Check the browser console for any errors (F12 → Console tab)

---

## 🎯 Quick Command Reference

```bash
# Verify setup
npm run verify

# Start development server
npm run dev

# Check for TypeScript errors
npm run type-check

# Check code quality
npm run lint

# Build for production (optional)
npm run build
```

---

## 🐛 Troubleshooting

### Issue: "Invalid environment variables"

**Cause**: Missing or incorrect values in `.env.local`

**Solution**:
1. Open `.env.local`
2. Make sure ALL required variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Make sure there are no placeholder values like `your_key_here`
4. Restart the dev server: Press `Ctrl+C`, then run `npm run dev` again

### Issue: "Port 3000 is already in use"

**Solution**:
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace <PID> with the number from above)
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

### Issue: Database connection errors

**Possible causes**:
1. Supabase project is paused (free tier pauses after inactivity)
2. Wrong API keys in `.env.local`
3. Database schema not applied

**Solution**:
1. Go to https://app.supabase.com/project/lpnvtoysppumesllsgra
2. Check if project shows "Paused" - if so, click "Restore"
3. Verify your API keys are correct
4. Re-run the SQL schema files in SQL Editor

### Issue: Module not found errors

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules .next
npm install
```

---

## 📚 Next Steps After Setup

Once your development server is running successfully:

1. **Review the codebase**:
   - Start with `app/page.tsx` (homepage)
   - Check `components/` for UI components
   - Review `lib/` for utility functions

2. **Test key features**:
   - User registration/login
   - Booking creation flow
   - Admin dashboard
   - Performer dashboard

3. **Optional integrations**:
   - Set up Twilio WhatsApp (see `.env.example`)
   - Configure additional features

4. **Read documentation**:
   - `README.md` - Full project overview
   - `QUICKSTART.md` - Detailed setup guide
   - `IMPROVEMENTS.md` - Recent code changes
   - `HEALTH_REPORT.md` - Codebase health status

---

## 🔒 Security Reminders

⚠️ **NEVER commit these files to Git**:
- `.env.local` (contains your secret keys)
- Any file with actual API keys

✅ **Safe to commit**:
- `.env.example` (template only, no real keys)
- All source code files
- Documentation files

The `.gitignore` file is already configured to protect your secrets! ✅

---

## ✅ Setup Complete Checklist

Use this checklist to track your progress:

- [ ] **Step 1**: Added Supabase credentials to `.env.local`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` set
  - [ ] `ENCRYPTION_KEY` generated (optional)
  
- [ ] **Step 2**: Database schema applied
  - [ ] Ran `schema.sql` in Supabase SQL Editor
  - [ ] Ran `rls-policies.sql` in Supabase SQL Editor
  
- [ ] **Step 3**: Verification passed
  - [ ] Ran `npm run verify` successfully
  
- [ ] **Step 4**: Development server running
  - [ ] Ran `npm run dev`
  - [ ] No errors in terminal
  
- [ ] **Step 5**: Application tested
  - [ ] Opened http://localhost:3000
  - [ ] Homepage loads correctly
  - [ ] No errors in browser console

---

## 🎉 You're Ready!

Once all checklist items are complete, your development environment is fully set up and ready for development!

**Happy Coding! 🚀**

---

**Need Help?**
- Check `QUICKSTART.md` for more detailed instructions
- Review `README.md` for full documentation
- All code has inline comments to help you understand it
