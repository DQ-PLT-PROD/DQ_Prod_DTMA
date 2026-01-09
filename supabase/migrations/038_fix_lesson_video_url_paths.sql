-- Migration: Fix lesson video URL paths (case sensitivity issue)
-- Issue: DB has '/lessons/' (lowercase) but Supabase Storage has '/Lessons/' (capital L)

-- Fix the lessons folder path casing
UPDATE public.lessons 
SET video_url = REPLACE(video_url, '/lessons/', '/Lessons/')
WHERE course_slug = 'perfecting-life-transactions' 
AND video_url LIKE '%/lessons/%';

-- Verification query:
-- SELECT title, video_url FROM public.lessons WHERE course_slug = 'perfecting-life-transactions' ORDER BY order_index;
