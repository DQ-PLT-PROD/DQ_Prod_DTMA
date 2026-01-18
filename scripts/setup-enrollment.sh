#!/bin/bash
# DTMA Enrollment & Access Gating Setup Script
# This script sets up the enrollment feature for production

set -e

echo "🚀 DTMA Enrollment & Access Gating Setup"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please configure it before continuing."
    echo ""
    echo "Required variables:"
    echo "  - VITE_SUPABASE_URL"
    echo "  - VITE_SUPABASE_ANON_KEY"
    echo "  - VITE_SUPABASE_SERVICE_ROLE_KEY"
    echo "  - VITE_AZURE_CLIENT_ID"
    echo "  - VITE_AZURE_TENANT_ID"
    echo ""
    echo "Optional (for payment):"
    echo "  - VITE_STRIPE_PUBLIC_KEY"
    echo "  - STRIPE_SECRET_KEY"
    echo ""
    exit 1
fi

echo "✅ .env file found"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Install it with:"
    echo "  npm install -g supabase"
    echo ""
    echo "Or continue without CLI (manual migration required)"
    read -p "Continue without CLI? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    SKIP_MIGRATIONS=true
fi

# Run database migrations
if [ "$SKIP_MIGRATIONS" != "true" ]; then
    echo "📦 Running database migrations..."
    echo ""
    
    # Check if we're linked to a Supabase project
    if [ ! -f .supabase/config.toml ]; then
        echo "⚠️  Not linked to a Supabase project."
        echo "Run: supabase link --project-ref YOUR_PROJECT_REF"
        echo ""
        read -p "Skip migrations? (y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo "Running migrations..."
        supabase db push
        echo "✅ Migrations applied"
        echo ""
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Build the project
echo "🔨 Building project..."
npm run build
echo "✅ Build complete"
echo ""

# Summary
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Start API server: npm run api"
echo "2. Start frontend: npm run dev"
echo "3. Run tests: See docs/ENROLLMENT_TESTING_GUIDE.md"
echo ""
echo "For Stripe integration:"
echo "1. Add VITE_STRIPE_PUBLIC_KEY to .env"
echo "2. Add STRIPE_SECRET_KEY to .env"
echo "3. Restart API server"
echo ""
echo "Documentation:"
echo "- Implementation: DTMA_Enrollment_Implementation_Summary_Jan29.md"
echo "- Testing: docs/ENROLLMENT_TESTING_GUIDE.md"
echo "- Completion: DTMA_Enrollment_100_Percent_Complete.md"
echo ""
