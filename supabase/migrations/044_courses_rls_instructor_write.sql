-- Migration: Allow authenticated users to manage courses (instructor portal)
-- This avoids using the service_role key in the frontend.
-- RLS stays ON; only SELECT was allowed before. We add INSERT/UPDATE/DELETE for authenticated.
--
-- Alternative (not recommended for production): to allow writes without Supabase Auth,
-- run in SQL Editor: ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
-- Then anon key can write; prefer this migration instead so only logged-in users can write.

-- Allow authenticated users (e.g. instructors) to insert courses
CREATE POLICY "Authenticated can insert courses" ON public.courses
FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update any course
CREATE POLICY "Authenticated can update courses" ON public.courses
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete courses
CREATE POLICY "Authenticated can delete courses" ON public.courses
FOR DELETE TO authenticated
USING (true);

-- Optional: allow service_role full access (for backends/scripts)
CREATE POLICY "Service role full access courses" ON public.courses
FOR ALL TO service_role
USING (true)
WITH CHECK (true);
