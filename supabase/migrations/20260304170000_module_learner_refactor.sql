-- Migration: Promote modules to first-class learner entities.
-- Courses remain browse containers; learner state is tracked at module level.

ALTER TABLE public.modules
ADD COLUMN IF NOT EXISTS slug TEXT;

WITH prepared AS (
    SELECT
        m.id,
        lower(
            trim(
                both '-' FROM regexp_replace(
                    regexp_replace(coalesce(m.course_slug, '') || '-' || coalesce(m.title, ''), '[^a-zA-Z0-9]+', '-', 'g'),
                    '-+',
                    '-',
                    'g'
                )
            )
        ) AS base_slug
    FROM public.modules m
),
deduped AS (
    SELECT
        p.id,
        p.base_slug,
        row_number() OVER (PARTITION BY p.base_slug ORDER BY p.id) AS duplicate_rank
    FROM prepared p
)
UPDATE public.modules m
SET slug = CASE
    WHEN d.duplicate_rank = 1 THEN d.base_slug
    ELSE d.base_slug || '-' || d.duplicate_rank
END
FROM deduped d
WHERE m.id = d.id
  AND (m.slug IS NULL OR btrim(m.slug) = '');

ALTER TABLE public.modules
ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_modules_slug_unique
ON public.modules(slug);

CREATE INDEX IF NOT EXISTS idx_modules_status_course_slug
ON public.modules(status, course_slug, order_index);

COMMENT ON COLUMN public.modules.slug IS 'Stable learner-facing slug for module details, enrollment, saved state, and progress.';

CREATE TABLE IF NOT EXISTS public.module_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    progress_pct NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    enrollment_method TEXT NOT NULL DEFAULT 'auto' CHECK (enrollment_method IN ('explicit', 'auto', 'admin')),
    cancelled_at TIMESTAMPTZ,
    UNIQUE (user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_module_enrollments_user_id
ON public.module_enrollments(user_id);

CREATE INDEX IF NOT EXISTS idx_module_enrollments_module_id
ON public.module_enrollments(module_id);

CREATE INDEX IF NOT EXISTS idx_module_enrollments_status
ON public.module_enrollments(status);

COMMENT ON TABLE public.module_enrollments IS 'Learner enrollment/progress container for standalone modules.';

CREATE TABLE IF NOT EXISTS public.module_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES public.module_enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    watch_time_seconds NUMERIC DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (enrollment_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_module_lesson_progress_enrollment_id
ON public.module_lesson_progress(enrollment_id);

CREATE INDEX IF NOT EXISTS idx_module_lesson_progress_lesson_id
ON public.module_lesson_progress(lesson_id);

COMMENT ON TABLE public.module_lesson_progress IS 'Lesson progress scoped to standalone module enrollments.';

CREATE TABLE IF NOT EXISTS public.saved_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_modules_user_id
ON public.saved_modules(user_id);

CREATE INDEX IF NOT EXISTS idx_saved_modules_module_id
ON public.saved_modules(module_id);

COMMENT ON TABLE public.saved_modules IS 'Learner bookmarks for standalone modules.';

CREATE TABLE IF NOT EXISTS public.module_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    score_pct NUMERIC(5,2) DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_module_quiz_attempts_user_id
ON public.module_quiz_attempts(user_id);

CREATE INDEX IF NOT EXISTS idx_module_quiz_attempts_module_id
ON public.module_quiz_attempts(module_id);

COMMENT ON TABLE public.module_quiz_attempts IS 'Quiz completion analytics scoped to standalone modules.';
