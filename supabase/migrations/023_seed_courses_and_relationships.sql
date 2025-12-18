-- Migration: 023_seed_courses_and_relationships.sql
-- Description: Seed coming soon courses (without provider columns) and set up related course relationships
-- This migration replaces 010_seed_coming_soon_courses.sql (which had provider columns)

-- ============================================
-- D1 – Economy 4.0 (Mastering Economy 4.0) - 11 courses
-- ============================================

-- Course 1: Understanding Economy 4.0
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'understanding-economy-4-0',
    'Understanding Economy 4.0',
    'Get a clear, practical introduction to Economy 4.0 and why it matters.',
    'Get a clear, practical introduction to what Economy 4.0 is, how it differs from previous eras, and why it matters for organizations today. By the end of this course, you''ll be able to explain Economy 4.0 to others and recognize its core drivers in your industry.',
    'economy-4-0', 'Digital Leaders',
    ARRAY['Economy 4.0', 'Macro Context', 'Foundations'],
    'Beginner', 55, 4, FALSE, 'published', TRUE,
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Explain what Economy 4.0 is and how it evolved.', 'Identify the core drivers of Economy 4.0 in your context.'],
    ARRAY['Macro digital economy awareness', 'Strategic framing of Economy 4.0'],
    'You will be able to confidently introduce Economy 4.0 to leaders and teams.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 2: Connecting Economy 4.0 and Digital Cognitive Organizations
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'connecting-economy-4-0-and-dco',
    'Connecting Economy 4.0 and Digital Cognitive Organizations',
    'Link Economy 4.0 trends to the design of Digital Cognitive Organizations.',
    'Explore how Digital Cognitive Organizations are the native operating model of Economy 4.0. Learn how DCOs create value and how to connect macro economic trends to concrete organizational design choices.',
    'economy-4-0', 'Digital Leaders',
    ARRAY['Economy 4.0', 'DCO', 'Operating Model'],
    'Intermediate', 60, 4, FALSE, 'published', TRUE,
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Describe the characteristics of a Digital Cognitive Organization.', 'Map Economy 4.0 trends to DCO design choices.'],
    ARRAY['DCO conceptual understanding', 'Operating model mapping'],
    'You will be able to frame why your organization needs to evolve toward a DCO model.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 3: Designing Perfect Life Transactions in Economy 4.0
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'designing-perfect-life-transactions-economy-4-0',
    'Designing Perfect Life Transactions in Economy 4.0',
    'Learn to design Perfect Life Transactions that create value for customers and citizens.',
    'Learn the concept of Perfect Life Transactions and why they sit at the center of Economy 4.0. You''ll map critical transactions, define what "perfect" means in your context, and spot gaps your teams can close.',
    'economy-4-0', 'Digital Leaders',
    ARRAY['PLT', 'Customer Value', 'Journey Design'],
    'Intermediate', 65, 4, FALSE, 'published', TRUE,
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Explain the Perfect Life Transactions concept.', 'Map and prioritize critical transactions in your organization.'],
    ARRAY['Transaction design', 'Journey mapping'],
    'You will leave with a PLT map and a shortlist of improvement opportunities.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 4: Building Digital Business Platforms for Economy 4.0
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'building-digital-business-platforms-economy-4-0',
    'Building Digital Business Platforms for Economy 4.0',
    'Understand how Digital Business Platforms underpin modern Economy 4.0 business models.',
    'Understand what a Digital Business Platform is, how it differs from traditional IT, and how it enables new products, services, and ecosystems in Economy 4.0. Connect platform thinking to your own context and identify where a DBP could unlock value.',
    'economy-4-0', 'Digital Leaders',
    ARRAY['DBP', 'Platform Strategy', 'Architecture'],
    'Intermediate', 58, 4, FALSE, 'published', TRUE,
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Differentiate Digital Business Platforms from traditional systems.', 'Identify where platform thinking applies in your organization.'],
    ARRAY['Platform literacy', 'Opportunity framing'],
    'You will be able to outline where a platform could create value in your organization.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- RELATED COURSES RELATIONSHIPS
-- All 5 courses (PLT + 4 Economy 4.0) are related to each other
-- ============================================

-- PLT course related to Economy 4.0 courses
INSERT INTO public.related_courses (course_slug, related_course_slug, display_order) VALUES
    ('perfecting-life-transactions', 'understanding-economy-4-0', 1),
    ('perfecting-life-transactions', 'connecting-economy-4-0-and-dco', 2),
    ('perfecting-life-transactions', 'designing-perfect-life-transactions-economy-4-0', 3),
    ('perfecting-life-transactions', 'building-digital-business-platforms-economy-4-0', 4)
ON CONFLICT (course_slug, related_course_slug) DO NOTHING;

-- Understanding Economy 4.0 related courses
INSERT INTO public.related_courses (course_slug, related_course_slug, display_order) VALUES
    ('understanding-economy-4-0', 'perfecting-life-transactions', 1),
    ('understanding-economy-4-0', 'connecting-economy-4-0-and-dco', 2),
    ('understanding-economy-4-0', 'designing-perfect-life-transactions-economy-4-0', 3),
    ('understanding-economy-4-0', 'building-digital-business-platforms-economy-4-0', 4)
ON CONFLICT (course_slug, related_course_slug) DO NOTHING;

-- Connecting Economy 4.0 and DCO related courses
INSERT INTO public.related_courses (course_slug, related_course_slug, display_order) VALUES
    ('connecting-economy-4-0-and-dco', 'perfecting-life-transactions', 1),
    ('connecting-economy-4-0-and-dco', 'understanding-economy-4-0', 2),
    ('connecting-economy-4-0-and-dco', 'designing-perfect-life-transactions-economy-4-0', 3),
    ('connecting-economy-4-0-and-dco', 'building-digital-business-platforms-economy-4-0', 4)
ON CONFLICT (course_slug, related_course_slug) DO NOTHING;

-- Designing Perfect Life Transactions related courses
INSERT INTO public.related_courses (course_slug, related_course_slug, display_order) VALUES
    ('designing-perfect-life-transactions-economy-4-0', 'perfecting-life-transactions', 1),
    ('designing-perfect-life-transactions-economy-4-0', 'understanding-economy-4-0', 2),
    ('designing-perfect-life-transactions-economy-4-0', 'connecting-economy-4-0-and-dco', 3),
    ('designing-perfect-life-transactions-economy-4-0', 'building-digital-business-platforms-economy-4-0', 4)
ON CONFLICT (course_slug, related_course_slug) DO NOTHING;

-- Building Digital Business Platforms related courses
INSERT INTO public.related_courses (course_slug, related_course_slug, display_order) VALUES
    ('building-digital-business-platforms-economy-4-0', 'perfecting-life-transactions', 1),
    ('building-digital-business-platforms-economy-4-0', 'understanding-economy-4-0', 2),
    ('building-digital-business-platforms-economy-4-0', 'connecting-economy-4-0-and-dco', 3),
    ('building-digital-business-platforms-economy-4-0', 'designing-perfect-life-transactions-economy-4-0', 4)
ON CONFLICT (course_slug, related_course_slug) DO NOTHING;
