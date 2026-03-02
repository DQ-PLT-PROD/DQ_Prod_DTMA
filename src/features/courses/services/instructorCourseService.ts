import { subject } from "@casl/ability";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

type AbilityLike = {
  can: (action: string, target: unknown) => boolean;
};

type CourseRow = {
  slug: string;
  title: string | null;
  short_description: string | null;
  status: string | null;
  owner_user_id: string | null;
};

type MutationResult = {
  ok: boolean;
  message: string;
};

type DraftCoursePayload = {
  slug: string;
  title: string;
  short_description?: string;
  [key: string]: unknown;
};

const getCourseMinimal = async (courseSlug: string): Promise<CourseRow | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await getSupabase()
    .from("courses")
    .select("*")
    .eq("slug", courseSlug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as CourseRow;
};

const isOwner = (course: CourseRow, userId: string) => course.owner_user_id === userId;

const canMutate = (
  ability: AbilityLike | undefined,
  action: string,
  course: CourseRow
): boolean => {
  if (!ability) {
    return true;
  }
  return ability.can(action, subject("Course", course));
};

const validatePublishable = (course: CourseRow): string | null => {
  if (!course.title?.trim()) {
    return "Title is required";
  }
  if (!course.short_description?.trim()) {
    return "Short description is required";
  }
  return null;
};

export const listInstructorCourses = async (userId: string): Promise<any[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await getSupabase()
    .from("courses")
    .select("*")
    .filter("owner_user_id", "eq", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    return [];
  }

  return data || [];
};

export const publishCourse = async (
  courseSlug: string,
  userId: string,
  ability?: AbilityLike
): Promise<MutationResult> => {
  const course = await getCourseMinimal(courseSlug);
  if (!course) {
    return { ok: false, message: "Course not found" };
  }
  if (!isOwner(course, userId)) {
    return { ok: false, message: "Forbidden" };
  }
  if (!canMutate(ability, "publish", course)) {
    return { ok: false, message: "Forbidden" };
  }

  const validationMessage = validatePublishable(course);
  if (validationMessage) {
    return { ok: false, message: validationMessage };
  }

  const { error } = await getSupabase()
    .from("courses")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .filter("slug", "eq", courseSlug)
    .eq("owner_user_id", userId);

  if (error) {
    return { ok: false, message: error.message || "Failed to publish course" };
  }

  return { ok: true, message: "Published" };
};

export const unpublishCourse = async (
  courseSlug: string,
  userId: string,
  ability?: AbilityLike
): Promise<MutationResult> => {
  const course = await getCourseMinimal(courseSlug);
  if (!course) {
    return { ok: false, message: "Course not found" };
  }
  if (!isOwner(course, userId)) {
    return { ok: false, message: "Forbidden" };
  }
  if (!canMutate(ability, "unpublish", course)) {
    return { ok: false, message: "Forbidden" };
  }

  const { error } = await getSupabase()
    .from("courses")
    .update({
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .filter("slug", "eq", courseSlug)
    .eq("owner_user_id", userId);

  if (error) {
    return { ok: false, message: error.message || "Failed to unpublish course" };
  }

  return { ok: true, message: "Unpublished" };
};

export const createDraftCourse = async (
  userId: string,
  payload: DraftCoursePayload
): Promise<{ slug: string } | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const draftPayload = {
    ...payload,
    short_description: payload.short_description || "",
    status: "draft",
    owner_user_id: userId,
  };

  const { data, error } = await getSupabase()
    .from("courses")
    .insert(draftPayload)
    .select("slug")
    .single();

  if (error || !data?.slug) {
    return null;
  }

  return { slug: data.slug };
};

export const updateInstructorCourse = async (
  courseSlug: string,
  userId: string,
  updates: Record<string, unknown>
): Promise<MutationResult> => {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase not configured" };
  }

  const { error } = await getSupabase()
    .from("courses")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .filter("slug", "eq", courseSlug)
    .eq("owner_user_id", userId);

  if (error) {
    return { ok: false, message: error.message || "Failed to update course" };
  }

  return { ok: true, message: "Updated" };
};

export const deleteDraftCourse = async (
  courseSlug: string,
  userId: string,
  ability?: AbilityLike
): Promise<MutationResult> => {
  const course = await getCourseMinimal(courseSlug);
  if (!course) {
    return { ok: false, message: "Course not found" };
  }
  if (!isOwner(course, userId)) {
    return { ok: false, message: "Forbidden" };
  }
  if (!canMutate(ability, "delete", course)) {
    return { ok: false, message: "Forbidden" };
  }
  if (course.status === "published") {
    return { ok: false, message: "Cannot delete a published course" };
  }

  const { error } = await getSupabase()
    .from("courses")
    .delete()
    .filter("slug", "eq", courseSlug)
    .eq("owner_user_id", userId);

  if (error) {
    return { ok: false, message: error.message || "Failed to delete course" };
  }

  return { ok: true, message: "Deleted" };
};
