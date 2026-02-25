-- Seed Data: Course 01 - Perfecting Life Transactions
-- This script resets courses and seeds the first production course
-- Run this AFTER applying all migration scripts

-- ============================================
-- STEP 1: Clear existing seed data
-- ============================================

-- Delete lessons (cascade from courses will handle this, but being explicit)
DELETE FROM public.lessons WHERE course_slug IN (SELECT slug FROM public.courses);

-- Delete quizzes
DELETE FROM public.quizzes WHERE course_slug IN (SELECT slug FROM public.courses);

-- Delete resources
DELETE FROM public.course_resources WHERE course_slug IN (SELECT slug FROM public.courses);

-- Delete all existing courses
DELETE FROM public.courses;

-- ============================================
-- STEP 2: Insert Course 01 - PLT Course
-- ============================================

INSERT INTO public.courses (
    slug, 
    title, 
    short_description, 
    long_description,
    category_id, 
    audience_level, 
    topic_tags, 
    level_tag,
    estimated_duration_minutes, 
    lesson_count, 
    hero_image_url,
    intro_video_url, 
    intro_video_poster_url, 
    is_featured, 
    status,
    provider_name, 
    provider_logo_url, 
    provider_description,
    delivery_mode, 
    enrollment_url, 
    learning_outcomes, 
    skills_gained,
    upon_completion, 
    created_at, 
    updated_at
) VALUES (
    'perfecting-life-transactions',
    'Perfecting Life Transactions: A Digital Builder''s Blueprint',
    'Learn how to master the digital landscape of Economy 4.0 by shifting your role from simply "shipping tickets" to shaping "Perfect Life Transactions (PLTs)" for human beings.',
    'Learn how to master the digital landscape of Economy 4.0 by shifting your role from simply "shipping tickets" to shaping "Perfect Life Transactions (PLTs)" for human beings. Every day, people are engaged in critical life moments—like opening a bank account or enrolling in a course—that are often hidden behind a form or screen.

This course equips digital solution builders to deconstruct and map any transaction into its essential steps, and systematically evaluate its weaknesses using the five core PLT pillars: Efficiency, Accuracy, Personalization, Transparency, and Security. You will develop the skills to redesign flows for clarity and smoother handoffs, apply a platform lens to propose automation and reuse, and integrate data and AI ideas to make processes smarter. The final module guides you in layering in trust and ethical design and producing a realistic, measurable improvement plan for a real transaction from your own work. By the end, you won''t just be building features; you''ll be perfecting life''s most important digital moments.',
    'cat-economy-4-0',
    'Digital Workers',
    '{"PLT", "Economy 4.0", "Transaction Design", "UX Design", "Digital Transformation", "Platform Thinking", "AI Integration", "Trust & Security"}',
    'Intermediate',
    120,
    9,
    '/images/courses/plt-course-hero.png',
    NULL, -- Will be updated with Supabase storage URL
    '/images/courses/plt-course-poster.png',
    TRUE,
    'published',
    'DTMA Academy',
    '/mzn_logo.png',
    'Digital Qatalyst''s academy for digital transformation leaders and workers.',
    'Online',
    '/learning',
    '{
        "Gain the ability to shift your focus from executing a ticket or task to identifying and shaping the underlying life transaction for a human being.",
        "Map and deconstruct any real-world transaction by identifying its trigger, steps, actors, systems, outcome, and critical pain points.",
        "Evaluate transactions systematically using the five Perfect Life Transaction (PLT) pillars—Efficiency, Accuracy, Personalization, Transparency, and Security—to score performance and identify primary weaknesses.",
        "Contextualize the transaction by placing it within the wider lifecycle lens (Attract, Decide, Commit, Fulfill, Realize value, Loyalty) to understand its connections to the overall user journey.",
        "Design and sketch a PLT-aware flow by applying practical improvements, such as removing unnecessary steps, pre-filling known data, and defining cleaner, less error-prone handoffs.",
        "Apply a platform and reuse lens to propose automation ideas and distinguish between unique versus reusable steps that could become shared platform features.",
        "Select three to five key metrics (e.g., Completion rate, Drop-off point) to measure transaction success and propose ways data or AI could make the flow smarter through prediction or suggestion.",
        "Integrate trust and ethical considerations by proposing changes that improve data protection, process clarity, and respectful feedback when errors occur.",
        "Create a final, realistic mini capstone improvement plan for a real transaction, which includes before vs. after visuals, revised PLT scores, and a strategy detailing quick wins and necessary alignments."
    }',
    '{
        "Transaction Mapping",
        "PLT Pillar Assessment",
        "Journey Design",
        "Platform Thinking",
        "Metrics Definition",
        "AI/Data Integration",
        "Trust-by-Design",
        "Improvement Planning"
    }',
    'By the end, you won''t just be building features; you''ll be perfecting life''s most important digital moments.',
    NOW(),
    NOW()
);

