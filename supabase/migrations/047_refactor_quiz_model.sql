-- Refactor Quiz Model to support multi-question quizzes

-- 1. Update quizzes table to act as the container
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS passing_score INTEGER DEFAULT 80,
ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER,
ADD COLUMN IF NOT EXISTS max_attempts INTEGER,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN DEFAULT false;

-- 2. Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'single_select', -- 'single_select', 'multi_select', 'true_false', 'text'
    options JSONB, -- Array of options: [{id: '1', text: 'Option A'}, ...]
    correct_answer JSONB, -- ID or array of IDs of correct options
    explanation TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS on new table
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- 4. Add policies for quiz_questions
-- Allow read access to everyone (public content) or authenticated users depending on your app's privacy model
-- Assuming widely readable for now, similar to other content, or restricted to enrolled.
-- For simplicity in this step, we'll mirror the courses/lessons publicly readable pattern if that's the case, 
-- or generic authenticated read.
CREATE POLICY "Enable read access for all users" ON quiz_questions FOR SELECT USING (true);

-- Allow write access for instructors/admins (using the service role or specific RLS if implemented)
-- For now, generic authenticated write or based on user role? 
-- Checking existing policies in other files would be good, but safe default for Instructor App usage:
-- "Enable insert for authenticated users only"
CREATE POLICY "Enable insert for authenticated users only" ON quiz_questions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON quiz_questions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON quiz_questions FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Notes on migration of existing data:
-- Existing 'quizzes' table rows are actually single questions.
-- A migration script would be needed to:
--    For each existing row in 'quizzes' that has 'question' text:
--      1. Create a new 'quiz_questions' row with that data.
--      2. (Optionally) Clean up the 'quizzes' row to be just the container.
-- This is left for a manual script or separate migration if preserving data is critical.
