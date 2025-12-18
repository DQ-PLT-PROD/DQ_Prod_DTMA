-- Migration: Add quizzes table for course assessments
-- Run this after 002_add_lessons_table.sql

-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    order_index NUMERIC NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of {id, text} objects
    correct_answer TEXT NOT NULL, -- ID of the correct option
    explanation TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_quizzes_course FOREIGN KEY (course_slug) 
        REFERENCES public.courses(slug) ON DELETE CASCADE
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_quizzes_course_slug ON public.quizzes(course_slug);
CREATE INDEX IF NOT EXISTS idx_quizzes_order ON public.quizzes(course_slug, order_index);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read Access
CREATE POLICY "Public Read Access: quizzes" ON public.quizzes
FOR SELECT USING (true);
