# Entra Auth Integration with Database Customer ID Sync

This document describes the complete implementation of Azure AD (Entra) authentication integration with database customer ID synchronization.

## Overview

The implementation provides:
- ✅ Azure AD External Identities (CIAM) authentication
- ✅ Automatic user synchronization with database
- ✅ Customer ID generation and mapping
- ✅ Business profile linking to authenticated users
- ✅ Session tracking and user management

## Architecture

### Components

1. **Authentication Layer** (`src/services/auth/msal.ts`)
   - MSAL.js configuration for Azure AD CIAM
   - Handles login/logout flows
   - Token management

2. **User Service** (`src/services/userService.ts`)
   - Database user synchronization
   - Customer ID generation
   - User profile management

3. **Business Profile Service** (`src/services/businessProfileService.ts`)
   - Links business profiles to authenticated users
   - Manages multiple profiles per user
   - Primary profile designation

4. **Auth Context** (`src/components/Header/context/AuthContext.tsx`)
   - React context for authentication state
   - Integrates MSAL with database sync
   - Provides user data throughout the app

5. **User Sync Hook** (`src/hooks/useUserSync.ts`)
   - Custom React hook for user operations
   - Simplifies component integration
   - Provides loading states and error handling

## Database Schema

### Users Table
```sql
CREATE TABLE users (
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
```

### Business Profiles Table
```sql
CREATE TABLE user_business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_name TEXT NOT NULL,
    profile_data JSONB NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### User Sessions Table
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT,
    login_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    logout_time TIMESTAMPTZ,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE
);
```

## Authentication Flow

1. **User Login**
   - User clicks login button
   - Redirected to Azure AD CIAM
   - User authenticates with Microsoft account
   - Redirected back to app with tokens

2. **User Synchronization**
   - Extract user info from Azure AD tokens
   - Check if user exists in database
   - If new user: create database record with generated customer ID
   - If existing user: update last login timestamp
   - Fetch additional user info from Microsoft Graph API

3. **Business Profile Linking**
   - When user accesses business profile features
   - Link profile data to authenticated user
   - Support multiple profiles per user
   - Designate primary profile

## Usage Examples

### Basic Authentication Check
```typescript
import { useAuth } from '../components/Header/context/AuthContext';

function MyComponent() {
  const { user, databaseUser, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Customer ID: {databaseUser?.customer_id}</p>
    </div>
  );
}
```

### Using the User Sync Hook
```typescript
import { useUserSync } from '../hooks/useUserSync';

function UserDashboard() {
  const {
    user,
    databaseUser,
    businessProfiles,
    customerId,
    isUserSynced,
    createBusinessProfile
  } = useUserSync();
  
  const handleCreateProfile = async () => {
    try {
      await createBusinessProfile('My Business', profileData, true);
      console.log('Profile created successfully');
    } catch (error) {
      console.error('Failed to create profile:', error);
    }
  };
  
  return (
    <div>
      <h2>User Dashboard</h2>
      <p>Customer ID: {customerId}</p>
      <p>Sync Status: {isUserSynced ? 'Synced' : 'Not Synced'}</p>
      <p>Business Profiles: {businessProfiles.length}</p>
      <button onClick={handleCreateProfile}>Create Profile</button>
    </div>
  );
}
```

### Linking Business Profile Data
```typescript
import { saveBusinessProfile } from '../services/businessProfileService';

async function linkProfileToUser(azureUserId: string, profileData: any) {
  try {
    const profile = await saveBusinessProfile(
      azureUserId,
      'Company Profile',
      profileData,
      true // Set as primary
    );
    
    console.log('Profile linked:', profile);
  } catch (error) {
    console.error('Failed to link profile:', error);
  }
}
```

## Environment Variables

Required environment variables in `.env`:

```bash
# Azure AD External Identities (CIAM)
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_AZURE_CIAM_DOMAIN=your-domain.ciamlogin.com
VITE_AZURE_REDIRECT_URI=http://localhost:3000
VITE_AZURE_POST_LOGOUT_REDIRECT_URI=http://localhost:3000

# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Security Features

1. **Row Level Security (RLS)**
   - Users can only access their own data
   - Service role has full access for sync operations

2. **Token Validation**
   - Azure AD tokens are validated
   - Claims are processed and validated

3. **Data Isolation**
   - Each user's data is isolated by Azure user ID
   - Business profiles are linked to specific users

## Migration Instructions

To apply the database schema:

1. Run the migration:
   ```bash
   supabase migration up
   ```

2. Or manually execute the SQL in `supabase/migrations/006_add_users_table.sql`

## Testing the Integration

Use the `UserProfileDisplay` component to test the integration:

```typescript
import { UserProfileDisplay } from '../components/UserProfile/UserProfileDisplay';

function TestPage() {
  return (
    <div className="p-8">
      <h1>Auth Integration Test</h1>
      <UserProfileDisplay />
    </div>
  );
}
```

This component shows:
- Azure AD user information
- Database sync status
- Customer ID assignment
- Business profile links
- Integration summary

## Troubleshooting

### Common Issues

1. **User not syncing with database**
   - Check Supabase connection
   - Verify environment variables
   - Check browser console for errors

2. **Customer ID not generated**
   - Ensure user service is properly imported
   - Check database permissions
   - Verify RLS policies

3. **Business profiles not linking**
   - Check user authentication status
   - Verify database user exists
   - Check foreign key constraints

### Debug Information

The implementation includes extensive logging:
- Authentication state changes
- Database sync operations
- Error conditions
- User profile updates

Check browser console for detailed debug information.

## Next Steps

1. **Production Deployment**
   - Update environment variables for production
   - Configure production Azure AD app registration
   - Set up production Supabase instance

2. **Enhanced Features**
   - Add user role management
   - Implement audit logging
   - Add data export capabilities
   - Create admin dashboard

3. **Performance Optimization**
   - Add caching for user data
   - Implement background sync
   - Optimize database queries