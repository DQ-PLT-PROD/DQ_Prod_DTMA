import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, SettingsIcon, EyeIcon, ListIcon, FileTextIcon, BookOpenIcon, PlayCircleIcon, GraduationCapIcon, CheckCircleIcon, XCircleIcon, RotateCcwIcon, ClockIcon } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';
import { getSupabaseClient } from '../lib/dbClient';
import { Quiz, QuizQuestion } from '@/types/dtma-lms';
import { instructorApi } from '@/lib/api/instructorApiClient';

// Sub-components
import { QuestionList } from '../components/course-management/quiz-editor/QuestionList';
import { QuestionEditor } from '../components/course-management/quiz-editor/QuestionEditor';
import { QuizPreview } from '../components/course-management/quiz-editor/QuizPreview';

interface ScopeModule { id: string; title: string; order_index: number; }
interface ScopeLesson { id: string; title: string; order_index: number; module_id?: string; }

export function QuizEditor() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const isEditing = id && id !== 'new';

    // Initial scope from URL (for new quizzes)
    const initialCourseSlug = searchParams.get('course') || '';
    const initialModuleId = searchParams.get('module') || '';
    const initialLessonId = searchParams.get('lesson') || '';

    // State
    const [activeTab, setActiveTab] = useState<'details' | 'questions' | 'settings' | 'preview'>('details');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    const [quiz, setQuiz] = useState<Partial<Quiz>>({
        title: '',
        description: '',
        courseSlug: initialCourseSlug,
        moduleId: initialModuleId || undefined,
        lessonId: initialLessonId || undefined,
        passingScore: 80,
        timeLimitMinutes: 0,
        maxAttempts: 0,
        isPublished: false,
        shuffleQuestions: false,
        hideAnswers: false,
        questions: []
    });

    // Scope selector data
    const [allCourses, setAllCourses] = useState<{ slug: string; title: string }[]>([]);
    const [allModules, setAllModules] = useState<ScopeModule[]>([]);
    const [allLessons, setAllLessons] = useState<ScopeLesson[]>([]);

    // Question Editing State
    const [isEditingQuestion, setIsEditingQuestion] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | undefined>(undefined);

    // Load courses, modules, lessons for scope selector
    useEffect(() => {
        loadScopeData();
    }, []);

    useEffect(() => {
        if (isEditing && id) {
            loadQuiz(id);
        }
    }, [id, isEditing]);

    // Unsaved changes warning
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (saving) return; // Don't warn if currently saving
            // In a real app we'd compare 'quiz' against a 'initialQuiz' state to detect dirty.
            // For now, we'll just warn if we have a title (indicating some work done) and not saving.
            // A better way is strictly tracking 'isDirty'.
            // Simpler: Just rely on browser 'Leave site?' dialog if form is touched.
            // React Router v6 'useBlocker' is the way, but requires data router.
            // We'll stick to native handling for refresh/tab close.
        };
        // window.addEventListener('beforeunload', handleBeforeUnload);
        // return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [saving]);

    // Check dirty state on back button
    const handleBack = () => {
        // Simple check: if we have changes, confirm.
        // For this MVP, we will just navigate back to preserve context.
        // In fully robust app: compare current 'quiz' with 'loadedQuiz'.
        navigate(-1); // Go back to preserve history (and scope context)
    };

    const loadScopeData = async () => {
        try {
            const supabase = getSupabaseClient();
            if (!supabase) return;
            const [coursesRes, modulesRes, lessonsRes] = await Promise.all([
                supabase.from('courses').select('slug, title').order('title'),
                supabase.from('modules').select('id, title, order_index, course_slug').order('order_index'),
                supabase.from('lessons').select('id, title, order_index, module_id, course_slug').order('order_index'),
            ]);
            setAllCourses(coursesRes.data || []);
            setAllModules(modulesRes.data || []);
            setAllLessons(lessonsRes.data || []);
        } catch (e) {
            console.error('Failed to load scope data:', e);
        }
    };

    // Filtered modules/lessons based on selected course slug
    const courseScopedModules = useMemo(() => {
        if (!quiz.courseSlug) return [];
        return (allModules as any[]).filter((m: any) => m.course_slug === quiz.courseSlug);
    }, [allModules, quiz.courseSlug]);

    const moduleScopedLessons = useMemo(() => {
        if (!quiz.moduleId) return [];
        return allLessons.filter((l: any) => l.module_id === quiz.moduleId);
    }, [allLessons, quiz.moduleId]);

    const loadQuiz = async (quizId: string) => {
        try {
            setLoading(true);
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Database connection unavailable');

            // Fetch Quiz
            const { data: quizData, error: quizError } = await supabase
                .from('quizzes')
                .select('*')
                .eq('id', quizId)
                .single();

            if (quizError) throw quizError;

            // Fetch Questions
            const { data: questionsData, error: questionsError } = await supabase
                .from('quiz_questions')
                .select('*')
                .eq('quiz_id', quizId)
                .order('order_index');

            if (questionsError && questionsError.code !== '42P01') {
                console.error('Error fetching questions:', questionsError);
            }

            const questions: QuizQuestion[] = (questionsData || []).map((q: any) => ({
                id: q.id,
                quizId: q.quiz_id,
                question: q.question,
                type: q.type,
                options: q.options,
                correctAnswer: q.correct_answer,
                explanation: q.explanation,
                orderIndex: q.order_index
            }));

            setQuiz({
                ...quizData,
                courseSlug: quizData.course_slug,
                moduleId: quizData.module_id || undefined,
                lessonId: quizData.lesson_id || undefined,
                passingScore: quizData.passing_score ?? 80,
                timeLimitMinutes: quizData.time_limit_minutes ?? 0,
                maxAttempts: quizData.max_attempts ?? 0,
                isPublished: quizData.is_published ?? false,
                shuffleQuestions: quizData.shuffle_questions ?? false,
                hideAnswers: quizData.hide_answers ?? false,
                orderIndex: quizData.order_index ?? 0,
                questions: questions
            });

        } catch (error: any) {
            console.error('Error loading quiz:', error);
            setToast({ type: 'error', message: error.message || 'Failed to load quiz' });
        } finally {
            setLoading(false);
        }
    };

    // --- Question Handlers ---

    const handleAddQuestion = () => {
        setCurrentQuestion(undefined);
        setIsEditingQuestion(true);
    };

    const handleEditQuestion = (question: QuizQuestion) => {
        setCurrentQuestion(question);
        setIsEditingQuestion(true);
    };

    const handleDeleteQuestion = (questionId: string) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            const updatedQuestions = (quiz.questions || []).filter(q => q.id !== questionId);
            setQuiz({ ...quiz, questions: updatedQuestions });

            // Note: In a real app we might want to track deleted IDs to remove from DB on save,
            // or delete immediately. For now, we'll rely on the "Save Quiz" (or separate questions save) logic.
            // A hybrid approach: if it has a real ID (from DB), maybe mark for deletion or delete now.
            // To keep it simple: we update local state. The unified save will handle it (by delete+insert or update).
            // Actually, simpler: delete from DB immediately if it exists, or just filter from local state.
            // Let's just update local state and let the user click "Save Quiz".
            // BUT: Implementing full diff-sync on save is complex.
            // Easier: Delete immediately from DB if it has an ID.
            if (!questionId.startsWith('temp-')) {
                // Fire and forget delete or async
                deleteQuestionFromDb(questionId);
            }
        }
    };

    const deleteQuestionFromDb = async (questionId: string) => {
        await instructorApi.deleteQuizQuestion(questionId);
    };

    const handleSaveQuestion = (questionData: QuizQuestion) => {
        // If editing existing
        let updatedQuestions = [...(quiz.questions || [])];

        if (currentQuestion) {
            // Update
            updatedQuestions = updatedQuestions.map(q =>
                q.id === currentQuestion.id ? { ...questionData, id: currentQuestion.id } : q
            );
        } else {
            // Add new
            const newQuestion = {
                ...questionData,
                id: questionData.id || `temp-${Date.now()}`, // Temp ID until saved
                orderIndex: updatedQuestions.length
            };
            updatedQuestions.push(newQuestion);
        }

        setQuiz({ ...quiz, questions: updatedQuestions });
        setIsEditingQuestion(false);
        setCurrentQuestion(undefined);
    };

    const handleCancelQuestion = () => {
        setIsEditingQuestion(false);
        setCurrentQuestion(undefined);
    };

    /** Duplicate a question (creates a copy with a temp ID appended after the original) */
    const handleDuplicateQuestion = useCallback((question: QuizQuestion) => {
        const questions = quiz.questions || [];
        const sourceIndex = questions.findIndex(q => q.id === question.id);
        const duplicate: QuizQuestion = {
            ...question,
            id: `temp-${Date.now()}`,
            question: `${question.question} (copy)`,
            orderIndex: sourceIndex + 1,
        };
        // Insert right after the original
        const updated = [...questions];
        updated.splice(sourceIndex + 1, 0, duplicate);
        // Re-index
        setQuiz({ ...quiz, questions: updated.map((q, i) => ({ ...q, orderIndex: i })) });
    }, [quiz]);

    /** Handle drag-and-drop reorder from QuestionList */
    const handleReorderQuestions = useCallback((reordered: QuizQuestion[]) => {
        setQuiz(prev => ({ ...prev, questions: reordered }));
    }, []);


    // --- Quiz Save Handler ---

    const handleSave = async () => {
        setSaving(true);
        try {
            if (!quiz.title) {
                setToast({ type: 'error', message: 'Quiz title is required' });
                setActiveTab('details');
                setSaving(false);
                return;
            }

            if (!quiz.courseSlug) {
                setToast({ type: 'error', message: 'Course association is required.' });
                setSaving(false);
                return;
            }

            // 1. Upsert Quiz
            const quizPayload: Record<string, unknown> = {
                course_slug: quiz.courseSlug,
                module_id: quiz.moduleId || null,
                lesson_id: quiz.lessonId || null,
                title: quiz.title,
                description: quiz.description,
                passing_score: quiz.passingScore,
                time_limit_minutes: quiz.timeLimitMinutes,
                max_attempts: quiz.maxAttempts,
                is_published: quiz.isPublished,
                shuffle_questions: quiz.shuffleQuestions,
                hide_answers: quiz.hideAnswers ?? false,
                order_index: quiz.orderIndex ?? 0,
                updated_at: new Date().toISOString(),
            };

            if (!isEditing) {
                quizPayload.question = '';
                quizPayload.options = [];
            }

            let quizId = id;

            if (isEditing) {
                const result = await instructorApi.updateQuiz(id!, quizPayload);
                if (!result.ok) throw new Error(result.message);
            } else {
                const result = await instructorApi.createQuiz(quizPayload);
                if (!result.ok) throw new Error(result.message);
                quizId = result.data?.id ?? undefined;
            }

            // 2. Upsert Questions
            if (quiz.questions && quiz.questions.length > 0) {
                for (let index = 0; index < quiz.questions.length; index++) {
                    const q = quiz.questions[index];
                    const qPayload = {
                        quiz_id: quizId,
                        question: q.question,
                        type: q.type,
                        options: q.options,
                        correct_answer: q.correctAnswer,
                        explanation: q.explanation,
                        order_index: index,
                    };

                    if (q.id && !q.id.startsWith('temp-')) {
                        const result = await instructorApi.updateQuizQuestion(q.id, qPayload);
                        if (!result.ok) throw new Error(result.message);
                    } else {
                        const result = await instructorApi.createQuizQuestion(qPayload);
                        if (!result.ok) throw new Error(result.message);
                    }
                }
            }

            // Reload to get fresh IDs
            if (quizId) {
                await loadQuiz(quizId);
                // Also update URL if new
                if (!isEditing) {
                    navigate(`/instructor/course-management/quiz/${quizId}`, { replace: true });
                }
            }

            setToast({ type: 'success', message: 'Quiz saved successfully' });
        } catch (error: any) {
            console.error('Error saving quiz:', error);
            setToast({ type: 'error', message: error.message || 'Failed to save quiz' });
        } finally {
            setSaving(false);
        }
    };

    const SkeletonLoader = () => (
        <div className="px-4 sm:px-6 pt-4 pb-20 bg-gray-50 min-h-screen animate-pulse">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
                    <div className="flex items-center justify-between">
                        <div className="h-8 w-64 bg-gray-200 rounded"></div>
                        <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                    <div className="flex border-b border-gray-100">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="px-6 py-4">
                                <div className="h-4 w-24 bg-gray-100 rounded"></div>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="h-4 w-32 bg-gray-100 rounded"></div>
                        <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
                        <div className="h-4 w-48 bg-gray-100 rounded"></div>
                        <div className="h-32 w-full bg-gray-100 rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <SkeletonLoader />;
    }

    return (
        <div className="px-4 sm:px-6 pt-4 pb-20 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Course Management
                    </button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditing ? 'Edit Quiz' : 'Create Quiz'}
                        </h1>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 bg-[var(--md-primary)] text-white rounded-lg hover:bg-[var(--md-primary-dark)] disabled:opacity-50 flex items-center shadow-sm"
                        >
                            <SaveIcon className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Quiz'}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                    <div className="flex border-b border-gray-100 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'details'
                                ? 'border-[var(--md-primary)] text-[var(--md-primary)] bg-[var(--md-primary)]/5'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <FileTextIcon className="h-4 w-4" />
                            Details
                        </button>
                        <button
                            onClick={() => setActiveTab('questions')}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'questions'
                                ? 'border-[var(--md-primary)] text-[var(--md-primary)] bg-[var(--md-primary)]/5'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <ListIcon className="h-4 w-4" />
                            Questions
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                {quiz.questions?.length || 0}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'settings'
                                ? 'border-[var(--md-primary)] text-[var(--md-primary)] bg-[var(--md-primary)]/5'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <SettingsIcon className="h-4 w-4" />
                            Settings
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'preview'
                                ? 'border-[var(--md-primary)] text-[var(--md-primary)] bg-[var(--md-primary)]/5'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <EyeIcon className="h-4 w-4" />
                            Preview
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'details' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]/20 focus:border-[var(--md-primary)]"
                                        value={quiz.title}
                                        onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                                        placeholder="E.g., Module 1 Assessment"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description / Instructions</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]/20 focus:border-[var(--md-primary)]"
                                        value={quiz.description || ''}
                                        onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                                        placeholder="Instructions for the student..."
                                    />
                                </div>

                                {/* ── Scope Selector (3-level cascade) ── */}
                                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 space-y-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <GraduationCapIcon className="h-4 w-4 text-[var(--md-primary)]" />
                                        <span className="text-sm font-semibold text-gray-800">Content Placement</span>
                                    </div>
                                    <p className="text-xs text-gray-500 -mt-3">Bind this quiz to a specific course, module, and/or lesson.</p>

                                    {/* Course */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                            <GraduationCapIcon className="h-3.5 w-3.5 text-amber-500" />
                                            Course *
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]/20 focus:border-[var(--md-primary)] bg-white"
                                            value={quiz.courseSlug || ''}
                                            onChange={(e) => setQuiz({ ...quiz, courseSlug: e.target.value, moduleId: undefined, lessonId: undefined })}
                                        >
                                            <option value="">— Select a course —</option>
                                            {allCourses.map(c => (
                                                <option key={c.slug} value={c.slug}>{c.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Module */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                            <BookOpenIcon className="h-3.5 w-3.5 text-blue-600" />
                                            Module (optional)
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]/20 focus:border-[var(--md-primary)] bg-white disabled:bg-gray-100 disabled:text-gray-400"
                                            value={quiz.moduleId || ''}
                                            onChange={(e) => setQuiz({ ...quiz, moduleId: e.target.value || undefined, lessonId: undefined })}
                                            disabled={!quiz.courseSlug || courseScopedModules.length === 0}
                                        >
                                            <option value="">— No module (course-level) —</option>
                                            {courseScopedModules.map((m: any) => (
                                                <option key={m.id} value={m.id}>{m.title}</option>
                                            ))}
                                        </select>
                                        {quiz.courseSlug && courseScopedModules.length === 0 && (
                                            <p className="text-[11px] text-gray-400 mt-1">This course has no modules yet.</p>
                                        )}
                                    </div>

                                    {/* Lesson */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                            <PlayCircleIcon className="h-3.5 w-3.5 text-green-600" />
                                            Lesson (optional)
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]/20 focus:border-[var(--md-primary)] bg-white disabled:bg-gray-100 disabled:text-gray-400"
                                            value={quiz.lessonId || ''}
                                            onChange={(e) => setQuiz({ ...quiz, lessonId: e.target.value || undefined })}
                                            disabled={!quiz.moduleId || moduleScopedLessons.length === 0}
                                        >
                                            <option value="">— No lesson (module-level) —</option>
                                            {moduleScopedLessons.map((l: any) => (
                                                <option key={l.id} value={l.id}>{l.title}</option>
                                            ))}
                                        </select>
                                        {quiz.moduleId && moduleScopedLessons.length === 0 && (
                                            <p className="text-[11px] text-gray-400 mt-1">This module has no lessons yet.</p>
                                        )}
                                    </div>

                                    {/* Placement summary */}
                                    {quiz.courseSlug && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-100 rounded-lg p-2.5 mt-1">
                                            <span className="font-medium text-gray-500">Attached to:</span>
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] border border-amber-100">
                                                <GraduationCapIcon className="h-3 w-3" />
                                                {allCourses.find(c => c.slug === quiz.courseSlug)?.title || quiz.courseSlug}
                                            </span>
                                            {quiz.moduleId && (
                                                <>
                                                    <span className="text-gray-400">›</span>
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] border border-blue-100">
                                                        <BookOpenIcon className="h-3 w-3" />
                                                        {courseScopedModules.find((m: any) => m.id === quiz.moduleId)?.title || 'Module'}
                                                    </span>
                                                </>
                                            )}
                                            {quiz.lessonId && (
                                                <>
                                                    <span className="text-gray-400">›</span>
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[11px] border border-green-100">
                                                        <PlayCircleIcon className="h-3 w-3" />
                                                        {moduleScopedLessons.find((l: any) => l.id === quiz.lessonId)?.title || 'Lesson'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'questions' && (
                            <div className="max-w-4xl">
                                {isEditingQuestion ? (
                                    <QuestionEditor
                                        question={currentQuestion}
                                        onSave={handleSaveQuestion}
                                        onCancel={handleCancelQuestion}
                                    />
                                ) : (
                                    <QuestionList
                                        questions={quiz.questions || []}
                                        onAdd={handleAddQuestion}
                                        onEdit={handleEditQuestion}
                                        onDelete={handleDeleteQuestion}
                                        onDuplicate={handleDuplicateQuestion}
                                        onReorder={handleReorderQuestions}
                                    />
                                )}
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6 max-w-xl">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]/20 focus:border-[var(--md-primary)]"
                                        value={quiz.passingScore}
                                        onChange={(e) => setQuiz({ ...quiz, passingScore: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (Minutes)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]/20 focus:border-[var(--md-primary)]"
                                        value={quiz.timeLimitMinutes}
                                        onChange={(e) => setQuiz({ ...quiz, timeLimitMinutes: parseInt(e.target.value) || 0 })}
                                        placeholder="0 for no limit"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Leave as 0 for no time limit.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]/20 focus:border-[var(--md-primary)]"
                                        value={quiz.maxAttempts}
                                        onChange={(e) => setQuiz({ ...quiz, maxAttempts: parseInt(e.target.value) || 0 })}
                                        placeholder="0 for unlimited"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Leave as 0 for unlimited attempts.</p>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="shuffle"
                                        className="h-4 w-4 text-[var(--md-primary)] rounded border-gray-300 focus:ring-[var(--md-primary)]"
                                        checked={quiz.shuffleQuestions}
                                        onChange={(e) => setQuiz({ ...quiz, shuffleQuestions: e.target.checked })}
                                    />
                                    <label htmlFor="shuffle" className="text-sm text-gray-700 font-medium">Shuffle Questions</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="hideAnswers"
                                        className="h-4 w-4 text-[var(--md-primary)] rounded border-gray-300 focus:ring-[var(--md-primary)]"
                                        checked={quiz.hideAnswers}
                                        onChange={(e) => setQuiz({ ...quiz, hideAnswers: e.target.checked })}
                                    />
                                    <div>
                                        <label htmlFor="hideAnswers" className="text-sm text-gray-700 font-medium">Hide Correct Answers</label>
                                        <p className="text-xs text-gray-500">When enabled, students won't see explanations or correct answers after submitting.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="publish"
                                        className="h-4 w-4 text-[var(--md-primary)] rounded border-gray-300 focus:ring-[var(--md-primary)]"
                                        checked={quiz.isPublished}
                                        onChange={(e) => setQuiz({ ...quiz, isPublished: e.target.checked })}
                                    />
                                    <div>
                                        <label htmlFor="publish" className="text-sm text-gray-700 font-medium">Publish Quiz</label>
                                        <p className="text-xs text-gray-500">Published quizzes are visible and accessible to students.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preview' && (
                            <QuizPreview quiz={quiz} />
                        )}
                    </div>
                </div>
            </div>

            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                    isVisible={!!toast}
                />
            )}
        </div>
    );
}

export default QuizEditor;
