-- Migration: 019_seed_subindustry_descriptions.sql
-- Description: Seed descriptions for ALL sub-industries under each parent

-- =====================================================
-- Farming 4.0 children
-- =====================================================
UPDATE industries SET description = 'Integrate IoT, AI, and data analytics to boost productivity and sustainability in farming.'
WHERE parent_slug = 'farming-4-0' AND name = 'Agriculture 4.0';

UPDATE industries SET description = 'Leverage digital tools to monitor biodiversity and promote sustainable land management practices.'
WHERE parent_slug = 'farming-4-0' AND name = 'Conservation 4.0';

UPDATE industries SET description = 'Optimize forest health and sustainability with real-time monitoring and disease detection systems.'
WHERE parent_slug = 'farming-4-0' AND name = 'Forestry 4.0';

UPDATE industries SET description = 'Enhance livestock health, behavior tracking, and productivity with IoT wearables and analytics.'
WHERE parent_slug = 'farming-4-0' AND name = 'Livestock 4.0';

-- =====================================================
-- Government 4.0 children
-- =====================================================
UPDATE industries SET description = 'Digitize central government operations to improve efficiency, transparency, and data-driven decision-making.'
WHERE parent_slug = 'government-4-0' AND name = 'CentralGov 4.0';

UPDATE industries SET description = 'Enhance local governance with smart urban planning and citizen engagement solutions.'
WHERE parent_slug = 'government-4-0' AND name = 'Municipality';

UPDATE industries SET description = 'Automate compliance monitoring and risk management for efficient regulatory enforcement.'
WHERE parent_slug = 'government-4-0' AND name = 'Regulator 4.0';

UPDATE industries SET description = 'Promote investment opportunities and streamline business expansion through digital tools.'
WHERE parent_slug = 'government-4-0' AND name = 'IPA 4.0';

UPDATE industries SET description = 'Modernize law enforcement with AI-driven case management and intelligent surveillance systems.'
WHERE parent_slug = 'government-4-0' AND name = 'Police 4.0';

UPDATE industries SET description = 'Strengthen defense operations with cybersecurity, AI logistics, and advanced digital weaponry systems.'
WHERE parent_slug = 'government-4-0' AND name = 'Defense 4.0';

UPDATE industries SET description = 'Optimize emergency response with real-time data sharing and AI-driven resource management.'
WHERE parent_slug = 'government-4-0' AND name = 'Emergency 4.0';

-- =====================================================
-- Hospitality 4.0 children
-- =====================================================
UPDATE industries SET description = 'Integrate IoT, AI, and data analytics to enhance hospitality operations and guest experience.'
WHERE parent_slug = 'hospitality-4-0' AND name = 'Hotel & Stays 4.0';

UPDATE industries SET description = 'Enhance dining experiences through AI-driven recommendations, contactless ordering, and ambiance control.'
WHERE parent_slug = 'hospitality-4-0' AND name = 'Food & Beverage 4.0';

UPDATE industries SET description = 'Optimize park visits with digital queuing, ride reservations, and personalized guest interactions.'
WHERE parent_slug = 'hospitality-4-0' AND name = 'Park & Resort 4.0';

UPDATE industries SET description = 'Streamline event management with digital ticketing, crowd navigation, and real-time engagement tools.'
WHERE parent_slug = 'hospitality-4-0' AND name = 'Crowd & Event4.0';

-- =====================================================
-- Infrastructure 4.0 children
-- =====================================================
UPDATE industries SET description = 'Transform urban spaces with IoT, AI, and data-driven solutions for sustainability and efficiency.'
WHERE parent_slug = 'infrastructure-4-0' AND name = 'Smart City 4.0';

UPDATE industries SET description = 'Optimize building design, energy use, and maintenance with BIM, IoT, and smart sensors.'
WHERE parent_slug = 'infrastructure-4-0' AND name = 'Building 4.0';

UPDATE industries SET description = 'Enhance construction processes through automation, robotics, and predictive analytics for smarter execution.'
WHERE parent_slug = 'infrastructure-4-0' AND name = 'Construction 4.0';

