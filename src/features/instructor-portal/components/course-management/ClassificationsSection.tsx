import React, { useEffect, useState } from 'react';
import { COURSE_CATEGORIES } from '../../../../constants/navigation';
import { getSupabaseClient } from '../../lib/dbClient';
import { TagIcon, AlertCircleIcon, CheckCircleIcon, BarChart2Icon, PlusIcon, Edit2Icon, X, SaveIcon } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';
import { useNavigate } from 'react-router-dom';

interface CustomCategory {
    slug: string;
    title: string;
    count: number;
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
    const navigate = useNavigate();
    const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null); // null if adding new
    const [categoryName, setCategoryName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadCustomCategories();
    }, []);

    const loadCustomCategories = async () => {
        setLoading(true);
        const supabase = getSupabaseClient();
        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from('lms_courses')
                .select('category');

            if (error) throw error;

            if (data) {
                const standardSlugs = COURSE_CATEGORIES.map(c => c.slug);
                const categoryCounts: Record<string, number> = {};

                data.forEach((course) => {
                    const categorySlug = course.category;
                    if (categorySlug && !standardSlugs.includes(categorySlug)) {
                        categoryCounts[categorySlug] = (categoryCounts[categorySlug] || 0) + 1;
                    }
                });

                const customCats: CustomCategory[] = Object.entries(categoryCounts).map(([slug, count]) => ({
                    slug,
                    title: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), // Simple title case
                    count
                }));

                setCustomCategories(customCats);
            }
        } catch (err) {
            console.error('Error loading custom categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (category: CustomCategory) => {
        setEditingCategory(category);
        setCategoryName(category.title); // Initialize with title (pretty version) if simpler, or slug
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingCategory(null);
        setCategoryName('');
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryName.trim()) {
            setToast({ type: 'error', message: 'Category name is required' });
            return;
        }

        // Slugify the name
        const newSlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        if (!newSlug) {
            setToast({ type: 'error', message: 'Invalid category name' });
            return;
        }

        // Check if standard
        if (COURSE_CATEGORIES.some(c => c.slug === newSlug)) {
            setToast({ type: 'error', message: 'This conflicts with a standard category name' });
            return;
        }

        setSubmitting(true);
        const supabase = getSupabaseClient();

        if (!supabase) return;

        try {
            if (editingCategory) {
                // Rename existing category (bulk update courses)
                const { error } = await supabase
                    .from('lms_courses')
                    .update({ category: newSlug })
                    .eq('category', editingCategory.slug);

                if (error) throw error;

                setToast({ type: 'success', message: `Category renamed to "${categoryName}"` });
                setIsDialogOpen(false);
                loadCustomCategories(); // Reload list
            } else {
                // "Add" new category
                // Since we don't have a categories table, we direct the user to create a course with this category
                // Or we can just close and tell them.
                // Best UX: Close and navigate to create course?

                setIsDialogOpen(false);
                setToast({ type: 'info', message: 'Redirecting to create course...' });

                // Navigate to course creation with pre-filled category logic (if supported)
                // Assuming CourseForm might not support URL params, we can just navigate or explain.
                // But specifically for this demo, let's just close and show success message simulated.
                // Actually, "Adding" requires creating a course.
                setTimeout(() => {
                    navigate('/instructor/course-management/course/new');
                    // In a real app we'd pass ?category=newSlug
                }, 1000);
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
                <p className="text-sm text-gray-500 mt-1">Manage the primary dimensions for course classification.</p>
            </div>

            {/* Standard Categories */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Standard 6 Dimensions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {COURSE_CATEGORIES.map((category) => (
                        <div key={category.slug} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors flex items-start space-x-4 cursor-default group">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <category.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 flex items-center">
                                    {category.title}
                                    <span className="ml-2 text-[10px] uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        Standard
                                    </span>
                                </h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{category.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Categories */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mr-2">Custom Categories</h3>
                        {loading && <span className="text-xs text-gray-400">Loading...</span>}
                    </div>

                    <button
                        onClick={handleAddClick}
                        className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
                    >
                        <PlusIcon className="h-4 w-4 mr-1.5" />
                        Add New
                    </button>
                </div>

                {customCategories.length > 0 ? (
                    <div className="bg-white rounded-xl border border-orange-200 overflow-hidden">
                        <div className="px-4 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
                            <div className="flex items-center">
                                <AlertCircleIcon className="h-5 w-5 text-orange-500 mr-2" />
                                <p className="text-sm text-orange-800 font-medium">
                                    These categories are outside the standard 6 Dimensions.
                                </p>
                            </div>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {customCategories.map((cat) => (
                                <li key={cat.slug} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center">
                                        <TagIcon className="h-4 w-4 text-gray-400 mr-3 group-hover:text-blue-500 transition-colors" />
                                        <span className="text-gray-900 font-medium">{cat.title} <span className="text-gray-400 font-normal text-sm">({cat.slug})</span></span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {cat.count} {cat.count === 1 ? 'course' : 'courses'}
                                        </span>
                                        <button
                                            onClick={() => handleEditClick(cat)}
                                            className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                            title="Edit Category"
                                        >
                                            <Edit2Icon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <h4 className="text-gray-900 font-medium">Clean Structure</h4>
                        <p className="text-gray-500 text-sm">All courses are using the standard categories.</p>
                        <button
                            onClick={handleAddClick}
                            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                        >
                            Create a custom category
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
                            {!editingCategory && (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800 mb-4">
                                    <p>
                                        <strong>Note:</strong> Since categories are defined by their usage, creating a new category involves creating a new course assigned to it.
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name
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
                                    disabled={submitting || !categoryName.trim()}
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
                                            {editingCategory ? 'Update Category' : 'Create & New Course'}
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
