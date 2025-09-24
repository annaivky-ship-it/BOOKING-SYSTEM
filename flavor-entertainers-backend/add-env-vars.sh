#!/bin/bash

# Script to add environment variables to Vercel
echo "🔧 Adding environment variables to Vercel..."

cd flavor-entertainers-backend

# Add essential environment variables
echo "NODE_ENV=production" | vercel env add NODE_ENV production
echo "VITE_DEMO_MODE=true" | vercel env add VITE_DEMO_MODE production
echo "VITE_APP_ENV=demo" | vercel env add VITE_APP_ENV production
echo "https://rpldkrstlqdlolbhbylp.supabase.co" | vercel env add VITE_SUPABASE_URL production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwbGRrcnN0bHFkbG9sYmhieWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Njg4NTQsImV4cCI6MjA3MzA0NDg1NH0.0aBSYWQPAWerAmguhD7yWnkJc48aBlCQQ8RPzCWdoEU" | vercel env add VITE_SUPABASE_ANON_KEY production
echo "annaivk@gmail.com" | vercel env add ADMIN_EMAIL production
echo "whatsapp:+61414461008" | vercel env add ADMIN_WHATSAPP production

echo "✅ Environment variables added!"
echo "Now deploy with: vercel --prod"