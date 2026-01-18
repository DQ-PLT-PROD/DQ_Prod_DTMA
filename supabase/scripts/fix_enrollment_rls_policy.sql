-- Fix RLS policy for user_enrollments table
-- The current INSERT policy is too restrictive

-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Users can create own enrollments" ON public.user_enrollments;

-- Create a more permissive INSERT policy that doesn't check status
CREATE POLICY "Users can create own enrollments" ON public.user_enrollments
FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
);

-- Also update the SELECT policy to be more permissive for debugging
DROP POLICY IF EXISTS "Users can read own enrollments" ON public.user_enrollments;
CREATE POLICY "Users can read own enrollments" ON public.user_enrollments
FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
    OR auth.role() = 'service_role'
);

-- Ensure the UPDATE policy is also correct
DROP POLICY IF EXISTS "Users can update own enrollments" ON public.user_enrollments;
CREATE POLICY "Users can update own enrollments" ON public.user_enrollments
FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
    OR auth.role() = 'service_role'
);

-- Add a policy for service role to have full access
DROP POLICY IF EXISTS "Service role full access enrollments" ON public.user_enrollments;
CREATE POLICY "Service role full access enrollments" ON public.user_enrollments
FOR ALL USING (auth.role() = 'service_role');