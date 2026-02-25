-- Migration: Add saved_courses table for bookmark/save feature
-- Allows learners to bookmark courses for later

CREATE TABLE saved_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,  -- course slug (consistent with enrollment's course_slug)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent duplicate saves
CREATE UNIQUE INDEX idx_saved_courses_user_course ON saved_courses(user_id, course_id);

-- Fast lookup of all saved courses for a user
CREATE INDEX idx_saved_courses_user ON saved_courses(user_id);
