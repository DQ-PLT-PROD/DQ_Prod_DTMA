-- Migration: Add modules table for course organization
-- Feature 02 - Optimized Enrollment Gating with Module Support
-- Created: February 9, 2026

-- =============================================
-- CREATE MODULES TABLE
-- Modules group lessons and can have intro content
-- accessible to all users (enrolled or not)
-- =============================================

CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index NUMERIC NOT NULL,
    intro_content TEXT, -- Markdown/HTML intro content (public)
    intro_video_url TEXT, -- Intro video URL (public)
    intro_poster_url TEXT, -- Video poster image
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_modules_course FOREIGN KEY (course_slug) 
        REFERENCES public.courses(slug) ON DELETE CASCADE,
    CONSTRAINT unique_module_order UNIQUE (course_slug, order_index)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_modules_course_slug ON public.modules(course_slug);
CREATE INDEX IF NOT EXISTS idx_modules_order ON public.modules(course_slug, order_index);

-- Enable RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read Access (modules and intros are public metadata)
DROP POLICY IF EXISTS "Public Read Access: modules" ON public.modules;
CREATE POLICY "Public Read Access: modules" ON public.modules
FOR SELECT USING (true);

-- =============================================
-- UPDATE LESSONS TABLE
-- Add module_id to associate lessons with modules
-- =============================================

-- Add module_id column to lessons (nullable for backward compatibility)
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL;

-- Create index for module queries
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);

-- =============================================
-- HELPER FUNCTION: Update timestamps
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for modules table
DROP TRIGGER IF EXISTS update_modules_updated_at ON public.modules;
CREATE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON public.modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.modules IS 'Course modules/sections that group related lessons. Module intros are accessible to all users.';
COMMENT ON COLUMN public.modules.intro_content IS 'Public intro content (markdown/HTML) accessible without enrollment';
COMMENT ON COLUMN public.modules.intro_video_url IS 'Public intro video URL accessible without enrollment';
COMMENT ON COLUMN public.lessons.module_id IS 'Optional module association. NULL for flat course structure.';
