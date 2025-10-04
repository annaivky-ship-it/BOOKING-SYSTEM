@echo off
echo.
echo ===================================
echo  FLAVOR ENTERTAINERS - DEV SERVER
echo ===================================
echo.

echo Checking environment...
if not exist .env.local (
    echo ERROR: .env.local file not found!
    echo Please copy .env.example to .env.local and configure your variables.
    pause
    exit /b 1
)

echo Environment file found ✓
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo Dependencies installed ✓
echo.

echo Testing database connection...
call node test-db-connection.js
echo.

echo Starting development server...
echo Open http://localhost:3000 in your browser
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev