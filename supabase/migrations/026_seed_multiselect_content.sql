-- Migration: Seed Multi-Select Quiz Content
-- Course Slug: perfecting-life-transactions

-- 1. Clean up old quizzes
DELETE FROM public.quizzes 
WHERE course_slug = 'perfecting-life-transactions';

-- 2. Insert New Questions
INSERT INTO public.quizzes (course_slug, title, order_index, question, options, correct_answer, explanation, distractor_feedback)
VALUES
-- Q1 (Single)
(
  'perfecting-life-transactions',
  'Economy 4.0 Definition',
  1,
  'What defines "Economy 4.0" according to the sources?',
  '[
    {"id": "a", "text": "A system where human staff handles all customer interactions to ensure quality."},
    {"id": "b", "text": "A world where transactions are digital, data-driven, automated, and shaped by AI and platforms."},
    {"id": "c", "text": "An era focused on hardware manufacturing and physical retail."},
    {"id": "d", "text": "A landscape where data privacy is no longer a concern for builders."}
  ]'::jsonb,
  '["b"]'::jsonb, 
  'Hint: **Correct.** This is the specific environment where digital builders now operate.',
  '{
    "a": "Hint: Incorrect. The sources describe Economy 4.0 as increasingly automated.",
    "c": "Hint: Incorrect. The focus is on digital life transactions.",
    "d": "Hint: Incorrect. Trust and security remain fundamental pillars of the framework."
  }'::jsonb
),
-- Q2 (Single)
(
  'perfecting-life-transactions',
  'The Trigger',
  2,
  'When decomposing a transaction into its simple structure, what is the "Trigger"?',
  '[
    {"id": "a", "text": "The final output of the process, like a payment."},
    {"id": "b", "text": "The person or system performing the work."},
    {"id": "c", "text": "The specific event or action that starts the transaction."},
    {"id": "d", "text": "A technical error that causes the flow to restart."}
  ]'::jsonb,
  '["c"]'::jsonb,
  'Hint: **Correct.** The trigger is defined as "What starts this transaction?".',
  '{
    "a": "Hint: Incorrect. This describes the \"Outcome\".",
    "b": "Hint: Incorrect. These are the \"Actors\" or \"Systems\".",
    "d": "Hint: Incorrect. While an error is an event, the \"Trigger\" is the intentional start of the transaction."
  }'::jsonb
),
-- Q3 (Single)
(
  'perfecting-life-transactions',
  'PLT Pillar - Personalization',
  3,
  'Which PLT pillar should you focus on if you want to ensure a transaction adapts to a user’s history or intent?',
  '[
    {"id": "a", "text": "Accuracy."},
    {"id": "b", "text": "Efficiency."},
    {"id": "c", "text": "Personalization."},
    {"id": "d", "text": "Transparency."}
  ]'::jsonb,
  '["c"]'::jsonb,
  'Hint: **Correct.** This pillar checks if the experience is tailored or "one-size-fits-all".',
  '{
    "a": "Hint: Incorrect. Accuracy focuses on minimizing errors and rework.",
    "b": "Hint: Incorrect. Efficiency focuses on speed and streamlining steps.",
    "d": "Hint: Incorrect. Transparency focuses on visibility into the process status."
  }'::jsonb
),
-- Q4 (Single)
(
  'perfecting-life-transactions',
  'Drop-off metric',
  4,
  'Which metric is specifically used to identify the exact step where users abandon a process?',
  '[
    {"id": "a", "text": "Completion rate."},
    {"id": "b", "text": "Time to complete."},
    {"id": "c", "text": "Drop-off point."},
    {"id": "d", "text": "Rejection rate."}
  ]'::jsonb,
  '["c"]'::jsonb,
  'Hint: **Correct.** This metric pinpoint where users give up.',
  '{
    "a": "Hint: Incorrect. This tracks the total number of finishers but doesn''t isolate where others quit.",
    "b": "Hint: Incorrect. This measures the duration of the transaction.",
    "d": "Hint: Incorrect. This measures how often the organization rejects the submission, not when the user quits."
  }'::jsonb
),
-- Q5 (Single)
(
  'perfecting-life-transactions',
  'Capstone Objective',
  5,
  'What is the main objective of the "Capstone" project in this course?',
  '[
    {"id": "a", "text": "To memorize all five PLT pillars and their definitions."},
    {"id": "b", "text": "To write a new piece of code for a platform feature."},
    {"id": "c", "text": "To package the redesign of a real-world transaction into a realistic improvement plan."},
    {"id": "d", "text": "To evaluate the marketing strategy for a digital product."}
  ]'::jsonb,
  '["c"]'::jsonb,
  'Hint: **Correct.** It involves sketching "before vs. after" flows and identifying quick wins.',
  '{
    "a": "Hint: Incorrect. The capstone is a practical application, not a memory test.",
    "b": "Hint: Incorrect. The capstone focuses on a \"mini\" realistic improvement plan rather than full coding.",
    "d": "Hint: Incorrect. The capstone focuses on the transaction''s flow, data, and trust."
  }'::jsonb
),
-- Q6 (Multi-Select)
(
  'perfecting-life-transactions',
  'Builder Responsibilities',
  6,
  'Which of the following are responsibilities of a digital solution builder in shaping a PLT? (Select ALL that apply)',
  '[
    {"id": "a", "text": "As a developer: deciding how data flows and how errors are handled."},
    {"id": "b", "text": "As a designer: deciding how the journey flows and how the user feels."},
    {"id": "c", "text": "As a BA: picking which steps are necessary and which are \"noise.\""},
    {"id": "d", "text": "As an HR manager: deciding the salary of the people involved in the transaction."}
  ]'::jsonb,
  '["a", "b", "c"]'::jsonb,
  'Hint: Builder roles (Dev, Design, BA) work together to shape the solution.',
  '{
    "d": "Hint: Incorrect. While HR is an actor, the course defines builder roles as those who design and implement the digital solution."
  }'::jsonb
),
-- Q7 (Multi-Select)
(
  'perfecting-life-transactions',
  'Lifecycle Lens',
  7,
  'Which stages belong to the "Lifecycle Lens" used to contextualize a transaction? (Select ALL that apply)',
  '[
    {"id": "a", "text": "Attract: How people discover the journey."},
    {"id": "b", "text": "Commit: How they formally apply or sign up."},
    {"id": "c", "text": "Debug: How the technical team fixes the code."},
    {"id": "d", "text": "Loyalty: How they stick around or advocate for the service."}
  ]'::jsonb,
  '["a", "b", "d"]'::jsonb,
  'Hint: Lifecycle stages focus on the user journey (Attract, Decide, Commit, Fulfill, Loyalty).',
  '{
    "c": "Hint: Incorrect. This is a technical process, not a stage in the user''s lifecycle journey."
  }'::jsonb
),
-- Q8 (Multi-Select)
(
  'perfecting-life-transactions',
  'Improving Efficiency',
  8,
  'Which actions can a builder take to improve "Efficiency" in a redesigned flow? (Select ALL that apply)',
  '[
    {"id": "a", "text": "Remove a step."},
    {"id": "b", "text": "Pre-fill data that is already known."},
    {"id": "c", "text": "Bundle two steps together."},
    {"id": "d", "text": "Require a second manual review for every single entry."}
  ]'::jsonb,
  '["a", "b", "c"]'::jsonb,
  'Hint: Efficiency is about speed and reducing user effort.',
  '{
    "d": "Hint: Incorrect. While this might affect Accuracy, it decreases Efficiency."
  }'::jsonb
),
-- Q9 (Multi-Select)
(
  'perfecting-life-transactions',
  'Data and AI',
  9,
  'How can data and AI make a transaction "smarter" over time? (Select ALL that apply)',
  '[
    {"id": "a", "text": "Predicting the risk or likelihood of success."},
    {"id": "b", "text": "Autofilling values based on recognized patterns."},
    {"id": "c", "text": "Deleting user history every time a session ends."},
    {"id": "d", "text": "Flagging anomalies for review instead of checking everything manually."}
  ]'::jsonb,
  '["a", "b", "d"]'::jsonb,
  'Hint: Smart transactions use data to predict, automate, and assist.',
  '{
    "c": "Hint: Incorrect. Deleting history makes Personalization (reusing known data) impossible."
  }'::jsonb
),
-- Q10 (Multi-Select)
(
  'perfecting-life-transactions',
  'Building Trust',
  10,
  'To build "Trust" into a transaction, which questions should a designer ask? (Select ALL that apply)',
  '[
    {"id": "a", "text": "Is it obvious why we are asking for this specific data?"},
    {"id": "b", "text": "Is there a clear recourse or help path if the system fails?"},
    {"id": "c", "text": "Is the feedback clear and respectful if a user makes a mistake?"},
    {"id": "d", "text": "Can we hide the follow-up process to discourage users from contacting support?"}
  ]'::jsonb,
  '["a", "b", "c"]'::jsonb,
  'Hint: Trust comes from transparency, support, and respect.',
  '{
    "d": "Hint: Incorrect. Hiding the follow-up path reduces transparency and trust."
  }'::jsonb
);
