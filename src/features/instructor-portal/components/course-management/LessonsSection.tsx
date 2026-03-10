import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditIcon, PlusIcon, SearchIcon, TrashIcon } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';
import { useAdminAuth } from '@/lib/admin-auth';
import { getSupabaseClient } from '../../lib/dbClient';
import { instructorApi } from '@/lib/api/instructorApiClient';

interface ModuleOption {
    id: string;
    title: string;
    course_slug: string;
}

interface LessonRow {
    id: string;
    module_id: string | null;
    title: string;
    type: string;
    order_index: number;
    estimated_duration_minutes: number | null;
    duration_sec: number | null;
    video_url: string | null;
    module_title: string;
}

function formatMinutes(estimatedMinutes: number | null, durationSeconds: number | null) {
    if (estimatedMinutes != null) {
        return `${estimatedMinutes} min`;
    }
    if (durationSeconds != null) {
        return `${Math.max(1, Math.round(durationSeconds / 60))} min`;
    }
    return '-';
}

export function LessonsSection() {
    const navigate = useNavigate();
    const { ability } = useAdminAuth();
    const [lessons, setLessons] = useState<LessonRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const canCreateLesson = ability.can('create', 'Lesson');
    const canUpdateLesson = ability.can('update', 'Lesson');
    const canDeleteLesson = ability.can('delete', 'Lesson');

    useEffect(() => {
        void loadLessons();
    }, []);

    const loadLessons = async () => {
        try {
            setLoading(true);
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Database connection unavailable');

            const [{ data: lessonData, error: lessonError }, { data: moduleData, error: moduleError }] = await Promise.all([
                supabase
                    .from('lessons')
                    .select('id, module_id, title, type, order_index, estimated_duration_minutes, duration_sec, video_url')
                    .order('order_index', { ascending: true }),
                supabase.from('modules').select('id, title, course_slug'),
            ]);

            if (lessonError) throw lessonError;
            if (moduleError) throw moduleError;

            const moduleMap = new Map<string, ModuleOption>();
            ((moduleData as ModuleOption[] | null) ?? []).forEach((module) => {
                moduleMap.set(module.id, module);
            });

            const formattedData = ((lessonData as Array<Omit<LessonRow, 'module_title'>> | null) ?? []).map((lesson) => ({
                ...lesson,
                module_title: lesson.module_id
                    ? moduleMap.get(lesson.module_id)?.title ?? 'Unknown Module'
                    : 'Unassigned module',
            }));

            setLessons(formattedData);
        } catch (error: unknown) {
            console.error('Error loading lessons:', error);
            const message = error instanceof Error ? error.message : 'Failed to load lessons';
            setToast({ type: 'error', message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!canDeleteLesson) {
            setToast({ type: 'error', message: 'You do not have permission to delete lessons.' });
            return;
        }
        if (!confirm('Are you sure you want to delete this lesson?')) return;

        try {
            const result = await instructorApi.deleteLesson(id);
            if (!result.ok) throw new Error(result.message);

            setToast({ type: 'success', message: 'Lesson deleted successfully' });
            await loadLessons();
        } catch (error: unknown) {
            console.error('Error deleting lesson:', error);
            const message = error instanceof Error ? error.message : 'Failed to delete lesson';
            setToast({ type: 'error', message });
        }
    };

    const filteredLessons = lessons.filter((lesson) => {
        const query = searchQuery.toLowerCase();
        return (
            lesson.title.toLowerCase().includes(query) ||
            lesson.module_title.toLowerCase().includes(query) ||
            (lesson.type ?? '').toLowerCase().includes(query)
        );
    });

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--md-primary)] mx-auto" />
                    <p className="mt-2 text-gray-500">Loading lessons...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Lessons</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            if (!canCreateLesson) {
                                setToast({ type: 'error', message: 'You do not have permission to create lessons.' });
                                return;
                            }
                            navigate('/instructor/course-management/lesson/new');
                        }}
                        disabled={!canCreateLesson}
                        className="px-4 py-2 bg-[var(--md-primary)] hover:bg-[var(--md-primary-hover)] text-white rounded-md flex items-center text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Lesson
                    </button>
                </div>
            </div>

            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)] sm:text-sm"
                        placeholder="Search lessons or modules..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Lesson Title</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Video</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Order</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Duration</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLessons.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                                    {searchQuery ? 'No lessons found matching your search' : 'No lessons yet. Create your first one!'}
                                </td>
                            </tr>
                        ) : (
                            filteredLessons.map((lesson) => (
                                <tr key={lesson.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                                        <div className="text-xs text-gray-500">{lesson.module_title}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Video
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{lesson.order_index ?? '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {formatMinutes(lesson.estimated_duration_minutes, lesson.duration_sec)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-1">
                                            {canUpdateLesson && (
                                                <button
                                                    onClick={() => navigate(`/instructor/course-management/lesson/${lesson.id}`)}
                                                    className="p-1.5 text-[var(--md-primary)] hover:bg-gray-100 rounded"
                                                    title="Edit"
                                                >
                                                    <EditIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                            {canDeleteLesson && (
                                                <button
                                                    onClick={() => void handleDelete(lesson.id)}
                                                    className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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

export default LessonsSection;
