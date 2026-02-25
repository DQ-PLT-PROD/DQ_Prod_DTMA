-- Migration: 049_admin_auth_rbac.sql
-- Purpose: Supabase Auth-based admin/instructor authorization with strict RBAC
-- Scope: /instructor app data paths (courses, lessons, modules, course_categories, lms-content storage)

BEGIN;

-- =====================================================
-- 1) Admin membership source of truth
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'instructor', 'editor', 'viewer')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT admin_memberships_user_role_unique UNIQUE (user_id, role)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_memberships_one_active_per_user
    ON public.admin_memberships (user_id)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_admin_memberships_user_id
    ON public.admin_memberships (user_id);

CREATE INDEX IF NOT EXISTS idx_admin_memberships_role_status
    ON public.admin_memberships (role, status);

ALTER TABLE public.admin_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_memberships_self_read" ON public.admin_memberships;
CREATE POLICY "admin_memberships_self_read"
    ON public.admin_memberships
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_memberships_admin_manage" ON public.admin_memberships;
CREATE POLICY "admin_memberships_admin_manage"
    ON public.admin_memberships
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.admin_memberships am
            WHERE am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.admin_memberships am
            WHERE am.user_id = auth.uid()
              AND am.status = 'active'
              AND am.role = 'admin'
        )
    );

-- Shared helper for role-aware policies.
CREATE OR REPLACE FUNCTION public.is_admin_member(
    p_user_id UUID DEFAULT auth.uid(),
    p_allowed_roles TEXT[] DEFAULT ARRAY['viewer', 'editor', 'instructor', 'admin']
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_memberships am
        WHERE am.user_id = p_user_id
          AND am.status = 'active'
          AND am.role = ANY(p_allowed_roles)
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_member(UUID, TEXT[]) TO authenticated;

-- Keep updated_at in sync.
DROP TRIGGER IF EXISTS update_admin_memberships_updated_at ON public.admin_memberships;
CREATE TRIGGER update_admin_memberships_updated_at
    BEFORE UPDATE ON public.admin_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 2) Re-enable and lock down RLS for instructor-managed tables
-- =====================================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;

-- ---- courses
DROP POLICY IF EXISTS "Authenticated can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated can update courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated can delete courses" ON public.courses;
DROP POLICY IF EXISTS "Public read courses" ON public.courses;

CREATE POLICY "Public read courses"
    ON public.courses
    FOR SELECT
    USING (true);

CREATE POLICY "Admin insert courses"
    ON public.courses
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin update courses"
    ON public.courses
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    )
    WITH CHECK (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin delete courses"
    ON public.courses
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['instructor', 'admin'])
    );

-- ---- lessons
DROP POLICY IF EXISTS "Public Read Access: lessons" ON public.lessons;
DROP POLICY IF EXISTS "Public read lessons" ON public.lessons;

CREATE POLICY "Public read lessons"
    ON public.lessons
    FOR SELECT
    USING (true);

CREATE POLICY "Admin insert lessons"
    ON public.lessons
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin update lessons"
    ON public.lessons
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    )
    WITH CHECK (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin delete lessons"
    ON public.lessons
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['instructor', 'admin'])
    );

-- ---- modules
DROP POLICY IF EXISTS "Public Read Access: modules" ON public.modules;
DROP POLICY IF EXISTS "Public read modules" ON public.modules;

CREATE POLICY "Public read modules"
    ON public.modules
    FOR SELECT
    USING (true);

CREATE POLICY "Admin insert modules"
    ON public.modules
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin update modules"
    ON public.modules
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    )
    WITH CHECK (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin delete modules"
    ON public.modules
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['instructor', 'admin'])
    );

-- ---- course_categories
DROP POLICY IF EXISTS "Allow public read access on course_categories" ON public.course_categories;
DROP POLICY IF EXISTS "Public read course_categories" ON public.course_categories;

CREATE POLICY "Public read course_categories"
    ON public.course_categories
    FOR SELECT
    USING (true);

CREATE POLICY "Admin insert course_categories"
    ON public.course_categories
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin update course_categories"
    ON public.course_categories
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    )
    WITH CHECK (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin delete course_categories"
    ON public.course_categories
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['instructor', 'admin'])
    );

-- =====================================================
-- 3) Storage policies for lms-content bucket
-- =====================================================
DROP POLICY IF EXISTS "Public read lms-content objects" ON storage.objects;
DROP POLICY IF EXISTS "Admin insert lms-content objects" ON storage.objects;
DROP POLICY IF EXISTS "Admin update lms-content objects" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete lms-content objects" ON storage.objects;

CREATE POLICY "Public read lms-content objects"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'lms-content');

CREATE POLICY "Admin insert lms-content objects"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'lms-content'
        AND public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin update lms-content objects"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'lms-content'
        AND public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    )
    WITH CHECK (
        bucket_id = 'lms-content'
        AND public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin delete lms-content objects"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'lms-content'
        AND public.is_admin_member(auth.uid(), ARRAY['instructor', 'admin'])
    );

COMMIT;
