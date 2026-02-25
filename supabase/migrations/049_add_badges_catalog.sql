-- Migration: Add Badges Catalog and Earned Badges tables

-- =============================================
-- BADGES (Catalog/Definition)
-- =============================================

CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    category TEXT,
    criteria_text TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badges_slug ON public.badges(slug);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active badges" ON public.badges
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role full access badges" ON public.badges
    FOR ALL TO service_role USING (true);

-- =============================================
-- EARNED_BADGES (User-Badge Join)
-- =============================================

CREATE TABLE IF NOT EXISTS public.earned_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    context_type TEXT, -- e.g., 'course', 'quiz', 'milestone'
    context_id TEXT,   -- e.g., course_slug or quiz_id
    share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'base64'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_earned_badges_user_id ON public.earned_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_earned_badges_badge_id ON public.earned_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_earned_badges_share_token ON public.earned_badges(share_token);

ALTER TABLE public.earned_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own earned badges" ON public.earned_badges
    FOR SELECT USING (
        user_id IN (SELECT id FROM public.users WHERE azure_user_id = auth.uid()::text)
    );

CREATE POLICY "Allow public read access to earned badges via share token" ON public.earned_badges
    FOR SELECT USING (true); -- We will filter by share_token in the query

CREATE POLICY "Service role full access earned_badges" ON public.earned_badges
    FOR ALL TO service_role USING (true);

-- =============================================
-- SEED INITIAL BADGES
-- =============================================

INSERT INTO public.badges (slug, title, description, category)
VALUES 
    ('first_quiz_completed', 'First Quiz Completed', 'Completed your first course assessment.', 'Assessment'),
    ('first_course_completed', 'First Course Completed', 'Completed your first course end-to-end.', 'Course')
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category;

-- =============================================
-- MIGRATE OLD BADGES IF ANY
-- =============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_badges') THEN
        INSERT INTO public.earned_badges (user_id, badge_id, earned_at)
        SELECT 
            ub.user_id, 
            b.id, 
            ub.awarded_at
        FROM public.user_badges ub
        JOIN public.badges b ON b.slug = ub.badge_key
        ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
END $$;

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER trigger_update_badges_updated_at
    BEFORE UPDATE ON public.badges
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_xp_updated_at(); -- Reusing existing function

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.badges IS 'Badge definitions catalog';
COMMENT ON TABLE public.earned_badges IS 'Badges earned by users';
