# Production Authentication Setup Guide

This guide covers setting up authentication for production deployment with proper redirect URLs and Supabase user sync.

## Issues Fixed

### 1. Dynamic Redirect URLs ✅
- **Problem**: Hardcoded `localhost:3000` redirect URLs won't work in production
- **Solution**: Auto-detection of production URLs with localhost fallback for development

### 2. Supabase User Sync ✅
- **Problem**: Users need to be saved to Supabase database with customer IDs
- **Solution**: Automatic user synchronization on login with enhanced error handling

## Production Deployment Checklist

### 1. Azure AD App Registration

Update your Azure AD app registration with production URLs:

**Redirect URIs to add:**
- `https://your-domain.com` (replace with your actual domain)
- `https://your-domain.vercel.app` (if using Vercel)

**Logout URLs to add:**
- `https://your-domain.com`
- `https://your-domain.vercel.app`

### 2. Environment Variables

Set these environment variables in your production environment:

```bash
# Required - Azure AD Configuration
VITE_AZURE_CLIENT_ID=your-client-id-here
VITE_AZURE_TENANT_ID=your-tenant-id-here
VITE_AZURE_CIAM_DOMAIN=your-domain.ciamlogin.com

# Optional - Only needed for localhost development
# These will be auto-detected in production
VITE_AZURE_REDIRECT_URI=http://localhost:3000
VITE_AZURE_POST_LOGOUT_REDIRECT_URI=http://localhost:3000

# Required - Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional - Development/Testing
VITE_USE_MOCK_AUTH=false
VITE_BYPASS_AZURE_AUTH=false
```

### 3. Supabase Database Setup

Ensure your Supabase database has the required tables:

```sql
-- Run this migration if not already applied
-- File: supabase/migrations/006_add_users_table.sql

-- Users table for Azure AD user synchronization
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    azure_user_id TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    given_name TEXT,
    surname TEXT,
    job_title TEXT,
    department TEXT,
    office_location TEXT,
    profile_data JSONB,
    last_login TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Business profiles table
CREATE TABLE IF NOT EXISTS public.user_business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_name TEXT NOT NULL,
    profile_data JSONB NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4. Testing Production Setup

#### Option 1: Use the Debug Panel
1. Deploy your app to production
2. Visit `https://your-domain.com/auth-debug`
3. Check all environment variables are properly set (green checkmarks)
4. Test login functionality
5. Verify user sync with database
6. Confirm customer ID generation

#### Option 2: Manual Testing
1. Open browser developer tools
2. Navigate to your production app
3. Click login and authenticate
4. Check console logs for:
   - ✅ User authentication success
   - ✅ Database sync success
   - ✅ Customer ID generation
   - ✅ Redirect URL detection

## How It Works

### Dynamic Redirect URL Detection

The authentication system now automatically detects the correct redirect URLs:

```typescript
// Development: Uses localhost URLs from environment variables
// Production: Auto-detects current domain
const getRedirectUri = () => {
  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    
    // If not localhost, use current origin
    if (!currentOrigin.includes('localhost')) {
      return currentOrigin;
    }
  }
  
  // Fallback to environment variable for localhost
  return process.env.VITE_AZURE_REDIRECT_URI || 'http://localhost:3000';
};
```

### User Synchronization Flow

1. **User Login**: User authenticates with Azure AD
2. **Token Processing**: Extract user info from Azure AD tokens
3. **Database Check**: Check if user exists in Supabase
4. **User Creation**: If new user, create database record with generated customer ID
5. **Profile Enhancement**: Merge Azure AD data with database info
6. **Session Tracking**: Update last login timestamp

### Customer ID Generation

Each user gets a unique customer ID in format: `CUST_{timestamp}_{random}`

Example: `CUST_1703123456789_A1B2C3D4E`

## Troubleshooting

### Common Issues

1. **"Redirect URI mismatch" error**
   - Add your production domain to Azure AD app registration
   - Ensure HTTPS is used in production

2. **User not syncing with database**
   - Check Supabase environment variables
   - Verify database tables exist
   - Check browser console for detailed error logs

3. **Customer ID not generated**
   - Ensure Supabase connection is working
   - Check database permissions and RLS policies
   - Verify user service is properly imported

### Debug Information

The system provides extensive logging in browser console:

- 🔍 Authentication state changes
- 🔄 Database sync operations  
- ✅ Success confirmations
- ❌ Error details with stack traces
- 🔧 Environment configuration checks

### Support

If you encounter issues:

1. Check the `/auth-debug` page for configuration status
2. Review browser console logs for detailed error information
3. Verify all environment variables are set correctly
4. Ensure Azure AD app registration includes production URLs
5. Confirm Supabase database schema is up to date

## Security Notes

- All user data is isolated by Azure user ID
- Row Level Security (RLS) is enabled on all user tables
- Tokens are validated and claims are processed securely
- Business profiles are linked to specific authenticated users only

## Next Steps

After successful production deployment:

1. Monitor user authentication and sync success rates
2. Set up user analytics and session tracking
3. Consider implementing user role management
4. Add audit logging for compliance requirements
5. Create admin dashboard for user management