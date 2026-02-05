-- Setup test enrollment for lesson access testing
-- Run this in Supabase SQL editor or via psql

-- Create test user if not exists
INSERT INTO public.users (
    id,
    azure_user_id,
    customer_id,
    email,
    name,
    onboarding_completed,
    last_login,
    created_at,
    updated_at
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'test-user-123',
    'customer-test-123',
    'test@example.com',
    'Test User',
    true,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW(),
    last_login = NOW();

-- Create test enrollment
INSERT INTO public.user_enrollments (
    id,
    user_id,
    course_slug,
    started_at,
    last_accessed_at,
    progress_pct,
    status,
    enrollment_method,
    created_at,
    updated_at
) VALUES (
    'enrollment-test-123',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'perfecting-life-transactions',
    NOW(),
    NOW(),
    0,
    'active',
    'explicit',
    NOW(),
    NOW()
) ON CONFLICT (user_id, course_slug) DO UPDATE SET
    status = 'active',
    updated_at = NOW();

-- Verify the setup
SELECT 
    u.name as user_name,
    u.email,
    ue.course_slug,
    ue.status as enrollment_status,
    ue.started_at
FROM public.users u
JOIN public.user_enrollments ue ON u.id = ue.user_id
WHERE u.azure_user_id = 'test-user-123';