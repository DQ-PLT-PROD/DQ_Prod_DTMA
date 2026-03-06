import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, Image as ImageIcon, SaveIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';
import { useAdminAuth } from '@/lib/admin-auth';
import { MediaPickerModal } from '../../components/media/MediaPickerModal';
import { getSupabaseClient } from '../../lib/dbClient';
import { uploadLMSFile } from '../../lib/storage';

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

interface CourseOption {
    id: string;
    slug: string;
    title: string;
}

interface ModuleFormData {
    title: string;
    course_id: string;
    course_slug: string;
    estimated_duration_minutes: number;
    status: 'draft' | 'published' | 'archived';
    order_index: number;
    description: string | null;
    thumbnail_url: string;
}

export function ModuleForm() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id && id !== 'new');
    const { ability } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const [originalStatus, setOriginalStatus] = useState<ModuleFormData['status']>('draft');
    const [formData, setFormData] = useState<ModuleFormData>({
        title: '',
        course_id: '',
        course_slug: '',
        estimated_duration_minutes: 0,
        status: 'draft',
        order_index: 0,
        description: null,
        thumbnail_url: '',
    });
    const canCreateModule = ability.can('create', 'Module');
    const canUpdateModule = ability.can('update', 'Module');
    const canPublishModule = ability.can('publish', 'Module');
    const canUnpublishModule = ability.can('unpublish', 'Module');
    const canUploadMedia = ability.can('upload', 'Media');
    const canSubmit = isEditing ? canUpdateModule : canCreateModule;
    const hasThumbnailUrl = formData.thumbnail_url.trim().length > 0;

    useEffect(() => {
        void loadCourses();
        if (isEditing && id) {
            void loadModule(id);
        }
    }, [id, isEditing]);

    const loadCourses = async () => {
        try {
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Database connection unavailable');

            const { data, error } = await supabase.from('courses').select('id, slug, title').order('title');
            if (error) throw error;
            setCourses((data as CourseOption[]) ?? []);
        } catch (error) {
            console.error('Error loading courses:', error);
            setToast({ type: 'error', message: 'Failed to load courses' });
        }
    };

    const loadModule = async (moduleId: string) => {
        try {
            setLoading(true);
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Database connection unavailable');

            const { data, error } = await supabase
                .from('modules')
                .select('title, course_id, course_slug, estimated_duration_minutes, status, order_index, description, thumbnail_url')
                .eq('id', moduleId)
                .single();

            if (error) throw error;
            if (!data) return;

            setFormData({
                title: data.title ?? '',
                course_id: data.course_id ?? '',
                course_slug: data.course_slug ?? '',
                estimated_duration_minutes: Number(data.estimated_duration_minutes) || 0,
                status: ((data.status as ModuleFormData['status'] | null) ?? 'draft'),
                order_index: Number(data.order_index) || 0,
                description: data.description ?? null,
                thumbnail_url: data.thumbnail_url ?? '',
            });
            setOriginalStatus(((data.status as ModuleFormData['status'] | null) ?? 'draft'));
        } catch (error) {
            console.error('Error loading module:', error);
            setToast({ type: 'error', message: 'Failed to load module details' });
        } finally {
            setLoading(false);
        }
    };

    const handleCourseChange = (courseId: string) => {
        const selectedCourse = courses.find((course) => course.id === courseId);
        setFormData((current) => ({
            ...current,
            course_id: courseId,
            course_slug: selectedCourse?.slug ?? '',
        }));
    };

    const getNextOrderIndex = async (courseId: string) => {
        const supabase = getSupabaseClient();
        if (!supabase) throw new Error('Database connection unavailable');

        const { data, error } = await supabase
            .from('modules')
            .select('order_index')
            .eq('course_id', courseId)
            .order('order_index', { ascending: false })
            .limit(1);

        if (error) throw error;
        const highestOrder = Number(data?.[0]?.order_index) || 0;
        return highestOrder + 1;
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!canUploadMedia) {
            setToast({ type: 'error', message: 'You do not have permission to upload media.' });
            event.target.value = '';
            return;
        }

        const file = event.target.files?.[0];
        if (!file) return;

        if (!formData.course_slug) {
            setToast({ type: 'error', message: 'Select a course before uploading a module thumbnail.' });
            event.target.value = '';
            return;
        }

        if (!formData.title.trim()) {
            setToast({ type: 'error', message: 'Enter a module title before uploading a thumbnail.' });
            event.target.value = '';
            return;
        }

        try {
            setUploadingImage(true);
            setUploadProgress(0);

            const result = await uploadLMSFile({
                file,
                courseSlug: formData.course_slug,
                moduleOrder: formData.order_index > 0 ? formData.order_index : undefined,
                moduleTitle: formData.title.trim(),
                itemType: 'thumbnail',
                itemId: isEditing ? id : undefined,
                onProgress: (progress) => setUploadProgress(progress),
            });

            setFormData((current) => ({ ...current, thumbnail_url: result.publicUrl }));
            setUploadProgress(100);
            setToast({ type: 'success', message: 'Module thumbnail uploaded successfully' });
        } catch (error: unknown) {
            console.error('Error uploading module thumbnail:', error);
            const message = error instanceof Error ? error.message : 'Failed to upload module thumbnail';
            setToast({ type: 'error', message });
            setUploadProgress(0);
        } finally {
            setUploadingImage(false);
            event.target.value = '';
        }
    };

    const handleSubmit = async (event?: React.FormEvent) => {
        event?.preventDefault();
        if (!canSubmit) {
            setToast({ type: 'error', message: `You do not have permission to ${isEditing ? 'update' : 'create'} modules.` });
            return;
        }
        if (!formData.title.trim() || !formData.course_id || !formData.course_slug) {
            setToast({ type: 'error', message: 'Module title and course are required.' });
            return;
        }
        if (formData.status === 'published' && !canPublishModule) {
            setToast({ type: 'error', message: 'You do not have permission to publish modules.' });
            return;
        }
        if (isEditing && originalStatus === 'published' && formData.status !== 'published' && !canUnpublishModule) {
            setToast({ type: 'error', message: 'You do not have permission to unpublish modules.' });
            return;
        }

        try {
            setSaving(true);
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Database connection unavailable');

            const orderIndex = isEditing ? formData.order_index : await getNextOrderIndex(formData.course_id);
            const payload: Record<string, unknown> = {
                title: formData.title.trim(),
                slug: slugify(formData.title),
                course_id: formData.course_id,
                course_slug: formData.course_slug,
                estimated_duration_minutes: Number(formData.estimated_duration_minutes) || 0,
                status: formData.status,
                order_index: orderIndex,
                description: formData.description,
                thumbnail_url: formData.thumbnail_url.trim() || null,
                updated_at: new Date().toISOString(),
            };

            if (isEditing && id) {
                const { error } = await supabase.from('modules').update(payload).eq('id', id);
                if (error) throw error;
                setToast({ type: 'success', message: 'Module updated successfully' });
            } else {
                const { error } = await supabase.from('modules').insert([payload]);
                if (error) throw error;
                setToast({ type: 'success', message: 'Module created successfully' });
            }

            window.setTimeout(() => navigate('/instructor/course-management?tab=modules'), 700);
        } catch (error) {
            console.error('Error saving module:', error);
            setToast({ type: 'error', message: 'Failed to save module' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--md-primary)] mx-auto" />
                    <p className="mt-4 text-[color:var(--md-on-surface-variant)]">Loading module...</p>
                </div>
            </div>
        );
    }

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
                            {isEditing ? 'Edit Module' : 'Create Module'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Modules belong to a course and group the lessons that follow.
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving || !canSubmit}
                    className="px-4 py-2 bg-[var(--md-primary)] hover:bg-[var(--md-primary-hover)] text-white rounded-lg flex items-center shadow-sm disabled:opacity-50"
                >
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Module'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Module Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                            placeholder="e.g. Introduction to Economy 4.0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.course_id}
                            onChange={(event) => handleCourseChange(event.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                        >
                            <option value="">Select a course</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Length (minutes) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            required
                            value={formData.estimated_duration_minutes}
                            onChange={(event) => setFormData((current) => ({
                                ...current,
                                estimated_duration_minutes: Number(event.target.value) || 0,
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.status}
                            onChange={(event) => setFormData((current) => ({
                                ...current,
                                status: event.target.value as ModuleFormData['status'],
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                        >
                            <option value="draft">Draft</option>
                            <option value="published" disabled={!canPublishModule}>Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                    value={formData.thumbnail_url}
                                    onChange={(event) => setFormData((current) => ({ ...current, thumbnail_url: event.target.value }))}
                                    placeholder="https://..."
                                />
                                <label
                                    className={`px-4 py-2 rounded-lg cursor-pointer flex items-center transition-colors ${
                                        uploadingImage || !canUploadMedia
                                            ? 'bg-[var(--md-surface-variant)] text-[var(--md-on-surface-variant)]'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    <UploadIcon className="h-4 w-4 mr-2" />
                                    {uploadingImage ? `${uploadProgress}%` : 'Upload'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage || !canUploadMedia}
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!canUploadMedia) {
                                            setToast({ type: 'error', message: 'You do not have permission to upload media.' });
                                            return;
                                        }
                                        setShowMediaPicker(true);
                                    }}
                                    disabled={!canUploadMedia}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                    Library
                                </button>
                                {hasThumbnailUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData((current) => ({ ...current, thumbnail_url: '' }))}
                                        disabled={!canSubmit}
                                        className="flex items-center rounded-lg bg-red-50 px-4 py-2 text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Trash2Icon className="mr-2 h-4 w-4" />
                                        Remove
                                    </button>
                                )}
                            </div>

                            {uploadingImage && uploadProgress > 0 && (
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className="bg-[var(--md-primary)] h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            )}

                            {hasThumbnailUrl && !uploadingImage && (
                                <div className="relative group w-40 h-24">
                                    <img
                                        src={formData.thumbnail_url}
                                        alt="Module thumbnail preview"
                                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/instructor/course-management?tab=modules')}
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
                        {saving ? 'Saving...' : isEditing ? 'Update Module' : 'Create Module'}
                    </button>
                </div>
            </form>

            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                    isVisible={!!toast}
                />
            )}

            <MediaPickerModal
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={(url) => {
                    setFormData((current) => ({ ...current, thumbnail_url: url }));
                    setShowMediaPicker(false);
                }}
                allowedTypes={['image/']}
            />
        </div>
    );
}

export default ModuleForm;
