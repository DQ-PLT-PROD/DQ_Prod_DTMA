-- Migration: Add hierarchy binding (module_id, lesson_id) to quizzes table
-- This enables quizzes to be attached to specific modules and lessons,
-- not just at the course level via course_slug.

-- 1. Add module_id FK to quizzes
ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES modules(id) ON DELETE SET NULL;

-- 2. Add lesson_id FK to quizzes
ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL;

-- 3. Add updated_at if it doesn't exist (needed for upsert tracking)
ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 4. Add hide_answers setting for post-submission display control
ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS hide_answers BOOLEAN DEFAULT false;

-- 5. Create indexes for hierarchy lookups
CREATE INDEX IF NOT EXISTS idx_quizzes_module_id ON quizzes(module_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);
