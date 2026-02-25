-- Migration: Add enriched learner profile fields to users table
-- Adds display_name, preferred_email, phone_number, country, timezone,
-- seniority_level, weekly_learning_capacity, transformation_experience

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS display_name TEXT,
    ADD COLUMN IF NOT EXISTS preferred_email TEXT,
    ADD COLUMN IF NOT EXISTS phone_number TEXT,
    ADD COLUMN IF NOT EXISTS country TEXT,
    ADD COLUMN IF NOT EXISTS timezone TEXT,
    ADD COLUMN IF NOT EXISTS seniority_level TEXT,
    ADD COLUMN IF NOT EXISTS weekly_learning_capacity TEXT,
    ADD COLUMN IF NOT EXISTS transformation_experience TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_seniority_level_check'
    ) THEN
        ALTER TABLE public.users
            ADD CONSTRAINT users_seniority_level_check
            CHECK (
                seniority_level IS NULL OR seniority_level IN (
                    'entry',
                    'mid',
                    'senior',
                    'executive'
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_weekly_learning_capacity_check'
    ) THEN
        ALTER TABLE public.users
            ADD CONSTRAINT users_weekly_learning_capacity_check
            CHECK (
                weekly_learning_capacity IS NULL OR weekly_learning_capacity IN (
                    '1-2h',
                    '3-5h',
                    '5+h'
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_transformation_experience_check'
    ) THEN
        ALTER TABLE public.users
            ADD CONSTRAINT users_transformation_experience_check
            CHECK (
                transformation_experience IS NULL OR transformation_experience IN (
                    'none',
                    'participated',
                    'led_initiatives',
                    'enterprise_wide'
                )
            );
    END IF;
END $$;
