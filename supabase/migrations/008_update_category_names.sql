-- Migration: Update course category names to match Explore Dropdown menu headings
-- Description: Updates the 'name' column in 'course_categories' table for consistency across the platform.

-- 1. Mastering Economy 4.0
UPDATE course_categories 
SET name = 'Mastering Economy 4.0' 
WHERE slug = 'economy-4-0';

-- 2. Building Tomorrow's Organisations
UPDATE course_categories 
SET name = 'Building Tomorrow''s Organisations' 
WHERE slug = 'digital-cognitive-organization';

-- 3. Mastering Digital Transformation
UPDATE course_categories 
SET name = 'Mastering Digital Transformation' 
WHERE slug = 'digital-business-platform';

-- 4. Designing for the Future
UPDATE course_categories 
SET name = 'Designing for the Future' 
WHERE slug = 'digital-transformation-2-0';

-- 5. Architecting Change
UPDATE course_categories 
SET name = 'Architecting Change' 
WHERE slug = 'digital-worker-workspace';

-- 6. Empowering Change
UPDATE course_categories 
SET name = 'Empowering Change' 
WHERE slug = 'digital-accelerators-tools';
