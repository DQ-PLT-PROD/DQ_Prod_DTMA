import { getSupabase, isSupabaseConfigured } from '../../../lib/supabase/client';
import type { AppAbility } from '../../../config/abilities';
import { subject } from '@casl/ability';

export type PublishResult = { ok: true } | { ok: false; message: string };

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }
  return getSupabase();
}

function requireOwnCourseFields(course: any) {
  if (!course) return 'Course not found';
  if (!course.slug) return 'Course slug missing';
  if (!course.owner_user_id) return 'Course owner missing (owner_user_id)';
  return null;
}

async function fetchCourseMinimal(slug: string) {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from('courses')
    .select('slug, title, short_description, status, owner_user_id')
    .eq('slug', slug)
    .single();
  if (error) {
    return { course: null as any, error };
  }
  return { course: data as any, error: null };
}

export async function listInstructorCourses(currentUserId: string) {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from('courses')
    .select('slug, title, status, updated_at, created_at')
    // Use filter to avoid TS column checks if schema not updated yet
    .filter('owner_user_id', 'eq', currentUserId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createDraftCourse(
  currentUserId: string,
  payload: { slug: string; title: string; short_description?: string }
) {
  const supabase = ensureSupabase();
  if (!payload?.slug || !payload?.title) {
    throw new Error('slug and title are required');
  }
  const insertRow: any = {
    ...payload,
    status: 'draft',
    owner_user_id: currentUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('courses').insert(insertRow).select('slug').single();
  if (error) throw error;
  return data;
}

export async function updateInstructorCourse(
  slug: string,
  currentUserId: string,
  updates: Record<string, any>,
  ability?: AppAbility
) {
  const supabase = ensureSupabase();
  // Ownership check
  const { course, error: fetchErr } = await fetchCourseMinimal(slug);
  if (fetchErr) throw fetchErr;
  const missing = requireOwnCourseFields(course);
  if (missing) throw new Error(missing);
  if (course.owner_user_id !== currentUserId) throw new Error('Forbidden');

  const allowedKeys = new Set([
    'title',
    'short_description',
    'long_description',
    'category_id',
    'topic_tags',
    'level_tag',
    'estimated_duration_minutes',
    'thumbnail_url',
    'intro_video_url',
    'intro_video_poster_url',
    'learning_outcomes',
    'skills_gained',
    'upon_completion',
    'start_date',
    'industry',
    'enrollment_url',
  ]);

  const sanitized: any = {};
  for (const [k, v] of Object.entries(updates || {})) {
    if (allowedKeys.has(k)) sanitized[k] = v;
  }
  sanitized.updated_at = new Date().toISOString();

  // CASL check: can update this course
  if (ability && !ability.can('update', subject('course', course))) {
    throw new Error('Forbidden');
  }

  const { error } = await supabase
    .from('courses')
    .update(sanitized)
    .filter('owner_user_id', 'eq', currentUserId)
    .eq('slug', slug);
  if (error) throw error;
  return { ok: true } as const;
}

export async function publishCourse(slug: string, currentUserId: string, ability?: AppAbility): Promise<PublishResult> {
  const supabase = ensureSupabase();
  const { course, error } = await fetchCourseMinimal(slug);
  if (error) return { ok: false, message: error.message };
  const missing = requireOwnCourseFields(course);
  if (missing) return { ok: false, message: missing };
  if (course.owner_user_id !== currentUserId) return { ok: false, message: 'Forbidden' };

  if (!course.title || !String(course.title).trim()) {
    return { ok: false, message: 'Title is required before publishing' };
  }
  if (!course.short_description || !String(course.short_description).trim()) {
    return { ok: false, message: 'Description is required before publishing' };
  }

  // CASL check
  if (ability && !ability.can('publish', subject('course', course))) {
    return { ok: false, message: 'Forbidden' };
  }

  const { error: upErr } = await supabase
    .from('courses')
    .update({ status: 'published', updated_at: new Date().toISOString() } as any)
    .filter('owner_user_id', 'eq', currentUserId)
    .eq('slug', slug);
  if (upErr) return { ok: false, message: upErr.message };
  return { ok: true };
}

export async function unpublishCourse(slug: string, currentUserId: string, ability?: AppAbility): Promise<PublishResult> {
  const supabase = ensureSupabase();
  const { course, error } = await fetchCourseMinimal(slug);
  if (error) return { ok: false, message: error.message };
  const missing = requireOwnCourseFields(course);
  if (missing) return { ok: false, message: missing };
  if (course.owner_user_id !== currentUserId) return { ok: false, message: 'Forbidden' };

  // CASL check
  if (ability && !ability.can('unpublish', subject('course', course))) {
    return { ok: false, message: 'Forbidden' };
  }

  const { error: upErr } = await supabase
    .from('courses')
    .update({ status: 'draft', updated_at: new Date().toISOString() } as any)
    .filter('owner_user_id', 'eq', currentUserId)
    .eq('slug', slug);
  if (upErr) return { ok: false, message: upErr.message };
  return { ok: true };
}

export async function deleteDraftCourse(slug: string, currentUserId: string, ability?: AppAbility) {
  const supabase = ensureSupabase();
  const { course, error } = await fetchCourseMinimal(slug);
  if (error) throw error;
  const missing = requireOwnCourseFields(course);
  if (missing) throw new Error(missing);
  if (course.owner_user_id !== currentUserId) throw new Error('Forbidden');
  if (course.status === 'published') throw new Error('Cannot delete published courses');

  // CASL check
  if (ability && !ability.can('delete', subject('course', course))) {
    throw new Error('Forbidden');
  }

  const { error: delErr } = await supabase
    .from('courses')
    .delete()
    .filter('owner_user_id', 'eq', currentUserId)
    .eq('slug', slug);
  if (delErr) throw delErr;
  return { ok: true } as const;
}

export async function addCourseResourceLink(
  courseSlug: string,
  currentUserId: string,
  resource: { title: string; resource_url: string; type?: string; description?: string }
) {
  const supabase = ensureSupabase();
  // ensure ownership
  const { course, error } = await fetchCourseMinimal(courseSlug);
  if (error) throw error;
  const missing = requireOwnCourseFields(course);
  if (missing) throw new Error(missing);
  if (course.owner_user_id !== currentUserId) throw new Error('Forbidden');

  if (!resource?.title || !resource?.resource_url) {
    throw new Error('Resource title and resource_url are required');
  }

  const insertRow: any = {
    course_slug: courseSlug,
    title: resource.title,
    resource_url: resource.resource_url,
    type: resource.type || 'other',
    description: resource.description || null,
    order_index: 0,
    created_at: new Date().toISOString(),
  };

  const { data, error: insErr } = await supabase
    .from('course_resources')
    .insert(insertRow)
    .select('id, title, resource_url')
    .single();
  if (insErr) throw insErr;
  return data;
}

export async function removeCourseResourceLink(
  courseSlug: string,
  currentUserId: string,
  resourceId: string
) {
  const supabase = ensureSupabase();
  // ensure ownership
  const { course, error } = await fetchCourseMinimal(courseSlug);
  if (error) throw error;
  const missing = requireOwnCourseFields(course);
  if (missing) throw new Error(missing);
  if (course.owner_user_id !== currentUserId) throw new Error('Forbidden');

  const { error: delErr } = await supabase
    .from('course_resources')
    .delete()
    .eq('id', resourceId)
    .eq('course_slug', courseSlug);
  if (delErr) throw delErr;
  return { ok: true } as const;
}
