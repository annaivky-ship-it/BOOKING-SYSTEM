# Setup Helper Script for Booking System
# This script helps you complete the setup process

Write-Host "🚀 Booking System Setup Helper" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Function to generate encryption key
function Generate-EncryptionKey {
    Write-Host "🔐 Generating Encryption Key..." -ForegroundColor Yellow
    $key = node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
    Write-Host "✅ Generated encryption key: $key" -ForegroundColor Green
    Write-Host ""
    Write-Host "Copy this key and add it to your .env.local file as:" -ForegroundColor Cyan
    Write-Host "ENCRYPTION_KEY=$key" -ForegroundColor White
    Write-Host ""
    return $key
}

# Function to check if .env.local exists
function Check-EnvFile {
    Write-Host "📁 Checking .env.local file..." -ForegroundColor Yellow
    if (Test-Path ".env.local") {
        Write-Host "✅ .env.local exists" -ForegroundColor Green
        
        # Check if it has the required variables
        $content = Get-Content ".env.local" -Raw
        $required = @(
            "NEXT_PUBLIC_SUPABASE_URL",
            "NEXT_PUBLIC_SUPABASE_ANON_KEY",
            "SUPABASE_SERVICE_ROLE_KEY"
        )
        
        $missing = @()
        foreach ($var in $required) {
            if ($content -notmatch "$var=.+") {
                $missing += $var
            }
        }
        
        if ($missing.Count -gt 0) {
            Write-Host "⚠️  Missing or incomplete variables:" -ForegroundColor Yellow
            foreach ($var in $missing) {
                Write-Host "   - $var" -ForegroundColor Red
            }
            Write-Host ""
            Write-Host "Please add these to your .env.local file" -ForegroundColor Cyan
            return $false
        } else {
            Write-Host "✅ All required variables are set" -ForegroundColor Green
            return $true
        }
    } else {
        Write-Host "❌ .env.local not found" -ForegroundColor Red
        Write-Host "Creating .env.local from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env.local"
        Write-Host "✅ Created .env.local - Please edit it with your Supabase credentials" -ForegroundColor Green
        return $false
    }
}

# Function to open Supabase dashboard
function Open-SupabaseDashboard {
    Write-Host "🌐 Opening Supabase Dashboard..." -ForegroundColor Yellow
    Start-Process "https://app.supabase.com/project/lpnvtoysppumesllsgra/settings/api"
    Write-Host "✅ Opened in your browser" -ForegroundColor Green
    Write-Host ""
    Write-Host "Copy your API keys from the dashboard and paste them into .env.local" -ForegroundColor Cyan
}

# Function to open SQL Editor
function Open-SQLEditor {
    Write-Host "🌐 Opening Supabase SQL Editor..." -ForegroundColor Yellow
    Start-Process "https://app.supabase.com/project/lpnvtoysppumesllsgra/sql/new"
    Write-Host "✅ Opened in your browser" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Copy contents of supabase/schema.sql" -ForegroundColor White
    Write-Host "2. Paste into SQL Editor and click Run" -ForegroundColor White
    Write-Host "3. Then copy contents of supabase/rls-policies.sql" -ForegroundColor White
    Write-Host "4. Paste into SQL Editor and click Run" -ForegroundColor White
}

# Main menu
function Show-Menu {
    Write-Host ""
    Write-Host "What would you like to do?" -ForegroundColor Cyan
    Write-Host "1. Check .env.local configuration" -ForegroundColor White
    Write-Host "2. Generate encryption key" -ForegroundColor White
    Write-Host "3. Open Supabase API settings (to get keys)" -ForegroundColor White
    Write-Host "4. Open Supabase SQL Editor (to run schema)" -ForegroundColor White
    Write-Host "5. Run verification script" -ForegroundColor White
    Write-Host "6. Start development server" -ForegroundColor White
    Write-Host "7. Exit" -ForegroundColor White
    Write-Host ""
}

# Main loop
$continue = $true
while ($continue) {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-7)"
    
    switch ($choice) {
        "1" {
            Check-EnvFile
        }
        "2" {
            Generate-EncryptionKey
        }
        "3" {
            Open-SupabaseDashboard
        }
        "4" {
            Open-SQLEditor
        }
        "5" {
            Write-Host "🔍 Running verification..." -ForegroundColor Yellow
            npm run verify
        }
        "6" {
            Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
            Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
            npm run dev
        }
        "7" {
            Write-Host "👋 Goodbye!" -ForegroundColor Cyan
            $continue = $false
        }
        default {
            Write-Host "❌ Invalid choice. Please enter 1-7" -ForegroundColor Red
        }
    }
}
