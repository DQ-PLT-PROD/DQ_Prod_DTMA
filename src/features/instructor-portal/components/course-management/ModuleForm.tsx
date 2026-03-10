import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeftIcon,
    FileTextIcon,
    Image as ImageIcon,
    PlusIcon,
    SaveIcon,
    Trash2Icon,
    UploadIcon,
} from 'lucide-react';
import { Toast } from '@/components/ui/Toast';
import { useAdminAuth } from '@/lib/admin-auth';
import { MediaPickerModal } from '../../components/media/MediaPickerModal';
import { getSupabaseClient } from '../../lib/dbClient';
import { uploadLMSFile } from '../../lib/storage';
import { instructorApi } from '@/lib/api/instructorApiClient';

type ResourceType = 'whitepaper' | 'pdf' | 'template' | 'tool' | 'worksheet' | 'other';

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
    description: string;
    learning_outcomes: string;
    skills_gained: string;
    upon_completion: string;
    thumbnail_url: string;
}

interface ModuleResourceFormItem {
    id?: string;
    tempId: string;
    title: string;
    type: ResourceType;
    description: string;
    resource_url: string;
    file_size_bytes: number | null;
    order_index: number;
}

const RESOURCE_TYPE_OPTIONS: Array<{ value: ResourceType; label: string }> = [
    { value: 'pdf', label: 'PDF' },
    { value: 'whitepaper', label: 'Whitepaper' },
    { value: 'worksheet', label: 'Worksheet' },
    { value: 'template', label: 'Template' },
    { value: 'tool', label: 'Tool' },
    { value: 'other', label: 'Other' },
];

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function formatListForTextarea(values?: string[] | null) {
    return Array.isArray(values) ? values.join('\n') : '';
}

