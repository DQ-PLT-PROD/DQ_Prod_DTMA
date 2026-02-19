-- Disable RLS on quizzes and quiz_questions to allow instructor edits
-- Mirrors pattern from migration 046 (lessons and modules)

ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions DISABLE ROW LEVEL SECURITY;
