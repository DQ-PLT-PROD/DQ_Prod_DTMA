-- Migration: Add learner onboarding/profile fields to users table
-- Adds role_track, goals, preferences, onboarding_completed, onboarding_completed_at
-- NOTE: No auth.uid()-based RLS policies are added here. If client updates are blocked by RLS,
--       use a backend proxy or add a TEMP MVP policy with TODO to replace.

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS role_track TEXT,
    ADD COLUMN IF NOT EXISTS goals JSONB,
    ADD COLUMN IF NOT EXISTS preferences JSONB,
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_role_track_check'
    ) THEN
        ALTER TABLE public.users
            ADD CONSTRAINT users_role_track_check
            CHECK (role_track IS NULL OR role_track IN ('digital_worker', 'leader'));
    END IF;
END $$;
