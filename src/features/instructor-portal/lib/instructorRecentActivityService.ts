/**
 * Instructor Recent Activity Service
 *
 * Fetches the most recently modified courses, modules, lessons, categories, and quizzes.
 * Used for the "Recent Activity" / "Continue Editing" section on the instructor dashboard.
 */

import { getSupabaseClient } from './dbClient';

export type RecentActivityType = 'course' | 'module' | 'lesson' | 'category' | 'quiz';

export interface RecentActivityItem {
    id: string;
    type: RecentActivityType;
    title: string;
    updatedAt: string;
    /** For courses: status (draft/published). For modules/lessons: course slug. Categories/quizzes: n/a */
    context?: string;
}

const LIMIT_PER_TABLE = 5;

/**
 * Fetch 3–5 most recently modified items from courses, modules, lessons, categories, and quizzes.
 * Merges and sorts by updated_at DESC.
 */
export async function fetchRecentActivity(): Promise<RecentActivityItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        return [];
    }

    const [coursesRes, modulesRes, lessonsRes, categoriesRes, quizzesRes] = await Promise.all([
        supabase
            .from('courses')
            .select('id, title, status, updated_at')
            .order('updated_at', { ascending: false })
            .limit(LIMIT_PER_TABLE),
        supabase
            .from('modules')
            .select('id, title, course_slug, updated_at')
            .order('updated_at', { ascending: false })
            .limit(LIMIT_PER_TABLE),
        supabase
            .from('lessons')
            .select('id, title, course_slug, updated_at')
            .order('updated_at', { ascending: false })
            .limit(LIMIT_PER_TABLE),
        supabase
            .from('course_categories')
            .select('id, slug, name, updated_at')
            .or('is_active.is.null,is_active.eq.true')
            .order('updated_at', { ascending: false })
            .limit(LIMIT_PER_TABLE),
        supabase
            .from('quizzes')
            .select('id, title, course_slug, updated_at')
            .order('updated_at', { ascending: false })
            .limit(LIMIT_PER_TABLE),
    ]);

    const items: RecentActivityItem[] = [];

    const courses = coursesRes.data ?? [];
    const modules = modulesRes.data ?? [];
    const lessons = lessonsRes.data ?? [];
    const categories = categoriesRes.data ?? [];
    const quizzes = quizzesRes.data ?? [];

    for (const c of courses) {
        items.push({
            id: c.id,
            type: 'course',
            title: c.title ?? 'Untitled Course',
            updatedAt: c.updated_at ?? new Date().toISOString(),
            context: (c.status ?? 'draft') as string,
        });
    }
    for (const m of modules) {
        items.push({
            id: m.id,
            type: 'module',
            title: m.title ?? 'Untitled Module',
            updatedAt: m.updated_at ?? new Date().toISOString(),
            context: m.course_slug ?? undefined,
        });
    }
    for (const l of lessons) {
        items.push({
            id: l.id,
            type: 'lesson',
            title: l.title ?? 'Untitled Lesson',
            updatedAt: l.updated_at ?? new Date().toISOString(),
            context: l.course_slug ?? undefined,
        });
    }
    for (const cat of categories) {
        items.push({
            id: cat.id,
            type: 'category',
            title: cat.name ?? cat.slug ?? 'Untitled Category',
            updatedAt: cat.updated_at ?? new Date().toISOString(),
        });
    }
    for (const q of quizzes) {
        items.push({
            id: q.id,
            type: 'quiz',
            title: q.title ?? 'Untitled Quiz',
            updatedAt: q.updated_at ?? new Date().toISOString(),
            context: q.course_slug ?? undefined,
        });
    }

    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return items.slice(0, 5);
}
