-- Migration: Replace Quiz Content with User Provided Questions
-- Course Slug: perfecting-life-transactions (confirmed from seed)

-- 1. Ensure schema support
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS distractor_feedback JSONB DEFAULT '{}'::jsonb;

-- 2. Quiz content seeding for this course is handled in 026_seed_multiselect_content.sql
--    This migration now only ensures schema support to avoid duplicate/overwritten data.
