BEGIN;

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access: quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admin read quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admin insert quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admin update quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admin delete quizzes" ON public.quizzes;

CREATE POLICY "Admin read quizzes"
    ON public.quizzes
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin insert quizzes"
    ON public.quizzes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin update quizzes"
    ON public.quizzes
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    )
    WITH CHECK (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin delete quizzes"
    ON public.quizzes
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['instructor', 'admin'])
    );

DROP POLICY IF EXISTS "Enable read access for all users" ON public.quiz_questions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.quiz_questions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.quiz_questions;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admin read quiz_questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admin insert quiz_questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admin update quiz_questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admin delete quiz_questions" ON public.quiz_questions;

CREATE POLICY "Admin read quiz_questions"
    ON public.quiz_questions
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin insert quiz_questions"
    ON public.quiz_questions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin update quiz_questions"
    ON public.quiz_questions
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    )
    WITH CHECK (
        public.is_admin_member(auth.uid(), ARRAY['editor', 'instructor', 'admin'])
    );

CREATE POLICY "Admin delete quiz_questions"
    ON public.quiz_questions
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin_member(auth.uid(), ARRAY['instructor', 'admin'])
    );

CREATE OR REPLACE FUNCTION public.normalize_quiz_answer_ids(p_value JSONB)
RETURNS TEXT[]
LANGUAGE SQL
IMMUTABLE
SET search_path = public
AS $$
    SELECT COALESCE(array_agg(DISTINCT value ORDER BY value), ARRAY[]::text[])
    FROM jsonb_array_elements_text(
        CASE
            WHEN p_value IS NULL THEN '[]'::jsonb
            WHEN jsonb_typeof(p_value) = 'array' THEN p_value
            ELSE jsonb_build_array(trim(both '"' FROM p_value::text))
        END
    ) AS elements(value);
$$;

CREATE OR REPLACE FUNCTION public.get_published_module_quiz(p_module_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_module_id UUID;
    v_course_slug TEXT;
    v_session JSONB;
BEGIN
    SELECT m.id, m.course_slug
    INTO v_module_id, v_course_slug
    FROM public.modules m
    WHERE m.slug = p_module_slug
      AND m.status = 'published'
    LIMIT 1;

    IF v_module_id IS NULL THEN
        RETURN NULL;
    END IF;

    WITH candidate_quizzes AS (
        SELECT
            q.*,
            CASE
                WHEN q.module_id = v_module_id THEN 0
                ELSE 1
            END AS scope_rank
        FROM public.quizzes q
        WHERE COALESCE(q.is_published, false) = true
          AND (
              q.module_id = v_module_id
              OR (
                  q.module_id IS NULL
                  AND q.lesson_id IS NULL
                  AND q.course_slug = v_course_slug
              )
          )
    ),
    preferred_scope AS (
        SELECT MIN(scope_rank) AS min_scope_rank
        FROM candidate_quizzes
    ),
    published_quizzes AS (
        SELECT cq.*
        FROM candidate_quizzes cq
        CROSS JOIN preferred_scope ps
        WHERE cq.scope_rank = ps.min_scope_rank
        ORDER BY COALESCE(cq.order_index, 0), cq.created_at, cq.id
    ),
    base_quiz AS (
        SELECT *
        FROM published_quizzes
        LIMIT 1
    ),
    question_rows AS (
        SELECT
            COALESCE(qq.id, q.id) AS question_id,
            q.id AS quiz_id,
            COALESCE(qq.question, q.question) AS question_text,
            COALESCE(qq.type, 'single_select') AS question_type,
            COALESCE(qq.options, q.options, '[]'::jsonb) AS question_options,
            COALESCE(q.order_index, 0) AS quiz_order,
            COALESCE(qq.order_index, 0) AS question_order
        FROM published_quizzes q
        LEFT JOIN public.quiz_questions qq
            ON qq.quiz_id = q.id
        WHERE qq.id IS NOT NULL
           OR (qq.id IS NULL AND q.question IS NOT NULL AND btrim(q.question) <> '')
    )
    SELECT jsonb_build_object(
        'quizId', bq.id,
        'title', COALESCE(bq.title, 'Module Assessment'),
        'description', bq.description,
        'passingScore', COALESCE(bq.passing_score, 80),
        'timeLimitMinutes', COALESCE(bq.time_limit_minutes, 0),
        'maxAttempts', COALESCE(bq.max_attempts, 0),
        'shuffleQuestions', COALESCE(bq.shuffle_questions, false),
        'hideAnswers', COALESCE(bq.hide_answers, false),
        'questions', COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', qr.question_id,
                        'quizId', qr.quiz_id,
                        'question', qr.question_text,
                        'type', qr.question_type,
                        'options', qr.question_options
                    )
                    ORDER BY qr.quiz_order, qr.question_order, qr.question_id
                )
                FROM question_rows qr
            ),
            '[]'::jsonb
        )
    )
    INTO v_session
    FROM base_quiz bq;

    IF v_session IS NULL OR COALESCE(jsonb_array_length(v_session -> 'questions'), 0) = 0 THEN
        RETURN NULL;
    END IF;

    RETURN v_session;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_published_module_quiz(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.evaluate_published_quiz_answer(
    p_question_id UUID,
    p_selected_answer_ids JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_expected_answers JSONB;
    v_explanation TEXT;
    v_hide_answers BOOLEAN := false;
    v_is_correct BOOLEAN := false;
BEGIN
    SELECT
        qq.correct_answer,
        qq.explanation,
        COALESCE(q.hide_answers, false)
    INTO
        v_expected_answers,
        v_explanation,
        v_hide_answers
    FROM public.quiz_questions qq
    INNER JOIN public.quizzes q
        ON q.id = qq.quiz_id
    WHERE qq.id = p_question_id
      AND COALESCE(q.is_published, false) = true
    LIMIT 1;

    IF NOT FOUND THEN
        SELECT
            q.correct_answer,
            q.explanation,
            COALESCE(q.hide_answers, false)
        INTO
            v_expected_answers,
            v_explanation,
            v_hide_answers
        FROM public.quizzes q
        WHERE q.id = p_question_id
          AND COALESCE(q.is_published, false) = true
          AND q.question IS NOT NULL
          AND btrim(q.question) <> ''
        LIMIT 1;
    END IF;

    IF v_expected_answers IS NULL THEN
        RETURN NULL;
    END IF;

    v_is_correct := public.normalize_quiz_answer_ids(v_expected_answers)
        = public.normalize_quiz_answer_ids(
            CASE
                WHEN p_selected_answer_ids IS NULL THEN '[]'::jsonb
                WHEN jsonb_typeof(p_selected_answer_ids) = 'array' THEN p_selected_answer_ids
                ELSE jsonb_build_array(trim(both '"' FROM p_selected_answer_ids::text))
            END
        );

    RETURN jsonb_build_object(
        'questionId', p_question_id,
        'isCorrect', v_is_correct,
        'hideAnswers', v_hide_answers,
        'explanation', CASE
            WHEN v_hide_answers THEN NULL
            ELSE v_explanation
        END
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.evaluate_published_quiz_answer(UUID, JSONB) TO anon, authenticated;

COMMIT;
