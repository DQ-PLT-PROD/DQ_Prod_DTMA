-- Migration: 009_add_coming_soon_column.sql
-- Description: Add is_coming_soon boolean column to courses table to distinguish 
--              active courses (with video content) from placeholder courses

-- Add the is_coming_soon column
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_coming_soon BOOLEAN DEFAULT FALSE;

-- Mark existing PLT course as NOT coming soon (it has video content)
UPDATE public.courses SET is_coming_soon = FALSE WHERE slug = 'perfecting-life-transactions';

-- Add index for filtering by coming soon status
CREATE INDEX IF NOT EXISTS idx_courses_is_coming_soon ON public.courses(is_coming_soon);
