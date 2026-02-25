import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    EditIcon,
    TrashIcon,
    PlusIcon,
    SearchIcon,
    HelpCircleIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    GraduationCapIcon,
    BookOpenIcon,
    PlayCircleIcon,
    FolderIcon,
    XIcon,
    LayersIcon,
    FilterIcon,
    ListIcon
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

interface Course {
    slug: string;
    title: string;
}

interface Module {
    id: string;
    course_slug: string;
    title: string;
    order_index: number;
}

interface Lesson {
    id: string;
    course_slug: string;
    title: string;
    type: string;
    order_index: number;
    module_id?: string;
}

/** The content node the user selected to scope quizzes */
type ScopeLevel = 'all' | 'course' | 'module' | 'lesson';

interface ContentScope {
    level: ScopeLevel;
    courseSlug?: string;
    courseTitle?: string;
    moduleId?: string;
    moduleTitle?: string;
    lessonId?: string;
    lessonTitle?: string;
}

/* ─── Component ──────────────────────────────────────────── */

export function QuizzesSection() {
    const navigate = useNavigate();

    // Data
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);

    // UI
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    // Content tree expansion state
    const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    // Scope selection
    const [scope, setScope] = useState<ContentScope>({ level: 'all' });
    const [searchParams, setSearchParams] = useSearchParams();

    // View mode: 'tree' (hierarchical browser) or 'flat' (legacy table)
    const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');

    /* ─── Sync URL with Scope ────────────────────────────── */

    // On mount or when data loads, restore scope from URL
    useEffect(() => {
        if (loading || courses.length === 0) return;

        const scopeType = searchParams.get('scope');
        const scopeId = searchParams.get('scopeId');

        if (!scopeType || !scopeId) {
            // Default to 'all' if no params, but only if we haven't set a scope yet (or it's 'all')
            if (scope.level === 'all' && !searchParams.has('scope')) {
                // No op
            }
            return;
        }

        let newScope: ContentScope | null = null;

        if (scopeType === 'course') {
            const c = courses.find(c => c.slug === scopeId);
            if (c) newScope = { level: 'course', courseSlug: c.slug, courseTitle: c.title };
        } else if (scopeType === 'module') {
            const m = modules.find(m => m.id === scopeId);
            if (m) {
                const c = courses.find(c => c.slug === m.course_slug);
                newScope = {
                    level: 'module',
                    courseSlug: m.course_slug,
                    courseTitle: c?.title,
                    moduleId: m.id,
                    moduleTitle: m.title
                };
            }
        } else if (scopeType === 'lesson') {
            const l = lessons.find(l => l.id === scopeId);
            if (l) {
                const m = modules.find(m => m.id === l.module_id);
                const c = courses.find(c => c.slug === l.course_slug);
                newScope = {
                    level: 'lesson',
                    courseSlug: l.course_slug,
                    courseTitle: c?.title,
                    moduleId: l.module_id,
                    moduleTitle: m?.title,
                    lessonId: l.id,
                    lessonTitle: l.title
                };
            }
        }

        if (newScope) {
            setScope(newScope);

            // Auto-expand tree path
            if (newScope.courseSlug) {
                setExpandedCourses(prev => new Set(prev).add(newScope.courseSlug!));
            }
            if (newScope.moduleId) {
                setExpandedModules(prev => new Set(prev).add(newScope.moduleId!));
            }
        }
    }, [loading, courses, modules, lessons, searchParams]);

    /** Helper to update scope and URL */
    const updateScope = (newScope: ContentScope) => {
        setScope(newScope);

        const params = new URLSearchParams(searchParams);
        if (newScope.level === 'all') {
            params.delete('scope');
            params.delete('scopeId');
        } else if (newScope.level === 'course') {
            params.set('scope', 'course');
            params.set('scopeId', newScope.courseSlug!);
        } else if (newScope.level === 'module') {
            params.set('scope', 'module');
            params.set('scopeId', newScope.moduleId!);
        } else if (newScope.level === 'lesson') {
            params.set('scope', 'lesson');
            params.set('scopeId', newScope.lessonId!);
        }
        setSearchParams(params, { replace: true });
    };

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

            setCourses(coursesData);
            setModules(modulesData);
            setLessons(lessonsData);
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

    /* ─── Tree interaction helpers ───────────────────────── */

    const toggleCourse = (slug: string) => {
        setExpandedCourses(prev => {
            const next = new Set(prev);
            if (next.has(slug)) next.delete(slug);
            else next.add(slug);
            return next;
        });
    };

    const toggleModule = (id: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectScope = (newScope: ContentScope) => {
        setScope(newScope);
    };

    const clearScope = () => {
        updateScope({ level: 'all' });
    };

    /* ─── Derived / filtered data ────────────────────────── */

    const scopedQuizzes = useMemo(() => {
        let filtered = quizzes;

        // Apply scope filter — STRICT matching by hierarchy ID
        switch (scope.level) {
            case 'course':
                filtered = filtered.filter(q => q.course_slug === scope.courseSlug);
                break;
            case 'module':
                // Strict: only quizzes attached to this specific module
                filtered = filtered.filter(q => q.module_id === scope.moduleId);
                break;
            case 'lesson':
                // Strict: only quizzes attached to this specific lesson
                filtered = filtered.filter(q => q.lesson_id === scope.lessonId);
                break;
        }

        // Apply search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(quiz =>
                quiz.title?.toLowerCase().includes(q) ||
                quiz.course_title?.toLowerCase().includes(q) ||
                quiz.course_slug?.toLowerCase().includes(q) ||
                quiz.question?.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [quizzes, scope, searchQuery]);

    /** Count quizzes per course slug */
    const quizCountByCourse = useMemo(() => {
        const map = new Map<string, number>();
        quizzes.forEach(q => {
            map.set(q.course_slug, (map.get(q.course_slug) || 0) + 1);
        });
        return map;
    }, [quizzes]);

    /** Count quizzes per module_id */
    const quizCountByModule = useMemo(() => {
        const map = new Map<string, number>();
        quizzes.forEach(q => {
            if (q.module_id) map.set(q.module_id, (map.get(q.module_id) || 0) + 1);
        });
        return map;
    }, [quizzes]);

    /** Count quizzes per lesson_id */
    const quizCountByLesson = useMemo(() => {
        const map = new Map<string, number>();
        quizzes.forEach(q => {
            if (q.lesson_id) map.set(q.lesson_id, (map.get(q.lesson_id) || 0) + 1);
        });
        return map;
    }, [quizzes]);

    /** Count unassigned quizzes per course (no module or lesson binding) */
    const unassignedQuizCountByCourse = useMemo(() => {
        const map = new Map<string, number>();
        quizzes.forEach(q => {
            if (!q.module_id && !q.lesson_id) {
                map.set(q.course_slug, (map.get(q.course_slug) || 0) + 1);
            }
        });
        return map;
    }, [quizzes]);

    /** Modules grouped by course_slug */
    const modulesByCourse = useMemo(() => {
        const map = new Map<string, Module[]>();
        modules.forEach(m => {
            const arr = map.get(m.course_slug) || [];
            arr.push(m);
            map.set(m.course_slug, arr);
        });
        return map;
    }, [modules]);

    /** Lessons grouped by course_slug */
    const lessonsByCourse = useMemo(() => {
        const map = new Map<string, Lesson[]>();
        lessons.forEach(l => {
            const arr = map.get(l.course_slug) || [];
            arr.push(l);
            map.set(l.course_slug, arr);
        });
        return map;
    }, [lessons]);

    /** Lessons grouped by module_id (if available) */
    const lessonsByModule = useMemo(() => {
        const map = new Map<string, Lesson[]>();
        lessons.forEach(l => {
            if (!l.module_id) return;
            const arr = map.get(l.module_id) || [];
            arr.push(l);
            map.set(l.module_id, arr);
        });

        map.forEach((arr) => {
            arr.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
        });

        return map;
    }, [lessons]);

    /* ─── Breadcrumb ─────────────────────────────────────── */

    const renderBreadcrumb = () => {
        if (scope.level === 'all') return null;

        const crumbs: { label: string; icon: React.ReactNode; onClick?: () => void }[] = [];

        crumbs.push({
            label: 'All Content',
            icon: <LayersIcon className="h-3.5 w-3.5" />,
            onClick: clearScope,
        });

        if (scope.courseTitle) {
            crumbs.push({
                label: scope.courseTitle,
                icon: <GraduationCapIcon className="h-3.5 w-3.5" />,
                onClick: scope.level !== 'course'
                    ? () => selectScope({ level: 'course', courseSlug: scope.courseSlug, courseTitle: scope.courseTitle })
                    : undefined,
            });
        }

        if (scope.moduleTitle) {
            crumbs.push({
                label: scope.moduleTitle,
                icon: <BookOpenIcon className="h-3.5 w-3.5" />,
                onClick: scope.level !== 'module'
                    ? () =>
                        selectScope({
                            level: 'module',
                            courseSlug: scope.courseSlug,
                            courseTitle: scope.courseTitle,
                            moduleId: scope.moduleId,
                            moduleTitle: scope.moduleTitle,
                        })
                    : undefined,
            });
        }

        if (scope.lessonTitle) {
            crumbs.push({
                label: scope.lessonTitle,
                icon: <PlayCircleIcon className="h-3.5 w-3.5" />,
            });
        }

        return (
            <div className="flex items-center gap-1.5 text-xs flex-wrap mb-3">
                {crumbs.map((crumb, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && <ChevronRightIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />}
                        <button
                            onClick={crumb.onClick}
                            disabled={!crumb.onClick}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${crumb.onClick
                                ? 'text-[var(--md-primary)] hover:bg-[var(--md-primary)]/10 cursor-pointer'
                                : 'text-gray-700 font-semibold cursor-default'
                                }`}
                        >
                            {crumb.icon}
                            <span className="max-w-[140px] truncate">{crumb.label}</span>
                        </button>
                    </React.Fragment>
                ))}

                {/* Clear scope button */}
                <button
                    onClick={clearScope}
                    className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
                    title="Clear filter"
                >
                    <XIcon className="h-3 w-3" />
                    Clear
                </button>
            </div>
        );
    };

    /* ─── Content Tree (Sidebar) ─────────────────────────── */

    const renderContentTree = () => {
        return (
            <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tree Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-[var(--md-primary)]/10 to-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FolderIcon className="h-4 w-4 text-[var(--md-primary)]" />
                            <span className="text-sm font-semibold text-gray-900">Content Browser</span>
                        </div>
                        {scope.level !== 'all' && (
                            <button
                                onClick={clearScope}
                                className="text-xs text-[var(--md-primary)] hover:underline"
                            >
                                Show All
                            </button>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1">Select where to attach quizzes</p>
                </div>

                {/* "All Quizzes" option */}
                <div
                    onClick={() => updateScope({ level: 'all' })}
                    className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-colors border-b border-gray-200 ${scope.level === 'all'
                        ? 'bg-[var(--md-primary)]/10 text-[var(--md-primary)] font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <LayersIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">All Quizzes</span>
                    <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${scope.level === 'all' ? 'bg-[var(--md-primary)]/20' : 'bg-gray-200 text-gray-700'
                        }`}>
                        {quizzes.length}
                    </span>
                </div>

                {/* Course Tree */}
                <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
                    {courses.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-gray-500">
                            No courses found. Create a course first.
                        </div>
                    ) : (
                        courses.map(course => {
                            const isExpanded = expandedCourses.has(course.slug);
                            const isSelected = scope.level === 'course' && scope.courseSlug === course.slug;
                            const courseModules = modulesByCourse.get(course.slug) || [];
                            const courseLessons = lessonsByCourse.get(course.slug) || [];
                            const moduleIds = new Set(courseModules.map(mod => mod.id));
                            const unassignedLessons = courseLessons.filter((lesson) =>
                                !lesson.module_id || !moduleIds.has(lesson.module_id)
                            );
                            const quizCount = quizCountByCourse.get(course.slug) || 0;

                            return (
                                <div key={course.slug}>
                                    {/* Course Row */}
                                    <div
                                        className={`flex items-center gap-1 px-3 py-2.5 cursor-pointer transition-all group ${isSelected
                                            ? 'bg-[var(--md-primary)]/10 text-[var(--md-primary)]'
                                            : 'text-gray-800 hover:bg-gray-100'
                                            }`}
                                    >
                                        {/* Expand toggle */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleCourse(course.slug); }}
                                            className="p-0.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
                                        >
                                            {isExpanded
                                                ? <ChevronDownIcon className="h-3.5 w-3.5" />
                                                : <ChevronRightIcon className="h-3.5 w-3.5" />
                                            }
                                        </button>

                                        {/* Course label */}
                                        <div
                                            className="flex items-center gap-1.5 flex-1 min-w-0"
                                            onClick={() => {
                                                toggleCourse(course.slug);
                                                if (!isSelected) {
                                                    const newScope: ContentScope = {
                                                        level: 'course',
                                                        courseSlug: course.slug,
                                                        courseTitle: course.title
                                                    };
                                                    updateScope(newScope);
                                                }
                                            }}
                                        >
                                            <GraduationCapIcon className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-[var(--md-primary)]' : 'text-amber-500'}`} />
                                            <span className={`text-sm truncate ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                                                {course.title}
                                            </span>
                                        </div>

                                        {/* Quiz count badge */}
                                        {quizCount > 0 && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-[var(--md-primary)]/20 text-[var(--md-primary)]' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {quizCount}
                                            </span>
                                        )}
                                    </div>

                                    {/* Expanded: Modules & Lessons */}
                                    {isExpanded && (
                                        <div className="bg-gray-50">
                                            {courseModules.length > 0 && (
                                                courseModules.map(mod => {
                                                    const isModExpanded = expandedModules.has(mod.id);
                                                    const moduleLessons = lessonsByModule.get(mod.id) || [];
                                                    const isModSelected = scope.level === 'module' && scope.moduleId === mod.id;

                                                    return (
                                                        <div key={mod.id} className="ml-4 border-l border-gray-100 pl-2">
                                                            <div
                                                                className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors text-sm group/mod ${isModSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-600'
                                                                    }`}
                                                                onClick={() => {
                                                                    toggleModule(mod.id);
                                                                    if (!isModSelected) {
                                                                        const newScope: ContentScope = {
                                                                            level: 'module',
                                                                            courseSlug: course.slug,
                                                                            courseTitle: course.title,
                                                                            moduleId: mod.id,
                                                                            moduleTitle: mod.title
                                                                        };
                                                                        updateScope(newScope);
                                                                    }
                                                                }}
                                                            >
                                                                {moduleLessons.length > 0 && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); toggleModule(mod.id); }}
                                                                        className="p-0.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
                                                                    >
                                                                        {isModExpanded
                                                                            ? <ChevronDownIcon className="h-3 w-3" />
                                                                            : <ChevronRightIcon className="h-3 w-3" />
                                                                        }
                                                                    </button>
                                                                )}
                                                                {moduleLessons.length === 0 && <span className="w-4" />}

                                                                <div
                                                                    className="flex items-center gap-1.5 flex-1 min-w-0"
                                                                >
                                                                    <BookOpenIcon className={`h-3.5 w-3.5 flex-shrink-0 ${isModSelected ? 'text-[var(--md-primary)]' : 'text-blue-600'}`} />
                                                                    <span className={`text-xs truncate ${isModSelected ? 'font-semibold' : ''}`}>
                                                                        {mod.title}
                                                                    </span>
                                                                </div>
                                                                {/* Module quiz count badge */}
                                                                {(quizCountByModule.get(mod.id) || 0) > 0 && (
                                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${isModSelected ? 'bg-[var(--md-primary)]/20 text-[var(--md-primary)]' : 'bg-gray-100 text-gray-500'
                                                                        }`}>
                                                                        {quizCountByModule.get(mod.id)}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Lessons under this module */}
                                                            {isModExpanded && moduleLessons.length > 0 && (
                                                                <div>
                                                                    {moduleLessons.map((les: Lesson) => {
                                                                        const isLesSelected = scope.level === 'lesson' && scope.lessonId === les.id;
                                                                        return (
                                                                            <div
                                                                                key={les.id}
                                                                                onClick={() => {
                                                                                    if (!isLesSelected) {
                                                                                        const newScope: ContentScope = {
                                                                                            level: 'lesson',
                                                                                            courseSlug: course.slug,
                                                                                            courseTitle: course.title,
                                                                                            moduleId: mod.id,
                                                                                            moduleTitle: mod.title,
                                                                                            lessonId: les.id,
                                                                                            lessonTitle: les.title,
                                                                                        };
                                                                                        updateScope(newScope);
                                                                                    }
                                                                                }}
                                                                                className={`flex items-center gap-1.5 pl-14 pr-3 py-1.5 cursor-pointer transition-all ${isLesSelected
                                                                                    ? 'bg-[var(--md-primary)]/8 text-[var(--md-primary)]'
                                                                                    : 'text-gray-600 hover:bg-gray-100'
                                                                                    }`}
                                                                            >
                                                                                <PlayCircleIcon className={`h-3 w-3 flex-shrink-0 ${isLesSelected ? 'text-[var(--md-primary)]' : 'text-green-600'}`} />
                                                                                <span className={`text-xs truncate ${isLesSelected ? 'font-semibold' : ''}`}>
                                                                                    {les.title}
                                                                                </span>
                                                                                {/* Lesson quiz count badge */}
                                                                                {(quizCountByLesson.get(les.id) || 0) > 0 && (
                                                                                    <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${isLesSelected ? 'bg-[var(--md-primary)]/20 text-[var(--md-primary)]' : 'bg-gray-100 text-gray-500'
                                                                                        }`}>
                                                                                        {quizCountByLesson.get(les.id)}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}

                                            {/* Lessons not assigned to a module */}
                                            {unassignedLessons.length > 0 && (
                                                <div className="pb-1">
                                                    {courseModules.length > 0 && (
                                                        <div className="pl-8 pr-3 pt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                                                            Lessons
                                                        </div>
                                                    )}
                                                    {unassignedLessons.map((les: Lesson) => {
                                                        const isLesSelected = scope.level === 'lesson' && scope.lessonId === les.id;
                                                        return (
                                                            <div
                                                                key={les.id}
                                                                onClick={() =>
                                                                    selectScope({
                                                                        level: 'lesson',
                                                                        courseSlug: course.slug,
                                                                        courseTitle: course.title,
                                                                        lessonId: les.id,
                                                                        lessonTitle: les.title,
                                                                    })
                                                                }
                                                                className={`flex items-center gap-1.5 pl-10 pr-3 py-1.5 cursor-pointer transition-all ${isLesSelected
                                                                    ? 'bg-[var(--md-primary)]/8 text-[var(--md-primary)]'
                                                                    : 'text-gray-600 hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                <PlayCircleIcon className={`h-3 w-3 flex-shrink-0 ${isLesSelected ? 'text-[var(--md-primary)]' : 'text-green-600'}`} />
                                                                <span className={`text-xs truncate ${isLesSelected ? 'font-semibold' : ''}`}>
                                                                    {les.title}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {courseModules.length === 0 && unassignedLessons.length === 0 && (
                                                <div className="pl-10 pr-3 py-2 text-[11px] text-gray-400 italic">
                                                    No modules or lessons yet
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };

    /* ─── Quiz List (Right Panel) ────────────────────────── */

    const renderQuizList = () => {
        const scopeLabel =
            scope.level === 'all'
                ? 'All Quizzes'
                : scope.level === 'course'
                    ? `Quizzes in "${scope.courseTitle}"`
                    : scope.level === 'module'
                        ? `Quizzes in "${scope.moduleTitle}"`
                        : `Quizzes for "${scope.lessonTitle}"`;

        return (
            <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-gray-100">
                    {renderBreadcrumb()}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <HelpCircleIcon className="h-5 w-5 text-[var(--md-primary)]" />
                                {scopeLabel}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {scopedQuizzes.length} quiz{scopedQuizzes.length !== 1 ? 'zes' : ''} found
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                // Navigate with scope context as query params
                                const params = new URLSearchParams();
                                if (scope.courseSlug) params.set('course', scope.courseSlug);
                                if (scope.moduleId) params.set('module', scope.moduleId);
                                if (scope.lessonId) params.set('lesson', scope.lessonId);
                                const qs = params.toString();
                                navigate(`/instructor/course-management/quiz/new${qs ? `?${qs}` : ''}`);
                            }}
                            className="px-4 py-2 bg-[var(--md-primary)] hover:bg-[var(--md-primary-dark,#5b21b6)] text-white rounded-lg flex items-center text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                        >
                            <PlusIcon className="h-4 w-4 mr-1.5" />
                            Add Quiz{scope.level !== 'all' ? ' Here' : ''}
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
                            {scopedQuizzes.length === 0 ? (
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
                                                        : scope.level !== 'all'
                                                            ? `Create the first quiz for this ${scope.level}`
                                                            : 'Get started by selecting content and adding a quiz'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                scopedQuizzes.map((quiz) => (
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
        );
    };

    /* ─── Loading State ──────────────────────────────────── */

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--md-primary)] mx-auto"></div>
                    <p className="mt-3 text-sm text-gray-500">Loading content hierarchy...</p>
                </div>
            </div>
        );
    }

    /* ─── Main Render ────────────────────────────────────── */

    return (
        <div>
            {/* View mode toggle */}
            <div className="flex items-center justify-end gap-2 mb-3">
                <span className="text-xs text-gray-500">View:</span>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <button
                        onClick={() => setViewMode('tree')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'tree'
                            ? 'bg-white text-[var(--md-primary)] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <FilterIcon className="h-3 w-3" />
                        Content-First
                    </button>
                    <button
                        onClick={() => setViewMode('flat')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'flat'
                            ? 'bg-white text-[var(--md-primary)] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <ListIcon className="h-3 w-3" />
                        Flat List
                    </button>
                </div>
            </div>

            {viewMode === 'tree' ? (
                <div className="flex flex-col lg:flex-row gap-4">
                    {renderContentTree()}
                    {renderQuizList()}
                </div>
            ) : (
                /* Flat list — same quiz list but without the tree sidebar */
                <div>{renderQuizList()}</div>
            )}

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
