BEGIN;

ALTER TABLE public.modules
ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[],
ADD COLUMN IF NOT EXISTS skills_gained TEXT[],
ADD COLUMN IF NOT EXISTS upon_completion TEXT;

COMMENT ON COLUMN public.modules.learning_outcomes IS
    'Learner-facing module outcomes managed from the instructor module form.';
COMMENT ON COLUMN public.modules.skills_gained IS
    'Learner-facing module skills managed from the instructor module form.';
COMMENT ON COLUMN public.modules.upon_completion IS
    'Learner-facing module completion copy managed from the instructor module form.';

ALTER TABLE public.course_resources
ADD COLUMN IF NOT EXISTS module_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'course_resources_module_id_fkey'
    ) THEN
        ALTER TABLE public.course_resources
        ADD CONSTRAINT course_resources_module_id_fkey
        FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;
    END IF;
END
$$;

COMMENT ON COLUMN public.course_resources.module_id IS
    'Optional module association so resource tabs can reflect module-managed content.';

WITH singleton_modules AS (
    SELECT m.course_slug, MIN(m.id::TEXT)::UUID AS module_id
    FROM public.modules m
    GROUP BY m.course_slug
    HAVING COUNT(*) = 1
)
UPDATE public.course_resources r
SET module_id = sm.module_id
FROM singleton_modules sm
WHERE r.course_slug = sm.course_slug
  AND r.module_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_course_resources_module_id
ON public.course_resources(module_id);

CREATE INDEX IF NOT EXISTS idx_course_resources_module_order
ON public.course_resources(module_id, order_index);

DROP POLICY IF EXISTS "Admin read course_resources" ON public.course_resources;
CREATE POLICY "Admin read course_resources"
    ON public.course_resources
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

DROP POLICY IF EXISTS "Admin insert course_resources" ON public.course_resources;
CREATE POLICY "Admin insert course_resources"
    ON public.course_resources
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

DROP POLICY IF EXISTS "Admin update course_resources" ON public.course_resources;
CREATE POLICY "Admin update course_resources"
    ON public.course_resources
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    )
    WITH CHECK (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

DROP POLICY IF EXISTS "Admin delete course_resources" ON public.course_resources;
CREATE POLICY "Admin delete course_resources"
    ON public.course_resources
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['instructor', 'admin'])
    );

COMMIT;
