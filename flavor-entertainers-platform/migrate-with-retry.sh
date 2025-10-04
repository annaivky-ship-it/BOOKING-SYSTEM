#!/bin/bash

# Apply migrations with automatic retry after unpausing

echo "=================================================="
echo "Supabase Migration with Unpause Detection"
echo "=================================================="
echo ""

DB_HOST="aws-0-ap-southeast-1.pooler.supabase.com"
DB_PORT="5432"
DB_USER="postgres.qohyutlxwekppkrdlamp"
DB_PASSWORD="QWOGNPMm2GP9GDax"
DB_NAME="postgres"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "⚠️  Your Supabase project appears to be PAUSED"
echo ""
echo "Please follow these steps:"
echo ""
echo "1. Open: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp"
echo "2. Look for 'Project is paused' or 'Restore project'"
echo "3. Click 'Restore' or 'Unpause'"
echo "4. Wait for the project to become active (1-2 minutes)"
echo ""
read -p "Press ENTER after you have unpaused the project and it's active..."

echo ""
echo "🔄 Waiting 10 seconds for database to fully initialize..."
sleep 10

echo ""
echo "🔍 Testing connection..."

# Test connection with retries
MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "Attempt $((RETRY_COUNT + 1))/$MAX_RETRIES..."
    
    if docker run --rm postgres:15-alpine psql "$DATABASE_URL" -c "SELECT 1;" 2>&1 | grep -q "1 row"; then
        echo "✅ Connection successful!"
        echo ""
        echo "📦 Applying migrations..."
        echo ""
        
        # Apply migrations
        docker run --rm -v "$(pwd)/supabase/migrations:/migrations" \
            postgres:15-alpine \
            psql "$DATABASE_URL" \
            -f /migrations/CONSOLIDATED_SCHEMA.sql
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Migrations applied successfully!"
            echo ""
            echo "🔍 Listing created tables..."
            docker run --rm postgres:15-alpine \
                psql "$DATABASE_URL" \
                -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
            
            echo ""
            echo "=================================================="
            echo "✅ SUCCESS! Database is ready!"
            echo "=================================================="
            echo ""
            echo "Next step: Deploy to Vercel"
            echo "  npx vercel --prod"
            exit 0
        else
            echo "❌ Failed to apply migrations"
            exit 1
        fi
    fi
    
    echo "⏳ Connection failed. Waiting 15 seconds before retry..."
    sleep 15
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

echo ""
echo "❌ Could not connect after $MAX_RETRIES attempts"
echo ""
echo "Please verify:"
echo "1. Project is active at: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp"
echo "2. Database password is correct"
echo "3. Wait a few more minutes if you just unpaused"
echo ""
echo "Alternative: Use manual SQL Editor method (see APPLY_MIGRATIONS_MANUALLY.md)"
exit 1
