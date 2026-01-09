-- Ensure table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    source TEXT DEFAULT 'footer',
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Ensure case-insensitive unique index exists
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscriptions_email_idx ON public.newsletter_subscriptions (lower(email));

-- Enable RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- 1. Drop ALL potentially conflicting policies from previous migrations to ensure a clean slate
DROP POLICY IF EXISTS "Allow anonymous subscription" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Allow anonymous email signups" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Service role can read all" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Service role can update" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Service role full access to newsletter subscriptions" ON public.newsletter_subscriptions;

-- 2. Re-create the correct policies
-- Allow anyone (anon) to insert a new subscription
CREATE POLICY "Allow anonymous email signups"
    ON public.newsletter_subscriptions
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow service role (admin/dashboard) full access
CREATE POLICY "Service role full access"
    ON public.newsletter_subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
