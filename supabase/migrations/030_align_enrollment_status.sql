-- Migration: Align enrollment status terminology with DTMA Spec (Jan 29)
-- Changes: "revoked" → "cancelled", add "expired" status, add cancelled_at field

-- =============================================
-- UPDATE USER_ENROLLMENTS TABLE
-- Align status terminology and add missing fields
-- =============================================

-- Add cancelled_at timestamp field
ALTER TABLE public.user_enrollments 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ NULL;

-- Update status constraint to include new values
ALTER TABLE public.user_enrollments 
DROP CONSTRAINT IF EXISTS user_enrollments_status_check;

ALTER TABLE public.user_enrollments 
ADD CONSTRAINT user_enrollments_status_check 
CHECK (status IN ('active', 'cancelled', 'expired'));

-- Migrate existing "revoked" status to "cancelled"
UPDATE public.user_enrollments 
SET status = 'cancelled' 
WHERE status = 'revoked';

-- Set cancelled_at for existing cancelled enrollments
UPDATE public.user_enrollments 
SET cancelled_at = updated_at 
WHERE status = 'cancelled' AND cancelled_at IS NULL;

-- Create index for cancelled_at queries
CREATE INDEX IF NOT EXISTS idx_user_enrollments_cancelled_at ON user_enrollments(cancelled_at);

-- =============================================
-- UPDATE HELPER FUNCTIONS
-- Update functions to use new status terminology
-- =============================================

-- Update is_user_enrolled function to exclude cancelled and expired
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

-- Update enrollment count function
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

-- =============================================
-- ADD NEW HELPER FUNCTIONS
-- =============================================

-- Function to cancel enrollment
CREATE OR REPLACE FUNCTION public.cancel_enrollment(
    p_user_id UUID,
    p_course_slug TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_updated INTEGER;
BEGIN
    UPDATE user_enrollments 
    SET 
        status = 'cancelled',
        cancelled_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id 
    AND course_slug = p_course_slug 
    AND status = 'active';
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire enrollments (for future use)
CREATE OR REPLACE FUNCTION public.expire_enrollment(
    p_user_id UUID,
    p_course_slug TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_updated INTEGER;
BEGIN
    UPDATE user_enrollments 
    SET 
        status = 'expired',
        updated_at = NOW()
    WHERE user_id = p_user_id 
    AND course_slug = p_course_slug 
    AND status = 'active';
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to re-enroll (reactivate cancelled enrollment)
CREATE OR REPLACE FUNCTION public.reactivate_enrollment(
    p_user_id UUID,
    p_course_slug TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_updated INTEGER;
BEGIN
    UPDATE user_enrollments 
    SET 
        status = 'active',
        cancelled_at = NULL,
        updated_at = NOW()
    WHERE user_id = p_user_id 
    AND course_slug = p_course_slug 
    AND status IN ('cancelled', 'expired');
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.cancel_enrollment(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_enrollment(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_enrollment(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.reactivate_enrollment(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reactivate_enrollment(UUID, TEXT) TO service_role;

-- =============================================
-- UPDATE ENROLLMENT STATS VIEW
-- =============================================

-- Drop the old view first
DROP VIEW IF EXISTS public.enrollment_stats;

-- Recreate with updated column names
CREATE VIEW public.enrollment_stats AS
SELECT 
    course_slug,
    COUNT(*) as total_enrollments,
    COUNT(*) FILTER (WHERE status = 'active') as active_enrollments,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_enrollments,
    COUNT(*) FILTER (WHERE status = 'expired') as expired_enrollments,
    COUNT(*) FILTER (WHERE enrollment_method = 'explicit') as explicit_enrollments,
    COUNT(*) FILTER (WHERE enrollment_method = 'auto') as auto_enrollments,
    MIN(started_at) as first_enrollment,
    MAX(started_at) as latest_enrollment
FROM user_enrollments
GROUP BY course_slug;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON COLUMN public.user_enrollments.status IS 'Enrollment status: active, cancelled, or expired';
COMMENT ON COLUMN public.user_enrollments.cancelled_at IS 'Timestamp when enrollment was cancelled (NULL if not cancelled)';
COMMENT ON FUNCTION public.cancel_enrollment(UUID, TEXT) IS 'Cancel an active enrollment';
COMMENT ON FUNCTION public.expire_enrollment(UUID, TEXT) IS 'Expire an active enrollment (admin/system use)';
COMMENT ON FUNCTION public.reactivate_enrollment(UUID, TEXT) IS 'Reactivate a cancelled or expired enrollment';
