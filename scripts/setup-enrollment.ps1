# DTMA Enrollment & Access Gating Setup Script (PowerShell)
# This script sets up the enrollment feature for production

$ErrorActionPreference = "Stop"

Write-Host "🚀 DTMA Enrollment & Access Gating Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file. Please configure it before continuing." -ForegroundColor Green
    Write-Host ""
    Write-Host "Required variables:" -ForegroundColor Yellow
    Write-Host "  - VITE_SUPABASE_URL"
    Write-Host "  - VITE_SUPABASE_ANON_KEY"
    Write-Host "  - VITE_SUPABASE_SERVICE_ROLE_KEY"
    Write-Host "  - VITE_AZURE_CLIENT_ID"
    Write-Host "  - VITE_AZURE_TENANT_ID"
    Write-Host ""
    Write-Host "Optional (for payment):" -ForegroundColor Yellow
    Write-Host "  - VITE_STRIPE_PUBLIC_KEY"
    Write-Host "  - STRIPE_SECRET_KEY"
    Write-Host ""
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green
Write-Host ""

# Check if Supabase CLI is installed
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseInstalled) {
    Write-Host "⚠️  Supabase CLI not found. Install it with:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase"
    Write-Host ""
    Write-Host "Or continue without CLI (manual migration required)" -ForegroundColor Yellow
    $continue = Read-Host "Continue without CLI? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
    $skipMigrations = $true
}

# Run database migrations
if (-not $skipMigrations) {
    Write-Host "📦 Running database migrations..." -ForegroundColor Cyan
    Write-Host ""
    
    # Check if we're linked to a Supabase project
    if (-not (Test-Path .supabase/config.toml)) {
        Write-Host "⚠️  Not linked to a Supabase project." -ForegroundColor Yellow
        Write-Host "Run: supabase link --project-ref YOUR_PROJECT_REF"
        Write-Host ""
        $skip = Read-Host "Skip migrations? (y/n)"
        if ($skip -ne "y") {
            exit 1
        }
    } else {
        Write-Host "Running migrations..." -ForegroundColor Cyan
        supabase db push
        Write-Host "✅ Migrations applied" -ForegroundColor Green
        Write-Host ""
    }
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Cyan
npm run build
Write-Host "✅ Build complete" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start API server: npm run api"
Write-Host "2. Start frontend: npm run dev"
Write-Host "3. Run tests: See docs/ENROLLMENT_TESTING_GUIDE.md"
Write-Host ""
Write-Host "For Stripe integration:" -ForegroundColor Cyan
Write-Host "1. Add VITE_STRIPE_PUBLIC_KEY to .env"
Write-Host "2. Add STRIPE_SECRET_KEY to .env"
Write-Host "3. Restart API server"
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "- Implementation: DTMA_Enrollment_Implementation_Summary_Jan29.md"
Write-Host "- Testing: docs/ENROLLMENT_TESTING_GUIDE.md"
Write-Host "- Completion: DTMA_Enrollment_100_Percent_Complete.md"
Write-Host ""
