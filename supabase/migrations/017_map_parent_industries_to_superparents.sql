-- Migration: 017_map_parent_industries_to_superparents.sql
-- Description: Map existing 9 parent industries under the 5 super-parents

-- Public Systems
UPDATE industries SET parent_slug = 'public-systems'
WHERE slug IN ('government-4-0', 'infrastructure-4-0');

-- Productive Industries
UPDATE industries SET parent_slug = 'productive-industries'
WHERE slug IN ('farming-4-0', 'plant-4-0', 'logistics-4-0');

-- Commercial & Consumer Businesses
UPDATE industries SET parent_slug = 'commercial-consumer'
WHERE slug IN ('retail-4-0', 'hospitality-4-0');

-- Professional & Knowledge Services
UPDATE industries SET parent_slug = 'professional-knowledge'
WHERE slug IN ('service-4-0');

-- Human & Social Care
UPDATE industries SET parent_slug = 'human-social-care'
WHERE slug IN ('wellness-4-0');
