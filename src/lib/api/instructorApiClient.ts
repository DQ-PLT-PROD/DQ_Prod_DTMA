/**
 * Instructor API Client
 * Calls Express backend for instructor mutations (courses, modules, lessons, quizzes, etc.)
 * Uses Supabase session access_token for auth. All mutations go through /api/admin.
 */

import { getSupabase } from '@/lib/supabase/client';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const ADMIN_PREFIX = '/admin';

async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function request<T = any>(
  method: string,
  path: string,
  body?: object
): Promise<{ ok: boolean; data?: T; message?: string; error?: string }> {
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, message: 'Authentication required. Please sign in.' };
  }

  const url = `${API_BASE}${ADMIN_PREFIX}${path}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const contentType = res.headers.get("content-type");
  const data = (contentType?.includes("application/json")
    ? await res.json().catch(() => ({}))
    : {}) as { ok?: boolean; message?: string; error?: string; code?: string; id?: string; slug?: string };

  if (!res.ok) {
    const msg = data?.message || data?.error || `Request failed: ${res.status}`;
    return {
      ok: false,
      message: msg,
      error: msg,
    };
  }
  return { ok: true, data: data as T, message: data?.message };
}

export const instructorApi = {
  // Courses (POST /api/admin/course, PATCH /api/admin/course/:id, etc.)
  createCourse: (payload: Record<string, unknown>) =>
    request<{ slug?: string; id?: string }>('POST', '/course', payload),
  updateCourse: (id: string, payload: Record<string, unknown>) =>
    request('PATCH', `/course/${encodeURIComponent(id)}`, payload),
  deleteCourse: (id: string) =>
    request('DELETE', `/course/${encodeURIComponent(id)}`),
  publishCourse: (slug: string) =>
    request('POST', `/course/${encodeURIComponent(slug)}/publish`),
  unpublishCourse: (slug: string) =>
    request('POST', `/course/${encodeURIComponent(slug)}/unpublish`),

  // Modules
  createModule: (payload: Record<string, unknown>) =>
    request<{ id?: string }>('POST', '/module', payload),
  updateModule: (id: string, payload: Record<string, unknown>) =>
    request('PATCH', `/module/${id}`, payload),
  deleteModule: (id: string) => request('DELETE', `/module/${id}`),

  // Lessons
  createLesson: (payload: Record<string, unknown>) =>
    request<{ id?: string }>('POST', '/lesson', payload),
  updateLesson: (id: string, payload: Record<string, unknown>) =>
    request('PATCH', `/lesson/${id}`, payload),
  deleteLesson: (id: string) => request('DELETE', `/lesson/${id}`),

  // Quizzes
  createQuiz: (payload: Record<string, unknown>) =>
    request<{ id?: string }>('POST', '/quiz', payload),
  updateQuiz: (id: string, payload: Record<string, unknown>) =>
    request('PATCH', `/quiz/${id}`, payload),
  deleteQuiz: (id: string) => request('DELETE', `/quiz/${id}`),

  // Quiz Questions
  createQuizQuestion: (payload: Record<string, unknown>) =>
    request<{ id?: string }>('POST', '/quiz-question', payload),
  updateQuizQuestion: (id: string, payload: Record<string, unknown>) =>
    request('PATCH', `/quiz-question/${id}`, payload),
  deleteQuizQuestion: (id: string) =>
    request('DELETE', `/quiz-question/${id}`),

  // Course Resources
  createCourseResource: (payload: Record<string, unknown>) =>
    request<{ id?: string }>('POST', '/course-resource', payload),
  updateCourseResource: (id: string, payload: Record<string, unknown>) =>
    request('PATCH', `/course-resource/${id}`, payload),
  deleteCourseResources: (ids: string[]) =>
    request('POST', '/course-resources/delete-batch', { ids }),

  // Course Categories
  createCourseCategory: (payload: Record<string, unknown>) =>
    request<{ slug?: string; id?: string }>('POST', '/course-category', payload),
  updateCourseCategory: (slug: string, payload: Record<string, unknown>) =>
    request('PATCH', `/course-category/${encodeURIComponent(slug)}`, payload),
  deleteCourseCategory: (slug: string) =>
    request('DELETE', `/course-category/${encodeURIComponent(slug)}`),
};
