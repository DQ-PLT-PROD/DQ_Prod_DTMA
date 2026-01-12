-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 
-- Table: public.media_items
--
CREATE TABLE IF NOT EXISTS public.media_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    body_html TEXT DEFAULT NULL,
    body_json JSONB DEFAULT NULL,
    type TEXT NOT NULL,
    category TEXT DEFAULT NULL,
    status TEXT NOT NULL,
    visibility TEXT NOT NULL,
    language TEXT NOT NULL,
    published_at TIMESTAMPTZ DEFAULT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    seo_title TEXT DEFAULT NULL,
    seo_description TEXT DEFAULT NULL,
    canonical_url TEXT DEFAULT NULL,
    tags TEXT[] DEFAULT NULL,
    thumbnail_url TEXT DEFAULT NULL,
    video_url TEXT DEFAULT NULL,
    podcast_url TEXT DEFAULT NULL,
    document_url TEXT DEFAULT NULL,
    duration_sec NUMERIC DEFAULT NULL,
    file_size_bytes NUMERIC DEFAULT NULL,
    event_date TEXT DEFAULT NULL,
    event_time TEXT DEFAULT NULL,
    event_location TEXT DEFAULT NULL,
    event_location_details TEXT DEFAULT NULL,
    event_registration_info TEXT DEFAULT NULL,
    event_agenda JSONB DEFAULT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_media_items_slug ON media_items(slug);
CREATE INDEX IF NOT EXISTS idx_media_items_type ON media_items(type);
CREATE INDEX IF NOT EXISTS idx_media_items_status ON media_items(status);

--
-- Table: public.courses
--
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    short_description TEXT DEFAULT NULL,
    long_description TEXT DEFAULT NULL,
    category_id TEXT DEFAULT NULL,
    audience_level TEXT DEFAULT NULL,
    topic_tags TEXT[] DEFAULT NULL,
    level_tag TEXT DEFAULT NULL,
    estimated_duration_minutes NUMERIC DEFAULT NULL,
    lesson_count NUMERIC DEFAULT NULL,
    hero_image_url TEXT DEFAULT NULL,
    intro_video_url TEXT DEFAULT NULL,
    intro_video_poster_url TEXT DEFAULT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'draft',
    provider_name TEXT DEFAULT NULL,
    provider_logo_url TEXT DEFAULT NULL,
    provider_description TEXT DEFAULT NULL,
    rating NUMERIC DEFAULT NULL,
    review_count NUMERIC DEFAULT NULL,
    delivery_mode TEXT DEFAULT NULL,
    enrollment_url TEXT DEFAULT NULL,
    learning_outcomes TEXT[] DEFAULT NULL,
    skills_gained TEXT[] DEFAULT NULL,
    upon_completion TEXT DEFAULT NULL,
    start_date TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for courses
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

--
-- Table: public.media_assets
--
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_id UUID NOT NULL,
    kind TEXT DEFAULT NULL, -- 'Image' | 'Video' | 'Audio' | 'Doc'
    public_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime TEXT DEFAULT NULL,
    size_bytes NUMERIC DEFAULT NULL,
    duration_sec NUMERIC DEFAULT NULL,
    checksum TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key for media_assets -> media_items (optional, strict referential integrity)
ALTER TABLE public.media_assets 
ADD CONSTRAINT fk_media_assets_media_item 
FOREIGN KEY (media_id) 
REFERENCES public.media_items(id)
ON DELETE CASCADE;

--
-- Row Level Security (RLS) Policies
-- These policies allow public read access but restrict write access.
--

-- Enable RLS
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read Access (Anon)
CREATE POLICY "Public Read Access: media_items" ON public.media_items
FOR SELECT USING (true); -- Or restrict to status='Published' if preferred

CREATE POLICY "Public Read Access: courses" ON public.courses
FOR SELECT USING (true);

CREATE POLICY "Public Read Access: media_assets" ON public.media_assets
FOR SELECT USING (true);

-- Policy: Admin Write Access (Service Role Only)
-- Note: 'anon' key cannot write. You must use the service_role key for admin operations
-- or implement authenticated user RLS if you have users.
-- For now, we mainly want to ensure 'anon' cannot write.
