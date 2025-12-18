-- Migration: 020_insert_all_subindustries.sql
-- Description: Insert or update ALL sub-industries with correct parent_slug relationships
-- This ensures proper hierarchy: Super-parent > Parent > Sub-industry

-- =====================================================
-- Farming 4.0 children (parent_slug = farming-4-0)
-- =====================================================
INSERT INTO industries (slug, name, short_name, description, parent_slug, display_order)
VALUES
    ('agriculture-4-0', 'Agriculture 4.0', 'Agriculture', 'Integrate IoT, AI, and data analytics to boost productivity and sustainability in farming.', 'farming-4-0', 1),
    ('conservation-4-0', 'Conservation 4.0', 'Conservation', 'Leverage digital tools to monitor biodiversity and promote sustainable land management practices.', 'farming-4-0', 2),
    ('forestry-4-0', 'Forestry 4.0', 'Forestry', 'Optimize forest health and sustainability with real-time monitoring and disease detection systems.', 'farming-4-0', 3),
    ('livestock-4-0', 'Livestock 4.0', 'Livestock', 'Enhance livestock health, behavior tracking, and productivity with IoT wearables and analytics.', 'farming-4-0', 4)
ON CONFLICT (slug) DO UPDATE SET
    parent_slug = EXCLUDED.parent_slug,
    short_name = EXCLUDED.short_name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- =====================================================
-- Government 4.0 children (parent_slug = government-4-0)
-- =====================================================
INSERT INTO industries (slug, name, short_name, description, parent_slug, display_order)
VALUES
    ('centralgov-4-0', 'CentralGov 4.0', 'CentralGov', 'Digitize central government operations to improve efficiency, transparency, and data-driven decision-making.', 'government-4-0', 1),
    ('municipality-4-0', 'Municipality', 'Municipality', 'Enhance local governance with smart urban planning and citizen engagement solutions.', 'government-4-0', 2),
    ('regulator-4-0', 'Regulator 4.0', 'Regulator', 'Automate compliance monitoring and risk management for efficient regulatory enforcement.', 'government-4-0', 3),
    ('ipa-4-0', 'IPA 4.0', 'IPA', 'Promote investment opportunities and streamline business expansion through digital tools.', 'government-4-0', 4),
    ('police-4-0', 'Police 4.0', 'Police', 'Modernize law enforcement with AI-driven case management and intelligent surveillance systems.', 'government-4-0', 5),
    ('defense-4-0', 'Defense 4.0', 'Defense', 'Strengthen defense operations with cybersecurity, AI logistics, and advanced digital weaponry systems.', 'government-4-0', 6),
    ('emergency-4-0', 'Emergency 4.0', 'Emergency', 'Optimize emergency response with real-time data sharing and AI-driven resource management.', 'government-4-0', 7)
ON CONFLICT (slug) DO UPDATE SET
    parent_slug = EXCLUDED.parent_slug,
    short_name = EXCLUDED.short_name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- =====================================================
-- Hospitality 4.0 children (parent_slug = hospitality-4-0)
-- =====================================================
INSERT INTO industries (slug, name, short_name, description, parent_slug, display_order)
VALUES
    ('hotel-stays-4-0', 'Hotel & Stays 4.0', 'Hotels', 'Integrate IoT, AI, and data analytics to enhance hospitality operations and guest experience.', 'hospitality-4-0', 1),
    ('fnb-4-0', 'Food & Beverage 4.0', 'F&B', 'Enhance dining experiences through AI-driven recommendations, contactless ordering, and ambiance control.', 'hospitality-4-0', 2),
    ('park-resort-4-0', 'Park & Resort 4.0', 'Parks', 'Optimize park visits with digital queuing, ride reservations, and personalized guest interactions.', 'hospitality-4-0', 3),
    ('crowd-event-4-0', 'Crowd & Event4.0', 'Events', 'Streamline event management with digital ticketing, crowd navigation, and real-time engagement tools.', 'hospitality-4-0', 4)
ON CONFLICT (slug) DO UPDATE SET
    parent_slug = EXCLUDED.parent_slug,
    short_name = EXCLUDED.short_name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- =====================================================
-- Infrastructure 4.0 children (parent_slug = infrastructure-4-0)
-- =====================================================
INSERT INTO industries (slug, name, short_name, description, parent_slug, display_order)
VALUES
    ('smart-city-4-0', 'Smart City 4.0', 'Smart City', 'Transform urban spaces with IoT, AI, and data-driven solutions for sustainability and efficiency.', 'infrastructure-4-0', 1),
    ('building-4-0', 'Building 4.0', 'Building', 'Optimize building design, energy use, and maintenance with BIM, IoT, and smart sensors.', 'infrastructure-4-0', 2),
    ('construction-4-0', 'Construction 4.0', 'Construction', 'Enhance construction processes through automation, robotics, and predictive analytics for smarter execution.', 'infrastructure-4-0', 3),
    ('developer-4-0', 'Developer 4.0', 'Developer', 'Streamline property development with smart urban planning and data-driven project management tools.', 'infrastructure-4-0', 4),
    ('urbanisation-4-0', 'Urbanisation 4.0', 'Urbanisation', 'Improve large-scale urbanization projects with digital tools for resource optimization and quality of life.', 'infrastructure-4-0', 5)
ON CONFLICT (slug) DO UPDATE SET
    parent_slug = EXCLUDED.parent_slug,
    short_name = EXCLUDED.short_name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- =====================================================
-- Logistics 4.0 children (parent_slug = logistics-4-0)
-- =====================================================
INSERT INTO industries (slug, name, short_name, description, parent_slug, display_order)
VALUES
    ('postal-4-0', 'Postal 4.0', 'Postal', 'Streamline postal logistics, tracking, and transport with real-time data and automation.', 'logistics-4-0', 1),
    ('logistics-ops-4-0', 'Logistics 4.0', 'Logistics Ops', 'Enhance 2PL, 3PL, warehousing, and transport operations through AI and IoT solutions.', 'logistics-4-0', 2),
    ('supplychain-4-0', 'SupplyChain 4.0', 'Supply Chain', 'Optimize planning, design, and 4PL services with predictive analytics and data-driven insights.', 'logistics-4-0', 3),
    ('delivery-4-0', 'Delivery 4.0', 'Delivery', 'Improve last-mile delivery, tracking, and customer experience with smart logistics tools.', 'logistics-4-0', 4),
    ('freight-4-0', 'Freight 4.0', 'Freight', 'Transform freight forwarding with blockchain transparency and real-time shipment tracking.', 'logistics-4-0', 5),
    ('rail-4-0', 'Rail 4.0', 'Rail', 'Modernize railways, trams, and metros with IoT, automation, and predictive maintenance.', 'logistics-4-0', 6),
    ('airline-4-0', 'Airline 4.0', 'Airline', 'Enhance flight operations, cargo management, and passenger experiences with digital tools.', 'logistics-4-0', 7),
    ('airport-4-0', 'Airport 4.0', 'Airport', 'Streamline entry, check-in, boarding, and airport experiences through smart technologies.', 'logistics-4-0', 8),
    ('road-transport-4-0', 'RoadTransport 4.0', 'Road', 'Optimize road transport systems with route planning, IoT sensors, and real-time monitoring.', 'logistics-4-0', 9),
    ('water-transport-4-0', 'WaterTransport 4.0', 'Maritime', 'Enable efficient water-based logistics with automated cargo handling and real-time tracking.', 'logistics-4-0', 10)
ON CONFLICT (slug) DO UPDATE SET
    parent_slug = EXCLUDED.parent_slug,
    short_name = EXCLUDED.short_name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- =====================================================
-- Plant 4.0 children (parent_slug = plant-4-0)
-- =====================================================
INSERT INTO industries (slug, name, short_name, description, parent_slug, display_order)
VALUES
    ('oil-gas-4-0', 'Oil & Gas 4.0', 'Oil & Gas', 'Optimize exploration, production, and distribution with IoT, AI, and automation solutions.', 'plant-4-0', 1),
    ('chemical-4-0', 'Chemical 4.0', 'Chemical', 'Enhance safety, sustainability, and efficiency in chemical manufacturing through digital tools.', 'plant-4-0', 2),
    ('fmcg-4-0', 'FMCG 4.0', 'FMCG', 'Streamline production, logistics, and inventory management for fast-moving consumer goods.', 'plant-4-0', 3),
    ('power-4-0', 'Power 4.0', 'Power', 'Enable smart grid management and optimize energy generation with real-time data analytics.', 'plant-4-0', 4),
    ('mining-4-0', 'Mining 4.0', 'Mining', 'Improve resource extraction, reduce risks, and enhance productivity with digital technologies.', 'plant-4-0', 5),
    ('water-4-0', 'Water 4.0', 'Water', 'Optimize water distribution and treatment using IoT and data-driven solutions.', 'plant-4-0', 6),
    ('pharmaceutical-4-0', 'Pharmaceutical 4.0', 'Pharma', 'Ensure compliance, improve quality, and reduce costs in pharmaceutical manufacturing.', 'plant-4-0', 7)
