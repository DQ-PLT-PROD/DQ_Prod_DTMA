-- Migration: Add learner lesson progress tracking table

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.learner_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    progress_percent NUMERIC NULL,
    last_position_seconds NUMERIC NULL,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT learner_lesson_progress_status_check
      CHECK (status IN ('not_started', 'in_progress', 'completed')),
    CONSTRAINT learner_lesson_progress_unique
      UNIQUE (user_id, course_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_learner_lesson_progress_user_course
    ON public.learner_lesson_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_learner_lesson_progress_user_course_last_accessed
    ON public.learner_lesson_progress(user_id, course_id, last_accessed_at DESC);

ALTER TABLE public.learner_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own lesson progress"
    ON public.learner_lesson_progress
    FOR SELECT
    USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own lesson progress"
    ON public.learner_lesson_progress
    FOR INSERT
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own lesson progress"
    ON public.learner_lesson_progress
    FOR UPDATE
    USING (user_id = auth.uid()::text);

CREATE POLICY "Service role full access learner lesson progress"
    ON public.learner_lesson_progress
    FOR ALL
    USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_learner_lesson_progress_updated_at
    ON public.learner_lesson_progress;

CREATE TRIGGER update_learner_lesson_progress_updated_at
    BEFORE UPDATE ON public.learner_lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
