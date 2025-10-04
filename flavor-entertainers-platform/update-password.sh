#!/bin/bash
# Update database password in environment variables

NEW_PASSWORD="jy4fteUbGaLR1z2h"

# Update local .env.local
sed -i "s|:QWOGNPMm2GP9GDax@|:${NEW_PASSWORD}@|g" .env.local

echo "✅ Updated .env.local with new password"
echo ""
echo "To update Vercel environment variables:"
echo ""
echo "# Remove old DATABASE_URL"
echo "echo y | npx vercel env rm DATABASE_URL production"
echo ""
echo "# Add new DATABASE_URL"  
echo "echo 'postgresql://postgres.qohyutlxwekppkrdlamp:${NEW_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' | npx vercel env add DATABASE_URL production"
echo ""
echo "# Remove old DIRECT_URL"
echo "echo y | npx vercel env rm DIRECT_URL production"
echo ""
echo "# Add new DIRECT_URL"
echo "echo 'postgresql://postgres.qohyutlxwekppkrdlamp:${NEW_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres' | npx vercel env add DIRECT_URL production"
