-- =====================================================
-- DTMA Academy - Clean Supabase Authentication Setup
-- =====================================================
-- This script safely updates existing database setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. DROP EXISTING POLICIES (Clean Slate)
-- =====================================================
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Service role full access users" ON public.users;
DROP POLICY IF EXISTS "Allow user creation" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;

-- =====================================================
-- 2. CREATE PERMISSIVE POLICIES FOR USER SYNC
-- =====================================================
-- Allow user creation (needed for Azure AD user sync)
CREATE POLICY "Allow user creation" ON public.users
FOR INSERT WITH CHECK (true);

-- Allow users to read data
CREATE POLICY "Users can read data" ON public.users
FOR SELECT USING (true);

-- Allow users to update data
CREATE POLICY "Users can update data" ON public.users
FOR UPDATE USING (true);

-- Service role has full access
CREATE POLICY "Service role full access" ON public.users
FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 3. ENSURE RLS IS ENABLED
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE MISSING TABLES (IF NOT EXISTS)
-- =====================================================
-- User business profiles table
CREATE TABLE IF NOT EXISTS public.user_business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_name TEXT NOT NULL,
    profile_data JSONB NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User sessions table
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

-- =====================================================
-- 5. CREATE INDEXES (IF NOT EXISTS)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_azure_user_id ON users(azure_user_id);
CREATE INDEX IF NOT EXISTS idx_users_customer_id ON users(customer_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

CREATE INDEX IF NOT EXISTS idx_user_business_profiles_user_id ON user_business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_business_profiles_is_primary ON user_business_profiles(is_primary);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_login_time ON user_sessions(login_time);

-- =====================================================
-- 6. ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CREATE POLICIES FOR OTHER TABLES
-- =====================================================
-- Business profiles policies
DROP POLICY IF EXISTS "Users can manage own business profiles" ON public.user_business_profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON public.user_business_profiles;

CREATE POLICY "Users can manage business profiles" ON public.user_business_profiles
FOR ALL USING (true);

CREATE POLICY "Service role full access profiles" ON public.user_business_profiles
FOR ALL USING (auth.role() = 'service_role');

-- User sessions policies
DROP POLICY IF EXISTS "Users can read own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Service role full access sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow session creation" ON public.user_sessions;

CREATE POLICY "Users can read sessions" ON public.user_sessions
FOR SELECT USING (true);

CREATE POLICY "Allow session creation" ON public.user_sessions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role full access sessions" ON public.user_sessions
FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================
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
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_business_profiles', 'user_sessions');

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Your authentication tables are now ready!
-- The policies are set to allow user creation and sync.
-- Test your authentication flow now!