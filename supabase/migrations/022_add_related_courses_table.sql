-- Migration: 022_add_related_courses_table.sql
-- Description: Create a table for managing related course relationships
-- This allows explicit control over which courses are shown as related to each other

-- ============================================
-- Create the related_courses table
-- ============================================

CREATE TABLE IF NOT EXISTS public.related_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_slug TEXT NOT NULL,
    related_course_slug TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure no duplicate relationships
    CONSTRAINT unique_course_relationship UNIQUE (course_slug, related_course_slug),
    
    -- Prevent self-references
    CONSTRAINT no_self_reference CHECK (course_slug != related_course_slug),
    
    -- Foreign key constraints to ensure valid course slugs
    CONSTRAINT fk_course FOREIGN KEY (course_slug) 
        REFERENCES public.courses(slug) ON DELETE CASCADE,
    CONSTRAINT fk_related_course FOREIGN KEY (related_course_slug) 
        REFERENCES public.courses(slug) ON DELETE CASCADE
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_related_courses_course_slug ON public.related_courses(course_slug);
CREATE INDEX IF NOT EXISTS idx_related_courses_display_order ON public.related_courses(course_slug, display_order);

-- Enable RLS
ALTER TABLE public.related_courses ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read Access
CREATE POLICY "Public Read Access: related_courses" ON public.related_courses
FOR SELECT USING (true);
