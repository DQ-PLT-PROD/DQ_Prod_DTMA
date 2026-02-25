-- Migration: 010_seed_coming_soon_courses.sql
-- Description: Seed all 32 placeholder courses from DTMA curriculum as "coming soon"
-- Note: Uses ON CONFLICT to preserve existing PLT course

-- ============================================
-- D1 – Economy 4.0 (Mastering Economy 4.0) - 11 courses
-- ============================================

-- Course 1: Understanding Economy 4.0
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
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
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
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
    provider_name, provider_logo_url, provider_description,
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
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
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
    provider_name, provider_logo_url, provider_description,
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
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
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
    provider_name, provider_logo_url, provider_description,
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
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Differentiate Digital Business Platforms from traditional systems.', 'Identify where platform thinking applies in your organization.'],
    ARRAY['Platform literacy', 'Opportunity framing'],
    'You will be able to outline where a platform could create value in your organization.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 5: Leading Workforce 4.0: People and Machines at Work
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'leading-workforce-4-0',
    'Leading Workforce 4.0: People and Machines at Work',
    'Learn how roles and teams evolve when people and intelligent systems work together.',
    'Discover how roles, skills, and teams change when humans and intelligent systems collaborate. Learn how to frame Workforce 4.0, identify capability gaps, and lead more confident conversations about reskilling and redesigning work.',
    'economy-4-0', 'Digital Leaders',
    ARRAY['Workforce 4.0', 'People', 'Automation'],
    'Beginner', 62, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Describe Workforce 4.0 in clear, practical terms.', 'Identify key capability gaps in your workforce.'],
    ARRAY['Workforce framing', 'Strategic reskilling planning'],
    'You will be able to guide leadership conversations about Workforce 4.0.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 6: Accelerating Digital Transformation in Economy 4.0
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'accelerating-digital-transformation-economy-4-0',
    'Accelerating Digital Transformation in Economy 4.0',
    'Move from slogans to concrete levers that speed up digital transformation.',
    'Move beyond vague transformation slogans and focus on concrete levers that actually speed up change in Economy 4.0. Learn how to prioritize initiatives, remove blockers, and sequence efforts for momentum.',
    'economy-4-0', 'Digital Leaders',
    ARRAY['Transformation', 'Prioritization', 'Execution'],
    'Intermediate', 70, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Identify the levers that accelerate digital transformation.', 'Prioritize transformation initiatives for impact.'],
    ARRAY['Transformation planning', 'Execution sequencing'],
    'You will be able to design a more realistic and accelerated transformation roadmap.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 7: Using AI for Advantage in Economy 4.0
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'using-ai-for-advantage-economy-4-0',
    'Using AI for Advantage in Economy 4.0',
    'Go beyond AI hype and focus on competitive advantage.',
    'Go beyond AI hype and focus on how AI creates real competitive advantage in Economy 4.0. Spot high-value use cases, distinguish automation from augmentation, and connect AI initiatives to business outcomes.',
    'economy-4-0', 'Digital Leaders',
    ARRAY['AI Strategy', 'Use Cases', 'Advantage'],
    'Advanced', 52, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Identify high-value AI use cases.', 'Connect AI initiatives to measurable business outcomes.'],
    ARRAY['AI opportunity framing', 'Business/AI alignment'],
    'You will be able to evaluate AI ideas through a strategic lens.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 8: Protecting Trust and Security in Economy 4.0
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'protecting-trust-and-security-economy-4-0',
    'Protecting Trust and Security in Economy 4.0',
    'Balance cybersecurity and innovation in a hyper-connected economy.',
    'Explore how trust, cybersecurity, privacy, and resilience work together in a hyper-connected economy. Learn simple frameworks to help your organization protect digital assets while still enabling innovation.',
    'economy-4-0', 'Digital Leaders',
    ARRAY['Cybersecurity', 'Trust', 'Resilience'],
    'Advanced', 68, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Explain the key components of digital trust.', 'Identify security gaps that impact innovation.'],
    ARRAY['Cyber risk framing', 'Trust-by-design thinking'],
    'You will be able to discuss security and trust without blocking innovation.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 9: Applying Strategic AI for Competitive Advantage
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'applying-strategic-ai-for-competitive-advantage',
    'Applying Strategic AI for Competitive Advantage',
    'Treat AI as a strategic capability, not a one-off project.',
    'Learn how to treat AI as a strategic capability instead of a series of disconnected experiments. Align AI investments with strategy, choose where to play, and monitor whether AI initiatives are moving the needle.',
    'economy-4-0', 'Digital Leaders',
    ARRAY['AI Strategy', 'Portfolio', 'Competitiveness'],
    'Advanced', 57, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Align AI initiatives with business strategy.', 'Define a simple AI portfolio and success measures.'],
    ARRAY['Strategic AI roadmapping', 'Outcome-based AI planning'],
    'You will be able to discuss AI in the same language as strategy and value.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 10: Building a Culture of Innovation in Economy 4.0
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'building-a-culture-of-innovation-in-economy-4-0',
    'Building a Culture of Innovation in Economy 4.0',
    'Make innovation stick inside real organizations.',
    'Understand what makes innovation stick inside real organizations, not just in slide decks. Learn how to create conditions for experimentation, reduce fear of failure, and align innovation efforts with customer and economic value.',
    'economy-4-0', 'Digital Leaders',
    ARRAY['Innovation', 'Culture', 'Experimentation'],
    'Intermediate', 63, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Identify barriers to innovation in your context.', 'Design simple practices that encourage experimentation.'],
    ARRAY['Innovation culture design', 'Experimentation practices'],
    'You will be able to propose concrete steps to strengthen innovation culture.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 11: Measuring Success in Economy 4.0
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'measuring-success-in-economy-4-0',
    'Measuring Success in Economy 4.0',
    'Focus on metrics that matter in a digital economy.',
    'Explore which metrics matter in a digital, platform-driven, data-rich economy. Move beyond vanity metrics, design a simple measurement stack, and connect leading indicators to long-term value.',
    'economy-4-0', 'Digital Leaders',
    ARRAY['Metrics', 'KPIs', 'Measurement'],
    'Beginner', 54, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Differentiate between vanity and value metrics.', 'Design a simple measurement stack for Economy 4.0.'],
    ARRAY['KPI design', 'Value-based measurement'],
    'You will be able to propose smarter metrics for digital initiatives.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- D2 – Digital Cognitive Organization (Building Tomorrow's Organisations) - 11 courses
