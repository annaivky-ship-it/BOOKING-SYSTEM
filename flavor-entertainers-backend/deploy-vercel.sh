#!/bin/bash

# Flavor Entertainers Backend - Vercel Deployment Script
# This script deploys the backend to Vercel with GitHub integration

set -e

echo "🚀 Flavor Entertainers Backend - Vercel Deployment"
echo "=================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

echo "📦 Building project locally to verify..."
pnpm install
pnpm build

echo "🔧 Setting up Vercel project..."

# Initialize Vercel project if not already done
if [ ! -f ".vercel/project.json" ]; then
    vercel --name flavor-entertainers-backend
fi

echo "⚙️ Setting up environment variables..."
echo ""
echo "📝 Please provide the following environment variables:"
echo ""

# Core Application
vercel env add NODE_ENV production
vercel env add PORT 3000

# Database & Auth (Supabase)
read -p "Enter your Supabase URL: " SUPABASE_URL
vercel env add SUPABASE_URL "$SUPABASE_URL" production

read -p "Enter your Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_ROLE_KEY" production

read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY
vercel env add SUPABASE_ANON_KEY "$SUPABASE_ANON_KEY" production

# PayID Business Details
read -p "Enter your PayID business email [bookings@lustandlace.com.au]: " PAYID_EMAIL
PAYID_EMAIL=${PAYID_EMAIL:-bookings@lustandlace.com.au}
vercel env add PAYID_BUSINESS_EMAIL "$PAYID_EMAIL" production

read -p "Enter your business name [Flavor Entertainers]: " PAYID_NAME
PAYID_NAME=${PAYID_NAME:-"Flavor Entertainers"}
vercel env add PAYID_BUSINESS_NAME "$PAYID_NAME" production

read -p "Enter your BSB: " PAYID_BSB
vercel env add PAYID_BSB "$PAYID_BSB" production

read -p "Enter your Account Number: " PAYID_ACCOUNT
vercel env add PAYID_ACCOUNT_NUMBER "$PAYID_ACCOUNT" production

# Twilio Configuration
read -p "Enter your Twilio Account SID: " TWILIO_SID
vercel env add TWILIO_ACCOUNT_SID "$TWILIO_SID" production

read -p "Enter your Twilio Auth Token: " TWILIO_TOKEN
vercel env add TWILIO_AUTH_TOKEN "$TWILIO_TOKEN" production

read -p "Enter your WhatsApp number [+61470253286]: " TWILIO_WHATSAPP
TWILIO_WHATSAPP=${TWILIO_WHATSAPP:-+61470253286}
vercel env add TWILIO_WHATSAPP_FROM "whatsapp:$TWILIO_WHATSAPP" production

# Admin Details
read -p "Enter admin email [contact@lustandlace.com.au]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-contact@lustandlace.com.au}
vercel env add ADMIN_EMAIL "$ADMIN_EMAIL" production

read -p "Enter admin WhatsApp [+61470253286]: " ADMIN_WHATSAPP
ADMIN_WHATSAPP=${ADMIN_WHATSAPP:-+61470253286}
vercel env add ADMIN_WHATSAPP "whatsapp:$ADMIN_WHATSAPP" production

# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
vercel env add JWT_SECRET "$JWT_SECRET" production

# Set other security and configuration variables
vercel env add BCRYPT_ROUNDS 12 production
vercel env add RATE_LIMIT_MAX 100 production
vercel env add RATE_LIMIT_WINDOW 900000 production
vercel env add UPLOAD_MAX_SIZE 10485760 production
vercel env add UPLOAD_ALLOWED_TYPES "image/jpeg,image/png,application/pdf" production
vercel env add LOG_LEVEL info production

echo "✅ Environment variables configured"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

# Get the deployment URL
VERCEL_URL=$(vercel ls | grep "flavor-entertainers-backend" | head -1 | awk '{print $2}')

# Update BASE_URL and CORS_ORIGINS with actual Vercel URL
vercel env add BASE_URL "https://$VERCEL_URL" production
vercel env add CORS_ORIGINS "https://lustandlace.com.au,https://app.lustandlace.com.au,https://$VERCEL_URL" production

echo "✅ URL variables updated"

# Redeploy with updated environment variables
echo "🔄 Redeploying with updated environment variables..."
vercel --prod

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo "📱 API URL: https://$VERCEL_URL"
echo "📚 Documentation: https://$VERCEL_URL/docs"
echo "🌐 Vercel Dashboard: https://vercel.com/dashboard"
echo ""
echo "🔧 Next Steps:"
echo "1. Set up your Supabase database and run migrations"
echo "2. Test the API endpoints"
echo "3. Configure your custom domain (optional)"
echo "4. Create your first admin user"
echo ""
echo "📞 Support: Check Vercel logs for any issues"

# Test the deployment
echo "🧪 Testing deployment..."
curl -f "https://$VERCEL_URL/healthz" || echo "⚠️ Health check failed - check logs"

# Open documentation in browser
if command -v open &> /dev/null; then
    echo "🌐 Opening API documentation..."
    open "https://$VERCEL_URL/docs"
elif command -v xdg-open &> /dev/null; then
    echo "🌐 Opening API documentation..."
    xdg-open "https://$VERCEL_URL/docs"
fi

echo ""
echo "🔗 GitHub Repository: https://github.com/annaivky-ship-it/BOOKING-SYSTEM"
echo "📖 Connect this repo to Vercel for automatic deployments!"