function parseTextareaList(value: string) {
    return value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function createTempId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }

    return `resource-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getFileTitle(fileName: string) {
    return fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
}

function inferResourceType(file: File): ResourceType {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (file.type === 'application/pdf' || extension === 'pdf') return 'pdf';
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'whitepaper';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'worksheet';
    if (['ppt', 'pptx'].includes(extension)) return 'template';
    return 'other';
}

function createEmptyResource(order_index: number): ModuleResourceFormItem {
    return {
        tempId: createTempId(),
        title: '',
        type: 'pdf',
        description: '',
        resource_url: '',
        file_size_bytes: null,
        order_index,
    };
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
    const [resources, setResources] = useState<ModuleResourceFormItem[]>([]);
    const [removedResourceIds, setRemovedResourceIds] = useState<string[]>([]);
    const [resourceUploadProgress, setResourceUploadProgress] = useState<Record<string, number>>({});
    const [uploadingResourceId, setUploadingResourceId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const [originalStatus, setOriginalStatus] = useState<ModuleFormData['status']>('draft');
    const [formData, setFormData] = useState<ModuleFormData>({
        title: '',
        course_id: '',
        course_slug: '',
        estimated_duration_minutes: 0,
        status: 'draft',
        order_index: 0,
        description: '',
        learning_outcomes: '',
        skills_gained: '',
        upon_completion: '',
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
            return;
        }

        setResources([]);
        setRemovedResourceIds([]);
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

            const [{ data: moduleData, error: moduleError }, { data: resourceData, error: resourceError }] = await Promise.all([
                supabase
                    .from('modules')
                    .select('title, course_id, course_slug, estimated_duration_minutes, status, order_index, description, learning_outcomes, skills_gained, upon_completion, thumbnail_url')
                    .eq('id', moduleId)
                    .single(),
                supabase
                    .from('course_resources')
                    .select('id, title, type, description, resource_url, file_size_bytes, order_index')
                    .eq('module_id', moduleId)
                    .order('order_index', { ascending: true }),
            ]);

            if (moduleError) throw moduleError;
            if (resourceError) throw resourceError;
            if (!moduleData) return;

            setFormData({
                title: moduleData.title ?? '',
                course_id: moduleData.course_id ?? '',
                course_slug: moduleData.course_slug ?? '',
                estimated_duration_minutes: Number(moduleData.estimated_duration_minutes) || 0,
                status: ((moduleData.status as ModuleFormData['status'] | null) ?? 'draft'),
                order_index: Number(moduleData.order_index) || 0,
                description: moduleData.description ?? '',
                learning_outcomes: formatListForTextarea(moduleData.learning_outcomes),
                skills_gained: formatListForTextarea(moduleData.skills_gained),
                upon_completion: moduleData.upon_completion ?? '',
                thumbnail_url: moduleData.thumbnail_url ?? '',
            });
            setOriginalStatus(((moduleData.status as ModuleFormData['status'] | null) ?? 'draft'));
            setResources(
                ((resourceData as Array<any> | null) ?? []).map((resource) => ({
                    id: resource.id,
                    tempId: resource.id,
                    title: resource.title ?? '',
                    type: (resource.type as ResourceType) ?? 'pdf',
                    description: resource.description ?? '',
                    resource_url: resource.resource_url ?? '',
                    file_size_bytes: resource.file_size_bytes ? Number(resource.file_size_bytes) : null,
                    order_index: Number(resource.order_index) || 0,
                }))
            );
            setRemovedResourceIds([]);
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
        return (Number(data?.[0]?.order_index) || 0) + 1;
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
            setToast({ type: 'error', message: error instanceof Error ? error.message : 'Failed to upload module thumbnail' });
            setUploadProgress(0);
        } finally {
            setUploadingImage(false);
            event.target.value = '';
        }
    };

    const handleAddResource = () => {
        setResources((current) => [...current, createEmptyResource(current.length)]);
    };

    const handleResourceChange = (
        tempId: string,
        field: keyof Omit<ModuleResourceFormItem, 'id' | 'tempId'>,
        value: string | number | null
    ) => {
        setResources((current) =>
            current.map((resource, index) =>
                resource.tempId === tempId ? { ...resource, [field]: value, order_index: index } : resource
            )
        );
    };

    const handleRemoveResource = (tempId: string) => {
        setResources((current) => {
            const target = current.find((resource) => resource.tempId === tempId);
            if (target?.id) {
                setRemovedResourceIds((existing) => [...existing, target.id!]);
            }
            return current.filter((resource) => resource.tempId !== tempId).map((resource, index) => ({ ...resource, order_index: index }));
        });
    };

    const handleResourceUpload = async (tempId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        if (!canUploadMedia) {
            setToast({ type: 'error', message: 'You do not have permission to upload media.' });
            event.target.value = '';
            return;
        }

        const file = event.target.files?.[0];
        if (!file) return;
        if (!formData.course_slug) {
            setToast({ type: 'error', message: 'Select a course before uploading a module resource.' });
            event.target.value = '';
            return;
        }
        if (!formData.title.trim()) {
            setToast({ type: 'error', message: 'Enter a module title before uploading a resource.' });
            event.target.value = '';
            return;
        }

        try {
            setUploadingResourceId(tempId);
            setResourceUploadProgress((current) => ({ ...current, [tempId]: 0 }));
            const result = await uploadLMSFile({
                file,
                courseSlug: formData.course_slug,
                moduleOrder: formData.order_index > 0 ? formData.order_index : undefined,
                moduleTitle: formData.title.trim(),
                itemType: 'document',
                itemId: isEditing ? id : undefined,
                onProgress: (progress) => setResourceUploadProgress((current) => ({ ...current, [tempId]: progress })),
            });
            setResources((current) =>
                current.map((resource) =>
                    resource.tempId === tempId
                        ? {
                            ...resource,
                            title: resource.title.trim() || getFileTitle(file.name),
                            type: inferResourceType(file),
                            resource_url: result.publicUrl,
                            file_size_bytes: result.fileSize,
                        }
                        : resource
                )
            );
            setToast({ type: 'success', message: 'Module resource uploaded successfully' });
        } catch (error: unknown) {
            console.error('Error uploading module resource:', error);
            setToast({ type: 'error', message: error instanceof Error ? error.message : 'Failed to upload module resource' });
        } finally {
            setUploadingResourceId(null);
            setResourceUploadProgress((current) => ({ ...current, [tempId]: 0 }));
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

        const trimmedResources = resources.map((resource, index) => ({
            ...resource,
            title: resource.title.trim(),
            description: resource.description.trim(),
            resource_url: resource.resource_url.trim(),
            order_index: index,
        }));
        const incompleteResource = trimmedResources.find(
            (resource) => Boolean(resource.title || resource.description || resource.resource_url) && (!resource.title || !resource.resource_url)
        );
        if (incompleteResource) {
            setToast({ type: 'error', message: 'Every resource needs both a title and a file or URL.' });
            return;
        }

        const resourcesToPersist = trimmedResources.filter((resource) => resource.title && resource.resource_url);

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
                description: formData.description.trim() || null,
                learning_outcomes: parseTextareaList(formData.learning_outcomes),
                skills_gained: parseTextareaList(formData.skills_gained),
                upon_completion: formData.upon_completion.trim() || null,
                thumbnail_url: formData.thumbnail_url.trim() || null,
                updated_at: new Date().toISOString(),
            };

            let moduleId = id ?? null;
            if (isEditing && id) {
                const result = await instructorApi.updateModule(id, payload);
                if (!result.ok) throw new Error(result.message);
            } else {
                const result = await instructorApi.createModule(payload);
                if (!result.ok) throw new Error(result.message);
                moduleId = result.data?.id ?? null;
            }

            if (!moduleId) throw new Error('Module identifier missing after save');

            if (removedResourceIds.length > 0) {
                const delResult = await instructorApi.deleteCourseResources(removedResourceIds);
                if (!delResult.ok) throw new Error(delResult.message);
            }

            if (resourcesToPersist.length > 0) {
                for (const resource of resourcesToPersist) {
                    const resourcePayload = {
                        course_slug: formData.course_slug,
                        module_id: moduleId,
                        title: resource.title,
                        type: resource.type,
                        description: resource.description || null,
                        resource_url: resource.resource_url,
                        file_size_bytes: resource.file_size_bytes ?? null,
                        order_index: resource.order_index,
                    };

                    if (resource.id) {
                        const result = await instructorApi.updateCourseResource(resource.id, resourcePayload);
                        if (!result.ok) throw new Error(result.message);
                    } else {
                        const result = await instructorApi.createCourseResource(resourcePayload);
                        if (!result.ok) throw new Error(result.message);
                    }
                }
            }

            setToast({ type: 'success', message: `Module ${isEditing ? 'updated' : 'created'} successfully` });
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
                        <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Module' : 'Create Module'}</h1>
                        <p className="text-sm text-gray-500">
                            Modules belong to a course and drive the learner-facing description, outcomes, and resources.
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
                            onChange={(event) => setFormData((current) => ({ ...current, estimated_duration_minutes: Number(event.target.value) || 0 }))}
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
                            onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value as ModuleFormData['status'] }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                        >
                            <option value="draft">Draft</option>
                            <option value="published" disabled={!canPublishModule}>Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Module Description</label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                            placeholder="Describe what this module covers for learners."
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <input
                                    type="text"
                                    className="flex-1 min-w-[16rem] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
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
                                    <div className="bg-[var(--md-primary)] h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                </div>
                            )}

                            {hasThumbnailUrl && !uploadingImage && (
                                <div className="relative group w-40 h-24">
                                    <img src={formData.thumbnail_url} alt="Module thumbnail preview" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <section className="border-t border-gray-200 pt-6 space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Learner-facing content</h2>
                        <p className="text-sm text-gray-500">
                            These fields populate the module detail page and learning outcomes tab.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Learning Outcomes</label>
                            <textarea
                                rows={6}
                                value={formData.learning_outcomes}
                                onChange={(event) => setFormData((current) => ({ ...current, learning_outcomes: event.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                placeholder={'One outcome per line\nUnderstand the module objective\nApply the workflow in context'}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Skills Gained</label>
                            <textarea
                                rows={6}
                                value={formData.skills_gained}
                                onChange={(event) => setFormData((current) => ({ ...current, skills_gained: event.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                placeholder={'One skill per line\nDecision-making\nProcess mapping'}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">What Learners Come Away With</label>
                            <textarea
                                rows={4}
                                value={formData.upon_completion}
                                onChange={(event) => setFormData((current) => ({ ...current, upon_completion: event.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                placeholder="Summarize what the learner can do or use after completing this module."
                            />
                        </div>
                    </div>
                </section>

                <section className="border-t border-gray-200 pt-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Resources</h2>
                            <p className="text-sm text-gray-500">
                                Upload or link module-specific files shown in the learner Resources tab.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddResource}
                            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Resource
                        </button>
                    </div>

                    {resources.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
                            <FileTextIcon className="mx-auto h-10 w-10 text-gray-300" />
                            <p className="mt-3 text-sm font-medium text-gray-700">No resources added yet</p>
                            <p className="mt-1 text-sm text-gray-500">
                                Add PDFs, worksheets, whitepapers, or other supporting documents for this module.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {resources.map((resource, index) => {
                                const isUploading = uploadingResourceId === resource.tempId;
                                const progress = resourceUploadProgress[resource.tempId] || 0;

                                return (
                                    <div key={resource.tempId} className="rounded-xl border border-gray-200 p-4 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900">Resource {index + 1}</h3>
                                                <p className="text-xs text-gray-500">
                                                    Visible on the learner-facing Resources tab for this module.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveResource(resource.tempId)}
                                                className="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                                            >
                                                <Trash2Icon className="mr-2 h-4 w-4" />
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Title</label>
                                                <input
                                                    type="text"
                                                    value={resource.title}
                                                    onChange={(event) => handleResourceChange(resource.tempId, 'title', event.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                                    placeholder="e.g. Module worksheet"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                                                <select
                                                    value={resource.type}
                                                    onChange={(event) => handleResourceChange(resource.tempId, 'type', event.target.value as ResourceType)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                                >
                                                    {RESOURCE_TYPE_OPTIONS.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                <textarea
                                                    rows={3}
                                                    value={resource.description}
                                                    onChange={(event) => handleResourceChange(resource.tempId, 'description', event.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                                    placeholder="Tell learners what this resource helps them do."
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
                                                <input
                                                    type="url"
                                                    value={resource.resource_url}
                                                    onChange={(event) => handleResourceChange(resource.tempId, 'resource_url', event.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <label
                                                className={`px-4 py-2 rounded-lg cursor-pointer flex items-center transition-colors ${
                                                    isUploading || !canUploadMedia
                                                        ? 'bg-[var(--md-surface-variant)] text-[var(--md-on-surface-variant)]'
                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                }`}
                                            >
                                                <UploadIcon className="h-4 w-4 mr-2" />
                                                {isUploading ? `${progress}%` : 'Upload File'}
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.rtf"
                                                    className="hidden"
                                                    onChange={(event) => void handleResourceUpload(resource.tempId, event)}
                                                    disabled={isUploading || !canUploadMedia}
                                                />
                                            </label>
                                            <span className="text-xs text-gray-500">Upload a file or paste a URL manually.</span>
                                        </div>

                                        {isUploading && progress > 0 && (
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div className="bg-[var(--md-primary)] h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                                            </div>
                                        )}

                                        {resource.resource_url && (
                                            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                                <a
                                                    href={resource.resource_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="font-medium text-[var(--md-primary)] hover:underline break-all"
                                                >
                                                    {resource.title || resource.resource_url}
                                                </a>
                                                {resource.file_size_bytes ? (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {(resource.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

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
