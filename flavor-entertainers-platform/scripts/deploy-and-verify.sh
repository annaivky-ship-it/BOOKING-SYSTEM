#!/bin/bash

# Complete deployment and verification script

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_REF="qohyutlxwekppkrdlamp"
VERCEL_URL="https://booking-system-lrkd.vercel.app"

echo "=================================================="
echo "Flavor Entertainers - Complete Deployment"
echo "=================================================="
echo ""

# Step 1: Verify environment variables
echo -e "${YELLOW}Step 1: Verifying configuration...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.local not found. Run setup script first!${NC}"
    echo "   ./scripts/setup-supabase-connection.sh"
    exit 1
fi

echo -e "${GREEN}✓ Configuration files found${NC}"
echo ""

# Step 2: Apply migrations
echo -e "${YELLOW}Step 2: Applying database migrations...${NC}"
read -p "Do you want to apply migrations now? (y/n): " apply_migrations

if [ "$apply_migrations" = "y" ] || [ "$apply_migrations" = "Y" ]; then
    ./scripts/apply-migrations.sh
else
    echo "⚠️  Skipping migrations. Make sure to apply them manually!"
fi

echo ""

# Step 3: Build locally to verify
echo -e "${YELLOW}Step 3: Building project locally...${NC}"
read -p "Do you want to test build locally? (y/n): " test_build

if [ "$test_build" = "y" ] || [ "$test_build" = "Y" ]; then
    npm run build
    echo -e "${GREEN}✓ Local build successful${NC}"
fi

echo ""

# Step 4: Deploy to Vercel
echo -e "${YELLOW}Step 4: Deploying to Vercel...${NC}"
read -p "Do you want to deploy to production now? (y/n): " deploy_now

if [ "$deploy_now" = "y" ] || [ "$deploy_now" = "Y" ]; then
    npx vercel --prod
    echo -e "${GREEN}✓ Deployed to Vercel${NC}"
fi

echo ""

# Step 5: Verification
echo -e "${YELLOW}Step 5: Verification Checklist${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Please verify the following:"
echo ""
echo "1. Frontend is accessible:"
echo "   → $VERCEL_URL"
echo ""
echo "2. Supabase database has tables:"
echo "   → https://supabase.com/dashboard/project/$PROJECT_REF/editor"
echo ""
echo "3. Check for errors in Vercel logs:"
echo "   → https://vercel.com/dashboard/deployments"
echo ""
echo "4. Check Supabase logs:"
echo "   → https://supabase.com/dashboard/project/$PROJECT_REF/logs"
echo ""
echo "5. Test authentication flow:"
echo "   → Try signing up/logging in at $VERCEL_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Your application should now be running at:"
echo "$VERCEL_URL"
echo ""
echo "If you encounter issues, check:"
echo "- SETUP_INSTRUCTIONS.md"
echo "- Vercel deployment logs"
echo "- Supabase database logs"
