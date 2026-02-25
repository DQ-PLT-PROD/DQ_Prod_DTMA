-- Migration: Add lessons table for course content
-- Run this after the initial_schema.sql

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('intro', 'standard', 'outro', 'quiz')),
    order_index NUMERIC NOT NULL,
    estimated_duration_minutes NUMERIC DEFAULT NULL,
    video_url TEXT DEFAULT NULL,
    resource_url TEXT DEFAULT NULL,
    content TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_lessons_course FOREIGN KEY (course_slug) 
        REFERENCES public.courses(slug) ON DELETE CASCADE
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_lessons_course_slug ON public.lessons(course_slug);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons(course_slug, order_index);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read Access
-- Policy: Public Read Access
DROP POLICY IF EXISTS "Public Read Access: lessons" ON public.lessons;
CREATE POLICY "Public Read Access: lessons" ON public.lessons
FOR SELECT USING (true);
