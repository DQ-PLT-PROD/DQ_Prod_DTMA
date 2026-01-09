-- Migration: Add progress tracking tables for course enrollments and lesson completion
-- Creates user_enrollments and lesson_progress tables with proper RLS policies

-- =============================================
-- USER ENROLLMENTS TABLE
-- Tracks when users start/complete courses
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_slug TEXT NOT NULL REFERENCES courses(slug) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    progress_pct NUMERIC(5,2) DEFAULT 0.00 CHECK (progress_pct >= 0 AND progress_pct <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique enrollment per user per course
    CONSTRAINT unique_user_course_enrollment UNIQUE (user_id, course_slug)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_enrollments_user_id ON user_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_enrollments_course_slug ON user_enrollments(course_slug);
CREATE INDEX IF NOT EXISTS idx_user_enrollments_last_accessed ON user_enrollments(last_accessed_at DESC);

-- Enable RLS
ALTER TABLE public.user_enrollments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own enrollments
CREATE POLICY "Users can read own enrollments" ON public.user_enrollments
FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
);

-- Policy: Users can insert their own enrollments
CREATE POLICY "Users can create own enrollments" ON public.user_enrollments
FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
);

-- Policy: Users can update their own enrollments
CREATE POLICY "Users can update own enrollments" ON public.user_enrollments
FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
);

-- Policy: Service role can do everything
CREATE POLICY "Service role full access enrollments" ON public.user_enrollments
FOR ALL USING (auth.role() = 'service_role');

-- Add trigger for updated_at
CREATE TRIGGER update_user_enrollments_updated_at 
    BEFORE UPDATE ON user_enrollments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- LESSON PROGRESS TABLE
-- Tracks individual lesson completion within an enrollment
-- =============================================
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES user_enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    watch_time_seconds NUMERIC DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique lesson per enrollment
    CONSTRAINT unique_enrollment_lesson UNIQUE (enrollment_id, lesson_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment_id ON lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON lesson_progress(completed) WHERE completed = true;

-- Enable RLS
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read progress for their enrollments
CREATE POLICY "Users can read own lesson progress" ON public.lesson_progress
FOR SELECT USING (
    enrollment_id IN (
        SELECT id FROM user_enrollments 
        WHERE user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
    )
);

-- Policy: Users can insert progress for their enrollments
CREATE POLICY "Users can create own lesson progress" ON public.lesson_progress
FOR INSERT WITH CHECK (
    enrollment_id IN (
        SELECT id FROM user_enrollments 
        WHERE user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
    )
);

-- Policy: Users can update progress for their enrollments
CREATE POLICY "Users can update own lesson progress" ON public.lesson_progress
FOR UPDATE USING (
    enrollment_id IN (
        SELECT id FROM user_enrollments 
        WHERE user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
    )
);

-- Policy: Service role can do everything
CREATE POLICY "Service role full access lesson progress" ON public.lesson_progress
FOR ALL USING (auth.role() = 'service_role');

-- Add trigger for updated_at
CREATE TRIGGER update_lesson_progress_updated_at 
    BEFORE UPDATE ON lesson_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
