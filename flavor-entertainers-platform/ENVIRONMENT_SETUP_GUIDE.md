# 🔧 Environment Variables Setup Guide

This guide will help you configure all the necessary environment variables for the Flavor Entertainers platform.

## 📋 Quick Setup Checklist

- [ ] **Required**: Supabase configuration
- [ ] **Required**: NextAuth configuration
- [ ] **Required**: Security keys
- [ ] **Optional**: Twilio (SMS notifications)
- [ ] **Optional**: Google OAuth (social login)
- [ ] **Optional**: PayID/NPP (Australian payments)
- [ ] **Optional**: Stripe (alternative payments)
- [ ] **Optional**: Cloudinary (image uploads)
- [ ] **Optional**: Email configuration
- [ ] **Optional**: Analytics

## 🚀 Required Environment Variables

### 1. Supabase Configuration (Required)

These are already configured for the current deployment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fmezpefpletmnthrmupu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. NextAuth Configuration (Required)

```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters
```

**How to generate a secure secret:**

```bash
openssl rand -base64 32
```

### 3. Security Configuration (Required)

```env
JWT_SECRET=your-jwt-secret-minimum-32-characters
ENCRYPTION_KEY=your-32-character-encryption-key
```

## 🔧 Optional Integrations

### 4. Twilio (SMS & WhatsApp Notifications)

**Setup Steps:**

1. Sign up at [Twilio Console](https://console.twilio.com/)
2. Get your Account SID and Auth Token
3. Purchase an Australian phone number

```env
TWILIO_ACCOUNT_SID=AC_your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+61_your_phone_number
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_WEBHOOK_TOKEN=your_webhook_token
```

### 5. Google OAuth (Social Login)

**Setup Steps:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-domain.vercel.app/auth/callback`
   - `https://fmezpefpletmnthrmupu.supabase.co/auth/v1/callback`

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 6. PayID/NPP (Australian Payments)

**Setup Steps:**

1. Contact your Australian bank
2. Request NPP API access
3. Get participant ID and API credentials

```env
NPP_API_URL=https://api.npp.com.au
NPP_API_KEY=your_npp_api_key
NPP_PARTICIPANT_ID=your_participant_id
```

### 7. Stripe (Alternative Payments)

**Setup Steps:**

1. Sign up at [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your publishable and secret keys
3. Set up webhook endpoints

```env
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 8. Cloudinary (Image Uploads)

**Setup Steps:**

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name and API credentials

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 9. Email Configuration

**Gmail Setup:**

1. Enable 2-factor authentication
2. Generate an app password
3. Use app password instead of regular password

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=Flavor Entertainers <noreply@flavorentertainers.com>
```

### 10. Analytics (Optional)

```env
GOOGLE_ANALYTICS_ID=G-YOUR_GA4_ID
MIXPANEL_PROJECT_TOKEN=your_mixpanel_token
```

## 🚀 Deployment Instructions

### For Vercel Deployment:

1. **Set environment variables in Vercel Dashboard:**

   ```bash
   vercel env add NEXTAUTH_SECRET
   vercel env add JWT_SECRET
   vercel env add ENCRYPTION_KEY
   # Add other variables as needed
   ```

2. **Or use Vercel CLI:**
   ```bash
   vercel env pull .env.local
   # Edit .env.local with your values
   vercel env push .env.local
   ```

### For Local Development:

1. **Copy the environment template:**

   ```bash
   cp .env.production.example .env.local
   ```

2. **Edit `.env.local` with your actual values**

3. **Start development server:**
   ```bash
   npm run dev
   ```

## 🔒 Security Best Practices

1. **Never commit `.env.local` to git**
2. **Use strong, randomly generated secrets**
3. **Rotate secrets regularly**
4. **Use different secrets for development and production**
5. **Limit environment variable access to necessary team members**

## 🆘 Troubleshooting

### Common Issues:

**1. "Missing Supabase environment variables"**

- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

**2. "Authentication not working"**

- Check `NEXTAUTH_URL` matches your domain
- Verify `NEXTAUTH_SECRET` is at least 32 characters

**3. "Twilio SMS failing"**

- Ensure `TWILIO_ACCOUNT_SID` starts with "AC"
- Check phone numbers are in E.164 format (+61...)

**4. "Google OAuth not working"**

- Verify redirect URIs in Google Console
- Check client ID and secret are correct

## 📞 Support

For help with environment configuration:

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review [NextAuth.js Documentation](https://next-auth.js.org/)
- Contact your service providers for API credentials

## 🔄 Environment Variables Reference

| Variable                        | Required | Service    | Description         |
| ------------------------------- | -------- | ---------- | ------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅       | Supabase   | Database URL        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅       | Supabase   | Public API key      |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✅       | Supabase   | Admin API key       |
| `NEXTAUTH_URL`                  | ✅       | NextAuth   | Application URL     |
| `NEXTAUTH_SECRET`               | ✅       | NextAuth   | Encryption secret   |
| `JWT_SECRET`                    | ✅       | Security   | JWT signing key     |
| `ENCRYPTION_KEY`                | ✅       | Security   | Data encryption     |
| `TWILIO_ACCOUNT_SID`            | ❌       | Twilio     | SMS service         |
| `GOOGLE_CLIENT_ID`              | ❌       | Google     | OAuth login         |
| `NPP_API_KEY`                   | ❌       | PayID      | Australian payments |
| `STRIPE_SECRET_KEY`             | ❌       | Stripe     | Payment processing  |
| `CLOUDINARY_CLOUD_NAME`         | ❌       | Cloudinary | Image uploads       |

---

**📍 Current Status:** The platform is deployed with basic Supabase configuration. Add optional services as needed for enhanced functionality.
