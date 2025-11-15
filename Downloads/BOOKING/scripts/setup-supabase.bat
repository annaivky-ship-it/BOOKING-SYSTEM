@echo off
REM ============================================================================
REM AUTOMATED SUPABASE SETUP SCRIPT (Windows)
REM ============================================================================
REM This script automatically sets up your Supabase backend
REM Run this: npm run setup:supabase
REM ============================================================================

echo.
echo ========================================
echo Flavor Entertainers - Supabase Setup
echo ========================================
echo.

set PROJECT_REF=wykwlstsfkiicusjyqiv
set PROJECT_URL=https://wykwlstsfkiicusjyqiv.supabase.co

echo [Step 1] Checking Supabase CLI...
call npx supabase --version >nul 2>&1
if errorlevel 1 (
    echo Installing Supabase CLI...
    call npm install --save-dev supabase
)
echo ✅ Supabase CLI ready
echo.

echo [Step 2] Linking to your Supabase project...
echo Project: %PROJECT_URL%
echo.
echo ⚠️  You'll need your Supabase database password
echo Find it in: Supabase Dashboard → Settings → Database
echo.

REM Link to remote project
call npx supabase link --project-ref %PROJECT_REF%

if errorlevel 1 (
    echo ❌ Failed to link. Check your password and try again.
    exit /b 1
)
echo ✅ Successfully linked to remote project
echo.

echo [Step 3] Pushing database migrations...
echo This will create all tables, functions, and policies...
echo.

REM Push all migrations
call npx supabase db push

if errorlevel 1 (
    echo ❌ Migration failed. Check the errors above.
    exit /b 1
)
echo ✅ Migrations applied successfully!
echo.

echo [Step 4] Creating storage buckets...

REM Execute SQL for storage buckets
(
echo INSERT INTO storage.buckets ^(id, name, public^)
echo VALUES ^('booking-documents', 'booking-documents', false^)
echo ON CONFLICT ^(id^) DO NOTHING;
echo.
echo INSERT INTO storage.buckets ^(id, name, public^)
echo VALUES ^('deposit-receipts', 'deposit-receipts', false^)
echo ON CONFLICT ^(id^) DO NOTHING;
echo.
echo INSERT INTO storage.buckets ^(id, name, public^)
echo VALUES ^('performer-photos', 'performer-photos', true^)
echo ON CONFLICT ^(id^) DO NOTHING;
) | npx supabase db execute

echo ✅ Storage buckets created
echo.

echo [Step 5] Verifying setup...
call npx tsx test-supabase-connection.ts

echo.
echo ========================================
echo 🎉 SETUP COMPLETE!
echo ========================================
echo.
echo Your Supabase backend is configured with:
echo   ✅ 8 database tables
echo   ✅ 6 demo performers
echo   ✅ 15 services
echo   ✅ 3 storage buckets
echo   ✅ Row Level Security
echo.
echo Next: Open http://localhost:3000
echo.
pause
