-- Quick test to see if enrollment will work
-- Run this in Supabase SQL Editor

-- Check current role and policies
SELECT 'Current role: ' || auth.role() as status;

-- Check if we can read from user_enrollments
SELECT 'Can read enrollments: ' || CASE WHEN COUNT(*) >= 0 THEN 'YES' ELSE 'NO' END as status
FROM user_enrollments;

-- Test if we can insert (this will be rolled back)
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
SELECT 'Can insert enrollments: YES' as status;
ROLLBACK;