-- ============================================

-- Course 12: Building Digital Cognitive Organizations
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'building-digital-cognitive-organizations',
    'Building Digital Cognitive Organizations',
    'Learn the core building blocks of Digital Cognitive Organizations.',
    'Get a structured overview of what defines a Digital Cognitive Organization and how it operates. Explore the key building blocks—strategy, platforms, data, AI, and culture—and how they interlock to create an intelligent, adaptive enterprise.',
    'digital-cognitive-organization', 'Digital Leaders',
    ARRAY['DCO', 'Operating Model', 'Blueprint'],
    'Beginner', 66, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Define the concept of a Digital Cognitive Organization.', 'Identify the core building blocks of a DCO.'],
    ARRAY['DCO literacy', 'High-level organization design'],
    'You will be able to explain what it means to become a Digital Cognitive Organization.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 13: Designing Life-Perfect Transactions in Your Organization
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'designing-life-perfect-transactions-organization',
    'Designing Life-Perfect Transactions in Your Organization',
    'Apply the PLT concept to real organizational journeys.',
    'Apply the Perfect Life Transactions concept to your own organization by mapping, assessing, and improving the transactions that matter most. Connect PLTs to customer experience, operations, and value.',
    'digital-cognitive-organization', 'Digital Leaders',
    ARRAY['PLT', 'Transactions', 'Optimization'],
    'Intermediate', 59, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Map high-value transactions in your organization.', 'Identify improvement opportunities for PLTs.'],
    ARRAY['Transaction mapping', 'Journey optimization'],
    'You will leave with a prioritized PLT improvement backlog.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 14: Using Digital Business Platforms as a DCO Backbone
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'using-dbp-as-dco-backbone',
    'Using Digital Business Platforms as a DCO Backbone',
    'See how Digital Business Platforms act as the backbone of a DCO.',
    'Understand how Digital Business Platforms act as the backbone of a DCO, connecting experiences, intelligence, and operations. Learn how different towers and components fit together and what this means for your roadmap.',
    'digital-cognitive-organization', 'Digital Leaders',
    ARRAY['DBP', 'Enablement', 'Architecture'],
    'Intermediate', 61, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Describe how Digital Business Platforms support DCOs.', 'Map DBP towers to organization needs.'],
    ARRAY['Platform mapping', 'DCO/DBP alignment'],
    'You will be able to frame DBPs as core infrastructure for DCOs.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 15: Building AI-Driven Organizations
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'building-ai-driven-organizations',
    'Building AI-Driven Organizations',
    'Embed AI into processes and decisions across the organization.',
    'Learn what it really means to embed AI into the organization rather than bolt it on. Explore patterns for AI-enabled processes, decision support, and automation, and how to manage the change that comes with them.',
    'digital-cognitive-organization', 'Digital Leaders',
    ARRAY['AI Operations', 'Automation', 'Decisions'],
    'Advanced', 69, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Identify processes suitable for AI enablement.', 'Plan for change when introducing AI at scale.'],
    ARRAY['AI-enabled process design', 'Change planning for AI'],
    'You will be able to sketch a roadmap for becoming more AI-driven.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 16: Monetizing Data: Practicing Data Capitalism
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'monetizing-data-data-capitalism',
    'Monetizing Data: Practicing Data Capitalism',
    'Treat data as a true asset, not just exhaust.',
    'Discover how to treat data as a true asset rather than a by-product of operations. Learn data value patterns—products, services, insights—and how to design pathways from raw data to revenue and impact.',
    'digital-cognitive-organization', 'Digital Leaders',
    ARRAY['Data Value', 'Monetization', 'Products'],
    'Advanced', 56, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Identify potential data value streams.', 'Outline simple data-to-value pathways.'],
    ARRAY['Data product thinking', 'Data monetization framing'],
    'You will be able to explain how data can directly contribute to revenue or impact.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 17: Applying Behavioral Economics and AI to Decisions
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'applying-behavioral-economics-and-ai',
    'Applying Behavioral Economics and AI to Decisions',
    'Design decision flows that combine human and machine intelligence.',
    'Explore how human biases and machine intelligence interact in decision-making. Learn how to design decision flows that use nudges, feedback, and AI recommendations to improve choices.',
    'digital-cognitive-organization', 'Digital Leaders',
    ARRAY['Behavioral AI', 'Decisions', 'Nudges'],
    'Advanced', 60, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Recognize common decision biases in your context.', 'Design AI-assisted decision flows.'],
    ARRAY['Behavioral design', 'Decision-flow design'],
    'You will be able to propose improvements to how key decisions are made.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 18: Designing the Digital Workforce: People, Process and Automation
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'designing-the-digital-workforce',
    'Designing the Digital Workforce: People, Process and Automation',
    'Redesign roles and workflows so people and automation support each other.',
    'Learn how to design roles, workflows, and automation so they support each other rather than clash. Map current work, identify automation opportunities, and redesign roles around higher-value tasks.',
    'digital-cognitive-organization', 'Digital Workers',
    ARRAY['Digital Workforce', 'Roles', 'Automation'],
    'Beginner', 55, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Map current work and identify automation candidates.', 'Redesign roles to focus on higher-value tasks.'],
    ARRAY['Workflow mapping', 'Role redesign'],
    'You will have a clearer view of how your own work can evolve.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 19: Leveraging the API Economy for Growth
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'leveraging-the-api-economy-for-growth',
    'Leveraging the API Economy for Growth',
    'Use APIs as business building blocks, not just technical interfaces.',
    'Understand APIs as business building blocks instead of just technical interfaces. Learn how API strategies open new channels, partnerships, and products, and how DCOs use them to move faster and scale.',
    'digital-cognitive-organization', 'Digital Leaders',
    ARRAY['API Economy', 'Partnerships', 'Growth'],
    'Intermediate', 58, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Explain the business value of APIs.', 'Identify potential API-based opportunities.'],
    ARRAY['API strategy thinking', 'Ecosystem design'],
    'You will be able to propose API-related growth opportunities.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 20: Automating Governance, Risk and Compliance with AI
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'automating-grc-with-ai',
    'Automating Governance, Risk and Compliance with AI',
    'Shift GRC from manual policing to embedded intelligent safeguards.',
    'Explore how GRC can shift from manual policing to embedded, intelligent safeguards. Learn patterns for monitoring, alerts, controls, and evidence that reduce risk while speeding up delivery.',
    'digital-cognitive-organization', 'Digital Leaders',
    ARRAY['GRC', 'Automation', 'Controls'],
    'Advanced', 62, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Identify GRC processes suitable for automation.', 'Design simple AI-supported control patterns.'],
    ARRAY['GRC process design', 'Control automation framing'],
    'You will be able to suggest smarter, automated GRC patterns.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 21: Scaling Strategy Execution with TMaaS
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'scaling-strategy-execution-with-tmaas',
    'Scaling Strategy Execution with TMaaS',
    'Turn strategy into a repeatable transformation engine.',
    'Learn how Transformation Management as a Service (TMaaS) turns strategy into a repeatable execution engine. Explore how to structure portfolios, track value, and support teams so execution becomes continuous rather than one-off.',
    'digital-cognitive-organization', 'Digital Leaders',
    ARRAY['TMaaS', 'Execution', 'Portfolio'],
    'Advanced', 67, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Explain the TMaaS concept.', 'Outline a simple TMaaS-based execution model.'],
    ARRAY['Portfolio thinking', 'Transformation management'],
    'You will be able to connect strategy to a concrete execution model.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 22: Using the DCO Canvas to Design Your Organization
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'using-the-dco-canvas',
    'Using the DCO Canvas to Design Your Organization',
    'Use the DCO Canvas as a practical design tool.',
    'Get hands-on with the DCO Canvas as a practical design tool. Use it to capture your current state, design a target state, and facilitate structured conversations with leaders and teams.',
    'digital-cognitive-organization', 'Digital Leaders',
    ARRAY['DCO Canvas', 'Design', 'Blueprint'],
    'Intermediate', 53, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Capture your organization on the DCO Canvas.', 'Use the canvas to structure design discussions.'],
    ARRAY['Visual organization design', 'Facilitation using the canvas'],
    'You will have a first version of your organization''s DCO Canvas.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- D3 – Digital Business Platform (Mastering Digital Transformation) - 10 courses
