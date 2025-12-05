@echo off
REM ⚠️ SECURITY WARNING: This file previously contained hardcoded secrets
REM All secrets have been removed for security reasons
REM
REM IMPORTANT: Rotate all Supabase keys and encryption keys immediately!
REM The previous keys in this file were exposed in git history.
REM
REM To set environment variables on Vercel:
REM 1. Go to https://vercel.com/dashboard
REM 2. Select your project
REM 3. Go to Settings > Environment Variables
REM 4. Add each variable manually with NEW values
REM
REM Required variables:
REM - NEXT_PUBLIC_SUPABASE_URL
REM - NEXT_PUBLIC_SUPABASE_ANON_KEY (generate new key in Supabase dashboard)
REM - SUPABASE_SERVICE_ROLE_KEY (generate new key in Supabase dashboard)
REM - ENCRYPTION_KEY (generate with: node -e "console.log(require('crypto').randomBytes(24).toString('base64'))")
REM - TWILIO_ACCOUNT_SID
REM - TWILIO_AUTH_TOKEN
REM - TWILIO_WHATSAPP_NUMBER
REM - ADMIN_WHATSAPP
REM
REM See .env.example for reference

echo ⚠️  SECURITY: Please rotate your Supabase keys immediately!
echo The previous keys in this file were exposed.
echo.
echo Set new environment variables manually in Vercel dashboard
echo See comments in this file for required variables
pause
