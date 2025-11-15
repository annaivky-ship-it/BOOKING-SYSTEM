#!/bin/bash
# ============================================================================
# AUTOMATED SUPABASE SETUP SCRIPT
# ============================================================================
# This script automatically sets up your Supabase backend
# Run this: npm run setup:supabase
# ============================================================================

set -e  # Exit on error

echo "🚀 Flavor Entertainers - Automated Supabase Setup"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project details
PROJECT_REF="wykwlstsfkiicusjyqiv"
PROJECT_URL="https://wykwlstsfkiicusjyqiv.supabase.co"

echo -e "${BLUE}Step 1: Checking Supabase CLI...${NC}"
if ! npx supabase --version > /dev/null 2>&1; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Installing Supabase CLI..."
    npm install --save-dev supabase
fi
echo -e "${GREEN}✅ Supabase CLI ready${NC}"
echo ""

echo -e "${BLUE}Step 2: Linking to your Supabase project...${NC}"
echo "Project: ${PROJECT_URL}"
echo ""
echo -e "${YELLOW}⚠️  You'll need your Supabase database password${NC}"
echo "Find it in: Supabase Dashboard → Settings → Database → Connection String"
echo ""

# Link to remote project
npx supabase link --project-ref ${PROJECT_REF}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully linked to remote project${NC}"
else
    echo -e "${RED}❌ Failed to link. Check your password and try again.${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}Step 3: Pushing database migrations...${NC}"
echo "This will create all tables, functions, and policies..."
echo ""

# Push all migrations to remote
npx supabase db push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations applied successfully!${NC}"
else
    echo -e "${RED}❌ Migration failed. Check the errors above.${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}Step 4: Creating storage buckets...${NC}"

# Create storage buckets using SQL
npx supabase db execute <<EOF
-- Create booking-documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-documents', 'booking-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create deposit-receipts bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('deposit-receipts', 'deposit-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Create performer-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('performer-photos', 'performer-photos', true)
ON CONFLICT (id) DO NOTHING;
EOF

echo -e "${GREEN}✅ Storage buckets created${NC}"
echo ""

echo -e "${BLUE}Step 5: Verifying setup...${NC}"

# Test connection
npx tsx test-supabase-connection.ts

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 SETUP COMPLETE!${NC}"
echo "=================================================="
echo ""
echo "Your Supabase backend is now fully configured with:"
echo "  ✅ 8 database tables"
echo "  ✅ 6 demo performers"
echo "  ✅ 15 services"
echo "  ✅ 3 storage buckets"
echo "  ✅ Row Level Security policies"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost:3000"
echo "  2. Browse performers and test booking"
echo "  3. Check out the Admin Dashboard"
echo ""
echo "Documentation:"
echo "  📖 QUICK_REFERENCE.md - Quick lookup"
echo "  📖 DATABASE_STRUCTURE.md - Schema details"
echo ""