UPDATE industries SET description = 'Streamline property development with smart urban planning and data-driven project management tools.'
WHERE parent_slug = 'infrastructure-4-0' AND name = 'Developer 4.0';

UPDATE industries SET description = 'Improve large-scale urbanization projects with digital tools for resource optimization and quality of life.'
WHERE parent_slug = 'infrastructure-4-0' AND name = 'Urbanisation 4.0';

-- =====================================================
-- Logistics 4.0 children
-- =====================================================
UPDATE industries SET description = 'Streamline postal logistics, tracking, and transport with real-time data and automation.'
WHERE parent_slug = 'logistics-4-0' AND name = 'Postal 4.0';

UPDATE industries SET description = 'Enhance 2PL, 3PL, warehousing, and transport operations through AI and IoT solutions.'
WHERE parent_slug = 'logistics-4-0' AND name = 'Logistics 4.0';

UPDATE industries SET description = 'Optimize planning, design, and 4PL services with predictive analytics and data-driven insights.'
WHERE parent_slug = 'logistics-4-0' AND name = 'SupplyChain 4.0';

UPDATE industries SET description = 'Improve last-mile delivery, tracking, and customer experience with smart logistics tools.'
WHERE parent_slug = 'logistics-4-0' AND name = 'Delivery 4.0';

UPDATE industries SET description = 'Transform freight forwarding with blockchain transparency and real-time shipment tracking.'
WHERE parent_slug = 'logistics-4-0' AND name = 'Freight 4.0';

UPDATE industries SET description = 'Modernize railways, trams, and metros with IoT, automation, and predictive maintenance.'
WHERE parent_slug = 'logistics-4-0' AND name = 'Rail 4.0';

UPDATE industries SET description = 'Enhance flight operations, cargo management, and passenger experiences with digital tools.'
WHERE parent_slug = 'logistics-4-0' AND name = 'Airline 4.0';

UPDATE industries SET description = 'Streamline entry, check-in, boarding, and airport experiences through smart technologies.'
WHERE parent_slug = 'logistics-4-0' AND name = 'Airport 4.0';

UPDATE industries SET description = 'Optimize road transport systems with route planning, IoT sensors, and real-time monitoring.'
WHERE parent_slug = 'logistics-4-0' AND name = 'RoadTransport 4.0';

UPDATE industries SET description = 'Enable efficient water-based logistics with automated cargo handling and real-time tracking.'
WHERE parent_slug = 'logistics-4-0' AND name = 'WaterTransport 4.0';

-- =====================================================
-- Plant 4.0 children
-- =====================================================
UPDATE industries SET description = 'Optimize exploration, production, and distribution with IoT, AI, and automation solutions.'
WHERE parent_slug = 'plant-4-0' AND name = 'Oil & Gas 4.0';

UPDATE industries SET description = 'Enhance safety, sustainability, and efficiency in chemical manufacturing through digital tools.'
WHERE parent_slug = 'plant-4-0' AND name = 'Chemical 4.0';

UPDATE industries SET description = 'Streamline production, logistics, and inventory management for fast-moving consumer goods.'
WHERE parent_slug = 'plant-4-0' AND name = 'FMCG 4.0';

UPDATE industries SET description = 'Enable smart grid management and optimize energy generation with real-time data analytics.'
WHERE parent_slug = 'plant-4-0' AND name = 'Power 4.0';

UPDATE industries SET description = 'Improve resource extraction, reduce risks, and enhance productivity with digital technologies.'
WHERE parent_slug = 'plant-4-0' AND name = 'Mining 4.0';

UPDATE industries SET description = 'Optimize water distribution and treatment using IoT and data-driven solutions.'
WHERE parent_slug = 'plant-4-0' AND name = 'Water 4.0';

UPDATE industries SET description = 'Ensure compliance, improve quality, and reduce costs in pharmaceutical manufacturing.'
WHERE parent_slug = 'plant-4-0' AND name = 'Pharmaceutical 4.0';

