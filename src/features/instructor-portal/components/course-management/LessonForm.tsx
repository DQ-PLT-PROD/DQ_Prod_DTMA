import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, LinkIcon } from 'lucide-react';
import { getSupabaseClient } from '../../lib/dbClient';
import { Toast } from '@/components/ui/Toast';

interface CourseOption {
    id: string;
    title: string;
}

interface ModuleOption {
    id: string;
    title: string;
    course_id: string;
}

export function LessonForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [allModules, setAllModules] = useState<ModuleOption[]>([]);
    const [filteredModules, setFilteredModules] = useState<ModuleOption[]>([]);

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        course_id: '',
        module_id: '', // optional
        order_index: 0,
        duration: 0,
        video_url: '',
        content: '',
        is_preview: false,
    });

    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    useEffect(() => {
        loadDependencyData();
        if (isEditing && id) {
            loadLesson(id);
        }
    }, [id, isEditing]);

    // Update modules when course changes
    useEffect(() => {
        if (formData.course_id) {
            const mods = allModules.filter(m => m.course_id === formData.course_id);
            setFilteredModules(mods);
        } else {
            setFilteredModules([]);
        }
    }, [formData.course_id, allModules]);

    const loadDependencyData = async () => {
        const supabase = getSupabaseClient();
        if (!supabase) return;

        // Load Courses
        const { data: coursesData, error: coursesError } = await supabase
            .from('lms_courses')
            .select('id, title')
            .order('title');

        if (coursesError) console.error('Error loading courses:', coursesError);
        else setCourses(coursesData || []);

        // Load Modules (all for now, optimization: fetch only when course selected if list is huge)
        const { data: modulesData, error: modulesError } = await supabase
            .from('lms_modules')
            .select('id, title, course_id')
            .order('order_index');

        if (modulesError) console.error('Error loading modules:', modulesError);
        else setAllModules(modulesData || []);
    };

    const loadLesson = async (lessonId: string) => {
        setLoading(true);
        const supabase = getSupabaseClient();
        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from('lms_lessons')
                .select('*')
                .eq('id', lessonId)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    title: data.title,
                    description: data.description || '',
                    course_id: data.course_id,
                    module_id: data.module_id || '',
                    order_index: data.order_index || 0,
                    duration: data.duration || 0,
                    video_url: data.video_url || '',
                    content: data.content || '',
                    is_preview: data.is_preview || false
                });
            }
        } catch (error) {
            console.error('Error loading lesson:', error);
            setToast({ type: 'error', message: 'Failed to load lesson details' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.course_id) {
            setToast({ type: 'error', message: 'Title and Course are required' });
            return;
        }

        setLoading(true);
        const supabase = getSupabaseClient();
        if (!supabase) return;

        const payload = {
            ...formData,
            module_id: formData.module_id || null // Ensure null if empty string
        };

        try {
            if (isEditing && id) {
                const { error } = await supabase
                    .from('lms_lessons')
                    .update(payload)
                    .eq('id', id);
                if (error) throw error;
                setToast({ type: 'success', message: 'Lesson updated successfully' });
            } else {
                const { error } = await supabase
                    .from('lms_lessons')
                    .insert([payload]);
                if (error) throw error;
                setToast({ type: 'success', message: 'Lesson created successfully' });
                navigate('/instructor/course-management?tab=lessons');
            }
        } catch (error) {
            console.error('Error saving lesson:', error);
            setToast({ type: 'error', message: 'Failed to save lesson' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/instructor/course-management?tab=lessons')}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        title="Back to Course Management"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditing ? 'Edit Lesson' : 'Create New Lesson'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Create engaging content for your students
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center shadow-sm disabled:opacity-50"
                >
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Lesson'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Lesson Details</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lesson Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Understanding Components"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Brief overview of the lesson..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Video URL (Vimeo/YouTube/Self-hosted)
                            </label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                    <LinkIcon className="h-4 w-4" />
                                </span>
                                <input
                                    type="text"
                                    value={formData.video_url}
                                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://vimeo.com/..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Content / Notes (Markdown supported)
                            </label>
                            <textarea
                                rows={10}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                placeholder="# Lesson Notes..."
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Organization</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.course_id}
                                onChange={(e) => setFormData({ ...formData, course_id: e.target.value, module_id: '' })} // Reset module on course change
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Course</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Module (Optional)
                            </label>
                            <select
                                value={formData.module_id}
                                onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                disabled={!formData.course_id}
                            >
                                <option value="">No Module (Direct to Course)</option>
                                {filteredModules.map((module) => (
                                    <option key={module.id} value={module.id}>
                                        {module.title}
                                    </option>
                                ))}
                            </select>
                            {!formData.course_id && (
                                <p className="mt-1 text-xs text-gray-400">Select a course first</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Order Index
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.order_index}
                                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="is_preview"
                                type="checkbox"
                                checked={formData.is_preview}
                                onChange={(e) => setFormData({ ...formData, is_preview: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_preview" className="ml-2 block text-sm text-gray-900">
                                Allow as Free Preview
                            </label>
                        </div>
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

export default LessonForm;
