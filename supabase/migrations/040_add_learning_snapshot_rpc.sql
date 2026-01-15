-- Migration: Add learning snapshot RPC

CREATE OR REPLACE FUNCTION public.get_learning_snapshot(
    p_course_slug TEXT,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    course_row JSONB;
    lessons_rows JSONB;
    resources_rows JSONB;
    enrollment_row JSONB;
    progress_rows JSONB;
    resume_lesson_id TEXT;
    enrollment_id UUID;
BEGIN
    SELECT to_jsonb(c)
    INTO course_row
    FROM public.courses c
    WHERE c.slug = p_course_slug
    LIMIT 1;

    SELECT COALESCE(jsonb_agg(to_jsonb(l) ORDER BY l.order_index), '[]'::jsonb)
    INTO lessons_rows
    FROM public.lessons l
    WHERE l.course_slug = p_course_slug;

    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.order_index), '[]'::jsonb)
    INTO resources_rows
    FROM public.course_resources r
    WHERE r.course_slug = p_course_slug;

    progress_rows := '[]'::jsonb;
    enrollment_row := NULL;
    resume_lesson_id := NULL;

    IF p_user_id IS NOT NULL THEN
        SELECT e.id, to_jsonb(e)
        INTO enrollment_id, enrollment_row
        FROM public.user_enrollments e
        WHERE e.user_id = p_user_id
          AND e.course_slug = p_course_slug
        LIMIT 1;

        IF enrollment_id IS NOT NULL THEN
            SELECT COALESCE(jsonb_agg(to_jsonb(lp) ORDER BY lp.updated_at DESC), '[]'::jsonb)
            INTO progress_rows
            FROM public.lesson_progress lp
            WHERE lp.enrollment_id = enrollment_id;

            SELECT lp.lesson_id::text
            INTO resume_lesson_id
            FROM public.lesson_progress lp
            WHERE lp.enrollment_id = enrollment_id
            ORDER BY lp.updated_at DESC NULLS LAST
            LIMIT 1;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'course', course_row,
        'lessons', lessons_rows,
        'resources', resources_rows,
        'enrollment', enrollment_row,
        'progress', progress_rows,
        'resumeLessonId', resume_lesson_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_learning_snapshot(TEXT, UUID) TO anon, authenticated;
