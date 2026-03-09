import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    EditIcon,
    TrashIcon,
    PlusIcon,
    SearchIcon,
    HelpCircleIcon,
    GraduationCapIcon,
    BookOpenIcon,
    PlayCircleIcon,
} from 'lucide-react';
import { getSupabaseClient } from '../../lib/dbClient';
import { Toast } from '@/components/ui/Toast';

/* ─── Types ──────────────────────────────────────────────── */

interface Quiz {
    id: string;
    course_slug: string;
    title: string;
    description?: string;
    question?: string;
    options?: any;
    correct_answer?: string;
    explanation?: string;
    order_index?: number;
    course_title?: string;
    module_title?: string;
    lesson_title?: string;
    module_id?: string;
    lesson_id?: string;
    is_published?: boolean;
    question_count?: number;
    created_at?: string;
    updated_at?: string;
}

/* ─── Component ──────────────────────────────────────────── */

export function QuizzesSection() {
    const navigate = useNavigate();

    // Data
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);

    // UI
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    /* ─── Data Loading ───────────────────────────────────── */

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Database connection unavailable');

            // Fetch all data in parallel — quiz_questions(count) gives us the real question count
            const [coursesRes, modulesRes, lessonsRes, quizzesRes] = await Promise.all([
                supabase.from('courses').select('slug, title').order('title'),
                supabase.from('modules').select('*').order('order_index'),
                supabase.from('lessons').select('*').order('order_index'),
                supabase.from('quizzes').select('*, quiz_questions(count)').order('created_at', { ascending: false }),
            ]);

            const coursesData = coursesRes.data || [];
            const modulesData = modulesRes.data || [];
            const lessonsData = lessonsRes.data || [];
            let quizzesData = quizzesRes.data || [];

            // Build lookup maps
            const courseMap = new Map(coursesData.map((c: any) => [c.slug, c.title]));
            const moduleMap = new Map(modulesData.map((m: any) => [m.id, m.title]));
            const lessonMap = new Map(lessonsData.map((l: any) => [l.id, l.title]));

            // Enrich quizzes with titles and question count
            quizzesData = quizzesData.map((q: any) => {
                // Supabase returns quiz_questions as [{count: N}] when using select('*, quiz_questions(count)')
                const qCount = Array.isArray(q.quiz_questions) && q.quiz_questions.length > 0
                    ? q.quiz_questions[0].count
                    : 0;
                return {
                    ...q,
                    course_title: courseMap.get(q.course_slug) || q.course_slug || 'Unknown Course',
                    module_title: q.module_id ? moduleMap.get(q.module_id) || null : null,
                    lesson_title: q.lesson_id ? lessonMap.get(q.lesson_id) || null : null,
                    question_count: qCount,
                };
            });

            setQuizzes(quizzesData);
        } catch (error: unknown) {
            console.error('Error loading data:', error);
            setQuizzes([]);
        } finally {
            setLoading(false);
        }
    };

    /* ─── Delete ────────────────────────────────────────── */

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this quiz?')) return;

        try {
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Database connection unavailable');

            const { error } = await supabase.from('quizzes').delete().eq('id', id);
            if (error) throw error;

            setToast({ type: 'success', message: 'Quiz deleted successfully' });
            loadAllData();
        } catch (error: unknown) {
            console.error('Error deleting quiz:', error);
            const message = error instanceof Error ? error.message : 'Failed to delete quiz';
            setToast({ type: 'error', message });
        }
    };

    /* ─── Derived / filtered data ────────────────────────── */

    const filteredQuizzes = useMemo(() => {
        if (!searchQuery) return quizzes;

        const q = searchQuery.toLowerCase();
        return quizzes.filter(quiz =>
            quiz.title?.toLowerCase().includes(q) ||
            quiz.course_title?.toLowerCase().includes(q) ||
            quiz.course_slug?.toLowerCase().includes(q) ||
            quiz.question?.toLowerCase().includes(q)
        );
    }, [quizzes, searchQuery]);

    /* ─── Loading State ──────────────────────────────────── */

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--md-primary)] mx-auto"></div>
                    <p className="mt-3 text-sm text-gray-500">Loading quizzes...</p>
                </div>
            </div>
        );
    }

    /* ─── Main Render ────────────────────────────────────── */

    return (
        <div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <HelpCircleIcon className="h-5 w-5 text-[var(--md-primary)]" />
                                All Quizzes
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'zes' : ''} found
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/instructor/course-management/quiz/new')}
                            className="px-4 py-2 bg-[var(--md-primary)] hover:bg-[var(--md-primary-dark,#5b21b6)] text-white rounded-lg flex items-center text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                        >
                            <PlusIcon className="h-4 w-4 mr-1.5" />
                            Add Quiz
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)]/30 focus:border-[var(--md-primary)] sm:text-sm bg-white transition-all"
                            placeholder="Search quizzes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Quiz Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Scope</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Questions</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredQuizzes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                                <HelpCircleIcon className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">
                                                    {searchQuery ? 'No quizzes match your search' : 'No quizzes yet'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {searchQuery
                                                        ? 'Try a different search term'
                                                        : 'Get started by adding a quiz'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredQuizzes.map((quiz) => (
                                    <tr key={quiz.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-[var(--md-primary)]/10 flex items-center justify-center flex-shrink-0">
                                                    <HelpCircleIcon className="h-4 w-4 text-[var(--md-primary)]" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{quiz.title}</span>
                                            </div>
                                        </td>
                                        {/* Scope column */}
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap items-center gap-1">
                                                <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                                                    <GraduationCapIcon className="h-3 w-3" />
                                                    {quiz.course_title}
                                                </span>
                                                {quiz.module_title && (
                                                    <>
                                                        <span className="text-gray-400 text-[10px]">›</span>
                                                        <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                                            <BookOpenIcon className="h-3 w-3" />
                                                            {quiz.module_title}
                                                        </span>
                                                    </>
                                                )}
                                                {quiz.lesson_title && (
                                                    <>
                                                        <span className="text-gray-400 text-[10px]">›</span>
                                                        <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-100">
                                                            <PlayCircleIcon className="h-3 w-3" />
                                                            {quiz.lesson_title}
                                                        </span>
                                                    </>
                                                )}
                                                {!quiz.module_id && !quiz.lesson_id && (
                                                    <span className="text-[10px] text-gray-400 italic ml-1">(course-level)</span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Status badge */}
                                        <td className="px-4 py-3">
                                            {quiz.is_published ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                    Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600 tabular-nums">
                                                {quiz.question_count !== undefined && quiz.question_count > 0
                                                    ? `${quiz.question_count} question${quiz.question_count !== 1 ? 's' : ''}`
                                                    : quiz.question
                                                        ? '1 question'
                                                        : <span className="text-gray-400">—</span>
                                                }
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {quiz.created_at
                                                ? new Date(quiz.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })
                                                : '—'
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => navigate(`/instructor/course-management/quiz/${quiz.id}`)}
                                                    className="p-1.5 rounded-md hover:bg-[var(--md-primary)]/10 text-[var(--md-primary)] transition-colors"
                                                    title="Edit"
                                                >
                                                    <EditIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(quiz.id)}
                                                    className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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

export default QuizzesSection;
