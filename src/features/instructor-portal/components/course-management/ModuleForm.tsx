import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { getSupabaseClient } from '../../lib/dbClient';
import { Toast } from '@/components/ui/Toast';

interface CourseOption {
    id: string;
    title: string;
}

export function ModuleForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        course_id: '',
        order_index: 0
    });
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    useEffect(() => {
        loadCourses();
        if (isEditing && id) {
            loadModule(id);
        }
    }, [id, isEditing]);

    const loadCourses = async () => {
        const supabase = getSupabaseClient();
        if (!supabase) return;

        const { data, error } = await supabase
            .from('lms_courses')
            .select('id, title')
            .order('title');

        if (error) {
            console.error('Error loading courses:', error);
            setToast({ type: 'error', message: 'Failed to load courses' });
        } else {
            setCourses(data || []);
        }
    };

    const loadModule = async (moduleId: string) => {
        setLoading(true);
        const supabase = getSupabaseClient();
        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from('lms_modules')
                .select('*')
                .eq('id', moduleId)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    title: data.title,
                    description: data.description || '',
                    course_id: data.course_id,
                    order_index: data.order_index || 0
                });
            }
        } catch (error) {
            console.error('Error loading module:', error);
            setToast({ type: 'error', message: 'Failed to load module details' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || (!formData.course_id && !isEditing)) {
            setToast({ type: 'error', message: 'Title and Course are required' });
            return;
        }

        setLoading(true);
        const supabase = getSupabaseClient();
        if (!supabase) return;

        try {
            if (isEditing && id) {
                const { error } = await supabase
                    .from('lms_modules')
                    .update(formData)
                    .eq('id', id);
                if (error) throw error;
                setToast({ type: 'success', message: 'Module updated successfully' });
            } else {
                const { error } = await supabase
                    .from('lms_modules')
                    .insert([formData]);
                if (error) throw error;
                setToast({ type: 'success', message: 'Module created successfully' });
                // Reset form or navigate back
                navigate('/instructor/course-management?tab=modules');
            }
        } catch (error) {
            console.error('Error saving module:', error);
            setToast({ type: 'error', message: 'Failed to save module' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/instructor/course-management?tab=modules')}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        title="Back to Course Management"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditing ? 'Edit Module' : 'Create New Module'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Organize your course content into logical sections
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-[var(--md-primary)] hover:bg-[var(--md-primary-dark)] text-white rounded-lg flex items-center shadow-sm disabled:opacity-50"
                >
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Module'}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.course_id}
                            onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                        >
                            <option value="">Select a course</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            The course this module belongs to.
                        </p>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Order Index
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.order_index}
                            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Controls the display order of the module.
                        </p>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Module Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                            placeholder="e.g., Introduction to React"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                            placeholder="Briefly describe what students will learn in this module..."
                        />
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

export default ModuleForm;
