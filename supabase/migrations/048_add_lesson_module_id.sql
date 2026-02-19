-- Migration: 048_add_lesson_module_id.sql
-- Description: Add optional module_id to lessons so a lesson can be assigned to a module or directly to a course.

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
