-- Migration: 047_course_categories_instructor_write.sql
-- Description: Allow instructor portal to INSERT/UPDATE course_categories when creating new categories.
-- Same approach as 045 for courses - enables category management without Supabase Auth.

ALTER TABLE public.course_categories DISABLE ROW LEVEL SECURITY;
