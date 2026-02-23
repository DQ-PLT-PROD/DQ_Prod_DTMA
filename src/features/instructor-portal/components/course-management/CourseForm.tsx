/**
 * CourseForm Component for Instructor Portal
 * 
 * Form for creating and editing courses.
 * Adapted from DWS Admin App for DTMA integration.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, UploadIcon, Image as ImageIcon } from 'lucide-react';
import { getSupabaseClient } from '../../lib/dbClient';
import { uploadLMSFile } from '../../lib/storage';
import { Toast } from '@/components/ui/Toast';
import { MediaPickerModal } from '../../components/media/MediaPickerModal';
import {
    DEPARTMENTS,
    LMS_ITEM_PROVIDERS,
    COURSE_TYPES,
    SFIA_LEVEL_CODES,
    AUDIENCE_OPTIONS
} from '../../constants/courseConstants';
import { COURSE_CATEGORIES as STANDARD_CATEGORIES } from '../../../../constants/navigation';
import { AlertTriangleIcon, CheckIcon, XIcon } from 'lucide-react';

interface CourseFormData {
    slug: string;
    title: string;
    provider: string;
    description: string;
    category: string;
    delivery_mode: string;
    duration: number;
    level_code: string;
    department: string;
    audience: string;
    status: string;
    highlights: string[];
    outcomes: string[];
    course_type: string;
    track: string;
    rating: number;
    review_count: number;
    image_url: string;
    excerpt: string;
    faq: unknown[];
}

export function CourseForm() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = id && id !== 'new';

    const [formData, setFormData] = useState<CourseFormData>({
        slug: '',
        title: '',
        provider: '',
        description: '',
        category: '',
        delivery_mode: '',
        duration: 0,
        level_code: '',
        department: '',
        audience: '',
        status: 'draft',
        highlights: [],
        outcomes: [],
        course_type: '',
        track: '',
        rating: 0,
        review_count: 0,
        image_url: '',
        excerpt: '',
        faq: [],
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const [highlightInput, setHighlightInput] = useState('');
    const [outcomeInput, setOutcomeInput] = useState('');

    // Image upload state
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    // Custom Category State
    const [showCustomCategoryWarn, setShowCustomCategoryWarn] = useState(false);
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [customCategoryInput, setCustomCategoryInput] = useState('');

    useEffect(() => {
        if (isEditing && id) {
            loadCourse(id);
        }
    }, [id, isEditing]);

    // Check if loaded category is custom
    useEffect(() => {
        if (formData.category) {
            const isStandard = STANDARD_CATEGORIES.some(c => c.slug === formData.category);
            setIsCustomCategory(!isStandard);
            if (!isStandard) {
                setCustomCategoryInput(formData.category);
            }
        }
    }, [formData.category]);

    const loadCourse = async (courseId: string) => {
        // ... (existing loadCourse implementation) ...
        try {
            setLoading(true);
            const supabase = getSupabaseClient();
            if (!supabase) {
                throw new Error('Database connection unavailable');
            }

            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();

            if (error) throw error;
            if (data) {
                const row = data as Record<string, unknown>;
                setFormData({
                    slug: (row.slug as string) ?? '',
                    title: (row.title as string) ?? '',
                    provider: '',
                    description: (row.long_description as string) ?? (row.short_description as string) ?? '',
                    category: (row.category_id as string) ?? '',
                    delivery_mode: (row.delivery_mode as string) ?? '',
                    duration: Number(row.estimated_duration_minutes) || 0,
                    level_code: (row.level_tag as string) ?? '',
                    department: '',
                    audience: (row.audience_level as string) ?? '',
                    status: (row.status as string) ?? 'draft',
                    highlights: Array.isArray(row.skills_gained) ? (row.skills_gained as string[]) : [],
                    outcomes: Array.isArray(row.learning_outcomes) ? (row.learning_outcomes as string[]) : [],
                    course_type: '',
                    track: '',
                    rating: Number(row.rating) || 0,
                    review_count: Number(row.review_count) || 0,
                    image_url: (row.hero_image_url as string) ?? '',
                    excerpt: (row.short_description as string) ?? '',
                    faq: [],
                });
            }
        } catch (error: unknown) {
            console.error('Error loading course:', error);
            const message = error instanceof Error ? error.message : 'Failed to load course';
            setToast({ type: 'error', message });
        } finally {
            setLoading(false);
        }
    };

    // ... (handleImageUpload and others remain the same) ...
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Use slug or generate a temporary one for new courses
        const courseSlug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-') || 'temp-new-course';

        if (!formData.title && (!courseSlug || courseSlug === 'temp-new-course')) {
            setToast({ type: 'error', message: 'Please enter a course title first' });
            return;
        }

        try {
            setUploadingImage(true);
            setUploadProgress(0);

            const result = await uploadLMSFile({
                file,
                courseSlug,
                itemType: 'thumbnail',
                itemId: id !== 'new' ? id : undefined,
                onProgress: (progress) => {
                    setUploadProgress(progress);
                },
            });

            setFormData({ ...formData, image_url: result.publicUrl });
            setUploadProgress(100);
            setToast({ type: 'success', message: 'Thumbnail uploaded successfully' });
        } catch (error: unknown) {
            console.error('Error uploading image:', error);
            const message = error instanceof Error ? error.message : 'Failed to upload image';
            setToast({ type: 'error', message });
            setUploadProgress(0);
        } finally {
            setUploadingImage(false);
        }
    };

    const addHighlight = () => {
        if (highlightInput.trim()) {
            setFormData({
                ...formData,
                highlights: [...formData.highlights, highlightInput.trim()],
            });
            setHighlightInput('');
        }
    };

    const removeHighlight = (index: number) => {
        setFormData({
            ...formData,
            highlights: formData.highlights.filter((_, i) => i !== index),
        });
    };

    const addOutcome = () => {
        if (outcomeInput.trim()) {
            setFormData({
                ...formData,
                outcomes: [...formData.outcomes, outcomeInput.trim()],
            });
            setOutcomeInput('');
        }
    };

    const removeOutcome = (index: number) => {
        setFormData({
            ...formData,
            outcomes: formData.outcomes.filter((_, i) => i !== index),
        });
    };

    /** Map form data to actual public.courses table columns (avoids 400 from invalid column names). */
    const formDataToCourseRow = (): Record<string, unknown> => {
        const slug = formData.slug?.trim() || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return {
            slug,
            title: formData.title?.trim() || '',
            short_description: formData.excerpt?.trim() || formData.description?.trim() || null,
            long_description: formData.description?.trim() || null,
            category_id: formData.category?.trim() || null,
            audience_level: formData.audience?.trim() || null,
            level_tag: formData.level_code?.trim() || null,
            estimated_duration_minutes: formData.duration ? Number(formData.duration) : null,
            delivery_mode: formData.delivery_mode?.trim() || null,
            status: formData.status || 'draft',
            hero_image_url: formData.image_url?.trim() || null,
            rating: formData.rating != null ? Number(formData.rating) : null,
            review_count: formData.review_count != null ? Number(formData.review_count) : null,
            learning_outcomes: Array.isArray(formData.outcomes) && formData.outcomes.length > 0 ? formData.outcomes : null,
            skills_gained: Array.isArray(formData.highlights) && formData.highlights.length > 0 ? formData.highlights : null,
            updated_at: new Date().toISOString(),
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const supabase = getSupabaseClient();
            if (!supabase) {
                throw new Error('Database connection unavailable');
            }

            const dataToSave = formDataToCourseRow();

            if (isEditing && id) {
                const { id: _id, ...updatePayload } = dataToSave as { id?: string; [k: string]: unknown };
                const { error } = await supabase
                    .from('courses')
                    .update(updatePayload)
                    .eq('id', id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('courses')
                    .insert([dataToSave]);

                if (error) throw error;
            }

            setToast({ type: 'success', message: `Course ${isEditing ? 'updated' : 'created'} successfully` });
            setTimeout(() => {
                navigate('/instructor/course-management?tab=courses');
            }, 1000);
        } catch (error: unknown) {
            console.error('Error saving course:', error);
            const message = error instanceof Error ? error.message : 'Failed to save course';
            setToast({ type: 'error', message });
        } finally {
            setSaving(false);
        }
    };


    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'custom_new') {
            setShowCustomCategoryWarn(true);
        } else {
            setFormData({ ...formData, category: value });
            setIsCustomCategory(false);
        }
    };

    const confirmCustomCategory = () => {
        if (customCategoryInput.trim()) {
            setFormData({ ...formData, category: customCategoryInput.trim() });
            setIsCustomCategory(true);
            setShowCustomCategoryWarn(false);
        }
    };

    // ... (render logic) ...

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--md-primary)] mx-auto"></div>
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
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="Auto-generated from title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                    value={formData.provider}
                                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                >
                                    <option value="">Select provider</option>
                                    {LMS_ITEM_PROVIDERS.map((provider) => (
                                        <option key={provider} value={provider}>
                                            {provider}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <div className="space-y-3">
                                    <select
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                        value={showCustomCategoryWarn ? 'custom_new' : formData.category}
                                        onChange={handleCategoryChange}
                                    >
                                        <option value="">Select category</option>
                                        <optgroup label="Standard Categories">
                                            {STANDARD_CATEGORIES.map((category) => (
                                                <option key={category.slug} value={category.slug}>
                                                    {category.title}
                                                </option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Custom">
                                            <option value="custom_new">Create Custom Category...</option>
                                            {/* If current category is custom, show it as an option so it's selected */}
                                            {isCustomCategory && formData.category && (
                                                <option value={formData.category}>{formData.category}</option>
                                            )}
                                        </optgroup>
                                    </select>

                                    {/* Custom Category Warning/Input */}
                                    {showCustomCategoryWarn && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangleIcon className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-orange-800">Custom Category Warning</h4>
                                                    <p className="text-xs text-orange-700 mt-1">
                                                        Creating a custom category keeps this course outside the standard 6 Dimensions of Digital Transformation.
                                                        It may limit discoverability in standard filters.
                                                    </p>

                                                    <div className="mt-3 flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={customCategoryInput}
                                                            onChange={(e) => setCustomCategoryInput(e.target.value)}
                                                            placeholder="Enter custom category slug..."
                                                            className="flex-1 text-sm px-3 py-1.5 border border-orange-300 rounded focus:border-orange-500 focus:outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={confirmCustomCategory}
                                                            className="p-1.5 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                                                            title="Confirm"
                                                        >
                                                            <CheckIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCustomCategoryWarn(false)}
                                                            className="p-1.5 text-gray-400 hover:text-gray-600"
                                                            title="Cancel"
                                                        >
                                                            <XIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Active Custom Category Indicator */}
                                    {isCustomCategory && !showCustomCategoryWarn && formData.category && (
                                        <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                                            <AlertTriangleIcon className="h-3 w-3" />
                                            <span>Using custom category: <strong>{formData.category}</strong></span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCustomCategoryInput(formData.category);
                                                    setShowCustomCategoryWarn(true);
                                                }}
                                                className="text-orange-800 underline ml-auto"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Mode</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                    value={formData.delivery_mode}
                                    onChange={(e) => setFormData({ ...formData, delivery_mode: e.target.value })}
                                >
                                    <option value="">Select delivery mode</option>
                                    <option value="online">Online</option>
                                    <option value="in-person">In-Person</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                    value={formData.course_type}
                                    onChange={(e) => setFormData({ ...formData, course_type: e.target.value })}
                                >
                                    <option value="">Select course type</option>
                                    {COURSE_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SFIA Level</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                    value={formData.level_code}
                                    onChange={(e) => setFormData({ ...formData, level_code: e.target.value })}
                                >
                                    <option value="">Select SFIA level</option>
                                    {SFIA_LEVEL_CODES.map((level) => (
                                        <option key={level} value={level}>
                                            {level}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                >
                                    <option value="">Select department</option>
                                    {DEPARTMENTS.map((dept) => (
                                        <option key={dept} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                    value={formData.audience}
                                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                >
                                    <option value="">Select audience</option>
                                    {AUDIENCE_OPTIONS.map((audience) => (
                                        <option key={audience} value={audience}>
                                            {audience}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                            value={formData.image_url}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            placeholder="https://..."
                                        />
                                        <label className={`px-4 py-2 rounded-lg cursor-pointer flex items-center transition-colors ${uploadingImage
                                            ? 'bg-[var(--md-surface-variant)] text-[var(--md-on-surface-variant)]'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}>
                                            <UploadIcon className="h-4 w-4 mr-2" />
                                            {uploadingImage ? `${uploadProgress}%` : 'Upload'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                disabled={uploadingImage}
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowMediaPicker(true)}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center transition-colors"
                                        >
                                            <ImageIcon className="h-4 w-4 mr-2" />
                                            Library
                                        </button>
                                    </div>

                                    {uploadingImage && uploadProgress > 0 && (
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-[var(--md-primary)] h-1.5 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    )}

                                    {formData.image_url && !uploadingImage && (
                                        <div className="mt-2 relative group w-32 h-20">
                                            <img
                                                src={formData.image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-lg border border-gray-200"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (Short Summary) *</label>
                            <textarea
                                required
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                placeholder="A short summary of the course"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Highlights</h2>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                value={highlightInput}
                                onChange={(e) => setHighlightInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                                placeholder="Add a highlight"
                            />
                            <button
                                type="button"
                                onClick={addHighlight}
                                className="px-4 py-2 bg-[var(--md-primary)] text-white rounded-lg hover:bg-[var(--md-primary-dark)]"
                            >
                                Add
                            </button>
                        </div>
                        <div className="space-y-2">
                            {formData.highlights.map((highlight, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <span className="text-sm text-gray-700">{highlight}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeHighlight(index)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Outcomes */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Learning Outcomes</h2>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)]"
                                value={outcomeInput}
                                onChange={(e) => setOutcomeInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                                placeholder="Add a learning outcome"
                            />
                            <button
                                type="button"
                                onClick={addOutcome}
                                className="px-4 py-2 bg-[var(--md-primary)] text-white rounded-lg hover:bg-[var(--md-primary-dark)]"
                            >
                                Add
                            </button>
                        </div>
                        <div className="space-y-2">
                            {formData.outcomes.map((outcome, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <span className="text-sm text-gray-700">{outcome}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeOutcome(index)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
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
                            disabled={saving}
                            className="px-4 py-2 bg-[var(--md-primary)] text-white rounded-lg hover:bg-[var(--md-primary-dark)] disabled:opacity-50 flex items-center"
                        >
                            <SaveIcon className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
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

            <MediaPickerModal
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={(url) => {
                    setFormData({ ...formData, image_url: url });
                    setShowMediaPicker(false);
                }}
                allowedTypes={['image/']}
            />
        </div>
    );
}

export default CourseForm;