-- ============================================
-- STEP 3: Insert Lessons
-- ============================================

-- Intro
INSERT INTO public.lessons (course_slug, title, type, order_index, estimated_duration_minutes, video_url, content)
VALUES (
    'perfecting-life-transactions',
    'Course Introduction',
    'intro',
    0,
    5,
    'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/intro/Intro_V2.mp4',
    'Welcome to Perfecting Life Transactions: A Digital Builder''s Blueprint. In this introduction, you''ll learn what to expect from the course and how it will transform your approach to digital solution building.'
);

-- Lesson 1
INSERT INTO public.lessons (course_slug, title, type, order_index, estimated_duration_minutes, video_url, content)
VALUES (
    'perfecting-life-transactions',
    'Economy 4.0 & Your Role in Perfecting Life''s Transactions',
    'standard',
    1,
    12,
    'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_1.mp4',
    'Ground yourself in the core ideas behind Economy 4.0 and understand your critical role in shaping perfect life transactions for human beings.'
);

-- Lesson 2
INSERT INTO public.lessons (course_slug, title, type, order_index, estimated_duration_minutes, video_url, content)
VALUES (
    'perfecting-life-transactions',
    'Seeing Your Work as a Transaction, Not a Task',
    'standard',
    2,
    13,
    'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_2.mp4',
    'Learn to shift your perspective from completing tickets to understanding the underlying human transaction you''re enabling.'
);

-- Lesson 3
INSERT INTO public.lessons (course_slug, title, type, order_index, estimated_duration_minutes, video_url, content)
VALUES (
    'perfecting-life-transactions',
    'Applying the 5 PLT Pillars as a Design & Build Checklist',
    'standard',
    3,
    14,
    'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_3.mp4',
    'Master the five core PLT pillars: Efficiency, Accuracy, Personalization, Transparency, and Security. Use them as your design checklist.'
);

-- Lesson 4
INSERT INTO public.lessons (course_slug, title, type, order_index, estimated_duration_minutes, video_url, content)
VALUES (
    'perfecting-life-transactions',
    'The Transaction Lifecycle: Using the Growth Hack Lens',
    'standard',
    4,
    12,
    'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_4.mp4',
    'Place transactions within the wider lifecycle lens (Attract, Decide, Commit, Fulfill, Realize value, Loyalty) to understand their full context.'
);

-- Lesson 5
INSERT INTO public.lessons (course_slug, title, type, order_index, estimated_duration_minutes, video_url, content)
VALUES (
    'perfecting-life-transactions',
    'Designing PLTs in Practice (UX, Flows & Handoffs)',
    'standard',
    5,
    15,
    'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_5.mp4',
    'Apply practical improvements: remove unnecessary steps, pre-fill known data, and define cleaner, error-free handoffs.'
);

-- Lesson 6
INSERT INTO public.lessons (course_slug, title, type, order_index, estimated_duration_minutes, video_url, content)
VALUES (
    'perfecting-life-transactions',
    'Building PLTs on Platforms: DBPs, Automation & Reuse',
    'standard',
    6,
    14,
    'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_6.mp4',
    'Apply a platform and reuse lens to identify automation opportunities and distinguish unique versus reusable transaction steps.'
);

