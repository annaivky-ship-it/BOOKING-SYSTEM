#!/bin/bash

# Apply all database migrations to Supabase project

set -e

PROJECT_REF="qohyutlxwekppkrdlamp"
MIGRATIONS_DIR="./supabase/migrations"

echo "=================================================="
echo "Applying Database Migrations"
echo "Project: $PROJECT_REF"
echo "=================================================="
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check if linked to project
if [ ! -f ".supabase/config.toml" ]; then
    echo "🔗 Linking to Supabase project..."
    npx supabase link --project-ref $PROJECT_REF
fi

echo "📦 Applying migrations..."
echo ""

# Option 1: Use supabase db push
echo "Option 1: Using 'supabase db push'"
if npx supabase db push; then
    echo ""
    echo "✅ Migrations applied successfully using db push!"
else
    echo ""
    echo "⚠️  'db push' failed. Trying alternative method..."
    echo ""
    
    # Option 2: Apply migrations manually
    echo "Option 2: Manual migration application"
    echo "Please run the following SQL files in your Supabase SQL editor:"
    echo "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
    echo ""
    echo "Migration files (apply in order):"
    for file in $(ls -1 $MIGRATIONS_DIR/*.sql | sort); do
        echo "  - $(basename $file)"
    done
    echo ""
    echo "Or use the consolidated schema:"
    echo "  - CONSOLIDATED_SCHEMA.sql"
fi

echo ""
echo "=================================================="
echo "Next Steps:"
echo "=================================================="
echo "1. Verify tables in Supabase dashboard:"
echo "   https://supabase.com/dashboard/project/$PROJECT_REF/editor"
echo ""
echo "2. Check authentication settings:"
echo "   https://supabase.com/dashboard/project/$PROJECT_REF/auth/users"
echo ""
echo "3. Configure RLS policies if needed:"
echo "   https://supabase.com/dashboard/project/$PROJECT_REF/auth/policies"
