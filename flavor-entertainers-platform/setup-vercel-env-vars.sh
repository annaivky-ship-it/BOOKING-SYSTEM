#!/bin/bash

# Update Vercel environment variables for production

PROJECT_NAME="booking-system"
ENV_TARGET="production"

echo "🔧 Configuring Vercel Environment Variables for $PROJECT_NAME"
echo "=================================================="
echo ""

# Function to update or add environment variable
update_env_var() {
    local var_name=$1
    local var_value=$2
    
    echo "Setting $var_name..."
    
    # Try to remove existing variable (ignore errors if it doesn't exist)
    echo "y" | npx vercel env rm "$var_name" "$ENV_TARGET" 2>/dev/null || true
    
    # Add the new value
    echo "$var_value" | npx vercel env add "$var_name" "$ENV_TARGET"
    
    if [ $? -eq 0 ]; then
        echo "✅ $var_name configured"
    else
        echo "❌ Failed to configure $var_name"
    fi
    echo ""
}

# Configure all environment variables
update_env_var "NEXT_PUBLIC_SUPABASE_URL" "https://qohyutlxwekppkrdlamp.supabase.co"

update_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvaHl1dGx4d2VrcHBrcmRsYW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NTY0OTcsImV4cCI6MjA3NDAzMjQ5N30.wu6hCCEQKtvpCaRIZSudVe8Ufu5DWO1rW_okJNrsCbc"

update_env_var "SUPABASE_SERVICE_ROLE_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvaHl1dGx4d2VrcHBrcmRsYW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ1NjQ5NywiZXhwIjoyMDc0MDMyNDk3fQ.uGJUCqgafpZWlA1uyZOpr8BxMXezeJBmVDjLAw0JJsM"

update_env_var "DATABASE_URL" "postgresql://postgres.qohyutlxwekppkrdlamp:QWOGNPMm2GP9GDax@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

update_env_var "DIRECT_URL" "postgresql://postgres.qohyutlxwekppkrdlamp:QWOGNPMm2GP9GDax@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

update_env_var "NEXTAUTH_URL" "https://booking-system-lrkd.vercel.app"

update_env_var "NEXTAUTH_SECRET" "/pZs6DVL5mcWQm2Tq6a8FDTibN556Kknn8hZM7XISK4="

echo "=================================================="
echo "✅ Vercel environment variables configured!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Apply database migrations"
echo "2. Deploy to Vercel"
