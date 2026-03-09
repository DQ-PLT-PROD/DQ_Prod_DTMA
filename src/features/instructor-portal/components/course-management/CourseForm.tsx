import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';
import { useAdminAuth } from '@/lib/admin-auth';
import { getSupabaseClient } from '../../lib/dbClient';

interface CourseFormData {
    slug: string;
    title: string;
    description: string;
    status: 'draft' | 'published' | 'archived';
}

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function deriveExcerpt(description: string) {
    const firstLine = description
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find(Boolean);

    if (!firstLine) return null;
    return firstLine.length <= 180 ? firstLine : `${firstLine.slice(0, 177)}...`;
}

export function CourseForm() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id && id !== 'new');
    const { ability } = useAdminAuth();
    const [formData, setFormData] = useState<CourseFormData>({
        slug: '',
        title: '',
        description: '',
        status: 'draft',
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [originalStatus, setOriginalStatus] = useState<'draft' | 'published' | 'archived'>('draft');
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const canCreateCourse = ability.can('create', 'Course');
    const canUpdateCourse = ability.can('update', 'Course');
    const canPublishCourse = ability.can('publish', 'Course');
    const canUnpublishCourse = ability.can('unpublish', 'Course');
    const canSubmit = isEditing ? canUpdateCourse : canCreateCourse;

    useEffect(() => {
        if (isEditing && id) {
            void loadCourse(id);
        }
    }, [id, isEditing]);

    const loadCourse = async (courseId: string) => {
        try {
            setLoading(true);
            const supabase = getSupabaseClient();
            if (!supabase) {
                throw new Error('Database connection unavailable');
            }

            const { data, error } = await supabase
                .from('courses')
                .select('slug, title, short_description, long_description, status')
                .eq('id', courseId)
                .single();

            if (error) throw error;
            if (!data) return;

            const nextStatus = ((data.status as CourseFormData['status'] | null) ?? 'draft');
            setFormData({
                slug: data.slug ?? '',
                title: data.title ?? '',
                description: data.long_description ?? data.short_description ?? '',
                status: nextStatus,
            });
            setOriginalStatus(nextStatus);
        } catch (error: unknown) {
            console.error('Error loading course:', error);
            const message = error instanceof Error ? error.message : 'Failed to load course';
            setToast({ type: 'error', message });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!canSubmit) {
            setToast({ type: 'error', message: `You do not have permission to ${isEditing ? 'update' : 'create'} courses.` });
            return;
        }
        if (!formData.title.trim() || !formData.description.trim()) {
            setToast({ type: 'error', message: 'Title and description are required.' });
            return;
        }
        if (formData.status === 'published' && !canPublishCourse) {
            setToast({ type: 'error', message: 'You do not have permission to publish courses.' });
            return;
        }
        if (isEditing && originalStatus === 'published' && formData.status !== 'published' && !canUnpublishCourse) {
            setToast({ type: 'error', message: 'You do not have permission to unpublish courses.' });
            return;
        }

        try {
            setSaving(true);
            const supabase = getSupabaseClient();
            if (!supabase) {
                throw new Error('Database connection unavailable');
            }

            const slug = formData.slug || slugify(formData.title);
            const description = formData.description.trim();
            const payload = {
                slug,
                title: formData.title.trim(),
                short_description: deriveExcerpt(description),
                long_description: description,
                status: formData.status,
                updated_at: new Date().toISOString(),
            };

            if (isEditing && id) {
                const { error } = await supabase.from('courses').update(payload).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('courses').insert([payload]);
                if (error) throw error;
            }

            setToast({ type: 'success', message: `Course ${isEditing ? 'updated' : 'created'} successfully` });
            window.setTimeout(() => navigate('/instructor/course-management?tab=courses'), 700);
        } catch (error: unknown) {
            console.error('Error saving course:', error);
            const message = error instanceof Error ? error.message : 'Failed to save course';
            setToast({ type: 'error', message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--md-primary)] mx-auto" />
                    <p className="mt-4 text-[color:var(--md-on-surface-variant)]">Loading course...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 pt-4 pb-20 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/instructor/course-management?tab=courses')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Course Management
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit Course' : 'Create Course'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Courses sit at the top of the hierarchy. Modules and lessons are managed separately.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Course Details</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                value={formData.title}
                                onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                                placeholder="e.g. Mastering Economy 4.0"
                            />
                            {!isEditing && formData.title.trim() && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Slug preview: <span className="font-mono">{slugify(formData.title)}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                rows={8}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                value={formData.description}
                                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                                placeholder="Describe the course and the learning journey it covers."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                value={formData.status}
                                onChange={(event) => {
                                    const nextStatus = event.target.value as CourseFormData['status'];
                                    if (nextStatus === 'published' && !canPublishCourse) {
                                        setToast({ type: 'error', message: 'You do not have permission to publish courses.' });
                                        return;
                                    }
                                    if (formData.status === 'published' && nextStatus !== 'published' && !canUnpublishCourse) {
                                        setToast({ type: 'error', message: 'You do not have permission to unpublish courses.' });
                                        return;
                                    }
                                    setFormData((current) => ({ ...current, status: nextStatus }));
                                }}
                            >
                                <option value="draft">Draft</option>
                                <option value="published" disabled={!canPublishCourse}>Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/instructor/course-management?tab=courses')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !canSubmit}
                            className="px-4 py-2 bg-[var(--md-primary)] text-white rounded-lg hover:bg-[var(--md-primary-hover)] disabled:opacity-50 flex items-center"
                        >
                            <SaveIcon className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
                        </button>
                    </div>
                </form>
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

export default CourseForm;
