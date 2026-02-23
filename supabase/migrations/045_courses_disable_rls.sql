-- Disable RLS on courses so anon key can INSERT/UPDATE/DELETE (instructor portal without Supabase Auth).
-- Use only if the instructor app is internal/trusted. Prefer 044_courses_rls_instructor_write.sql
-- if instructors sign in via Supabase Auth.

ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
