import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, FilmIcon, LinkIcon, SaveIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';
import { useAdminAuth } from '@/lib/admin-auth';
import { MediaPickerModal } from '../../components/media/MediaPickerModal';
import { getSupabaseClient } from '../../lib/dbClient';
import { instructorApi } from '@/lib/api/instructorApiClient';
import { uploadLMSFile } from '../../lib/storage';

interface CourseOption {
    slug: string;
    title: string;
}

interface ModuleOption {
    id: string;
    title: string;
    course_slug: string;
    order_index: number;
    course_title: string;
}

interface LessonFormData {
    title: string;
    module_id: string;
    course_slug: string;
    order_index: number;
    duration: number;
    video_url: string;
    type: string;
    content: string | null;
}

export function LessonForm() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id && id !== 'new');
    const { ability } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [modules, setModules] = useState<ModuleOption[]>([]);
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const [formData, setFormData] = useState<LessonFormData>({
        title: '',
        module_id: '',
        course_slug: '',
        order_index: 1,
        duration: 0,
        video_url: '',
        type: 'standard',
        content: null,
    });
    const canCreateLesson = ability.can('create', 'Lesson');
    const canUpdateLesson = ability.can('update', 'Lesson');
    const canUploadMedia = ability.can('upload', 'Media');
    const canSubmit = isEditing ? canUpdateLesson : canCreateLesson;
    const hasVideoUrl = formData.video_url.trim().length > 0;

    useEffect(() => {
        void loadDependencyData();
        if (isEditing && id) {
            void loadLesson(id);
        }
    }, [id, isEditing]);

    const loadDependencyData = async () => {
        try {
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Database connection unavailable');

            const [{ data: modulesData, error: modulesError }, { data: coursesData, error: coursesError }] = await Promise.all([
                supabase.from('modules').select('id, title, course_slug, order_index').order('title'),
                supabase.from('courses').select('slug, title'),
            ]);

            if (modulesError) throw modulesError;
            if (coursesError) throw coursesError;

            const courseMap = new Map<string, string>();
            ((coursesData as CourseOption[] | null) ?? []).forEach((course) => {
                courseMap.set(course.slug, course.title);
            });

            const nextModules = ((modulesData as Array<Omit<ModuleOption, 'course_title'>> | null) ?? []).map((module) => ({
                ...module,
                course_title: courseMap.get(module.course_slug) ?? module.course_slug,
            }));

            setModules(nextModules);
        } catch (error) {
            console.error('Error loading module options:', error);
            setToast({ type: 'error', message: 'Failed to load modules' });
        }
    };

    const loadLesson = async (lessonId: string) => {
        try {
            setLoading(true);
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Database connection unavailable');

            const { data, error } = await supabase
                .from('lessons')
                .select('title, module_id, course_slug, order_index, estimated_duration_minutes, video_url, type, content')
                .eq('id', lessonId)
                .single();

            if (error) throw error;
            if (!data) return;

            setFormData({
                title: data.title ?? '',
                module_id: data.module_id ?? '',
                course_slug: data.course_slug ?? '',
                order_index: Number(data.order_index) || 1,
                duration: Number(data.estimated_duration_minutes) || 0,
                video_url: data.video_url ?? '',
                type: data.type ?? 'standard',
                content: data.content ?? null,
            });
        } catch (error) {
            console.error('Error loading lesson:', error);
            setToast({ type: 'error', message: 'Failed to load lesson details' });
        } finally {
            setLoading(false);
        }
    };

    const selectedModule = modules.find((module) => module.id === formData.module_id) ?? null;

    const handleModuleChange = (moduleId: string) => {
        const module = modules.find((item) => item.id === moduleId);
        setFormData((current) => ({
            ...current,
            module_id: moduleId,
            course_slug: module?.course_slug ?? '',
        }));
    };

    const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!canUploadMedia) {
            setToast({ type: 'error', message: 'You do not have permission to upload media.' });
            event.target.value = '';
            return;
        }

        const file = event.target.files?.[0];
        if (!file) return;
        if (!selectedModule) {
            setToast({ type: 'error', message: 'Select a module before uploading a lesson video.' });
            event.target.value = '';
            return;
        }
        if (!formData.title.trim()) {
            setToast({ type: 'error', message: 'Enter a lesson title before uploading a video.' });
            event.target.value = '';
            return;
        }

        try {
            setUploadingVideo(true);
            setUploadProgress(0);

            const result = await uploadLMSFile({
                file,
                courseSlug: selectedModule.course_slug,
                moduleOrder: selectedModule.order_index,
                moduleTitle: selectedModule.title,
                lessonOrder: formData.order_index,
                lessonTitle: formData.title,
                itemType: 'video',
                itemId: isEditing ? id : undefined,
                onProgress: (progress) => setUploadProgress(progress),
            });

            setFormData((current) => ({ ...current, video_url: result.publicUrl }));
            setUploadProgress(100);
            setToast({ type: 'success', message: 'Lesson video uploaded successfully' });
        } catch (error) {
            console.error('Error uploading lesson video:', error);
            const message = error instanceof Error ? error.message : 'Failed to upload lesson video';
            setToast({ type: 'error', message });
            setUploadProgress(0);
        } finally {
            setUploadingVideo(false);
            event.target.value = '';
        }
    };

    const handleSubmit = async (event?: React.FormEvent) => {
        event?.preventDefault();
        if (!canSubmit) {
            setToast({ type: 'error', message: `You do not have permission to ${isEditing ? 'update' : 'create'} lessons.` });
            return;
        }
        if (!formData.title.trim() || !formData.module_id || !formData.course_slug) {
            setToast({ type: 'error', message: 'Lesson title and module are required.' });
            return;
        }

        try {
            setLoading(true);

            const payload = {
                course_slug: formData.course_slug,
                module_id: formData.module_id,
                title: formData.title.trim(),
                type: formData.type || 'standard',
                order_index: formData.order_index,
                estimated_duration_minutes: formData.duration || 0,
                video_url: formData.video_url.trim() || null,
                content: formData.content,
                updated_at: new Date().toISOString(),
            };

            if (isEditing && id) {
                const result = await instructorApi.updateLesson(id, payload);
                if (!result.ok) throw new Error(result.message);
                setToast({ type: 'success', message: 'Lesson updated successfully' });
            } else {
                const result = await instructorApi.createLesson(payload);
                if (!result.ok) throw new Error(result.message);
                setToast({ type: 'success', message: 'Lesson created successfully' });
            }

            window.setTimeout(() => navigate('/instructor/course-management?tab=lessons'), 700);
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
                            {isEditing ? 'Edit Lesson' : 'Create Lesson'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Lessons now live under modules. Pick the parent module first and the course is derived automatically.
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !canSubmit}
                    className="px-4 py-2 bg-[var(--md-primary)] hover:bg-[var(--md-primary-hover)] text-white rounded-lg flex items-center shadow-sm disabled:opacity-50"
                >
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Lesson'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                placeholder="e.g. Introduction to Platforms"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Video Link or Upload
                            </label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-1">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                            <LinkIcon className="h-4 w-4" />
                                        </span>
                                        <input
                                            type="text"
                                            value={formData.video_url}
                                            onChange={(event) => setFormData((current) => ({ ...current, video_url: event.target.value }))}
                                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                            placeholder="https://vimeo.com/..."
                                        />
                                    </div>
                                    <label
                                        className={`px-4 py-2 rounded-lg cursor-pointer flex items-center transition-colors ${
                                            uploadingVideo || !canUploadMedia
                                                ? 'bg-[var(--md-surface-variant)] text-[var(--md-on-surface-variant)]'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        <UploadIcon className="h-4 w-4 mr-2" />
                                        {uploadingVideo ? `${uploadProgress}%` : 'Upload'}
                                        <input
                                            type="file"
                                            accept="video/*"
                                            className="hidden"
                                            onChange={handleVideoUpload}
                                            disabled={uploadingVideo || !canUploadMedia}
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
                                        <FilmIcon className="h-4 w-4 mr-2" />
                                        Library
                                    </button>
                                    {hasVideoUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData((current) => ({ ...current, video_url: '' }))}
                                            disabled={!canSubmit}
                                            className="flex items-center rounded-lg bg-red-50 px-4 py-2 text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Trash2Icon className="mr-2 h-4 w-4" />
                                            Remove
                                        </button>
                                    )}
                                </div>

                                {uploadingVideo && uploadProgress > 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className="bg-[var(--md-primary)] h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                )}

                                {hasVideoUrl && (
                                    <p className="text-xs text-gray-500 break-all">{formData.video_url}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Organization</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Module <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.module_id}
                                onChange={(event) => handleModuleChange(event.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                            >
                                <option value="">Select module</option>
                                {modules.map((module) => (
                                    <option key={module.id} value={module.id}>
                                        {module.course_title} | {module.title}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Lessons are attached to modules. The course is derived from the selected module.
                            </p>
                            {isEditing && !formData.module_id && (
                                <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                                    This is a legacy lesson without a module. Assign one before saving.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.order_index}
                                onChange={(event) => setFormData((current) => ({
                                    ...current,
                                    order_index: Math.max(1, Number(event.target.value) || 1),
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.duration}
                                onChange={(event) => setFormData((current) => ({
                                    ...current,
                                    duration: Number(event.target.value) || 0,
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                            />
                        </div>

                        {selectedModule && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                Parent course: <span className="font-medium text-gray-900">{selectedModule.course_title}</span>
                            </div>
                        )}
                    </div>
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
                    setFormData((current) => ({ ...current, video_url: url }));
                    setShowMediaPicker(false);
                }}
                allowedTypes={['video/']}
                currentUrl={formData.video_url}
                onDeleteUrl={() => setFormData((current) => ({ ...current, video_url: '' }))}
            />
        </div>
    );
}

export default LessonForm;
