-- Keep courses.lesson_count synchronized with lessons, using the canonical
-- learner-facing rule: count every lesson except intro/outro.

CREATE OR REPLACE FUNCTION public.recompute_course_lesson_count(p_course_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_count NUMERIC;
BEGIN
    IF p_course_slug IS NULL OR btrim(p_course_slug) = '' THEN
        RETURN;
    END IF;

    SELECT COUNT(*)::NUMERIC
    INTO v_count
    FROM public.lessons
    WHERE course_slug = p_course_slug
      AND type NOT IN ('intro', 'outro');

    UPDATE public.courses
    SET lesson_count = COALESCE(v_count, 0),
        updated_at = NOW()
    WHERE slug = p_course_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_course_lesson_count_from_lessons()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.recompute_course_lesson_count(OLD.course_slug);
        RETURN OLD;
    END IF;

    IF TG_OP = 'INSERT' THEN
        PERFORM public.recompute_course_lesson_count(NEW.course_slug);
        RETURN NEW;
    END IF;

    -- UPDATE
    PERFORM public.recompute_course_lesson_count(OLD.course_slug);

    IF NEW.course_slug IS DISTINCT FROM OLD.course_slug THEN
        PERFORM public.recompute_course_lesson_count(NEW.course_slug);
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_course_lesson_count_from_lessons ON public.lessons;

CREATE TRIGGER trg_sync_course_lesson_count_from_lessons
AFTER INSERT OR UPDATE OF course_slug, type OR DELETE
ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.sync_course_lesson_count_from_lessons();

-- Backfill all existing courses.
UPDATE public.courses c
SET lesson_count = COALESCE(src.lesson_count, 0),
    updated_at = NOW()
FROM (
    SELECT c2.slug,
           COUNT(l.id) FILTER (WHERE l.type NOT IN ('intro', 'outro'))::NUMERIC AS lesson_count
    FROM public.courses c2
    LEFT JOIN public.lessons l ON l.course_slug = c2.slug
    GROUP BY c2.slug
) src
WHERE c.slug = src.slug
  AND c.lesson_count IS DISTINCT FROM src.lesson_count;
