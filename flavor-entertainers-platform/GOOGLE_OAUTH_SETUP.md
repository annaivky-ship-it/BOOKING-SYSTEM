# Google OAuth Setup Guide for Flavor Entertainers

## 🔧 Setup Instructions

### Step 1: Google Cloud Console Setup

1. **Visit Google Cloud Console**
   - Go to: https://console.cloud.google.com/
   - Create a new project or select existing project

2. **Enable Required APIs**
   - Navigate to "APIs & Services" > "Library"
   - Search and enable "Google+ API"
   - Search and enable "Google Identity API" (if available)

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose application type: "Web application"
   - Name: "Flavor Entertainers Platform"

4. **Configure Authorized Redirect URIs**
   Add these URLs to authorized redirect URIs:
   ```
   http://localhost:3000/auth/callback
   https://flavor-entertainers-platform-d1s2m5fa4.vercel.app/auth/callback
   ```

5. **Save Credentials**
   - Copy the Client ID
   - Copy the Client Secret
   - Keep these secure!

### Step 2: Supabase Configuration

1. **Access Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/fmezpefpletmnthrmupu
   - Navigate to "Authentication" > "Providers"

2. **Enable Google Provider**
   - Find "Google" in the list of providers
   - Toggle "Enable sign in with Google"
   - Enter your Google Client ID
   - Enter your Google Client Secret
   - Click "Save"

### Step 3: Update Environment Variables

Update your `.env.local` file with the Google OAuth credentials:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_from_step_1
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_step_1
```

### Step 4: Deploy to Vercel

Add the same environment variables to your Vercel project:

1. Go to: https://vercel.com/dashboard
2. Select your "flavor-entertainers-platform" project
3. Go to "Settings" > "Environment Variables"
4. Add:
   - `GOOGLE_CLIENT_ID` = your_google_client_id
   - `GOOGLE_CLIENT_SECRET` = your_google_client_secret

### Step 5: Test the Integration

1. **Local Testing:**
   ```bash
   npm run dev
   ```
   - Visit http://localhost:3000/auth/login
   - Click "Continue with Google"
   - Complete the OAuth flow

2. **Production Testing:**
   - Visit https://flavor-entertainers-platform-d1s2m5fa4.vercel.app/auth/login
   - Click "Continue with Google"
   - Verify user creation and role assignment

## 🔐 Security Considerations

- **Client Secret Security:** Never expose the client secret in frontend code
- **Redirect URI Validation:** Only use HTTPS in production
- **Domain Verification:** Verify domain ownership in Google Console if required

## 🚀 Features Enabled

Once configured, users can:
- ✅ Sign in with their Google account
- ✅ Automatic user profile creation
- ✅ Role-based dashboard redirects
- ✅ Seamless authentication experience
- ✅ Profile picture from Google account

## 🛠️ Current Implementation Status

- ✅ Login form with Google OAuth button
- ✅ Auth callback handler for OAuth flow
- ✅ User profile creation from Google metadata
- ✅ Role-based redirects after authentication
- ✅ Supabase integration ready
- ⏳ Waiting for Google credentials configuration

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify redirect URIs match exactly
3. Ensure APIs are enabled in Google Cloud Console
4. Check Supabase authentication logs

## 🎯 Next Steps After Setup

1. Test Google OAuth flow
2. Verify user profile creation
3. Test role-based dashboard access
4. Configure additional OAuth providers if needed
5. Set up custom domain with HTTPS (recommended)

---

**Note:** This setup enables Google authentication for the Flavor Entertainers platform, providing a seamless sign-in experience for clients and performers in the Perth/WA entertainment market.