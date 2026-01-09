-- Ultra simple policy fix
-- We assume table exists and RLS is enabled (from previous attempts)

DROP POLICY IF EXISTS "Anon Insert 2026" ON public.newsletter_subscriptions;

CREATE POLICY "Anon Insert 2026"
    ON public.newsletter_subscriptions
    FOR INSERT
    TO anon
    WITH CHECK (true);
