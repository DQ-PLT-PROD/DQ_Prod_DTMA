-- Migration: Add subscriptions table for DTMA Feature Specification (Jan 29)
-- Implements minimal subscription tracking for enrollment eligibility

-- =============================================
-- CREATE SUBSCRIPTIONS TABLE
-- Minimal subscription tracking per spec
-- =============================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    provider TEXT NOT NULL DEFAULT 'stripe',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one active subscription per user per plan
    UNIQUE(user_id, plan_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
);

-- Service role has full access (for payment webhooks and admin operations)
CREATE POLICY "Service role full access to subscriptions" ON public.subscriptions
FOR ALL TO service_role USING (true);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(
    p_user_id UUID,
    p_plan_id TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    IF p_plan_id IS NULL THEN
        -- Check for any active subscription
        RETURN EXISTS (
            SELECT 1 FROM subscriptions 
            WHERE user_id = p_user_id 
            AND status = 'active'
        );
    ELSE
        -- Check for specific plan
        RETURN EXISTS (
            SELECT 1 FROM subscriptions 
            WHERE user_id = p_user_id 
            AND plan_id = p_plan_id
            AND status = 'active'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's active subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription(
    p_user_id UUID
) RETURNS TABLE (
    id UUID,
    plan_id TEXT,
    status TEXT,
    provider TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.plan_id,
        s.status,
        s.provider,
        s.created_at
    FROM subscriptions s
    WHERE s.user_id = p_user_id
    AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.has_active_subscription(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_subscription(UUID) TO service_role;

-- =============================================
-- TRIGGER FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_subscriptions_updated_at();

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.subscriptions IS 'Minimal subscription tracking for enrollment eligibility (DTMA Spec Jan 29)';
COMMENT ON COLUMN public.subscriptions.plan_id IS 'Plan identifier (e.g., "free", "premium", "enterprise")';
COMMENT ON COLUMN public.subscriptions.status IS 'Subscription status: active or inactive';
COMMENT ON COLUMN public.subscriptions.provider IS 'Payment provider (e.g., "stripe", "manual")';
