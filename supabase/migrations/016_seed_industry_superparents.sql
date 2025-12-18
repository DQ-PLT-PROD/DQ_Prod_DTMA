-- Migration: 016_seed_industry_superparents.sql
-- Description: Insert the 5 super-parent industry categories

INSERT INTO industries (slug, name, short_name, description, display_order, parent_slug)
VALUES
  (
    'public-systems',
    'Public Systems',
    'Public Systems',
    'Digital and AI applied to government, regulation, cities, and public infrastructure.',
    1,
    NULL
  ),
  (
    'productive-industries',
    'Productive Industries',
    'Productive',
    'Digital and AI applied to production, operations, logistics, and physical systems.',
    2,
    NULL
  ),
  (
    'commercial-consumer',
    'Commercial & Consumer Businesses',
    'Commercial',
    'Digital and AI applied to customer experience, retail, hospitality, and commerce.',
    3,
    NULL
  ),
  (
    'professional-knowledge',
    'Professional & Knowledge Services',
    'Services',
    'Digital and AI applied to advisory, finance, legal, people ops, education, media, and telecom services.',
    4,
    NULL
  ),
  (
    'human-social-care',
    'Human & Social Care',
    'Care',
    'Digital and AI applied to health, wellbeing, care services, and coordinated support systems.',
    5,
    NULL
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  parent_slug = EXCLUDED.parent_slug;
