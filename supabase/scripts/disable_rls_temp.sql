-- Temporary fix: Disable RLS on user_enrollments table
-- This is needed because we're using Azure AD auth instead of Supabase auth
-- so auth.uid() returns null and RLS policies fail

-- Disable RLS temporarily
ALTER TABLE user_enrollments DISABLE ROW LEVEL SECURITY;

-- Optional: Also disable on lesson_progress if needed
ALTER TABLE lesson_progress DISABLE ROW LEVEL SECURITY;

-- Note: This makes the tables accessible to anyone with the anon key
-- In production, you should either:
-- 1. Use Supabase service role key for enrollment operations, OR
-- 2. Create custom RLS policies that work with your Azure AD user system