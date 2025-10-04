@echo off
echo ================================================
echo Applying Migrations Using Native psql
echo ================================================
echo.

REM Check if psql is available
where psql >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Found psql installed locally
    set PGPASSWORD=jy4fteUbGaLR1z2h
    psql -h db.qohyutlxwekppkrdlamp.supabase.co -p 5432 -U postgres -d postgres -f supabase\migrations\CONSOLIDATED_SCHEMA.sql
) else (
    echo psql not found. Installing via Scoop...
    scoop install postgresql
    if %ERRORLEVEL% EQU 0 (
        set PGPASSWORD=jy4fteUbGaLR1z2h
        psql -h db.qohyutlxwekppkrdlamp.supabase.co -p 5432 -U postgres -d postgres -f supabase\migrations\CONSOLIDATED_SCHEMA.sql
    ) else (
        echo Failed to install postgresql
        echo.
        echo Please use SQL Editor method instead:
        echo 1. Go to: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/sql/new
        echo 2. Copy content from: supabase\migrations\CONSOLIDATED_SCHEMA.sql
        echo 3. Paste and click RUN
    )
)
