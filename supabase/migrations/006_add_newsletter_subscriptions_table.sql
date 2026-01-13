-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    source TEXT DEFAULT 'footer',
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    unsubscribed_at TIMESTAMPTZ DEFAULT NULL
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_active ON newsletter_subscriptions(is_active);

-- Enable RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert (subscribe)
-- Policy: Allow anonymous users to insert (subscribe)
DROP POLICY IF EXISTS "Allow anonymous subscription" ON public.newsletter_subscriptions;
CREATE POLICY "Allow anonymous subscription" ON public.newsletter_subscriptions
FOR INSERT 
TO anon
WITH CHECK (true);

-- Policy: Allow service role to read all subscriptions (for admin purposes)
-- Policy: Allow service role to read all subscriptions (for admin purposes)
DROP POLICY IF EXISTS "Service role can read all" ON public.newsletter_subscriptions;
CREATE POLICY "Service role can read all" ON public.newsletter_subscriptions
FOR SELECT 
TO service_role
USING (true);

-- Policy: Allow service role to update subscriptions (for unsubscribe functionality)
-- Policy: Allow service role to update subscriptions (for unsubscribe functionality)
DROP POLICY IF EXISTS "Service role can update" ON public.newsletter_subscriptions;
CREATE POLICY "Service role can update" ON public.newsletter_subscriptions
FOR UPDATE 
TO service_role
USING (true);