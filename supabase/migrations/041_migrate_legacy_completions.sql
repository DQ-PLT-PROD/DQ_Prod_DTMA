-- Migration: Migrate legacy user course completions to user_enrollments
-- Source table: learner_course_completion (legacy)
-- Target table: user_enrollments (current)

-- 1. Insert completion records into user_enrollments
-- We map 'course_id' from legacy to 'course_slug' in new table
-- We assume 100% progress since it's a completion record
INSERT INTO public.user_enrollments (
    user_id,
    course_slug,
    started_at,
    completed_at,
    last_accessed_at,
    progress_pct,
    enrollment_method
)
SELECT 
    lcc.user_id,
    lcc.course_id,               -- maps to course_slug
    lcc.completed_at,            -- started_at (fallback to completed time)
    lcc.completed_at,            -- completed_at
    lcc.completed_at,            -- last_accessed_at
    100.00,                      -- progress_pct
    'auto'                       -- enrollment_method (valid check constraint value)
FROM 
    public.learner_course_completion lcc
WHERE 
    NOT EXISTS (
        SELECT 1 
        FROM public.user_enrollments ue 
        WHERE ue.user_id = lcc.user_id 
          AND ue.course_slug = lcc.course_id
    );

-- 2. Log result
DO $$
DECLARE
    migrated_count INT;
BEGIN
    SELECT COUNT(*) INTO migrated_count FROM public.user_enrollments WHERE enrollment_method = 'auto';
    RAISE NOTICE 'Migrated legacy course completions. Total auto enrollments: %', migrated_count;
END $$;
