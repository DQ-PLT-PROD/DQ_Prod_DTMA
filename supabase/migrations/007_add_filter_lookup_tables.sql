-- Migration: 007_add_filter_lookup_tables.sql
-- Description: Add lookup tables for course filter options (categories, industries, audience levels, difficulty levels)

-- =====================================================
-- 1. Course Categories (6XD Dimensions)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.course_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    display_order SMALLINT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed categories (6XD Dimensions)
INSERT INTO public.course_categories (slug, name, description, display_order) VALUES
    ('economy-4-0', 'Mastering Economy 4.0', 'Navigating the opportunities and challenges in the new economy', 1),
    ('digital-cognitive-organization', 'Building Tomorrow''s Organisations', 'Where organizations are headed in the age of digital transformation', 2),
    ('digital-business-platform', 'Mastering Digital Transformation', 'What legacy value or orchestration engine powers the future?', 3),
    ('digital-transformation-2-0', 'Designing for the Future', 'How to design and deploy next-generation transformation frameworks', 4),
    ('digital-worker-workspace', 'Architecting Change', 'Who are the orchestrators of the new digital workspace?', 5),
    ('digital-accelerators-tools', 'Empowering Change', 'When will we get there? Exploring tools to accelerate transformation', 6)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- =====================================================
-- 2. Industries (Industry 4.0 Verticals)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    display_order SMALLINT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed industries
INSERT INTO public.industries (slug, name, description, display_order) VALUES
    ('farming-4-0', 'Farming 4.0', 'Digital transformation in agriculture and agribusiness', 1),
    ('government-4-0', 'Government 4.0', 'Smart government and digital public services', 2),
    ('hospitality-4-0', 'Hospitality 4.0', 'Digital innovation in tourism and hospitality', 3),
    ('infrastructure-4-0', 'Infrastructure 4.0', 'Smart cities and connected infrastructure', 4),
    ('logistics-4-0', 'Logistics 4.0', 'Digital supply chain and logistics transformation', 5),
    ('plant-4-0', 'Plant 4.0', 'Smart manufacturing and industrial automation', 6),
    ('retail-4-0', 'Retail 4.0', 'Digital retail and omnichannel commerce', 7),
    ('service-4-0', 'Service 4.0', 'Digital service delivery and customer experience', 8),
    ('wellness-4-0', 'Wellness 4.0', 'Digital health and wellness transformation', 9)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- =====================================================
-- 3. Audience Levels (Roles)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audience_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    display_order SMALLINT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed audience levels
INSERT INTO public.audience_levels (slug, name, description, display_order) VALUES
    ('digital-leaders', 'Digital Leaders', 'Executives, managers, and strategic decision-makers driving digital transformation', 1),
    ('digital-workers', 'Digital Workers', 'Professionals and practitioners implementing digital solutions', 2)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- =====================================================
-- 4. Difficulty Levels
-- =====================================================
CREATE TABLE IF NOT EXISTS public.difficulty_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    display_order SMALLINT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed difficulty levels
INSERT INTO public.difficulty_levels (slug, name, description, display_order) VALUES
    ('beginner', 'Beginner', 'No prior knowledge required', 1),
    ('intermediate', 'Intermediate', 'Some foundational knowledge expected', 2),
    ('advanced', 'Advanced', 'Requires strong understanding of core concepts', 3)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- =====================================================
-- 5. Enable Row Level Security (Public Read)
-- =====================================================
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.difficulty_levels ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on course_categories"
    ON public.course_categories FOR SELECT USING (true);

CREATE POLICY "Allow public read access on industries"
    ON public.industries FOR SELECT USING (true);

CREATE POLICY "Allow public read access on audience_levels"
    ON public.audience_levels FOR SELECT USING (true);

CREATE POLICY "Allow public read access on difficulty_levels"
    ON public.difficulty_levels FOR SELECT USING (true);

-- =====================================================
-- 6. Add industry column to courses table (if not exists)
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'industry'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN industry TEXT;
    END IF;
END $$;
