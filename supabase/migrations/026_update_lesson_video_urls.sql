-- Migration: 026_update_lesson_video_urls.sql
-- Purpose: Update lesson video URLs to use local fallback videos
-- since Supabase storage videos are not yet uploaded.
-- 
-- NOTE: This is a TEMPORARY fix. Once videos are uploaded to Supabase storage,
-- run a new migration to update these URLs to the correct Supabase storage paths.

-- For now, use the single available local video as a placeholder for all lessons
-- This ensures the learning page doesn't break while videos are being prepared

UPDATE public.lessons 
SET video_url = '/videos/C2-INTRO.mp4'
WHERE course_slug = 'perfecting-life-transactions';

-- When you have the actual videos uploaded to Supabase, run something like:
-- UPDATE public.lessons SET video_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/intro/Intro_V2.mp4' WHERE course_slug = 'perfecting-life-transactions' AND order_index = 0;
-- UPDATE public.lessons SET video_url = 'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_1.mp4' WHERE course_slug = 'perfecting-life-transactions' AND order_index = 1;
-- etc.
