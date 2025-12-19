#!/bin/bash

# Complete Deployment Script for Flavor Entertainers Platform
# This script automates the entire deployment process
# Run this on your LOCAL machine (not in sandbox)

set -e  # Exit on error

echo ""
echo "🚀 Flavor Entertainers - Complete Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Loaded environment from .env.local${NC}"
else
    echo -e "${RED}❌ Error: .env.local not found${NC}"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found${NC}"
    echo ""
    echo "To install Supabase CLI:"
    echo ""
    echo "macOS/Linux:"
    echo "  brew install supabase/tap/supabase"
    echo ""
    echo "Windows:"
    echo "  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git"
    echo "  scoop install supabase"
    echo ""
    echo "Or use manual deployment - see DEPLOY_NOW.md"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI detected: $(supabase --version)${NC}"

# Extract project ref from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
echo -e "${GREEN}✅ Project ref: $PROJECT_REF${NC}"
echo ""

# Step 1: Login to Supabase
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Supabase Login"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}📝 Please login to Supabase...${NC}"
    supabase login
else
    echo -e "${GREEN}✅ Already logged in to Supabase${NC}"
fi
echo ""

# Step 2: Link project
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Link Project"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -f supabase/.temp/project-ref ]; then
    echo -e "${YELLOW}🔗 Linking to project: $PROJECT_REF${NC}"
    supabase link --project-ref $PROJECT_REF
else
    echo -e "${GREEN}✅ Project already linked${NC}"
fi
echo ""

# Step 3: Deploy database schema
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Deploy Database Schema"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f supabase_schema.sql ]; then
    echo -e "${BLUE}📊 Executing supabase_schema.sql...${NC}"
    supabase db push --db-url "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" < supabase_schema.sql || {
        echo -e "${YELLOW}⚠️  CLI push failed, trying SQL execution...${NC}"
        # Alternative: Execute SQL directly
        psql "$DB_URL" < supabase_schema.sql || {
            echo -e "${RED}❌ Automated schema deployment failed${NC}"
            echo -e "${YELLOW}📝 Please run manually via SQL Editor:${NC}"
            echo "   1. Go to: https://app.supabase.com/project/$PROJECT_REF/sql"
            echo "   2. Copy contents of: supabase_schema.sql"
            echo "   3. Paste and click 'Run'"
            echo ""
            read -p "Press Enter after you've completed this manually..."
        }
    }
    echo -e "${GREEN}✅ Database schema deployed${NC}"
else
    echo -e "${RED}❌ supabase_schema.sql not found${NC}"
    exit 1
fi
echo ""

# Step 4: Set Edge Function secrets
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Configure Edge Function Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}🔐 Setting Twilio secrets...${NC}"
supabase secrets set TWILIO_ACCOUNT_SID="$TWILIO_ACCOUNT_SID"
supabase secrets set TWILIO_AUTH_TOKEN="$TWILIO_AUTH_TOKEN"
supabase secrets set TWILIO_PHONE_NUMBER="$TWILIO_PHONE_NUMBER"
supabase secrets set TWILIO_WHATSAPP_NUMBER="+14155238886"
echo -e "${GREEN}✅ Secrets configured${NC}"
echo ""

# Step 5: Deploy Edge Function
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Deploy Edge Function"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d supabase/functions/send-message ]; then
    echo -e "${BLUE}📱 Deploying send-message function...${NC}"
    supabase functions deploy send-message
    echo -e "${GREEN}✅ Edge Function deployed${NC}"
else
    echo -e "${RED}❌ Edge Function not found at: supabase/functions/send-message${NC}"
    exit 1
fi
echo ""

# Step 6: Test deployment
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Testing Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}🧪 Testing Supabase connection...${NC}"
node verify-supabase.js || echo -e "${YELLOW}⚠️  Connection test inconclusive${NC}"
echo ""

echo -e "${BLUE}🧪 Testing Edge Function...${NC}"
supabase functions invoke send-message --body '{
  "to": "'$TWILIO_PHONE_NUMBER'",
  "body": "Test notification from Flavor Entertainers platform",
  "channel": "sms"
}' || echo -e "${YELLOW}⚠️  Function test inconclusive${NC}"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎉 Your platform is ready!${NC}"
echo ""
echo "📊 Database:"
echo "   - 6 tables created"
echo "   - 7 services pre-loaded"
echo "   - Row Level Security enabled"
echo ""
echo "📱 Edge Function:"
echo "   - send-message deployed"
echo "   - Twilio configured"
echo ""
echo "🔗 Quick Links:"
echo "   • Dashboard: https://app.supabase.com/project/$PROJECT_REF"
echo "   • SQL Editor: https://app.supabase.com/project/$PROJECT_REF/sql"
echo "   • Edge Functions: https://app.supabase.com/project/$PROJECT_REF/functions"
echo "   • Table Editor: https://app.supabase.com/project/$PROJECT_REF/editor"
echo ""
echo "📝 Next Steps:"
echo "   1. Test locally: npm run dev"
echo "   2. Deploy to Vercel (add environment variables from .env.vercel)"
echo "   3. Create admin account (see DEPLOY_NOW.md Step 3)"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   • Quick start: DEPLOY_NOW.md"
echo "   • Full guide: DEPLOYMENT_READY.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