-- ============================================

-- Course 23: Getting Value from Digital Business Platforms
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'getting-value-from-digital-business-platforms',
    'Getting Value from Digital Business Platforms',
    'Learn what makes a Digital Business Platform different and valuable.',
    'Learn what makes a Digital Business Platform different from traditional IT and why it matters for value creation. Explain DBPs in simple language and identify where a platform approach could unlock new revenue or efficiency.',
    'digital-business-platform', 'Digital Leaders',
    ARRAY['DBP Value', 'Strategy', 'Enablement'],
    'Beginner', 57, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Explain DBPs in simple, non-technical language.', 'Identify where a DBP approach might apply.'],
    ARRAY['Platform value framing', 'Opportunity spotting'],
    'You will be able to communicate DBP value to business and tech stakeholders.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 24: Driving Operational Excellence with Digital Business Platforms
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'driving-operational-excellence-with-dbps',
    'Driving Operational Excellence with Digital Business Platforms',
    'Use DBPs to support reliable and scalable operations.',
    'Explore how Digital Business Platforms support reliable, predictable, and scalable operations. Learn how to use platform capabilities to reduce errors, shorten cycle times, and improve service levels.',
    'digital-business-platform', 'Digital Workers',
    ARRAY['Operations', 'Excellence', 'Reliability'],
    'Beginner', 64, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Identify operational pain points that DBPs can address.', 'Connect DBP capabilities to performance improvements.'],
    ARRAY['Operational improvement framing', 'DBP operations literacy'],
    'You will see how your day-to-day work fits into platform-enabled operations.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 25: Designing Seamless Digital Experiences on the DBP
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'designing-seamless-digital-experiences-on-dbp',
    'Designing Seamless Digital Experiences on the DBP',
    'Use the Experience Tower to orchestrate consistent journeys.',
    'Focus on the Experience Tower and how it shapes customer and employee journeys. Learn how to connect channels, orchestrate journeys, and use the platform to deliver consistent, personalized experiences.',
    'digital-business-platform', 'Digital Workers',
    ARRAY['Experience Design', 'Journeys', 'Channels'],
    'Intermediate', 52, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Map experiences across channels using the platform.', 'Spot breaks and friction in current journeys.'],
    ARRAY['Journey mapping on DBP', 'Experience orchestration'],
    'You will be able to propose improvements to key digital journeys.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 26: Building Data and Insights on the DBP Intelligence Tower
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'building-data-and-insights-on-dbp-intelligence-tower',
    'Building Data and Insights on the DBP Intelligence Tower',
    'Turn raw data into actionable insights on the platform.',
    'Understand how the Intelligence Tower turns raw data into actionable insight. Learn basic patterns for ingestion, modeling, analytics, and AI, and how they plug back into experiences and operations.',
    'digital-business-platform', 'Digital Workers',
    ARRAY['Analytics', 'Intelligence', 'Insights'],
    'Advanced', 59, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Describe the main components of the Intelligence Tower.', 'Connect analytics outputs back into business workflows.'],
    ARRAY['Analytics literacy', 'Insight-to-action thinking'],
    'You will see how data work supports better decisions and journeys.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 27: Modernizing Core Operations with Digital Platforms
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'modernizing-core-operations-with-digital-platforms',
    'Modernizing Core Operations with Digital Platforms',
    'Move from fragile legacy systems to platform-based core operations.',
    'Learn how to move from fragile legacy systems to modern, platform-based core operations. Explore migration patterns, risk considerations, and how to sequence change without breaking the business.',
    'digital-business-platform', 'Digital Workers',
    ARRAY['Core Systems', 'Modernization', 'Migration'],
    'Advanced', 70, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Explain the risks and benefits of core modernization.', 'Identify candidate systems and migration patterns.'],
    ARRAY['Modernization planning', 'Migration pattern selection'],
    'You will be able to support modernization conversations with practical options.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 28: Building a Digital Trust Framework on the DBP Security Tower
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'digital-trust-framework-dbp-security-tower',
    'Building a Digital Trust Framework on the DBP Security Tower',
    'Use the Security Tower to protect assets without blocking innovation.',
    'Dive into the Security Tower and its role in trust, compliance, and resilience. Learn how identity, access, monitoring, and policy are woven into the platform to protect assets without blocking innovation.',
    'digital-business-platform', 'Digital Leaders',
    ARRAY['Security', 'Trust', 'Compliance'],
    'Advanced', 54, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Understand the main components of the Security Tower.', 'Balance security requirements with innovation needs.'],
    ARRAY['Security-by-design framing', 'Risk/innovation balancing'],
    'You will be able to discuss trust and security in platform terms.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 29: Scaling Business Capabilities with Digital Business Platforms
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'scaling-business-capabilities-with-dbps',
    'Scaling Business Capabilities with Digital Business Platforms',
    'Package and reuse capabilities across products, services, and markets.',
    'Explore how Digital Business Platforms help organizations package and reuse capabilities across products, services, and markets. Learn how to think in terms of modular business capabilities and design for reuse at scale.',
    'digital-business-platform', 'Digital Leaders',
    ARRAY['Capabilities', 'Scaling', 'Reuse'],
    'Advanced', 63, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Describe business capabilities in modular terms.', 'Identify where capability reuse is possible.'],
    ARRAY['Capability thinking', 'Reuse/scale framing'],
    'You will be able to outline a capability-based view of your platform.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 30: Making Systems Talk: Interoperability on the DBP
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'interoperability-on-the-dbp',
    'Making Systems Talk: Interoperability on the DBP',
    'Connect systems, data, and processes on the platform.',
    'Focus on how the platform connects systems, data, and processes internally and externally. Learn key integration patterns and how interoperability unlocks new combinations of services and partnerships.',
    'digital-business-platform', 'Digital Workers',
    ARRAY['Interoperability', 'Integration', 'Connectivity'],
    'Advanced', 51, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Describe basic integration and interoperability patterns.', 'Recognize where poor interoperability is hurting value.'],
    ARRAY['Integration literacy', 'Interoperability mapping'],
    'You will see how better connections improve both internal and external experiences.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 31: Enabling the Digital Workforce with the DBP Workspace Tower
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'enabling-digital-workforce-with-dbp-workspace-tower',
    'Enabling the Digital Workforce with the DBP Workspace Tower',
    'Support digital workers with the right tools, workflows, and data.',
    'Understand how the Workspace Tower supports the people who run and grow the business. Learn how tools, workflows, and data come together to empower digital workers and teams.',
    'digital-business-platform', 'Digital Workers',
    ARRAY['Workspace', 'Tools', 'Productivity'],
    'Beginner', 56, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Describe the purpose of the Workspace Tower.', 'Identify gaps in current digital work tooling.'],
    ARRAY['Digital workspace literacy', 'Work tooling evaluation'],
    'You will be able to suggest improvements to your digital work environment.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Course 32: Designing Perfect Life Transactions on a Digital Business Platform
