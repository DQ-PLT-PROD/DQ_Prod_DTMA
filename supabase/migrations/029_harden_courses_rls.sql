-- =====================================================
-- DTMA Sprint 0 - Stage01: Harden Courses RLS
-- =====================================================
-- Ensure only published courses are publicly accessible
-- This migration enforces status-based filtering at the database level
-- for defense-in-depth security

BEGIN;

-- =====================================================
-- COURSES TABLE RLS HARDENING
-- =====================================================

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Public Read Access: courses" ON public.courses;
DROP POLICY IF EXISTS "Public can read published courses" ON public.courses;
DROP POLICY IF EXISTS "Service role full access" ON public.courses;

-- Create status-aware public read policy
-- Only published courses are visible to anonymous/public users
CREATE POLICY "Public can read published courses" ON public.courses
FOR SELECT 
USING (status = 'published');

-- Service role has full access for admin operations
-- This allows backend services to manage all courses regardless of status
CREATE POLICY "Service role full access courses" ON public.courses
FOR ALL 
USING (auth.role() = 'service_role');

-- =====================================================
-- RELATED TABLES: LESSONS
-- =====================================================
-- Lessons should only be publicly readable if their course is published

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Public Read Access: lessons" ON public.lessons;
DROP POLICY IF EXISTS "Public can read lessons of published courses" ON public.lessons;
DROP POLICY IF EXISTS "Service role full access lessons" ON public.lessons;

-- Public can only read lessons from published courses
CREATE POLICY "Public can read lessons of published courses" ON public.lessons
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.slug = lessons.course_slug 
    AND courses.status = 'published'
  )
);

-- Service role has full access
CREATE POLICY "Service role full access lessons" ON public.lessons
FOR ALL 
USING (auth.role() = 'service_role');

-- =====================================================
-- RELATED TABLES: COURSE_RESOURCES
-- =====================================================
-- Course resources should only be publicly readable if their course is published

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Public Read Access: course_resources" ON public.course_resources;
DROP POLICY IF EXISTS "Public can read resources of published courses" ON public.course_resources;
DROP POLICY IF EXISTS "Service role full access resources" ON public.course_resources;

-- Public can only read resources from published courses
CREATE POLICY "Public can read resources of published courses" ON public.course_resources
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.slug = course_resources.course_slug 
    AND courses.status = 'published'
  )
);

-- Service role has full access
CREATE POLICY "Service role full access resources" ON public.course_resources
FOR ALL 
USING (auth.role() = 'service_role');

-- =====================================================
-- RELATED TABLES: QUIZZES
-- =====================================================
-- Quizzes should only be publicly readable if their course is published

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Public Read Access: quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Public can read quizzes of published courses" ON public.quizzes;
DROP POLICY IF EXISTS "Service role full access quizzes" ON public.quizzes;

-- Public can only read quizzes from published courses
CREATE POLICY "Public can read quizzes of published courses" ON public.quizzes
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.slug = quizzes.course_slug 
    AND courses.status = 'published'
  )
);

-- Service role has full access
CREATE POLICY "Service role full access quizzes" ON public.quizzes
FOR ALL 
USING (auth.role() = 'service_role');

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Verify all policies were created correctly

DO $$
BEGIN
  RAISE NOTICE 'Verifying RLS policies...';
END $$;

-- Check courses policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies 
WHERE tablename IN ('courses', 'lessons', 'course_resources', 'quizzes')
ORDER BY tablename, policyname;

-- =====================================================
-- SECURITY NOTES
-- =====================================================
-- This migration provides defense-in-depth by:
-- 1. Enforcing published status at database level (not just application)
-- 2. Preventing direct access to draft/unpublished courses
-- 3. Cascading protection to related tables (lessons, resources, quizzes)
-- 4. Maintaining service role access for admin operations
-- 5. No breaking changes to frontend (already filters for published)

COMMIT;
