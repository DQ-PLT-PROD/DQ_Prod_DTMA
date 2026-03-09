-- Migration: Populate lesson durations with realistic values
-- This fixes B6 & B7 by adding estimated_duration_minutes to lessons

-- Update lessons with realistic durations based on lesson type
UPDATE lessons
SET estimated_duration_minutes = CASE
  -- Intro lessons: 5-10 minutes
  WHEN type = 'intro' THEN 5
  
  -- Outro lessons: 5-10 minutes
  WHEN type = 'outro' THEN 5
  
  -- Quiz lessons: 10-15 minutes
  WHEN type = 'quiz' THEN 10
  
  -- Standard lessons: 20-45 minutes (varies by content)
  WHEN type = 'standard' THEN 
    CASE 
      -- Shorter lessons (based on order_index pattern)
      WHEN order_index % 3 = 0 THEN 25
      WHEN order_index % 3 = 1 THEN 35
      ELSE 30
    END
  
  -- Default fallback
  ELSE 20
END
WHERE estimated_duration_minutes = 0 OR estimated_duration_minutes IS NULL;

-- Verify the update
SELECT 
  course_slug,
  COUNT(*) as total_lessons,
  SUM(estimated_duration_minutes) as total_duration_minutes,
  ROUND(SUM(estimated_duration_minutes) / 60.0, 1) as total_duration_hours
FROM lessons
GROUP BY course_slug
ORDER BY course_slug;
