# Database Setup Instructions

Since the Supabase CLI is not installed, you'll need to run the database migration manually through the Supabase dashboard.

## Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/006_add_users_table.sql`
4. Click "Run" to execute the migration

## Option 2: Install Supabase CLI

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Run the migration:
   ```bash
   supabase db push
   ```

## Option 3: Manual SQL Execution

Connect to your Supabase database and run this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for Azure AD user synchronization
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_azure_user_id ON users(azure_user_id);
CREATE INDEX IF NOT EXISTS idx_users_customer_id ON users(customer_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
FOR SELECT USING (auth.uid()::text = azure_user_id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
FOR UPDATE USING (auth.uid()::text = azure_user_id);

-- Policy: Service role full access (for sync operations)
CREATE POLICY "Service role full access" ON public.users
FOR ALL USING (auth.role() = 'service_role');

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create user_business_profiles table to link users with business profiles
CREATE TABLE IF NOT EXISTS public.user_business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_name TEXT NOT NULL,
    profile_data JSONB NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_business_profiles_user_id ON user_business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_business_profiles_is_primary ON user_business_profiles(is_primary);

-- Enable RLS
ALTER TABLE public.user_business_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own business profiles
CREATE POLICY "Users can manage own business profiles" ON public.user_business_profiles
FOR ALL USING (
    user_id IN (
        SELECT id FROM users WHERE azure_user_id = auth.uid()::text
    )
);

-- Add trigger for updated_at
CREATE TRIGGER update_user_business_profiles_updated_at 
    BEFORE UPDATE ON user_business_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create user_sessions table to track login sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT,
    login_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    logout_time TIMESTAMPTZ,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_login_time ON user_sessions(login_time);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own sessions
CREATE POLICY "Users can read own sessions" ON public.user_sessions
FOR SELECT USING (
    user_id IN (
        SELECT id FROM users WHERE azure_user_id = auth.uid()::text
    )
);
```

## Verification

After running the migration, verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_business_profiles', 'user_sessions');

-- Check table structure
\d users
\d user_business_profiles  
\d user_sessions
```

## Next Steps

Once the database is set up:

1. Test the authentication flow
2. Verify user synchronization works
3. Check that customer IDs are generated
4. Test business profile linking

Use the `UserProfileDisplay` component to verify everything is working correctly.