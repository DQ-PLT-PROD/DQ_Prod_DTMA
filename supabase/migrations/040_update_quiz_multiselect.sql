-- Migration: Update Quiz to Support Multi-Select Answers
-- 1. Alter correct_answer column to be JSONB
--    We convert existing text values (e.g. 'a') into a JSON array (e.g. ['a'])

ALTER TABLE public.quizzes
ALTER COLUMN correct_answer TYPE JSONB
USING (
  CASE
    WHEN correct_answer IS NULL OR btrim(correct_answer) = '' THEN '[]'::jsonb
    WHEN correct_answer ~ '^[[:space:]]*\\[' THEN correct_answer::jsonb
    ELSE jsonb_build_array(correct_answer)
  END
);

-- 2. (Optional) Set a default empty array if needed, but existing data is now migrated.
ALTER TABLE public.quizzes 
ALTER COLUMN correct_answer SET DEFAULT '[]'::jsonb;
