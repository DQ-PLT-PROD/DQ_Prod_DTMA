-- Verification script for enrollment setup
-- Run this in Supabase SQL Editor to verify everything is working

-- 1. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_enrollments', 'lesson_progress');

-- 2. Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('user_enrollments', 'lesson_progress')
ORDER BY tablename, policyname;

-- 3. Test service role access (should work)
SELECT 'Service role test' as test_type, auth.role() as current_role;

-- 4. Check if we can read from user_enrollments
SELECT COUNT(*) as enrollment_count FROM user_enrollments;

-- 5. Check if we can read from lesson_progress  
SELECT COUNT(*) as progress_count FROM lesson_progress;

-- 6. Test inserting a sample enrollment (will be rolled back)
BEGIN;
INSERT INTO user_enrollments (
    user_id, 
    course_slug, 
    started_at, 
    last_accessed_at, 
    progress_pct,
    status,
    enrollment_method
) VALUES (
    'test-user-id',
    'test-course',
    NOW(),
    NOW(),
    0,
    'active',
    'explicit'
);
SELECT 'Insert test' as test_type, 'SUCCESS' as result;
ROLLBACK;