INSERT INTO public.courses (
    slug, title, short_description, long_description,
    category_id, audience_level, topic_tags, level_tag,
    estimated_duration_minutes, lesson_count, 
    is_featured, status, is_coming_soon,
    provider_name, provider_logo_url, provider_description,
    delivery_mode, enrollment_url,
    learning_outcomes, skills_gained, upon_completion,
    created_at, updated_at
) VALUES (
    'designing-perfect-life-transactions-on-dbp',
    'Designing Perfect Life Transactions on a Digital Business Platform',
    'Bring PLT and DBP concepts together on the platform.',
    'Bring PLT and DBP concepts together by designing and improving critical transactions on the platform. Translate a transaction blueprint into concrete platform components, measure quality, and continuously improve the journeys that matter most.',
    'digital-business-platform', 'Digital Leaders',
    ARRAY['PLT', 'Orchestration', 'Journeys'],
    'Advanced', 68, 4, FALSE, 'published', TRUE,
    'DTMA Academy', NULL, 'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online', '/forms/dtma-needs-assessment',
    ARRAY['Map PLTs onto DBP components.', 'Define measures of transaction quality on the platform.'],
    ARRAY['PLT/platform mapping', 'Transaction orchestration'],
    'You will be able to design Perfect Life Transactions directly on the Digital Business Platform.',
    NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES (Uncomment to verify)
-- ============================================

-- SELECT COUNT(*) as total_courses FROM public.courses;
-- SELECT is_coming_soon, COUNT(*) as count FROM public.courses GROUP BY is_coming_soon;
-- SELECT category_id, COUNT(*) as count FROM public.courses GROUP BY category_id ORDER BY category_id;
