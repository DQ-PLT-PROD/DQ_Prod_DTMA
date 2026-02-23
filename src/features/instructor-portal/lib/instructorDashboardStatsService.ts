/**
 * Instructor Dashboard Stats Service
 *
 * Fetches live counts for the instructor dashboard: courses (draft/published)
 * and active students. Uses service role for enrollment counts since RLS
 * restricts user_enrollments to own enrollments.
 */

import { getSupabaseClient, getSupabaseClientWithRLSOverride } from './dbClient';

export interface InstructorDashboardStats {
    totalCourses: number;
    draftCourses: number;
    publishedCourses: number;
    activeStudents: number;
}

/**
 * Fetch dashboard stats: course counts (draft, published) and active students.
 * Course counts use regular client; active students use RLS override to read
 * all enrollments (instructor cannot see other users' enrollments via RLS).
 */
export async function fetchInstructorDashboardStats(): Promise<InstructorDashboardStats> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        return { totalCourses: 0, draftCourses: 0, publishedCourses: 0, activeStudents: 0 };
    }

    const [courseStats, activeStudents] = await Promise.all([
        fetchCourseStats(supabase),
        fetchActiveStudentsCount(supabase),
    ]);

    return {
        ...courseStats,
        activeStudents,
    };
}

async function fetchCourseStats(
    supabase: ReturnType<typeof getSupabaseClient>
): Promise<{ totalCourses: number; draftCourses: number; publishedCourses: number }> {
    const { data, error } = await supabase
        .from('courses')
        .select('id, status');

    if (error) {
        console.error('Error fetching courses for stats:', error);
        return { totalCourses: 0, draftCourses: 0, publishedCourses: 0 };
    }

    const courses = data ?? [];
    const draftCourses = courses.filter((c) => (c.status ?? 'draft') === 'draft').length;
    const publishedCourses = courses.filter((c) => c.status === 'published').length;
    const totalCourses = draftCourses + publishedCourses;

    return { totalCourses, draftCourses, publishedCourses };
}

async function fetchActiveStudentsCount(
    supabase: ReturnType<typeof getSupabaseClient>
): Promise<number> {
    // Use RLS override to read enrollments; regular client only returns
    // the current user's enrollments
    const client = getSupabaseClientWithRLSOverride() ?? supabase;

    const { data, error } = await client
        .from('user_enrollments')
        .select('user_id')
        .eq('status', 'active');

    if (error) {
        console.error('Error fetching active students count:', error);
        return 0;
    }

    const enrollments = data ?? [];
    const uniqueUserIds = new Set(enrollments.map((e) => e.user_id));
    return uniqueUserIds.size;
}
