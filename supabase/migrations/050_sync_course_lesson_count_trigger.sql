-- Migration: 050_sync_course_lesson_count_trigger
-- Purpose: Keep courses.lesson_count in sync with the actual count of
--          "standard" lessons. Intro, outro, and quiz lesson types are excluded.
--          Also updates estimated_duration_minutes to sum only standard lessons.

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION sync_course_lesson_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_course_slug text;
BEGIN
  -- Determine which course was affected
  IF TG_OP = 'DELETE' THEN
    v_course_slug := OLD.course_slug;
  ELSE
    v_course_slug := NEW.course_slug;
  END IF;

  -- Also handle the case where course_slug changed on UPDATE
  IF TG_OP = 'UPDATE' AND OLD.course_slug IS DISTINCT FROM NEW.course_slug THEN
    -- Update the OLD course first
    UPDATE courses
    SET lesson_count = (
          SELECT count(*) FROM lessons
          WHERE course_slug = OLD.course_slug AND type = 'standard'
        ),
        estimated_duration_minutes = (
          SELECT coalesce(sum(estimated_duration_minutes), 0) FROM lessons
          WHERE course_slug = OLD.course_slug AND type = 'standard'
        )
    WHERE slug = OLD.course_slug;
  END IF;

  -- Update the affected course
  UPDATE courses
  SET lesson_count = (
        SELECT count(*) FROM lessons
        WHERE course_slug = v_course_slug AND type = 'standard'
      ),
      estimated_duration_minutes = (
        SELECT coalesce(sum(estimated_duration_minutes), 0) FROM lessons
        WHERE course_slug = v_course_slug AND type = 'standard'
      )
  WHERE slug = v_course_slug;

  RETURN NULL; -- AFTER trigger, return value is ignored
END;
$$;

-- 2. Create the trigger (drop first if it already exists)
DROP TRIGGER IF EXISTS trg_sync_course_lesson_stats ON lessons;

CREATE TRIGGER trg_sync_course_lesson_stats
AFTER INSERT OR UPDATE OR DELETE ON lessons
FOR EACH ROW
EXECUTE FUNCTION sync_course_lesson_stats();

-- 3. Backfill: update all existing courses to reflect standard-only counts
UPDATE courses c
SET lesson_count = sub.cnt,
    estimated_duration_minutes = sub.dur
FROM (
  SELECT
    course_slug,
    count(*) FILTER (WHERE type = 'standard') AS cnt,
    coalesce(sum(estimated_duration_minutes) FILTER (WHERE type = 'standard'), 0) AS dur
  FROM lessons
  GROUP BY course_slug
) sub
WHERE c.slug = sub.course_slug;
