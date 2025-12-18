-- Migration: Cleanup schema and add thumbnail to courses
-- Run this after 005_seed_plt_course.sql

-- Drop unused media tables
DROP TABLE IF EXISTS public.media_assets;
DROP TABLE IF EXISTS public.media_items;

-- Add thumbnail_url to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT NULL;
