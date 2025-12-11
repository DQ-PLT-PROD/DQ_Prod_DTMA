-- Migration: Add course_resources table for downloadable assets
-- Run this after 003_add_quizzes_table.sql

-- Create course_resources table
CREATE TABLE IF NOT EXISTS public.course_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('whitepaper', 'pdf', 'template', 'tool', 'worksheet', 'other')),
    description TEXT DEFAULT NULL,
    resource_url TEXT NOT NULL,
    file_size_bytes NUMERIC DEFAULT NULL,
    order_index NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_resources_course FOREIGN KEY (course_slug) 
        REFERENCES public.courses(slug) ON DELETE CASCADE
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_resources_course_slug ON public.course_resources(course_slug);

-- Enable RLS
ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read Access
CREATE POLICY "Public Read Access: course_resources" ON public.course_resources
FOR SELECT USING (true);
