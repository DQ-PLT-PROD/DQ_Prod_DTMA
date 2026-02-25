-- Migration: 025_update_courses_industry.sql
-- Description: Update existing courses with the correct industry (Telco 4.0 under Service 4.0)

-- Update all 5 published courses to have industry = 'telco-4-0'
-- These courses are in the 'economy-4-0' category and belong to the Services (Telco) industry
UPDATE public.courses
SET industry = 'telco-4-0'
WHERE status = 'published'
  AND is_coming_soon = false;

-- Verify the update
-- SELECT slug, title, category_id, industry FROM courses WHERE status = 'published' AND is_coming_soon = false;
