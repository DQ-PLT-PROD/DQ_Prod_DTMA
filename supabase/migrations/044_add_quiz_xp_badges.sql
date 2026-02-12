-- Migration: Add quiz attempts, XP totals, and badges (MVP)

-- =============================================
-- QUIZ ATTEMPTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    course_slug TEXT NOT NULL REFERENCES public.courses(slug) ON DELETE CASCADE,
    score_pct NUMERIC(5,2) DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, course_slug)
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course_slug ON public.quiz_attempts(course_slug);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access quiz_attempts" ON public.quiz_attempts
FOR ALL TO service_role USING (true);

CREATE POLICY "Users can read own quiz attempts" ON public.quiz_attempts
FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
);

-- =============================================
-- USER XP TOTALS
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_xp (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    total_xp INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_xp_total ON public.user_xp(total_xp DESC);

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access user_xp" ON public.user_xp
FOR ALL TO service_role USING (true);

CREATE POLICY "Users can read own xp" ON public.user_xp
FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
);

-- =============================================
-- USER BADGES
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_key TEXT NOT NULL,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, badge_key)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access user_badges" ON public.user_badges
FOR ALL TO service_role USING (true);

CREATE POLICY "Users can read own badges" ON public.user_badges
FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION public.update_user_xp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_xp_updated_at
    BEFORE UPDATE ON public.user_xp
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_xp_updated_at();

CREATE OR REPLACE FUNCTION public.update_quiz_attempts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quiz_attempts_updated_at
    BEFORE UPDATE ON public.quiz_attempts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_quiz_attempts_updated_at();

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.quiz_attempts IS 'Quiz completion analytics (MVP)';
COMMENT ON TABLE public.user_xp IS 'User XP totals (MVP)';
COMMENT ON TABLE public.user_badges IS 'User badges awarded (MVP)';
