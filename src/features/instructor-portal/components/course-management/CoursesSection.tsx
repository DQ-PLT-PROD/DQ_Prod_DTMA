/**
 * CoursesSection Component for Instructor Portal
 * 
 * Displays a list of courses with search, filtering, and CRUD operations.
 * Adapted from DWS Admin App for DTMA integration.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditIcon, TrashIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { getSupabaseClient } from '../../lib/dbClient';
import { Toast } from '@/components/ui/Toast';

interface Course {
    id: string;
    slug: string;
    title: string;
    short_description: string | null;
    long_description: string | null;
    category_id: string | null;
    audience_level: string | null;
    topic_tags: string[] | null;
    level_tag: string | null;
    estimated_duration_minutes: number | null;
    lesson_count: number | null;
    hero_image_url: string | null;
    intro_video_url: string | null;
    intro_video_poster_url: string | null;
    is_featured: boolean | null;
    status: string | null;
    rating: number | null;
    review_count: number | null;
    delivery_mode: string | null;
    enrollment_url: string | null;
    learning_outcomes: string[] | null;
    skills_gained: string[] | null;
    upon_completion: string | null;
    start_date: string | null;
    industry: string | null;
    is_coming_soon: boolean | null;
    created_at: string | null;
    updated_at: string | null;
}

export function CoursesSection() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const supabase = getSupabaseClient();
            if (!supabase) {
                throw new Error('Database connection unavailable');
            }

            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCourses(data || []);
        } catch (error: unknown) {
            console.error('Error loading courses:', error);
            const message = error instanceof Error ? error.message : 'Failed to load courses';
            setToast({ type: 'error', message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;

        try {
            const supabase = getSupabaseClient();
            if (!supabase) {
                throw new Error('Database connection unavailable');
            }

            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setToast({ type: 'success', message: 'Course deleted successfully' });
            loadCourses();
        } catch (error: unknown) {
            console.error('Error deleting course:', error);
            const message = error instanceof Error ? error.message : 'Failed to delete course';
            setToast({ type: 'error', message });
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.long_description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--md-primary)] mx-auto"></div>
                    <p className="mt-2 text-[color:var(--md-on-surface-variant)]">Loading courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Courses</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/instructor/course-management/course/new')}
                        className="px-4 py-2 bg-[var(--md-primary)] hover:bg-[var(--md-primary-dark)] text-white rounded-md flex items-center text-sm font-medium transition-colors"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Course
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
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[var(--md-primary)] focus:border-[var(--md-primary)] sm:text-sm"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Duration</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCourses.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                                    {searchQuery ? 'No courses found matching your search' : 'No courses yet. Create your first one!'}
                                </td>
                            </tr>
                        ) : (
                            filteredCourses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            {course.hero_image_url && (
                                                <img
                                                    src={course.hero_image_url}
                                                    alt={course.title}
                                                    className="h-10 w-10 rounded-lg object-cover mr-3"
                                                />
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                                {course.short_description && (
                                                    <div className="text-xs text-gray-500 line-clamp-1">{course.short_description}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{course.category_id || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {course.estimated_duration_minutes ? `${course.estimated_duration_minutes} min` : '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                            course.status === 'published' ? 'bg-green-100 text-green-800' :
                                            course.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                            course.status === 'archived' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {course.status || 'draft'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => navigate(`/instructor/course-management/course/${course.id}`)}
                                                className="text-[var(--md-primary)] hover:text-[var(--md-primary-dark)]"
                                                title="Edit"
                                            >
                                                <EditIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
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

export default CoursesSection;
