# Production Authentication Setup Guide

This guide covers setting up authentication for production deployment with proper redirect URLs and Supabase user sync.

## Issues Fixed

### 1. Dynamic Redirect URLs ✅
- **Problem**: Hardcoded redirect URLs won't work across different environments
- **Solution**: Auto-detection of production URLs with environment variable support

### 2. Supabase User Sync ✅
- **Problem**: Users need to be saved to Supabase database with customer IDs
- **Solution**: Automatic user synchronization on login with enhanced error handling

### 3. No Hardcoded Values ✅
- **Problem**: Hardcoded Azure credentials and URLs in code
- **Solution**: All values now come from environment variables with proper validation

## Production Deployment Checklist

### 1. Azure AD App Registration

Update your Azure AD app registration with production URLs:

**Redirect URIs to add:**
- `https://your-domain.com/` (replace with your actual domain)
- `https://your-domain.vercel.app/` (if using Vercel)

**Logout URLs to add:**
- `https://your-domain.com/`
- `https://your-domain.vercel.app/`

### 2. Environment Variables

Set these environment variables in your production environment:

```bash
# Required - Azure AD Configuration
VITE_AZURE_CLIENT_ID=your-client-id-here
VITE_AZURE_TENANT_ID=your-tenant-id-here
VITE_AZURE_SUBDOMAIN=your-subdomain

# Optional - Redirect URIs (will auto-detect if not provided)
VITE_AZURE_REDIRECT_URI=https://your-domain.com/
VITE_AZURE_POST_LOGOUT_REDIRECT_URI=https://your-domain.com/

# Required - Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional - Development/Testing
VITE_USE_MOCK_AUTH=false
VITE_BYPASS_AZURE_AUTH=false
```

### 3. Supabase Database Setup

Run the complete SQL setup script in your Supabase SQL Editor:

**File:** `database/scripts/supabase_auth_setup.sql`

This script will create:
- ✅ `users` table with proper indexes and constraints
- ✅ `user_business_profiles` table for business profile management
- ✅ `user_sessions` table for session tracking
- ✅ Row Level Security (RLS) policies for all tables
- ✅ Automatic timestamp update triggers
- ✅ Helper functions for user management
- ✅ Verification queries to confirm setup

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

### Dynamic Configuration

The authentication system now uses environment variables for all configuration:

```typescript
// No hardcoded values - all from environment
const clientId = process.env.VITE_AZURE_CLIENT_ID; // Required
const tenantId = process.env.VITE_AZURE_TENANT_ID; // Required
const subdomain = process.env.VITE_AZURE_SUBDOMAIN; // Required
const redirectUri = process.env.VITE_AZURE_REDIRECT_URI; // Optional - auto-detects
```

### Redirect URL Detection

```typescript
// Development: Uses localhost URLs automatically
// Production: Uses environment variable or auto-detects current domain
const getRedirectUri = () => {
  if (window.location.origin.includes('localhost')) {
    return `${window.location.origin}/`;
  }
  
  // Use environment variable if set
  if (process.env.VITE_AZURE_REDIRECT_URI) {
    return process.env.VITE_AZURE_REDIRECT_URI;
  }
  
  // Auto-detect current origin
  return `${window.location.origin}/`;
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

1. **"Environment variable missing" error**
   - Ensure all required environment variables are set
   - Check that variable names match exactly (case-sensitive)

2. **"Redirect URI mismatch" error**
   - Add your production domain to Azure AD app registration
   - Ensure HTTPS is used in production
   - Check that redirect URIs end with `/`

3. **User not syncing with database**
   - Run the `database/scripts/supabase_auth_setup.sql` script
   - Check Supabase environment variables
   - Verify database tables exist with correct schema
   - Check browser console for detailed error logs

4. **Customer ID not generated**
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
5. Confirm Supabase database schema is up to date using the SQL script

## Security Notes

- All configuration values come from environment variables
- No hardcoded credentials or URLs in the codebase
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
