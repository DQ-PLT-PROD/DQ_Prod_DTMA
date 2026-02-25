-- Migration: Add event-specific fields to media_items table
-- This migration adds columns needed for event media types

-- Add event date column (the actual date of the event, separate from published_at)
ALTER TABLE media_items
ADD COLUMN IF NOT EXISTS event_date DATE;

-- Add event time column (stores time as text for flexibility, e.g., "9:00 AM - 5:00 PM")
ALTER TABLE media_items
ADD COLUMN IF NOT EXISTS event_time TEXT;

-- Add event location column (main venue name)
ALTER TABLE media_items
ADD COLUMN IF NOT EXISTS event_location TEXT;

-- Add event location details column (additional venue info like hall, gate, etc.)
ALTER TABLE media_items
ADD COLUMN IF NOT EXISTS event_location_details TEXT;

-- Add event registration info column (pricing, eligibility, etc.)
ALTER TABLE media_items
ADD COLUMN IF NOT EXISTS event_registration_info TEXT;

-- Add event agenda column (JSON structure for event schedule)
ALTER TABLE media_items
ADD COLUMN IF NOT EXISTS event_agenda JSONB;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_media_items_event_date ON media_items(event_date) WHERE type = 'Event';
CREATE INDEX IF NOT EXISTS idx_media_items_type_event_date ON media_items(type, event_date);

-- Add comment to document the purpose
COMMENT ON COLUMN media_items.event_date IS 'The actual date when the event takes place (separate from published_at which is when the event listing was published)';
COMMENT ON COLUMN media_items.event_time IS 'Event time or time range as text (e.g., "9:00 AM - 5:00 PM")';
COMMENT ON COLUMN media_items.event_location IS 'Main event venue name';
COMMENT ON COLUMN media_items.event_location_details IS 'Additional location details (hall, gate, room, etc.)';
COMMENT ON COLUMN media_items.event_registration_info IS 'Registration details including pricing, eligibility, etc.';
COMMENT ON COLUMN media_items.event_agenda IS 'Event schedule/agenda in JSON format';