-- Lesson 7
INSERT INTO public.lessons (course_slug, title, type, order_index, estimated_duration_minutes, video_url, content)
VALUES (
    'perfecting-life-transactions',
    'Making Transactions Intelligent: Data, Metrics & AI',
    'standard',
    7,
    13,
    'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_7.mp4',
    'Define key metrics like completion rate and drop-off points. Propose ways data and AI can make your flows smarter through prediction and suggestion.'
);

-- Lesson 8
INSERT INTO public.lessons (course_slug, title, type, order_index, estimated_duration_minutes, video_url, content)
VALUES (
    'perfecting-life-transactions',
    'Trust, Transparency & Security in Everyday Design',
    'standard',
    8,
    12,
    'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_8.mp4',
    'Integrate trust and ethical considerations: improve data protection, process clarity, and respectful error handling.'
);

-- Lesson 9
INSERT INTO public.lessons (course_slug, title, type, order_index, estimated_duration_minutes, video_url, content)
VALUES (
    'perfecting-life-transactions',
    'Capstone: Redesigning a Real Transaction You''re Working On',
    'standard',
    9,
    15,
    'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/lessons/Lesson_9.mp4',
    'Create your final mini capstone: a realistic improvement plan with before/after visuals, revised PLT scores, and implementation strategy.'
);

-- Add preview flag to intro lesson (make it accessible without enrollment)
UPDATE public.lessons 
SET is_preview = true 
WHERE course_slug = 'perfecting-life-transactions' 
AND title = 'Course Introduction';

-- Add preview flag to first lesson (for testing)
UPDATE public.lessons 
SET is_preview = true 
WHERE course_slug = 'perfecting-life-transactions' 
AND title = 'Economy 4.0 & Your Role in Perfecting Life''s Transactions';

-- ============================================
-- STEP 4: Insert Placeholder Quizzes
-- ============================================

