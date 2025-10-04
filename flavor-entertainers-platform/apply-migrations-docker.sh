#!/bin/bash

# Apply Supabase migrations using Docker PostgreSQL client

set -e

echo "=================================================="
echo "Applying Migrations via Docker PostgreSQL Client"
echo "=================================================="
echo ""

# Database connection details
DB_HOST="aws-0-ap-southeast-1.pooler.supabase.com"
DB_PORT="5432"
DB_USER="postgres.qohyutlxwekppkrdlamp"
DB_PASSWORD="QWOGNPMm2GP9GDax"
DB_NAME="postgres"

# Connection string
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "🔍 Testing connection to Supabase..."

# Test connection first
docker run --rm postgres:15-alpine psql "$DATABASE_URL" -c "SELECT version();" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Connection successful!"
    echo ""
    echo "📦 Applying consolidated schema..."
    echo ""
    
    # Apply the consolidated migration
    docker run --rm -v "$(pwd)/supabase/migrations:/migrations" \
        postgres:15-alpine \
        psql "$DATABASE_URL" \
        -f /migrations/CONSOLIDATED_SCHEMA.sql
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Migrations applied successfully!"
        echo ""
        echo "🔍 Verifying tables created..."
        docker run --rm postgres:15-alpine \
            psql "$DATABASE_URL" \
            -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
        
        echo ""
        echo "=================================================="
        echo "✅ Database setup complete!"
        echo "=================================================="
        echo ""
        echo "Next step: Deploy to Vercel"
        echo "  cd flavor-entertainers-platform"
        echo "  npx vercel --prod"
    else
        echo "❌ Failed to apply migrations"
        exit 1
    fi
else
    echo "❌ Connection failed. Is your Supabase project active?"
    echo ""
    echo "Please check:"
    echo "1. Project is not paused: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp"
    echo "2. Database password is correct"
    echo "3. Wait 1-2 minutes if you just unpaused the project"
    exit 1
fi
