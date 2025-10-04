# Quick Start Guide - Connect Frontend to Backend

## 🚀 One-Command Setup

```bash
cd flavor-entertainers-platform
./scripts/setup-supabase-connection.sh
```

This interactive script will:
1. Collect your Supabase credentials
2. Configure Vercel environment variables
3. Create local .env file
4. Prepare for deployment

## 📋 Manual Setup (5 Minutes)

### 1. Get Supabase Credentials
Visit: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/settings/api

Copy:
- Anon Key
- Service Role Key
- Database Password (from Database settings)

### 2. Configure Vercel
```bash
cd flavor-entertainers-platform

# Run these commands one by one:
echo "YOUR_ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "YOUR_SERVICE_ROLE_KEY" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo "postgresql://postgres.qohyutlxwekppkrdlamp:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" | npx vercel env add DATABASE_URL production
echo "https://qohyutlxwekppkrdlamp.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "https://booking-system-lrkd.vercel.app" | npx vercel env add NEXTAUTH_URL production
echo "$(openssl rand -base64 32)" | npx vercel env add NEXTAUTH_SECRET production
```

### 3. Apply Database Migrations
```bash
./scripts/apply-migrations.sh
```

Or manually run the SQL in Supabase SQL Editor:
https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/sql/new

Copy and paste: `supabase/migrations/CONSOLIDATED_SCHEMA.sql`

### 4. Deploy
```bash
npx vercel --prod
```

### 5. Verify
Visit: https://booking-system-lrkd.vercel.app

## 🔍 Verification Checklist

- [ ] Frontend loads without errors
- [ ] Can sign up/login
- [ ] Database tables exist in Supabase
- [ ] No errors in Vercel logs
- [ ] No errors in Supabase logs

## 🔗 Important Links

- **Frontend**: https://booking-system-lrkd.vercel.app
- **Supabase Dashboard**: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp
- **Vercel Dashboard**: https://vercel.com/dashboard
- **API Settings**: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/settings/api
- **Database Editor**: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/editor
- **SQL Editor**: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/sql/new
- **Auth Users**: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/auth/users
- **Logs**: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/logs

## ⚡ Environment Variables Reference

### Required for Production
```bash
NEXT_PUBLIC_SUPABASE_URL=https://qohyutlxwekppkrdlamp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from_supabase_dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from_supabase_dashboard>
DATABASE_URL=postgresql://postgres.qohyutlxwekppkrdlamp:<PASSWORD>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.qohyutlxwekppkrdlamp:<PASSWORD>@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
NEXTAUTH_URL=https://booking-system-lrkd.vercel.app
NEXTAUTH_SECRET=<random_32_char_string>
```

### Optional (Configure as needed)
```bash
TWILIO_ACCOUNT_SID=<your_twilio_sid>
TWILIO_AUTH_TOKEN=<your_twilio_token>
STRIPE_SECRET_KEY=<your_stripe_key>
GOOGLE_CLIENT_ID=<your_google_oauth_client_id>
GOOGLE_CLIENT_SECRET=<your_google_oauth_secret>
```

## 🆘 Common Issues

### "Missing Supabase environment variables"
→ Redeploy after setting Vercel environment variables

### "Failed to connect to database"
→ Check if Supabase project is paused
→ Verify database password in connection string

### "Invalid API key"
→ Regenerate keys in Supabase dashboard
→ Update Vercel environment variables

## 📚 Full Documentation

For detailed setup instructions, see:
- `SETUP_INSTRUCTIONS.md` - Complete setup guide
- `DEPLOYMENT_GUIDE.md` - Deployment best practices
- `DATABASE_SETUP.md` - Database schema details

## 🎯 Next Steps After Setup

1. Configure authentication providers (Google OAuth)
2. Set up Twilio for WhatsApp notifications
3. Configure Stripe for payments
4. Customize performer profiles
5. Test booking flow end-to-end

## 📞 Need Help?

Check logs:
- Vercel: `npx vercel logs`
- Supabase: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/logs
