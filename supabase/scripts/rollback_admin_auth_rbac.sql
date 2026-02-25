-- Rollback: admin auth RBAC migration (049_admin_auth_rbac.sql)
-- Emergency rollback to restore pre-migration behavior.
-- WARNING: This relaxes security controls and should be temporary.

BEGIN;

-- =====================================================
-- 1) Remove storage RBAC policies
-- =====================================================
DROP POLICY IF EXISTS "Public read lms-content objects" ON storage.objects;
DROP POLICY IF EXISTS "Admin insert lms-content objects" ON storage.objects;
DROP POLICY IF EXISTS "Admin update lms-content objects" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete lms-content objects" ON storage.objects;

-- =====================================================
-- 2) Remove admin table policies/function/table
-- =====================================================
DROP TRIGGER IF EXISTS update_admin_memberships_updated_at ON public.admin_memberships;
DROP POLICY IF EXISTS "admin_memberships_self_read" ON public.admin_memberships;
DROP POLICY IF EXISTS "admin_memberships_admin_manage" ON public.admin_memberships;
DROP TABLE IF EXISTS public.admin_memberships;

DROP FUNCTION IF EXISTS public.is_admin_member(UUID, TEXT[]);

-- =====================================================
-- 3) Drop RBAC policies on instructor-managed tables
-- =====================================================
DROP POLICY IF EXISTS "Public read courses" ON public.courses;
DROP POLICY IF EXISTS "Admin insert courses" ON public.courses;
DROP POLICY IF EXISTS "Admin update courses" ON public.courses;
DROP POLICY IF EXISTS "Admin delete courses" ON public.courses;

DROP POLICY IF EXISTS "Public read lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admin insert lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admin update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admin delete lessons" ON public.lessons;

DROP POLICY IF EXISTS "Public read modules" ON public.modules;
DROP POLICY IF EXISTS "Admin insert modules" ON public.modules;
DROP POLICY IF EXISTS "Admin update modules" ON public.modules;
DROP POLICY IF EXISTS "Admin delete modules" ON public.modules;

DROP POLICY IF EXISTS "Public read course_categories" ON public.course_categories;
DROP POLICY IF EXISTS "Admin insert course_categories" ON public.course_categories;
DROP POLICY IF EXISTS "Admin update course_categories" ON public.course_categories;
DROP POLICY IF EXISTS "Admin delete course_categories" ON public.course_categories;

-- Restore permissive behavior used before secure RBAC enforcement.
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories DISABLE ROW LEVEL SECURITY;

COMMIT;
