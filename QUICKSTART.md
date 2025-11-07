# 🚀 Quick Start Guide

Welcome to the Flavor Entertainers Booking Platform! This guide will get you up and running in 5 minutes.

---

## ✅ Prerequisites Checklist

Before you start, make sure you have:
- ✅ Node.js 18.17 or later installed
- ✅ npm or yarn package manager
- ✅ Supabase account with a project created
- ✅ (Optional) Twilio account for WhatsApp notifications

---

## 🎯 Step 1: Configure Environment Variables

### Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: `lpnvtoysppumesllsgra`
3. Click on **Settings** → **API**
4. Copy these values:
   - **Project URL**: Already set to `https://lpnvtoysppumesllsgra.supabase.co`
   - **anon/public key**: Copy from "Project API keys" → "anon public"
   - **service_role key**: Copy from "Project API keys" → "service_role" (⚠️ Keep this secret!)

### Update .env.local

Open `.env.local` and replace the placeholder values:

```env
# Replace these with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://lpnvtoysppumesllsgra.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here

# App URL (leave as is for local dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### Optional: Configure Twilio WhatsApp (Skip if not using)

If you want WhatsApp notifications:

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
ADMIN_WHATSAPP=whatsapp:+61400000000
```

### Optional: Add Encryption Key (Recommended)

For encrypting sensitive data:

```env
# Generate a random 32-character key
ENCRYPTION_KEY=your_32_character_key_here_12345
```

To generate a secure key, run:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 🎯 Step 2: Install Dependencies

Dependencies are already installed! ✅

If you need to reinstall:
```bash
npm install
```

---

## 🎯 Step 3: Set Up Database

### Run Migrations

Your Supabase database needs the schema. You have two options:

#### Option A: Use Supabase Dashboard (Easiest)

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents from:
   - `supabase/schema.sql`
   - `supabase/rls-policies.sql`
5. Click "Run" for each file

#### Option B: Use Supabase CLI

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref lpnvtoysppumesllsgra

# Push database schema
npx supabase db push
```

---

## 🎯 Step 4: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## 🎯 Step 5: Verify Everything Works

### Check the Console

You should see:
```
✓ Ready in X seconds
○ Compiling / ...
✓ Compiled / in Xms
```

### Open Your Browser

1. Go to http://localhost:3000
2. You should see the Flavor Entertainers homepage
3. Try navigating to different pages

### Test the Setup

Run the verification script:
```bash
npm run verify
```

This checks:
- ✅ Environment variables are set
- ✅ Database connection works
- ✅ All tables exist
- ✅ Required dependencies are installed

---

## 🛠 Common Issues & Solutions

### Issue 1: "Invalid environment variables"

**Problem**: Missing or invalid env vars in `.env.local`

**Solution**:
1. Make sure `.env.local` exists
2. Check all required variables are set
3. Verify no typos in variable names
4. Restart the dev server: `Ctrl+C` then `npm run dev`

### Issue 2: "Cannot find module"

**Problem**: Dependencies not installed

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: Database connection errors

**Problem**: Supabase credentials are wrong or project is paused

**Solution**:
1. Verify your Supabase project URL matches
2. Check if your Supabase project is active (not paused)
3. Regenerate API keys in Supabase Dashboard if needed

### Issue 4: "Port 3000 is already in use"

**Problem**: Another app is using port 3000

**Solution**:
```bash
# Use a different port
npm run dev -- -p 3001
```

Or kill the process using port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Next Steps

### For Development

1. **Read the docs**: Check `README.md` for detailed information
2. **Review improvements**: See `IMPROVEMENTS.md` for recent changes
3. **Check health**: Read `HEALTH_REPORT.md` for codebase status

### Key Files to Know

```
BOOKING-SYSTEM/
├── app/              # Next.js pages and API routes
│   ├── api/          # Backend API endpoints
│   └── (pages)/      # Frontend pages
├── components/       # React components
├── lib/              # Utilities and helpers
│   ├── config.ts     # Environment configuration
│   ├── logger.ts     # Logging utility
│   └── supabase/     # Database client
├── .env.local        # Your local environment variables (KEEP SECRET!)
└── .env.example      # Template for environment variables
```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Check TypeScript types |
| `npm run verify` | Verify environment setup |

### Learn the Codebase

1. **Start with**: `app/page.tsx` (homepage)
2. **API routes**: `app/api/bookings/route.ts` (booking creation)
3. **Components**: `components/BookingForm.tsx` (booking form)
4. **Utilities**: `lib/utils.ts` (helper functions)

---

## 🔒 Security Reminders

⚠️ **NEVER commit these files**:
- `.env.local`
- Any file with actual API keys or secrets

✅ **Safe to commit**:
- `.env.example` (no actual secrets)
- All code files
- Configuration files

The `.gitignore` file is already configured to protect you!

---

## 🎉 You're Ready!

Your development environment is fully configured and ready to go!

### Quick Reference

```bash
# Start developing
npm run dev

# Check for issues
npm run type-check
npm run lint

# Build for production
npm run build
```

### Need Help?

1. Check `README.md` for detailed documentation
2. Review `HEALTH_REPORT.md` for system status
3. See `IMPROVEMENTS.md` for recent changes
4. Check inline code comments

### Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Happy Coding! 🚀**

*Last Updated: 2025-11-04*