INSERT INTO public.quizzes (course_slug, title, order_index, question, options, correct_answer, explanation)
VALUES 
(
    'perfecting-life-transactions',
    'Quiz 1: Economy 4.0 Fundamentals',
    1,
    'What is the primary shift that Economy 4.0 demands from digital solution builders?',
    '[{"id": "a", "text": "Writing more code faster"}, {"id": "b", "text": "Shifting from shipping tickets to shaping life transactions"}, {"id": "c", "text": "Focusing only on technical requirements"}, {"id": "d", "text": "Reducing user interaction"}]',
    'b',
    'Economy 4.0 requires builders to see beyond tickets and understand the underlying human transactions they enable.'
),
(
    'perfecting-life-transactions',
    'Quiz 2: Understanding PLTs',
    2,
    'Which of the following is NOT one of the five PLT pillars?',
    '[{"id": "a", "text": "Efficiency"}, {"id": "b", "text": "Accuracy"}, {"id": "c", "text": "Profitability"}, {"id": "d", "text": "Transparency"}]',
    'c',
    'The five PLT pillars are Efficiency, Accuracy, Personalization, Transparency, and Security. Profitability is not a pillar.'
),
(
    'perfecting-life-transactions',
    'Quiz 3: Transaction Mapping',
    3,
    'When mapping a transaction, which element identifies when the transaction begins?',
    '[{"id": "a", "text": "Outcome"}, {"id": "b", "text": "Actor"}, {"id": "c", "text": "Trigger"}, {"id": "d", "text": "System"}]',
    'c',
    'The trigger is the event or action that initiates the transaction process.'
),
(
    'perfecting-life-transactions',
    'Quiz 4: PLT Pillar Application',
    4,
    'Which PLT pillar focuses on reducing the number of steps and time required to complete a transaction?',
    '[{"id": "a", "text": "Security"}, {"id": "b", "text": "Personalization"}, {"id": "c", "text": "Efficiency"}, {"id": "d", "text": "Transparency"}]',
    'c',
    'Efficiency is about minimizing friction, reducing steps, and saving time in the transaction process.'
),
(
    'perfecting-life-transactions',
    'Quiz 5: Lifecycle Lens',
    5,
    'In the transaction lifecycle, which phase comes after "Commit"?',
    '[{"id": "a", "text": "Attract"}, {"id": "b", "text": "Decide"}, {"id": "c", "text": "Fulfill"}, {"id": "d", "text": "Loyalty"}]',
    'c',
    'The lifecycle flows: Attract → Decide → Commit → Fulfill → Realize Value → Loyalty'
),
(
    'perfecting-life-transactions',
    'Quiz 6: UX Design Principles',
    6,
    'Pre-filling known data in forms is an example of improving which PLT pillar?',
    '[{"id": "a", "text": "Security"}, {"id": "b", "text": "Efficiency and Personalization"}, {"id": "c", "text": "Transparency only"}, {"id": "d", "text": "Accuracy only"}]',
    'b',
    'Pre-filling known data improves both Efficiency (less typing) and Personalization (showing you know the user).'
),
(
    'perfecting-life-transactions',
    'Quiz 7: Platform Thinking',
    7,
    'What is the main benefit of identifying reusable transaction steps?',
    '[{"id": "a", "text": "Reducing development costs only"}, {"id": "b", "text": "Creating shared platform features and enabling automation at scale"}, {"id": "c", "text": "Making transactions longer"}, {"id": "d", "text": "Avoiding user testing"}]',
    'b',
    'Reusable steps become shared platform features that can be automated and improved once, benefiting many transactions.'
),
(
    'perfecting-life-transactions',
    'Quiz 8: Metrics and AI',
    8,
    'Which metric measures where users abandon a transaction before completion?',
    '[{"id": "a", "text": "Completion rate"}, {"id": "b", "text": "Drop-off point"}, {"id": "c", "text": "Session duration"}, {"id": "d", "text": "Page views"}]',
    'b',
    'Drop-off point identifies exactly where in the flow users are abandoning the transaction.'
),
(
    'perfecting-life-transactions',
    'Quiz 9: Trust and Ethics',
    9,
    'What does "respectful feedback when errors occur" primarily improve?',
    '[{"id": "a", "text": "System performance"}, {"id": "b", "text": "User trust and experience"}, {"id": "c", "text": "Code quality"}, {"id": "d", "text": "Database efficiency"}]',
    'b',
    'Clear, respectful error messages maintain user trust and help them recover from mistakes without frustration.'
),
(
    'perfecting-life-transactions',
    'Quiz 10: Capstone Concepts',
    10,
    'What should a complete PLT improvement plan include?',
    '[{"id": "a", "text": "Only technical specifications"}, {"id": "b", "text": "Before/after visuals, revised PLT scores, and implementation strategy"}, {"id": "c", "text": "Only budget estimates"}, {"id": "d", "text": "Only user research findings"}]',
    'b',
    'A complete improvement plan shows the current state vs. proposed state, measurable improvements, and a realistic implementation path.'
);

-- ============================================
-- STEP 5: Insert Course Resources
-- ============================================

INSERT INTO public.course_resources (course_slug, title, type, description, resource_url, order_index)
VALUES (
    'perfecting-life-transactions',
    'Perfect Life Transactions Whitepaper',
    'whitepaper',
    'A comprehensive guide to understanding and implementing Perfect Life Transactions in your organization.',
    'https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/resources/PLT_Whitepaper.pdf',
    1
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Uncomment to verify the data was inserted correctly:
-- SELECT * FROM public.courses WHERE slug = 'perfecting-life-transactions';
-- SELECT * FROM public.lessons WHERE course_slug = 'perfecting-life-transactions' ORDER BY order_index;
-- SELECT * FROM public.quizzes WHERE course_slug = 'perfecting-life-transactions' ORDER BY order_index;
-- SELECT * FROM public.course_resources WHERE course_slug = 'perfecting-life-transactions';
