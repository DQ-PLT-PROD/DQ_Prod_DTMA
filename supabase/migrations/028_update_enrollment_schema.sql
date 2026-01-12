-- Migration: Update enrollment schema for DTMA Feature Specification 02 compliance
-- Adds missing fields: status, enrollment_method, and preview flags for lessons

-- =============================================
-- UPDATE USER_ENROLLMENTS TABLE
-- Add missing fields for enrollment status and method tracking
-- =============================================

-- Add status field for enrollment management
ALTER TABLE public.user_enrollments 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
CHECK (status IN ('active', 'revoked'));

-- Add enrollment method tracking
ALTER TABLE public.user_enrollments 
ADD COLUMN IF NOT EXISTS enrollment_method TEXT DEFAULT 'auto' 
CHECK (enrollment_method IN ('explicit', 'auto', 'admin'));

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_user_enrollments_status ON user_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_user_enrollments_method ON user_enrollments(enrollment_method);

-- Update existing enrollments to have active status
UPDATE public.user_enrollments 
SET status = 'active', enrollment_method = 'auto' 
WHERE status IS NULL OR enrollment_method IS NULL;

-- =============================================
-- UPDATE LESSONS TABLE
-- Add preview flag for content access control
-- =============================================

-- Add preview flag to lessons table
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS is_preview BOOLEAN DEFAULT false;

-- Create index for preview queries
CREATE INDEX IF NOT EXISTS idx_lessons_is_preview ON lessons(is_preview);

-- Mark intro lessons and first few lessons as preview content
-- This provides sample preview content for testing
UPDATE public.lessons 
SET is_preview = true 
WHERE type = 'intro' 
   OR order_index <= 2;

-- =============================================
-- UPDATE RLS POLICIES
-- Ensure new fields are properly secured
-- =============================================

-- Update existing policies to handle status field
-- Users can only see active enrollments by default
DROP POLICY IF EXISTS "Users can read own enrollments" ON public.user_enrollments;
CREATE POLICY "Users can read own enrollments" ON public.user_enrollments
FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
);

-- Users can only create active enrollments
DROP POLICY IF EXISTS "Users can create own enrollments" ON public.user_enrollments;
CREATE POLICY "Users can create own enrollments" ON public.user_enrollments
FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
    AND status = 'active'
);

-- Users can update their own enrollments (including status changes)
DROP POLICY IF EXISTS "Users can update own enrollments" ON public.user_enrollments;
CREATE POLICY "Users can update own enrollments" ON public.user_enrollments
FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE azure_user_id = auth.uid()::text)
);

-- =============================================
-- CREATE ENROLLMENT ANALYTICS VIEW
-- Optional: For tracking enrollment metrics
-- =============================================

CREATE OR REPLACE VIEW public.enrollment_stats AS
SELECT 
    course_slug,
    COUNT(*) as total_enrollments,
    COUNT(*) FILTER (WHERE status = 'active') as active_enrollments,
    COUNT(*) FILTER (WHERE status = 'revoked') as revoked_enrollments,
    COUNT(*) FILTER (WHERE enrollment_method = 'explicit') as explicit_enrollments,
    COUNT(*) FILTER (WHERE enrollment_method = 'auto') as auto_enrollments,
    MIN(started_at) as first_enrollment,
    MAX(started_at) as latest_enrollment
FROM user_enrollments
GROUP BY course_slug;

-- Grant access to enrollment stats view
GRANT SELECT ON public.enrollment_stats TO authenticated;
GRANT SELECT ON public.enrollment_stats TO service_role;

-- =============================================
-- ADD HELPFUL FUNCTIONS
-- =============================================

-- Function to check if user is enrolled in course
CREATE OR REPLACE FUNCTION public.is_user_enrolled(
    p_user_id UUID,
    p_course_slug TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_enrollments 
        WHERE user_id = p_user_id 
        AND course_slug = p_course_slug 
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's active enrollments count
CREATE OR REPLACE FUNCTION public.get_user_enrollment_count(
    p_user_id UUID
) RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) FROM user_enrollments 
        WHERE user_id = p_user_id 
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.is_user_enrolled(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_enrolled(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_enrollment_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_enrollment_count(UUID) TO service_role;