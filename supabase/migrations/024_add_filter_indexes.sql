-- Migration: 024_add_filter_indexes.sql
-- Description: Add database indexes to optimize server-side filtering on the courses table
-- These indexes improve query performance for the /courses catalog filtering

-- Index for category filtering (most common filter)
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON public.courses(category_id);

-- Index for audience level filtering (Digital Leaders / Digital Workers)
CREATE INDEX IF NOT EXISTS idx_courses_audience_level ON public.courses(audience_level);

-- Index for level tag filtering (Beginner / Intermediate / Advanced)
CREATE INDEX IF NOT EXISTS idx_courses_level_tag ON public.courses(level_tag);

-- Index for industry filtering
CREATE INDEX IF NOT EXISTS idx_courses_industry ON public.courses(industry);

-- Index for status filtering (required for published filter)
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);

-- Index for coming soon ordering
CREATE INDEX IF NOT EXISTS idx_courses_is_coming_soon ON public.courses(is_coming_soon);

-- GIN index for topic_tags array overlap queries
-- This enables efficient filtering when checking if any selected topic matches course tags
CREATE INDEX IF NOT EXISTS idx_courses_topic_tags ON public.courses USING GIN(topic_tags);

-- Composite index for common filter combinations (status + is_coming_soon for ordering)
CREATE INDEX IF NOT EXISTS idx_courses_status_coming_soon ON public.courses(status, is_coming_soon, created_at DESC);

-- Full-text search index for title and description (optional, for advanced search)
-- Uncomment if you want better text search performance:
-- CREATE INDEX IF NOT EXISTS idx_courses_search ON public.courses USING GIN(
--     to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(short_description, ''))
-- );

COMMENT ON INDEX idx_courses_category_id IS 'Optimizes category filter in course catalog';
COMMENT ON INDEX idx_courses_audience_level IS 'Optimizes role/audience filter in course catalog';
COMMENT ON INDEX idx_courses_level_tag IS 'Optimizes level filter in course catalog';
COMMENT ON INDEX idx_courses_industry IS 'Optimizes industry filter in course catalog';
COMMENT ON INDEX idx_courses_topic_tags IS 'Optimizes topic filter using array overlap in course catalog';
