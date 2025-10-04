# 🧪 Testing Checklist - Flavor Entertainers Platform

## ✅ Database Schema Applied - Now Test Everything!

### 1️⃣ Basic Site Functionality

**Homepage Test**:
- [ ] Visit: https://booking-system-lrkd.vercel.app
- [ ] Page loads without errors
- [ ] Age gate modal appears (18+ verification)
- [ ] Can dismiss age gate
- [ ] "Browse Performers" button visible
- [ ] No error messages in browser console (F12)

### 2️⃣ Authentication Testing

**Sign Up Test**:
- [ ] Click Sign Up or Register
- [ ] Fill out registration form
- [ ] Email validation works
- [ ] Password requirements shown
- [ ] Can create account successfully
- [ ] Receives confirmation (email or redirect)

**Login Test**:
- [ ] Click Login button
- [ ] Enter credentials
- [ ] Successfully logs in
- [ ] Redirected to dashboard or home
- [ ] User menu/profile shows logged-in state

### 3️⃣ Database Connectivity

**Check Tables**:
- [ ] Go to: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/editor
- [ ] Verify these tables exist:
  - [ ] users
  - [ ] performers
  - [ ] bookings
  - [ ] services
  - [ ] payments
  - [ ] do_not_serve_list
  - [ ] vetting_applications
  - [ ] performer_services
  - [ ] payment_receipts
  - [ ] whatsapp_messages
  - [ ] sms_messages
  - [ ] twilio_webhooks
  - [ ] payid_accounts
  - [ ] payid_transactions
  - [ ] blacklist_reason_types

**Check User Created**:
- [ ] After signing up, go to Supabase > Authentication > Users
- [ ] See your new user account listed
- [ ] Check email matches
- [ ] User UUID created

### 4️⃣ Performers Page

**Browse Performers**:
- [ ] Go to: https://booking-system-lrkd.vercel.app/performers
- [ ] Page loads successfully
- [ ] Shows "no performers" message (database is empty)
- [ ] OR shows any performers if data exists
- [ ] Filters/search bar visible
- [ ] No console errors

### 5️⃣ Dashboard Access

**User Dashboard**:
- [ ] Go to: https://booking-system-lrkd.vercel.app/dashboard
- [ ] Shows user dashboard or profile
- [ ] Can view bookings (empty for now)
- [ ] Can update profile
- [ ] Navigation works

**Admin Dashboard** (if you created admin user):
- [ ] Go to: https://booking-system-lrkd.vercel.app/admin
- [ ] Admin panel loads
- [ ] Can see statistics
- [ ] Can access vetting queue
- [ ] Can manage users/performers

### 6️⃣ Error Checking

**Browser Console**:
- [ ] Press F12 to open developer tools
- [ ] Check Console tab for errors
- [ ] Any red errors? Note them down
- [ ] Warnings are okay (yellow)

**Network Tab**:
- [ ] Still in F12, go to Network tab
- [ ] Reload page
- [ ] Check for failed requests (red status codes)
- [ ] API calls to Supabase should be 200 OK

### 7️⃣ Supabase Logs

**Check Logs**:
- [ ] Go to: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/logs
- [ ] Check for any errors
- [ ] Verify authentication logs when you sign up
- [ ] Database queries showing up

---

## 🐛 Common Issues & Solutions

### Issue: "Missing environment variables"
**Solution**: 
- Check Vercel environment variables are set
- Redeploy: `npx vercel --prod`

### Issue: Can't sign up/login
**Solution**:
- Check Supabase Auth is enabled
- Go to: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/auth/providers
- Enable Email provider

### Issue: No performers showing
**Solution**:
- This is normal - database is empty
- You need to add performer data or vetting applications

### Issue: Console errors about RLS
**Solution**:
- Row Level Security policies need to be configured
- Most tables have RLS in migrations already
- Check specific table policies in Supabase

---

## 🎯 Next Steps After Testing

### If Everything Works:
1. ✅ Platform is fully functional!
2. Add test performer data
3. Create admin user
4. Test booking flow
5. Configure optional integrations (Stripe, Twilio)

### If There Are Errors:
1. Note down specific error messages
2. Check browser console
3. Check Supabase logs
4. Report errors for debugging

---

## 📝 Quick Commands

**Redeploy**:
```bash
cd flavor-entertainers-platform
npx vercel --prod
```

**Check Vercel Logs**:
```bash
npx vercel logs
```

**Check Environment Variables**:
```bash
npx vercel env ls
```

---

**Start Testing Now**: https://booking-system-lrkd.vercel.app 🚀