-- =====================================================
-- Retail 4.0 children
-- =====================================================
UPDATE industries SET description = 'Integrate online and offline channels for consistent, personalized shopping experiences.'
WHERE parent_slug = 'retail-4-0' AND name = 'Commerce 4.0';

UPDATE industries SET description = 'Streamline operations with convenient click-and-collect and return solutions for customers.'
WHERE parent_slug = 'retail-4-0' AND name = 'PUDO 4.0';

UPDATE industries SET description = 'Transform physical stores with IoT, AI, and interactive displays for enhanced engagement.'
WHERE parent_slug = 'retail-4-0' AND name = 'Store 4.0';

UPDATE industries SET description = 'Optimize product placement, pricing, and promotions using data-driven merchandising tools.'
WHERE parent_slug = 'retail-4-0' AND name = 'Merchandising 4.0';

-- =====================================================
-- Service 4.0 children
-- =====================================================
UPDATE industries SET description = 'Empower decision-making with AI-driven insights, data analytics, and strategic digital advisory solutions.'
WHERE parent_slug = 'service-4-0' AND name = 'Advisory 4.0';

UPDATE industries SET description = 'Streamline legal processes with automated document management, contract reviews, and compliance tools.'
WHERE parent_slug = 'service-4-0' AND name = 'Legal 4.0';

UPDATE industries SET description = 'Optimize financial operations through AI-driven analytics, fraud detection, and real-time reporting.'
WHERE parent_slug = 'service-4-0' AND name = 'Finance 4.0';

UPDATE industries SET description = 'Enhance claims processing, risk assessment, and customer service with automation and AI.'
WHERE parent_slug = 'service-4-0' AND name = 'Insurance 4.0';

UPDATE industries SET description = 'Transform workforce planning, training, and performance management with data-driven HR solutions.'
WHERE parent_slug = 'service-4-0' AND name = 'HR 4.0';

UPDATE industries SET description = 'Enable personalized learning experiences with AI-powered platforms and digital content delivery.'
WHERE parent_slug = 'service-4-0' AND name = 'Education 4.0';

UPDATE industries SET description = 'Deliver seamless banking experiences through omnichannel platforms and real-time transaction insights.'
WHERE parent_slug = 'service-4-0' AND name = 'Bank 4.0';

UPDATE industries SET description = 'Optimize content delivery, audience engagement, and ad targeting with data-driven media solutions.'
WHERE parent_slug = 'service-4-0' AND name = 'Media 4.0';

UPDATE industries SET description = 'Enhance network performance, customer support, and service delivery with AI and IoT integration.'
WHERE parent_slug = 'service-4-0' AND name = 'Telco 4.0';

-- =====================================================
-- Wellness 4.0 children
-- =====================================================
UPDATE industries SET description = 'Transform patient care with telemedicine, diagnostics, and integrated digital health platforms.'
WHERE parent_slug = 'wellness-4-0' AND name = 'Healthcare 4.0';

UPDATE industries SET description = 'Enhance mental wellness through online therapy, self-help tools, and mindfulness apps.'
WHERE parent_slug = 'wellness-4-0' AND name = 'Mental Health 4.0';

UPDATE industries SET description = 'Streamline childcare services with digital tools for safety, education, and development tracking.'
WHERE parent_slug = 'wellness-4-0' AND name = 'Child Care 4.0';

UPDATE industries SET description = 'Enable senior care with IoT-enabled monitoring, health alerts, and remote support systems.'
WHERE parent_slug = 'wellness-4-0' AND name = 'Elderly Care 4.0';

UPDATE industries SET description = 'Empower individuals with disabilities using tailored digital solutions for daily living assistance.'
WHERE parent_slug = 'wellness-4-0' AND name = 'Disability Care 4.0';

UPDATE industries SET description = 'Connect caregivers and families on unified platforms for coordinated social care delivery.'
WHERE parent_slug = 'wellness-4-0' AND name = 'Social Care 4.0';
