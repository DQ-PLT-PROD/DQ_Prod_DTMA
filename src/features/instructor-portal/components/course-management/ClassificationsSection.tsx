import React, { useEffect, useState } from 'react';
import { COURSE_CATEGORIES } from '../../../../constants/navigation';
import { getSupabaseClient } from '../../lib/dbClient';
import { useAdminAuth } from '@/lib/admin-auth';
import { instructorApi } from '@/lib/api/instructorApiClient';
import { TagIcon, AlertCircleIcon, CheckCircleIcon, BarChart2Icon, PlusIcon, Edit2Icon, TrashIcon, X, SaveIcon } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';

interface CategoryInUse {
    slug: string;
    title: string;
    description: string | null;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
}

export function ClassificationsSection() {
    return (
        <div className="space-y-12">
            {/* Categories Subsection */}
            <CategoriesSubsection />

            {/* Difficulty Levels Subsection (Coming Soon) */}
            <DifficultyLevelsSubsection />
        </div>
    );
}

function CategoriesSubsection() {
    const { ability } = useAdminAuth();
    const [categories, setCategories] = useState<CategoryInUse[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryInUse | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const canCreateCategory = ability.can('create', 'Category');
    const canUpdateCategory = ability.can('update', 'Category');
    const canDeleteCategory = ability.can('delete', 'Category');

    const slugToIcon = Object.fromEntries(COURSE_CATEGORIES.map((c) => [c.slug, c.icon]));

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        const supabase = getSupabaseClient();
        if (!supabase) return;

        try {
            // Get all categories from course_categories
            const { data: catData, error: catError } = await supabase
                .from('course_categories')
                .select('slug, name, description, display_order')
                .or('is_active.is.null,is_active.eq.true')
                .order('display_order', { ascending: true });

            if (catError) throw catError;
            if (!catData?.length) {
                setCategories([]);
                return;
            }

            // Get course counts per category
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('category_id');

            if (courseError) throw courseError;
            const categoryCounts: Record<string, number> = {};
            (courseData ?? []).forEach((row) => {
                const slug = row.category_id;
                if (slug) categoryCounts[slug] = (categoryCounts[slug] || 0) + 1;
            });

            const result: CategoryInUse[] = catData.map((c) => {
                const Icon = slugToIcon[c.slug] ?? TagIcon;
                return {
                    slug: c.slug,
                    title: c.name,
                    description: c.description ?? null,
                    count: categoryCounts[c.slug] ?? 0,
                    icon: Icon,
                };
            });

            setCategories(result);
        } catch (err) {
            console.error('Error loading categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (category: CategoryInUse) => {
        setEditingCategory(category);
        setCategoryName(category.title);
        setCategoryDescription(category.description ?? '');
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingCategory(null);
        setCategoryName('');
        setCategoryDescription('');
        setIsDialogOpen(true);
    };

    const handleDeleteClick = async (category: CategoryInUse) => {
        if (!canDeleteCategory) {
            setToast({ type: 'error', message: 'You do not have permission to delete categories.' });
            return;
        }
        const message =
            category.count > 0
                ? `Delete "${category.title}"? ${category.count} course(s) will have their category cleared.`
                : `Delete "${category.title}"?`;
        if (!window.confirm(message)) return;
        try {
            const result = await instructorApi.deleteCourseCategory(category.slug);
            if (!result.ok) throw new Error(result.message);
            setToast({ type: 'success', message: `Category "${category.title}" deleted.` });
            loadCategories();
        } catch (err) {
            console.error('Error deleting category:', err);
            setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete category' });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory && !canUpdateCategory) {
            setToast({ type: 'error', message: 'You do not have permission to update categories.' });
            return;
        }
        if (!editingCategory && !canCreateCategory) {
            setToast({ type: 'error', message: 'You do not have permission to create categories.' });
            return;
        }

        if (!categoryName.trim()) {
            setToast({ type: 'error', message: 'Category name is required' });
            return;
        }

        const newSlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        if (!newSlug) {
            setToast({ type: 'error', message: 'Invalid category name' });
            return;
        }

        if (COURSE_CATEGORIES.some((c) => c.slug === newSlug)) {
            setToast({ type: 'error', message: 'This conflicts with a standard category name' });
            return;
        }

        setSubmitting(true);
        const supabase = getSupabaseClient();
        if (!supabase) return;

        try {
            if (editingCategory) {
                if (newSlug !== editingCategory.slug) {
                    const { data: existing } = await supabase
                        .from('course_categories')
                        .select('slug')
                        .eq('slug', newSlug)
                        .maybeSingle();
                    if (existing) {
                        setToast({ type: 'error', message: 'A category with this slug already exists' });
                        setSubmitting(false);
                        return;
                    }
                }
                const result = await instructorApi.updateCourseCategory(editingCategory.slug, {
                    ...(newSlug !== editingCategory.slug && { slug: newSlug }),
                    name: categoryName.trim(),
                    description: categoryDescription.trim() || null,
                });
                if (!result.ok) throw new Error(result.message);

                setToast({ type: 'success', message: `Category updated to "${categoryName}"` });
                setIsDialogOpen(false);
                loadCategories();
            } else {
                const { data: existing } = await supabase
                    .from('course_categories')
                    .select('slug')
                    .eq('slug', newSlug)
                    .maybeSingle();
                if (existing) {
                    setToast({ type: 'error', message: 'A category with this name already exists' });
                    setSubmitting(false);
                    return;
                }
                const result = await instructorApi.createCourseCategory({
                    slug: newSlug,
                    name: categoryName.trim(),
                    description: categoryDescription.trim() || null,
                });
                if (!result.ok) throw new Error(result.message);
                setToast({ type: 'success', message: `Category "${categoryName}" added.` });
                setIsDialogOpen(false);
                loadCategories();
            }
        } catch (error) {
            console.error('Error saving category:', error);
            setToast({ type: 'error', message: 'Failed to update category' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-2">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <TagIcon className="h-5 w-5 mr-2 text-[var(--md-primary)]" />
                    Categories
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Manage categories for course classification. Add new categories here—they will appear in the dropdown when creating or editing courses.
                </p>
            </div>

            {/* Categories from courses table */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mr-2">
                            Categories in use
                        </h3>
                        {loading && <span className="text-xs text-gray-400">Loading...</span>}
                    </div>

                    <button
                        onClick={() => {
                            if (!canCreateCategory) {
                                setToast({ type: 'error', message: 'You do not have permission to create categories.' });
                                return;
                            }
                            handleAddClick();
                        }}
                        disabled={!canCreateCategory}
                        className="flex items-center px-4 py-2 bg-[var(--md-primary)] hover:bg-[var(--md-primary-hover)] text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PlusIcon className="h-4 w-4 mr-1.5" />
                        Add New
                    </button>
                </div>

                {categories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((cat) => (
                            <div
                                key={cat.slug}
                                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors flex items-start space-x-4 group"
                            >
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <cat.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 flex items-center">
                                        {cat.title}
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {cat.count} {cat.count === 1 ? 'course' : 'courses'}
                                        </span>
                                    </h3>
                                    {cat.description && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => handleEditClick(cat)}
                                        disabled={!canUpdateCategory}
                                        className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                        title="Edit Category"
                                    >
                                        <Edit2Icon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(cat)}
                                        disabled={!canDeleteCategory}
                                        className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                        title="Delete Category"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <h4 className="text-gray-900 font-medium">No categories yet</h4>
                        <p className="text-gray-500 text-sm">
                            Add a category to get started. Categories will appear in the dropdown when creating or editing courses.
                        </p>
                        <button
                            onClick={() => {
                                if (!canCreateCategory) {
                                    setToast({ type: 'error', message: 'You do not have permission to create categories.' });
                                    return;
                                }
                                handleAddClick();
                            }}
                            disabled={!canCreateCategory}
                            className="mt-4 px-4 py-2 bg-[var(--md-primary)] hover:bg-[var(--md-primary-hover)] text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PlusIcon className="h-4 w-4 inline mr-1.5" />
                            Add New Category
                        </button>
                    </div>
                )}
            </div>

            {/* Editor Modal */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </h3>
                            <button
                                onClick={() => setIsDialogOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. Emerging Technologies"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    autoFocus
                                />
                                {categoryName && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Slug: <span className="font-mono text-gray-600">{categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}</span>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (optional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Brief description of this category"
                                    value={categoryDescription}
                                    onChange={(e) => setCategoryDescription(e.target.value)}
                                />
                            </div>

                            {editingCategory && (
                                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
                                    <p className="font-medium flex items-center mb-1">
                                        <AlertCircleIcon className="h-3 w-3 mr-1" />
                                        Warning
                                    </p>
                                    <p>
                                        Renaming this category will update <strong>{editingCategory.count}</strong> existing course(s). This action cannot be undone.
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        submitting ||
                                        !categoryName.trim() ||
                                        (editingCategory ? !canUpdateCategory : !canCreateCategory)
                                    }
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitting ? (
                                        <span className="flex items-center">
                                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>
                                            Saving...
                                        </span>
                                    ) : (
                                        <>
                                            <SaveIcon className="h-4 w-4 mr-2" />
                                            {editingCategory ? 'Update Category' : 'Add Category'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

function DifficultyLevelsSubsection() {
    return (
        <div className="space-y-6 opacity-60">
            <div className="border-b border-gray-200 pb-2 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <BarChart2Icon className="h-5 w-5 mr-2 text-gray-500" />
                        Difficulty Levels
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Define standard difficulty tiers for learning content.</p>
                </div>
                <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming Soon</span>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center cursor-not-allowed">
                <div className="max-w-md mx-auto">
                    <BarChart2Icon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Level Management</h3>
                    <p className="text-gray-500 text-sm mt-1">
                        Future updates will allow you to customize difficulty levels (e.g., Beginner, Intermediate, Advanced) and map them to course metadata.
                    </p>
                </div>
            </div>
        </div>
    );
}
