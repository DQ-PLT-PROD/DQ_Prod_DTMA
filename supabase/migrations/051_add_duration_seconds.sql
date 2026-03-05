-- Add duration_sec field to store exact video duration in seconds
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_sec INTEGER;

-- Add comment
COMMENT ON COLUMN lessons.duration_sec IS 'Exact video duration in seconds (e.g., 321 for 5:21)';
