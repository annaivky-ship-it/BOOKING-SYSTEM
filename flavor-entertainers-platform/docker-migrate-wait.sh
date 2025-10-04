#!/bin/bash

# Apply migrations with Docker - wait for database to be ready

echo "=================================================="
echo "Waiting for Supabase Database to be Ready"
echo "=================================================="
echo ""

DB_HOST="aws-0-ap-southeast-1.pooler.supabase.com"
DB_PORT="5432"
DB_USER="postgres.qohyutlxwekppkrdlamp"
DB_PASSWORD="QWOGNPMm2GP9GDax"
DB_NAME="postgres"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "⏳ Waiting 2 minutes for database to fully initialize after unpause..."
echo "   (You can check status at: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp)"
echo ""

# Wait 2 minutes
for i in {120..1}; do
    printf "\r   Seconds remaining: %3d" $i
    sleep 1
done
echo ""
echo ""

echo "🔍 Testing database connection..."
echo ""

# Try connection with multiple retries
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "Connection attempt $((RETRY_COUNT + 1))/$MAX_RETRIES..."
    
    RESULT=$(docker run --rm postgres:15-alpine psql "$DATABASE_URL" -c "SELECT 1 AS connected;" 2>&1)
    
    if echo "$RESULT" | grep -q "connected"; then
        echo "✅ Database is ready!"
        echo ""
        echo "📦 Applying migrations from CONSOLIDATED_SCHEMA.sql..."
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
            echo "🔍 Verifying tables were created..."
            echo ""
            
            docker run --rm postgres:15-alpine \
                psql "$DATABASE_URL" \
                -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" \
                -t
            
            echo ""
            echo "=================================================="
            echo "🎉 SUCCESS! Database schema is ready!"
            echo "=================================================="
            echo ""
            echo "Next step: Deploy to Vercel"
            echo "  npx vercel --prod"
            echo ""
            exit 0
        else
            echo ""
            echo "❌ Failed to apply migrations"
            echo "Check the error above for details"
            exit 1
        fi
    else
        echo "⏳ Database not ready yet. Waiting 10 seconds..."
        sleep 10
        RETRY_COUNT=$((RETRY_COUNT + 1))
    fi
done

echo ""
echo "❌ Could not connect to database after $MAX_RETRIES attempts"
echo ""
echo "Possible issues:"
echo "1. Database is still starting up (wait a few more minutes)"
echo "2. Project might still be paused"
echo "3. Incorrect database password"
echo ""
echo "Check project status: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp"
echo ""
echo "Alternative: Use SQL Editor method (see APPLY_MIGRATIONS_MANUALLY.md)"
exit 1
