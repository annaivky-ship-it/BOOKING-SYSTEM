#!/bin/bash

# Flavor Entertainers - Supabase Connection Setup Script
# This script helps you connect your Vercel frontend to Supabase backend

set -e

echo "=================================================="
echo "Flavor Entertainers - Supabase Connection Setup"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to prompt for input
prompt_input() {
    local prompt="$1"
    local var_name="$2"
    local default="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " value
        value=${value:-$default}
    else
        read -p "$prompt: " value
    fi
    
    eval "$var_name='$value'"
}

# Function to prompt for password
prompt_password() {
    local prompt="$1"
    local var_name="$2"
    
    read -sp "$prompt: " value
    echo ""
    eval "$var_name='$value'"
}

echo -e "${YELLOW}Step 1: Supabase Project Information${NC}"
echo "Project Reference: qohyutlxwekppkrdlamp"
echo "Project URL: https://qohyutlxwekppkrdlamp.supabase.co"
echo ""

echo -e "${YELLOW}Step 2: Get your Supabase API keys${NC}"
echo "Visit: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/settings/api"
echo ""

prompt_input "Enter your Supabase ANON key" SUPABASE_ANON_KEY
prompt_input "Enter your Supabase SERVICE ROLE key" SUPABASE_SERVICE_ROLE_KEY

echo ""
echo -e "${YELLOW}Step 3: Database Configuration${NC}"
echo "Visit: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/settings/database"
echo ""

prompt_password "Enter your database password" DB_PASSWORD

# Build connection strings
DATABASE_URL="postgresql://postgres.qohyutlxwekppkrdlamp:${DB_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.qohyutlxwekppkrdlamp:${DB_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

echo ""
echo -e "${YELLOW}Step 4: NextAuth Configuration${NC}"
prompt_input "Enter NEXTAUTH_SECRET (min 32 chars)" NEXTAUTH_SECRET "$(openssl rand -base64 32)"

echo ""
echo -e "${GREEN}Configuration Summary:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Supabase URL: https://qohyutlxwekppkrdlamp.supabase.co"
echo "Anon Key: ${SUPABASE_ANON_KEY:0:20}..."
echo "Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."
echo "Database URL: postgresql://postgres.qohyutlxwekppkrdlamp:***@aws..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Do you want to configure Vercel environment variables now? (y/n): " configure_vercel

if [ "$configure_vercel" = "y" ] || [ "$configure_vercel" = "Y" ]; then
    echo ""
    echo -e "${YELLOW}Configuring Vercel environment variables...${NC}"
    
    # Set environment variables for production
    echo "$SUPABASE_ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
    echo "$SUPABASE_SERVICE_ROLE_KEY" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
    echo "$DATABASE_URL" | npx vercel env add DATABASE_URL production
    echo "$DIRECT_URL" | npx vercel env add DIRECT_URL production
    echo "$NEXTAUTH_SECRET" | npx vercel env add NEXTAUTH_SECRET production
    echo "https://qohyutlxwekppkrdlamp.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
    echo "https://booking-system-lrkd.vercel.app" | npx vercel env add NEXTAUTH_URL production
    
    echo -e "${GREEN}✓ Vercel environment variables configured!${NC}"
fi

# Create local .env file
echo ""
read -p "Do you want to create/update local .env file? (y/n): " create_env

if [ "$create_env" = "y" ] || [ "$create_env" = "Y" ]; then
    cat > .env.local << ENVEOF
# =============================================================================
# FLAVOR ENTERTAINERS - ENVIRONMENT CONFIGURATION
# Generated on $(date)
# =============================================================================

# =============================================================================
# SUPABASE CONFIGURATION
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://qohyutlxwekppkrdlamp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
DATABASE_URL=$DATABASE_URL
DIRECT_URL=$DIRECT_URL

# =============================================================================
# NEXTAUTH CONFIGURATION
# =============================================================================
NEXTAUTH_URL=https://booking-system-lrkd.vercel.app
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# =============================================================================
# OTHER CONFIGURATION (Add as needed)
# =============================================================================
NODE_ENV=production
ENVEOF
    
    echo -e "${GREEN}✓ Created .env.local file!${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Run database migrations: npx supabase db push"
echo "2. Deploy to Vercel: npx vercel --prod"
echo "3. Test your application: https://booking-system-lrkd.vercel.app"
echo ""
echo "For detailed instructions, see SETUP_INSTRUCTIONS.md"
