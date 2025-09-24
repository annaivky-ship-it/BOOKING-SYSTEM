#!/bin/bash

# Flavor Entertainers Backend Deployment Script
# This script automates the deployment process to Railway

set -e

echo "🚀 Flavor Entertainers Backend Deployment"
echo "========================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    railway login
fi

echo "📦 Building project locally..."
pnpm install
pnpm build

echo "🔧 Setting up Railway project..."

# Initialize Railway project if not already done
if [ ! -f "railway.json" ]; then
    railway init --name flavor-entertainers-backend
fi

echo "⚙️  Setting up environment variables..."

# Core Application
railway variables set NODE_ENV=production
railway variables set PORT=8080

echo "✅ Core application variables set"

# Check if Supabase variables are set
read -p "Enter your Supabase URL: " SUPABASE_URL
read -p "Enter your Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY

railway variables set SUPABASE_URL="$SUPABASE_URL"
railway variables set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
railway variables set SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"

echo "✅ Database variables set"

# PayID Business Details
read -p "Enter your PayID business email [bookings@lustandlace.com.au]: " PAYID_EMAIL
PAYID_EMAIL=${PAYID_EMAIL:-bookings@lustandlace.com.au}

read -p "Enter your business name [Flavor Entertainers]: " PAYID_NAME
PAYID_NAME=${PAYID_NAME:-"Flavor Entertainers"}

read -p "Enter your BSB: " PAYID_BSB
read -p "Enter your Account Number: " PAYID_ACCOUNT

railway variables set PAYID_BUSINESS_EMAIL="$PAYID_EMAIL"
railway variables set PAYID_BUSINESS_NAME="$PAYID_NAME"
railway variables set PAYID_BSB="$PAYID_BSB"
railway variables set PAYID_ACCOUNT_NUMBER="$PAYID_ACCOUNT"

echo "✅ PayID variables set"

# Twilio Configuration
read -p "Enter your Twilio Account SID: " TWILIO_SID
read -p "Enter your Twilio Auth Token: " TWILIO_TOKEN
read -p "Enter your WhatsApp number [+61470253286]: " TWILIO_WHATSAPP
TWILIO_WHATSAPP=${TWILIO_WHATSAPP:-+61470253286}

railway variables set TWILIO_ACCOUNT_SID="$TWILIO_SID"
railway variables set TWILIO_AUTH_TOKEN="$TWILIO_TOKEN"
railway variables set TWILIO_WHATSAPP_FROM="whatsapp:$TWILIO_WHATSAPP"

echo "✅ Twilio variables set"

# Admin Details
read -p "Enter admin email [contact@lustandlace.com.au]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-contact@lustandlace.com.au}

read -p "Enter admin WhatsApp [+61470253286]: " ADMIN_WHATSAPP
ADMIN_WHATSAPP=${ADMIN_WHATSAPP:-+61470253286}

railway variables set ADMIN_EMAIL="$ADMIN_EMAIL"
railway variables set ADMIN_WHATSAPP="whatsapp:$ADMIN_WHATSAPP"

echo "✅ Admin contact variables set"

# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
railway variables set JWT_SECRET="$JWT_SECRET"

# Set other security and configuration variables
railway variables set BCRYPT_ROUNDS=12
railway variables set RATE_LIMIT_MAX=100
railway variables set RATE_LIMIT_WINDOW=900000
railway variables set UPLOAD_MAX_SIZE=10485760
railway variables set UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,application/pdf"
railway variables set LOG_LEVEL=info

echo "✅ Security variables set"

# Add Redis add-on
echo "📦 Adding Redis add-on..."
railway add redis || echo "Redis add-on may already exist"

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up --detach

echo "⏳ Waiting for deployment..."
sleep 30

# Get the deployment URL
RAILWAY_URL=$(railway status --json | jq -r '.deployments[0].url')
echo "📱 Deployment URL: $RAILWAY_URL"

# Update BASE_URL and CORS_ORIGINS with actual Railway URL
railway variables set BASE_URL="$RAILWAY_URL"
railway variables set CORS_ORIGINS="https://lustandlace.com.au,https://app.lustandlace.com.au,$RAILWAY_URL"

echo "✅ URL variables updated"

# Run database migrations
echo "🗄️  Running database migrations..."
SUPABASE_URL="$SUPABASE_URL" \
SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
pnpm db:migrate

echo "🌱 Running database seed..."
SUPABASE_URL="$SUPABASE_URL" \
SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
pnpm db:seed

# Test the deployment
echo "🧪 Testing deployment..."
curl -f "$RAILWAY_URL/healthz" || echo "⚠️  Health check failed - check logs"

echo ""
echo "🎉 Deployment Complete!"
echo "========================"
echo "📱 API URL: $RAILWAY_URL"
echo "📚 Documentation: $RAILWAY_URL/docs"
echo "📊 Railway Dashboard: https://railway.app/dashboard"
echo ""
echo "🔧 Next Steps:"
echo "1. Test the API endpoints"
echo "2. Configure your custom domain (optional)"
echo "3. Set up monitoring and alerts"
echo "4. Create your first admin user"
echo ""
echo "📞 Support: Check 'railway logs' for any issues"

# Open documentation in browser
if command -v open &> /dev/null; then
    echo "🌐 Opening API documentation..."
    open "$RAILWAY_URL/docs"
elif command -v xdg-open &> /dev/null; then
    echo "🌐 Opening API documentation..."
    xdg-open "$RAILWAY_URL/docs"
fi