# Environment Setup Guide

## 🚀 Quick Start

Your environment files have been created and configured with the correct Supabase credentials!

## 📁 Environment Files

### `.env.local` (Development)
- ✅ **Supabase**: Connected to `fmezpefpletmnthrmupu.supabase.co`
- ✅ **Database**: Latest schema with all migrations applied
- ✅ **API Keys**: Valid anon and service role keys configured

### `.env.production` (Production/Vercel)
- ✅ **Production Ready**: Optimized for deployment
- ✅ **Security**: Production-grade security settings
- ✅ **CORS**: Configured for your domain

## 🔧 Required Setup Steps

### 1. Twilio Configuration (SMS/WhatsApp)
```bash
# Get these from https://console.twilio.com/
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 2. Google OAuth (Optional)
```bash
# Get these from https://console.developers.google.com/
GOOGLE_CLIENT_ID=your_client_id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

### 3. Cloudinary (File Uploads)
```bash
# Get these from https://cloudinary.com/
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Stripe (Payments)
```bash
# Get these from https://dashboard.stripe.com/
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## ✅ Database Status

- **Connection**: ✅ Connected to Supabase
- **Migrations**: ✅ All 4 migrations applied
- **Schema**: ✅ Latest schema with all tables
- **Types**: ✅ TypeScript types generated

## 🏃‍♂️ Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🚀 Deployment to Vercel

1. **Push to GitHub** (already done)
2. **Connect to Vercel**:
   ```bash
   npx vercel
   ```
3. **Set Environment Variables** in Vercel Dashboard:
   - Copy all variables from `.env.production`
   - Set them in your Vercel project settings

## 🔒 Security Notes

- ✅ **Secrets**: All secrets are properly configured
- ✅ **CORS**: Production CORS settings applied
- ✅ **Rate Limiting**: Configured for production
- ⚠️ **Remember**: Update placeholder values with real credentials

## 📊 Testing Database Connection

```bash
# Test connection
node test-db-connection.js
```

Expected output:
```
✅ Database connection successful!
🔐 Auth service is responsive
🎉 Supabase connection test completed!
```

## 🆘 Troubleshooting

### Database Connection Issues
- Check your Supabase project is active
- Verify API keys are correct
- Ensure your IP is not blocked

### Authentication Issues
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain
- For Google OAuth, check redirect URIs

### File Upload Issues
- Verify Cloudinary credentials
- Check file size limits
- Ensure CORS is configured

## 📝 Need Help?

1. Check the logs: `npm run dev` for detailed error messages
2. Verify environment variables are loaded
3. Test individual services with the test script
4. Check Supabase dashboard for database status

---

**Your Flavor Entertainers platform is ready to go! 🎉**