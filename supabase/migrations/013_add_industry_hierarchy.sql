-- Migration: 013_add_industry_hierarchy.sql
-- Description: Add parent/child nesting to industries via parent_slug

ALTER TABLE public.industries
ADD COLUMN IF NOT EXISTS parent_slug TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'industries_parent_slug_fkey'
          AND conrelid = 'public.industries'::regclass
    ) THEN
        ALTER TABLE public.industries
        ADD CONSTRAINT industries_parent_slug_fkey
        FOREIGN KEY (parent_slug)
        REFERENCES public.industries (slug)
        ON UPDATE CASCADE
        ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'industries_parent_slug_not_self'
          AND conrelid = 'public.industries'::regclass
    ) THEN
        ALTER TABLE public.industries
        ADD CONSTRAINT industries_parent_slug_not_self
        CHECK (parent_slug IS NULL OR parent_slug <> slug);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_industries_parent_slug
    ON public.industries(parent_slug);

