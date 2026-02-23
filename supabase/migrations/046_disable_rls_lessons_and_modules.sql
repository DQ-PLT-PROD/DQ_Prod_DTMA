-- Disable RLS on lessons and modules so anon key can INSERT/UPDATE/DELETE
-- (instructor portal tabs: lessons, modules). Same approach as 045 for courses.
-- Create modules table if missing (used by instructor portal Modules tab).

CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_slug TEXT NOT NULL REFERENCES public.courses(slug) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    order_index NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_modules_course_slug ON public.modules(course_slug);
CREATE INDEX IF NOT EXISTS idx_modules_order ON public.modules(course_slug, order_index);

ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY;

-- Disable RLS on lms_* tables if they exist (legacy naming)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lms_lessons') THEN
    ALTER TABLE public.lms_lessons DISABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lms_modules') THEN
    ALTER TABLE public.lms_modules DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;