ON CONFLICT (slug) DO UPDATE SET
    parent_slug = EXCLUDED.parent_slug,
    short_name = EXCLUDED.short_name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- =====================================================
-- Retail 4.0 children (parent_slug = retail-4-0)
-- =====================================================
INSERT INTO industries (slug, name, short_name, description, parent_slug, display_order)
VALUES
    ('commerce-4-0', 'Commerce 4.0', 'Commerce', 'Integrate online and offline channels for consistent, personalized shopping experiences.', 'retail-4-0', 1),
    ('pudo-4-0', 'PUDO 4.0', 'PUDO', 'Streamline operations with convenient click-and-collect and return solutions for customers.', 'retail-4-0', 2),
    ('store-4-0', 'Store 4.0', 'Store', 'Transform physical stores with IoT, AI, and interactive displays for enhanced engagement.', 'retail-4-0', 3),
    ('merchandising-4-0', 'Merchandising 4.0', 'Merchandising', 'Optimize product placement, pricing, and promotions using data-driven merchandising tools.', 'retail-4-0', 4)
ON CONFLICT (slug) DO UPDATE SET
    parent_slug = EXCLUDED.parent_slug,
    short_name = EXCLUDED.short_name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- =====================================================
-- Service 4.0 children (parent_slug = service-4-0)
-- =====================================================
INSERT INTO industries (slug, name, short_name, description, parent_slug, display_order)
VALUES
    ('advisory-4-0', 'Advisory 4.0', 'Advisory', 'Empower decision-making with AI-driven insights, data analytics, and strategic digital advisory solutions.', 'service-4-0', 1),
    ('legal-4-0', 'Legal 4.0', 'Legal', 'Streamline legal processes with automated document management, contract reviews, and compliance tools.', 'service-4-0', 2),
    ('finance-4-0', 'Finance 4.0', 'Finance', 'Optimize financial operations through AI-driven analytics, fraud detection, and real-time reporting.', 'service-4-0', 3),
    ('insurance-4-0', 'Insurance 4.0', 'Insurance', 'Enhance claims processing, risk assessment, and customer service with automation and AI.', 'service-4-0', 4),
    ('hr-4-0', 'HR 4.0', 'HR', 'Transform workforce planning, training, and performance management with data-driven HR solutions.', 'service-4-0', 5),
    ('education-4-0', 'Education 4.0', 'Education', 'Enable personalized learning experiences with AI-powered platforms and digital content delivery.', 'service-4-0', 6),
    ('bank-4-0', 'Bank 4.0', 'Banking', 'Deliver seamless banking experiences through omnichannel platforms and real-time transaction insights.', 'service-4-0', 7),
    ('media-4-0', 'Media 4.0', 'Media', 'Optimize content delivery, audience engagement, and ad targeting with data-driven media solutions.', 'service-4-0', 8),
    ('telco-4-0', 'Telco 4.0', 'Telco', 'Enhance network performance, customer support, and service delivery with AI and IoT integration.', 'service-4-0', 9)
ON CONFLICT (slug) DO UPDATE SET
    parent_slug = EXCLUDED.parent_slug,
    short_name = EXCLUDED.short_name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- =====================================================
-- Wellness 4.0 children (parent_slug = wellness-4-0)
-- =====================================================
INSERT INTO industries (slug, name, short_name, description, parent_slug, display_order)
VALUES
    ('healthcare-4-0', 'Healthcare 4.0', 'Healthcare', 'Transform patient care with telemedicine, diagnostics, and integrated digital health platforms.', 'wellness-4-0', 1),
    ('mental-health-4-0', 'Mental Health 4.0', 'Mental Health', 'Enhance mental wellness through online therapy, self-help tools, and mindfulness apps.', 'wellness-4-0', 2),
    ('child-care-4-0', 'Child Care 4.0', 'Child Care', 'Streamline childcare services with digital tools for safety, education, and development tracking.', 'wellness-4-0', 3),
    ('elderly-care-4-0', 'Elderly Care 4.0', 'Elderly Care', 'Enable senior care with IoT-enabled monitoring, health alerts, and remote support systems.', 'wellness-4-0', 4),
    ('disability-care-4-0', 'Disability Care 4.0', 'Disability Care', 'Empower individuals with disabilities using tailored digital solutions for daily living assistance.', 'wellness-4-0', 5),
    ('social-care-4-0', 'Social Care 4.0', 'Social Care', 'Connect caregivers and families on unified platforms for coordinated social care delivery.', 'wellness-4-0', 6)
ON CONFLICT (slug) DO UPDATE SET
    parent_slug = EXCLUDED.parent_slug,
    short_name = EXCLUDED.short_name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;
