import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditIcon, TrashIcon, PlusIcon, SearchIcon, BookOpenIcon } from 'lucide-react';
import { getSupabaseClient } from '../../lib/dbClient';
import { useAdminAuth } from '@/lib/admin-auth';
import { Toast } from '@/components/ui/Toast';

interface Module {
    id: string;
    course_slug: string;
    title: string;
    description?: string;
    order_index: number;
    created_at?: string;
    updated_at?: string;
    course_title?: string; // For display purposes
}

export function ModulesSection() {
    const navigate = useNavigate();
    const { ability } = useAdminAuth();
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const canCreateModule = ability.can('create', 'Module');
    const canUpdateModule = ability.can('update', 'Module');
    const canDeleteModule = ability.can('delete', 'Module');

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        try {
            setLoading(true);
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Database connection unavailable');

            // Fetch modules from the 'modules' table
            const { data, error } = await supabase
                .from('modules')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;

            // Format data - use course_slug as course_title for display
            // Optionally, we can fetch course titles separately if needed
            const formattedData = data?.map((item: any) => ({
                ...item,
                course_title: item.course_slug || 'Unknown Course'
            })) || [];

            // Optionally fetch course titles for better display
            if (formattedData.length > 0) {
                const courseSlugs = [...new Set(formattedData.map(m => m.course_slug))];
                const { data: coursesData } = await supabase
                    .from('courses')
                    .select('slug, title')
                    .in('slug', courseSlugs);

                if (coursesData) {
                    const courseMap = new Map(coursesData.map(c => [c.slug, c.title]));
                    formattedData.forEach(module => {
                        module.course_title = courseMap.get(module.course_slug) || module.course_slug || 'Unknown Course';
                    });
                }
            }

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

            const { error } = await supabase
                .from('modules')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setToast({ type: 'success', message: 'Module deleted successfully' });
            loadModules();
        } catch (error: unknown) {
            console.error('Error deleting module:', error);
            const message = error instanceof Error ? error.message : 'Failed to delete module';
            setToast({ type: 'error', message });
        }
    };

    const filteredModules = modules.filter(module =>
        module.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.course_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.course_slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search modules or courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Course</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Module Title</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Order</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredModules.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                                    {searchQuery ? 'No modules found matching your search' : 'No modules yet. Create your first one!'}
                                </td>
                            </tr>
                        ) : (
                            filteredModules.map((module) => (
                                <tr key={module.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center text-gray-900">
                                            <BookOpenIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="text-sm font-medium">{module.course_title}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{module.title}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{module.order_index}</td>
                                    <td className="px-4 py-3 text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            {canUpdateModule && (
                                                <button
                                                    onClick={() => navigate(`/instructor/course-management/module/${module.id}`)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit"
                                                >
                                                    <EditIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                            {canDeleteModule && (
                                                <button
                                                    onClick={() => handleDelete(module.id)}
                                                    className="text-red-600 hover:text-red-900"
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
