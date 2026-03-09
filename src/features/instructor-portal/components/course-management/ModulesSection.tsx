import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArchiveIcon, EditIcon, PlusIcon, SearchIcon, SendIcon, TrashIcon } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';
import { useAdminAuth } from '@/lib/admin-auth';
import { getSupabaseClient } from '../../lib/dbClient';

interface CourseOption {
    id: string;
    slug: string;
    title: string;
}

interface ModuleRow {
    id: string;
    course_id: string;
    course_slug: string;
    title: string;
    thumbnail_url: string | null;
    order_index: number;
    estimated_duration_minutes: number | null;
    status: string | null;
    course_title: string;
}

function formatMinutes(minutes: number | null) {
    const normalized = Number(minutes ?? 0);
    return `${Number.isFinite(normalized) ? normalized : 0} min`;
}

function formatStatusLabel(status: string | null) {
    const normalized = status ?? 'draft';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function ModulesSection() {
    const navigate = useNavigate();
    const { ability } = useAdminAuth();
    const [modules, setModules] = useState<ModuleRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [postingId, setPostingId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const canCreateModule = ability.can('create', 'Module');
    const canUpdateModule = ability.can('update', 'Module');
    const canDeleteModule = ability.can('delete', 'Module');
    const canPublishModule = ability.can('publish', 'Module');
    const canUnpublishModule = ability.can('unpublish', 'Module');

    useEffect(() => {
        void loadModules();
    }, []);

    const loadModules = async () => {
        try {
            setLoading(true);
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Database connection unavailable');

            const [{ data: moduleData, error: moduleError }, { data: courseData, error: courseError }] = await Promise.all([
                supabase
                    .from('modules')
                    .select('id, course_id, course_slug, title, thumbnail_url, order_index, estimated_duration_minutes, status')
                    .order('order_index', { ascending: true }),
                supabase.from('courses').select('id, slug, title'),
            ]);

            if (moduleError) throw moduleError;
            if (courseError) throw courseError;

            const courseMap = new Map<string, CourseOption>();
            (courseData as CourseOption[] | null)?.forEach((course) => {
                courseMap.set(course.id, course);
                courseMap.set(course.slug, course);
            });

            const formattedData = ((moduleData as Array<Omit<ModuleRow, 'course_title'>> | null) ?? [])
                .map((module) => {
                    const matchedCourse = courseMap.get(module.course_id) ?? courseMap.get(module.course_slug);
                    return {
                        ...module,
                        course_title: matchedCourse?.title ?? module.course_slug ?? 'Unknown Course',
                    };
                })
                .sort((left, right) =>
                    left.course_title.localeCompare(right.course_title) ||
                    left.order_index - right.order_index ||
                    left.title.localeCompare(right.title)
                );

            setModules(formattedData);
        } catch (error: unknown) {
            console.error('Error loading modules:', error);
            const message = error instanceof Error ? error.message : 'Failed to load modules';
            setToast({ type: 'error', message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!canDeleteModule) {
            setToast({ type: 'error', message: 'You do not have permission to delete modules.' });
            return;
        }
        if (!confirm('Are you sure you want to delete this module?')) return;

        try {
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Database connection unavailable');

            const { error } = await supabase.from('modules').delete().eq('id', id);
            if (error) throw error;

            setToast({ type: 'success', message: 'Module deleted successfully' });
            await loadModules();
        } catch (error: unknown) {
            console.error('Error deleting module:', error);
            const message = error instanceof Error ? error.message : 'Failed to delete module';
            setToast({ type: 'error', message });
        }
    };

    const updateModuleStatus = async (module: ModuleRow, status: 'published' | 'draft') => {
        const hasPermission = status === 'published' ? canPublishModule : canUnpublishModule;
        if (!hasPermission) {
            setToast({
                type: 'error',
                message: `You do not have permission to ${status === 'published' ? 'publish' : 'unpublish'} modules.`,
            });
            return;
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            setToast({ type: 'error', message: 'Database connection unavailable' });
            return;
        }

        setPostingId(module.id);
        try {
            const { error } = await supabase
                .from('modules')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', module.id);

            if (error) throw error;

            setToast({
                type: 'success',
                message: status === 'published'
                    ? `"${module.title}" is now published`
                    : `"${module.title}" reverted to draft`,
            });
            await loadModules();
        } catch (error: unknown) {
            console.error('Error updating module status:', error);
            const message = error instanceof Error ? error.message : 'Failed to update module status';
            setToast({ type: 'error', message });
        } finally {
            setPostingId(null);
        }
    };

    const filteredModules = modules.filter((module) => {
        const query = searchQuery.toLowerCase();
        return (
            module.title.toLowerCase().includes(query) ||
            module.course_title.toLowerCase().includes(query) ||
            (module.status ?? 'draft').toLowerCase().includes(query)
        );
    });

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--md-primary)] mx-auto" />
                    <p className="mt-2 text-gray-500">Loading modules...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Modules</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            if (!canCreateModule) {
                                setToast({ type: 'error', message: 'You do not have permission to create modules.' });
                                return;
                            }
                            navigate('/instructor/course-management/module/new');
                        }}
                        disabled={!canCreateModule}
                        className="px-4 py-2 bg-[var(--md-primary)] hover:bg-[var(--md-primary-hover)] text-white rounded-md flex items-center text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Module
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
                        placeholder="Search modules or courses..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Module Title</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Course</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Length</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredModules.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                                    {searchQuery ? 'No modules found matching your search' : 'No modules yet. Create your first one!'}
                                </td>
                            </tr>
                        ) : (
                            filteredModules.map((module) => (
                                <tr key={module.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {module.thumbnail_url ? (
                                                <img
                                                    src={module.thumbnail_url}
                                                    alt={`${module.title} thumbnail`}
                                                    className="h-10 w-10 rounded-lg object-cover shrink-0"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 shrink-0" />
                                            )}
                                            <div className="text-sm font-medium text-gray-900">{module.title}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{module.course_title}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {formatMinutes(module.estimated_duration_minutes)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                module.status === 'published'
                                                    ? 'bg-green-100 text-green-800'
                                                    : module.status === 'archived'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {formatStatusLabel(module.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-1">
                                            {module.status !== 'published' && canPublishModule && (
                                                <button
                                                    onClick={() => void updateModuleStatus(module, 'published')}
                                                    disabled={postingId === module.id}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                                    title="Publish"
                                                >
                                                    {postingId === module.id ? (
                                                        <span className="inline-block h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <SendIcon className="h-4 w-4" />
                                                    )}
                                                </button>
                                            )}
                                            {module.status === 'published' && canUnpublishModule && (
                                                <button
                                                    onClick={() => void updateModuleStatus(module, 'draft')}
                                                    disabled={postingId === module.id}
                                                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded disabled:opacity-50"
                                                    title="Revert to draft"
                                                >
                                                    {postingId === module.id ? (
                                                        <span className="inline-block h-4 w-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <ArchiveIcon className="h-4 w-4" />
                                                    )}
                                                </button>
                                            )}
                                            {canUpdateModule && (
                                                <button
                                                    onClick={() => navigate(`/instructor/course-management/module/${module.id}`)}
                                                    className="p-1.5 text-[var(--md-primary)] hover:bg-gray-100 rounded"
                                                    title="Edit"
                                                >
                                                    <EditIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                            {canDeleteModule && (
                                                <button
                                                    onClick={() => void handleDelete(module.id)}
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

export default ModulesSection;
