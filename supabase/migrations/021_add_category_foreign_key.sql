-- Migration: 021_add_category_foreign_key.sql
-- Description: Fix category_id values and add foreign key from courses.category_id to course_categories.slug

-- Step 1: Fix category_id values that have 'cat-' prefix
UPDATE public.courses
SET category_id = REPLACE(category_id, 'cat-', '')
WHERE category_id LIKE 'cat-%';

-- Step 2: Map any remaining unmapped category_ids to valid slugs
-- Handle specific known mappings
UPDATE public.courses SET category_id = 'economy-4-0' 
WHERE category_id IN ('economy-4-0', 'ECONOMY-4-0', 'Economy 4.0', 'mastering-economy-4-0');

UPDATE public.courses SET category_id = 'digital-cognitive-organization' 
WHERE category_id IN ('digital-cognitive-organization', 'DIGITAL-COGNITIVE-ORGANIZATION', 'building-tomorrows-organisations');

UPDATE public.courses SET category_id = 'digital-business-platform' 
WHERE category_id IN ('digital-business-platform', 'DIGITAL-BUSINESS-PLATFORM', 'mastering-digital-transformation');

UPDATE public.courses SET category_id = 'digital-transformation-2-0' 
WHERE category_id IN ('digital-transformation-2-0', 'DIGITAL-TRANSFORMATION-2-0', 'designing-for-the-future');

UPDATE public.courses SET category_id = 'digital-worker-workspace' 
WHERE category_id IN ('digital-worker-workspace', 'DIGITAL-WORKER-WORKSPACE', 'architecting-change');

UPDATE public.courses SET category_id = 'digital-accelerators-tools' 
WHERE category_id IN ('digital-accelerators-tools', 'DIGITAL-ACCELERATORS-TOOLS', 'empowering-change');

-- Step 3: Set any remaining invalid category_ids to NULL (to allow FK constraint)
UPDATE public.courses
SET category_id = NULL
WHERE category_id IS NOT NULL
  AND category_id NOT IN (SELECT slug FROM public.course_categories);

-- Step 4: Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'courses_category_id_fkey'
          AND conrelid = 'public.courses'::regclass
    ) THEN
        ALTER TABLE public.courses
        ADD CONSTRAINT courses_category_id_fkey
        FOREIGN KEY (category_id)
        REFERENCES public.course_categories (slug)
        ON UPDATE CASCADE
        ON DELETE SET NULL;
    END IF;
END $$;

-- Step 5: Create index for performance
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON public.courses(category_id);
