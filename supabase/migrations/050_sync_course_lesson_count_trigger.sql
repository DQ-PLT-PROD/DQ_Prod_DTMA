-- Keep courses.lesson_count synchronized with canonical lesson counting rules.
-- Canonical lesson count: standard lessons only (excludes intro/outro/quiz).

CREATE OR REPLACE FUNCTION public.recalculate_course_lesson_count(p_course_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.courses c
    SET lesson_count = COALESCE((
        SELECT COUNT(*)::NUMERIC
        FROM public.lessons l
        WHERE l.course_slug = p_course_slug
          AND l.type = 'standard'
    ), 0)
    WHERE c.slug = p_course_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_course_lesson_count_from_lessons()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.recalculate_course_lesson_count(OLD.course_slug);
        RETURN OLD;
    END IF;

    PERFORM public.recalculate_course_lesson_count(NEW.course_slug);

    IF TG_OP = 'UPDATE' AND OLD.course_slug IS DISTINCT FROM NEW.course_slug THEN
        PERFORM public.recalculate_course_lesson_count(OLD.course_slug);
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_course_lesson_count_from_lessons ON public.lessons;

CREATE TRIGGER trigger_sync_course_lesson_count_from_lessons
AFTER INSERT OR UPDATE OF course_slug, type OR DELETE
ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.sync_course_lesson_count_from_lessons();

-- Backfill to the canonical count for all existing courses.
UPDATE public.courses c
SET lesson_count = COALESCE(stats.lesson_count, 0)
FROM (
    SELECT
        c2.slug AS course_slug,
        COUNT(l.*) FILTER (WHERE l.type = 'standard')::NUMERIC AS lesson_count
    FROM public.courses c2
    LEFT JOIN public.lessons l ON l.course_slug = c2.slug
    GROUP BY c2.slug
) stats
WHERE c.slug = stats.course_slug;
