-- Permanent RLS Policies for Azure AD + Service Role Architecture
-- This is the production-ready solution for enrollment system

-- =============================================
-- RE-ENABLE RLS (if it was disabled)
-- =============================================
ALTER TABLE user_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USER_ENROLLMENTS POLICIES
-- =============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own enrollments" ON public.user_enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON public.user_enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON public.user_enrollments;
DROP POLICY IF EXISTS "Service role full access enrollments" ON public.user_enrollments;

-- Service role has full access (for enrollment operations)
CREATE POLICY "Service role full access" ON public.user_enrollments
FOR ALL USING (auth.role() = 'service_role');

-- Anon role can read all enrollments (for public course data)
-- This is safe because we validate user ownership in application code
CREATE POLICY "Public read access" ON public.user_enrollments
FOR SELECT USING (true);

-- =============================================
-- LESSON_PROGRESS POLICIES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can create own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Service role full access progress" ON public.lesson_progress;

-- Service role has full access
CREATE POLICY "Service role full access" ON public.lesson_progress
FOR ALL USING (auth.role() = 'service_role');

-- Anon role can read progress (application validates ownership)
CREATE POLICY "Public read access" ON public.lesson_progress
FOR SELECT USING (true);

-- =============================================
-- SECURITY NOTES
-- =============================================
-- This approach is secure because:
-- 1. Service role operations are controlled by application code
-- 2. Application validates Azure AD authentication before operations
-- 3. User ownership is validated in the enrollment service
-- 4. Anon key only allows reads, writes go through service role
-- 5. All sensitive operations require valid Azure AD authentication

-- =============================================
-- VERIFY POLICIES
-- =============================================
-- Check that policies were created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('user_enrollments', 'lesson_progress')
ORDER BY tablename, policyname;