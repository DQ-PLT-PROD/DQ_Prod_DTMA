-- Migration: 018_seed_parent_industry_descriptions.sql
-- Description: Add descriptions and short_names to the 9 parent industries

UPDATE industries SET
  description = 'Applying AI, data, and automation across agriculture, conservation, forestry, and livestock systems.',
  short_name = 'Farming'
WHERE slug = 'farming-4-0';

UPDATE industries SET
  description = 'Applying digital systems to governance, regulation, security, emergency response, and public administration.',
  short_name = 'Government'
WHERE slug = 'government-4-0';

UPDATE industries SET
  description = 'Applying AI, automation, and data to hospitality operations, guest experience, and event ecosystems.',
  short_name = 'Hospitality'
WHERE slug = 'hospitality-4-0';

UPDATE industries SET
  description = 'Applying digital tools to cities, buildings, construction, and property development for smarter infrastructure.',
  short_name = 'Infrastructure'
WHERE slug = 'infrastructure-4-0';

UPDATE industries SET
  description = 'Applying AI and data across supply chains, transport modes, freight, delivery, and logistics networks.',
  short_name = 'Logistics'
WHERE slug = 'logistics-4-0';

UPDATE industries SET
  description = 'Applying Industry 4.0 practices to manufacturing and utilities: energy, chemicals, water, mining, and regulated plants.',
  short_name = 'Plant'
WHERE slug = 'plant-4-0';

UPDATE industries SET
  description = 'Applying AI and omnichannel systems to commerce operations, stores, merchandising, and customer fulfilment.',
  short_name = 'Retail'
WHERE slug = 'retail-4-0';

UPDATE industries SET
  description = 'Applying digital tools to professional services and knowledge work: finance, legal, HR, education, media, and telecom.',
  short_name = 'Services'
WHERE slug = 'service-4-0';

UPDATE industries SET
  description = 'Applying digital health and coordinated care systems to improve wellbeing outcomes across life stages.',
  short_name = 'Wellness'
WHERE slug = 'wellness-4-0';
