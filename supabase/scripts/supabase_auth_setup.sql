-- =====================================================
-- DTMA Academy - Complete Supabase Authentication Setup
-- =====================================================
-- This script sets up all required tables and policies for authentication
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
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

-- =====================================================
-- 2. USER BUSINESS PROFILES TABLE
-- =====================================================
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

-- =====================================================
-- 3. USER SESSIONS TABLE
-- =====================================================
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

-- =====================================================
-- 4. TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================
-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to automatically update updated_at timestamp
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_business_profiles_updated_at 
    BEFORE UPDATE ON user_business_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) SETUP
-- =====================================================
-- Enable RLS on all user tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. RLS POLICIES FOR USERS TABLE
-- =====================================================
-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Service role full access users" ON public.users;
DROP POLICY IF EXISTS "Allow user creation" ON public.users;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
FOR SELECT USING (
    auth.uid()::text = azure_user_id OR
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated'
);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
FOR UPDATE USING (
    auth.uid()::text = azure_user_id OR
    auth.role() = 'service_role'
);

-- Policy: Allow user creation (for new user registration)
CREATE POLICY "Allow user creation" ON public.users
FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR
    auth.role() = 'anon' OR
    auth.role() = 'authenticated'
);

-- Policy: Service role can do everything (for sync operations)
CREATE POLICY "Service role full access users" ON public.users
FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 7. RLS POLICIES FOR USER BUSINESS PROFILES TABLE
-- =====================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own business profiles" ON public.user_business_profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON public.user_business_profiles;

-- Policy: Users can manage their own business profiles
CREATE POLICY "Users can manage own business profiles" ON public.user_business_profiles
FOR ALL USING (
    user_id IN (
        SELECT id FROM users WHERE azure_user_id = auth.uid()::text
    ) OR
    auth.role() = 'service_role'
);

-- Policy: Service role can do everything
CREATE POLICY "Service role full access profiles" ON public.user_business_profiles
FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 8. RLS POLICIES FOR USER SESSIONS TABLE
-- =====================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Service role full access sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow session creation" ON public.user_sessions;

-- Policy: Users can read their own sessions
CREATE POLICY "Users can read own sessions" ON public.user_sessions
FOR SELECT USING (
    user_id IN (
        SELECT id FROM users WHERE azure_user_id = auth.uid()::text
    ) OR
    auth.role() = 'service_role'
);

-- Policy: Allow session creation
CREATE POLICY "Allow session creation" ON public.user_sessions
FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated'
);

-- Policy: Service role can do everything
CREATE POLICY "Service role full access sessions" ON public.user_sessions
FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 9. HELPER FUNCTIONS
-- =====================================================
-- Function to get user by Azure ID
CREATE OR REPLACE FUNCTION get_user_by_azure_id(azure_id TEXT)
RETURNS TABLE(
    id UUID,
    azure_user_id TEXT,
    customer_id TEXT,
    email TEXT,
    name TEXT,
    given_name TEXT,
    surname TEXT,
    job_title TEXT,
    department TEXT,
    office_location TEXT,
    profile_data JSONB,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.azure_user_id, u.customer_id, u.email, u.name, 
           u.given_name, u.surname, u.job_title, u.department, 
           u.office_location, u.profile_data, u.last_login, 
           u.created_at, u.updated_at
    FROM users u
    WHERE u.azure_user_id = azure_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user last login
CREATE OR REPLACE FUNCTION update_user_last_login(azure_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users 
    SET last_login = NOW(), updated_at = NOW()
    WHERE azure_user_id = azure_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify the setup

-- Check if tables exist
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_business_profiles', 'user_sessions');

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_business_profiles', 'user_sessions');

-- Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_business_profiles', 'user_sessions');

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Your authentication tables are now ready!
-- 
-- Next steps:
-- 1. Update your environment variables with Supabase credentials
-- 2. Test the authentication flow using the /auth-debug page
-- 3. Verify user creation and sync functionality
-- 
-- For troubleshooting, check the browser console for detailed logs
-- during authentication attempts.