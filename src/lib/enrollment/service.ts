import { isSupabaseConfigured } from "../supabase/client";
import { getSupabaseForEnrollment } from "../supabase/serviceClient";

type EnrollmentRow = {
    id: string;
    user_id: string;
    module_id: string;
    started_at: string;
    completed_at: string | null;
    last_accessed_at: string;
    progress_pct: number | string | null;
    status: "active" | "cancelled" | "expired";
    enrollment_method: "explicit" | "auto" | "admin";
    cancelled_at?: string | null;
};

type ModuleRow = {
    id: string;
    slug: string;
};

type LessonRow = {
    id: string;
    module_id: string | null;
    title: string;
    order_index: number;
    is_preview: boolean | null;
};

const getEnrollmentSupabase = () => getSupabaseForEnrollment();

const mapEnrollmentRow = (
    row: EnrollmentRow,
    moduleSlug: string
): CourseEnrollment => ({
    id: row.id,
    userId: row.user_id,
    moduleId: row.module_id,
    courseSlug: moduleSlug,
    enrolledAt: row.started_at,
    status: row.status,
    enrollmentMethod: row.enrollment_method,
    cancelledAt: row.cancelled_at ?? null,
    progressPct: Number(row.progress_pct ?? 0),
    completedAt: row.completed_at ?? null,
    lastAccessedAt: row.last_accessed_at,
});

const resolveModuleBySlug = async (moduleSlug: string): Promise<ModuleRow | null> => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    const supabase = getEnrollmentSupabase();
    const { data, error } = await supabase
        .from("modules")
        .select("id, slug")
        .eq("slug", moduleSlug)
        .eq("status", "published")
        .single();

    if (error) {
        if ((error as any).code === "PGRST116") {
            return null;
        }
        console.error("Error resolving module by slug:", error);
        return null;
    }

    return ((data as unknown) as ModuleRow | null) ?? null;
};

const getEnrollmentRow = async (
    userId: string,
    moduleId: string
): Promise<EnrollmentRow | null> => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    const supabase = getEnrollmentSupabase();
    const { data, error } = await (supabase.from("module_enrollments" as any) as any)
        .select("*")
        .eq("user_id", userId)
        .eq("module_id", moduleId)
        .single();

    if (error) {
        if ((error as any).code === "PGRST116") {
            return null;
        }
        console.error("Error fetching module enrollment:", error);
        return null;
    }

    return (data as EnrollmentRow | null) ?? null;
};

const getLessonRow = async (
    moduleSlug: string,
    lessonId: string
): Promise<LessonRow | null> => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    const module = await resolveModuleBySlug(moduleSlug);
    if (!module) {
        return null;
    }

    const supabase = getEnrollmentSupabase();
    const { data, error } = await supabase
        .from("lessons")
        .select("id, module_id, title, order_index, is_preview")
        .eq("id", lessonId)
        .eq("module_id", module.id)
        .single();

    if (error) {
        if ((error as any).code === "PGRST116") {
            return null;
        }
        console.error("Error fetching lesson for access check:", error);
        return null;
    }

    return (data as LessonRow | null) ?? null;
};

// Types
export interface CourseEnrollment {
    id: string;
    userId: string;
    moduleId?: string;
    courseSlug: string;
    enrolledAt: string;
    status: "active" | "cancelled" | "expired";
    enrollmentMethod: "explicit" | "auto" | "admin";
    cancelledAt?: string | null;
    progressPct?: number;
    completedAt?: string | null;
    lastAccessedAt?: string;
}

export interface EnrollmentResult {
    success: boolean;
    enrollment?: CourseEnrollment;
    error?: string;
}

/**
 * Access Contract - standardized learner access for module-backed experiences.
 */
export interface AccessContract {
    isEnrolled: boolean;
    enrollmentStatus: "active" | "cancelled" | "expired" | null;
    subscriptionStatus?: "active" | "inactive" | null;
    progressPct?: number;
}

export interface Subscription {
    id: string;
    userId: string;
    planId: string;
    status: "active" | "inactive";
    provider: string;
    createdAt: string;
}

/**
 * Check if user is enrolled in a module.
 */
export const isUserEnrolled = async (
    userId: string,
    courseSlug: string
): Promise<boolean> => {
    const enrollment = await getEnrollment(userId, courseSlug);
    return enrollment?.status === "active";
};

/**
 * Get enrollment details for a user and module slug.
 */
export const getEnrollment = async (
    userId: string,
    courseSlug: string
): Promise<CourseEnrollment | null> => {
    if (!userId || !courseSlug || !isSupabaseConfigured()) {
        return null;
    }

    try {
        const module = await resolveModuleBySlug(courseSlug);
        if (!module) {
            return null;
        }

        const row = await getEnrollmentRow(userId, module.id);
        return row ? mapEnrollmentRow(row, module.slug) : null;
    } catch (err) {
        console.error("Error getting enrollment:", err);
        return null;
    }
};

/**
 * Explicitly enroll user in a module.
 */
export const enrollInCourse = async (
    userId: string,
    courseSlug: string,
    method: "explicit" | "auto" = "explicit"
): Promise<EnrollmentResult> => {
    if (!userId || !courseSlug || !isSupabaseConfigured()) {
        return {
            success: false,
            error: "Missing learner or module context",
        };
    }

    try {
        const module = await resolveModuleBySlug(courseSlug);
        if (!module) {
            return {
                success: false,
                error: "Module not found",
            };
        }

        const existing = await getEnrollmentRow(userId, module.id);
        const now = new Date().toISOString();
        const payload = {
            user_id: userId,
            module_id: module.id,
            started_at: existing?.started_at ?? now,
            completed_at: existing?.completed_at ?? null,
            last_accessed_at: now,
            progress_pct: existing?.progress_pct ?? 0,
            status: "active",
            enrollment_method: method,
            cancelled_at: null,
            updated_at: now,
        };

        const supabase = getEnrollmentSupabase();
        const { data, error } = await (supabase.from("module_enrollments" as any) as any)
            .upsert(payload, { onConflict: "user_id,module_id" })
            .select("*")
            .single();

        if (error || !data) {
            console.error("Error enrolling in module:", error);
            return {
                success: false,
                error: error?.message || "Failed to create module enrollment",
            };
        }

        return {
            success: true,
            enrollment: mapEnrollmentRow(data as EnrollmentRow, module.slug),
        };
    } catch (err) {
        console.error("Unexpected error in enrollInCourse:", err);
        return {
            success: false,
            error: "Failed to enroll in module",
        };
    }
};

/**
 * Unenroll user from a module (legacy alias).
 */
export const unenrollFromCourse = async (
    userId: string,
    courseSlug: string
): Promise<EnrollmentResult> => cancelEnrollment(userId, courseSlug);

/**
 * Get all active module enrollments for a user.
 */
export const getUserEnrollments = async (
    userId: string
): Promise<CourseEnrollment[]> => {
    if (!userId || !isSupabaseConfigured()) {
        return [];
    }

    try {
        const supabase = getEnrollmentSupabase();
        const { data, error } = await (supabase.from("module_enrollments" as any) as any)
            .select("id, user_id, module_id, started_at, completed_at, last_accessed_at, progress_pct, status, enrollment_method, cancelled_at, modules!inner(slug)")
            .eq("user_id", userId)
            .eq("status", "active")
            .order("last_accessed_at", { ascending: false });

        if (error || !Array.isArray(data)) {
            console.error("Error getting user module enrollments:", error);
            return [];
        }

        return data
            .map((row: any) => {
                const moduleSlug = row.modules?.slug;
                if (!moduleSlug) {
                    return null;
                }

                return mapEnrollmentRow(row as EnrollmentRow, moduleSlug);
            })
            .filter(Boolean) as CourseEnrollment[];
    } catch (err) {
        console.error("Unexpected error getting user enrollments:", err);
        return [];
    }
};

/**
 * Check if user can access lesson content.
 */
export const canAccessLesson = async (
    userId: string | null,
    courseSlug: string,
    lessonId: string,
    isPreview: boolean = false
): Promise<boolean> => {
    if (isPreview) {
        return true;
    }

    const lesson = await getLessonRow(courseSlug, lessonId);
    if (!lesson) {
        return false;
    }

    if (lesson.is_preview) {
        return true;
    }

    if (!userId) {
        return false;
    }

    const enrollment = await getEnrollment(userId, courseSlug);
    if (!enrollment || enrollment.status !== "active" || !enrollment.moduleId) {
        return false;
    }

    if (lesson.order_index <= 1) {
        return true;
    }

    try {
        const supabase = getEnrollmentSupabase();
        const { data: priorLessons, error: lessonsError } = await supabase
            .from("lessons")
            .select("id")
            .eq("module_id", enrollment.moduleId)
            .lt("order_index", lesson.order_index)
            .order("order_index", { ascending: true });

        if (lessonsError) {
            console.error("Error fetching prerequisite lessons:", lessonsError);
            return false;
        }

        const priorLessonIds = (priorLessons || []).map((row: any) => row.id).filter(Boolean);
        if (priorLessonIds.length === 0) {
            return true;
        }

        const { data: completedRows, error: progressError } = await (supabase.from("module_lesson_progress" as any) as any)
            .select("lesson_id")
            .eq("enrollment_id", enrollment.id)
            .eq("completed", true)
            .in("lesson_id", priorLessonIds);

        if (progressError) {
            console.error("Error fetching prerequisite progress:", progressError);
            return false;
        }

        const completedLessonIds = new Set(
            (completedRows || []).map((row: any) => row.lesson_id).filter(Boolean)
        );

        return priorLessonIds.every((id) => completedLessonIds.has(id));
    } catch (err) {
        console.error("Unexpected error checking lesson access:", err);
        return false;
    }
};

/**
 * Validate enrollment eligibility.
 */
export const validateEnrollmentEligibility = async (
    userId: string,
    courseSlug: string
): Promise<{ eligible: boolean; reason?: string }> => {
    if (!userId) {
        return {
            eligible: false,
            reason: "Authentication required",
        };
    }

    const module = await resolveModuleBySlug(courseSlug);
    if (!module) {
        return {
            eligible: false,
            reason: "Module not found",
        };
    }

    return { eligible: true };
};

/**
 * Placeholder subscription contract.
 */
export const getUserSubscription = async (
    _userId: string
): Promise<Subscription | null> => null;

/**
 * Authoritative learner access contract for module-backed flows.
 */
export const getAccessContract = async (
    userId: string | null,
    courseSlug: string
): Promise<AccessContract> => {
    if (!userId) {
        return {
            isEnrolled: false,
            enrollmentStatus: null,
            subscriptionStatus: null,
            progressPct: 0,
        };
    }

    const enrollment = await getEnrollment(userId, courseSlug);

    return {
        isEnrolled: enrollment?.status === "active",
        enrollmentStatus: enrollment?.status ?? null,
        subscriptionStatus: null,
        progressPct: enrollment?.progressPct ?? 0,
    };
};

/**
 * Cancel an active module enrollment.
 */
export const cancelEnrollment = async (
    userId: string,
    courseSlug: string
): Promise<EnrollmentResult> => {
    if (!userId || !courseSlug || !isSupabaseConfigured()) {
        return {
            success: false,
            error: "Missing learner or module context",
        };
    }

    try {
        const module = await resolveModuleBySlug(courseSlug);
        if (!module) {
            return {
                success: false,
                error: "Module not found",
            };
        }

        const now = new Date().toISOString();
        const supabase = getEnrollmentSupabase();
        const { data, error } = await (supabase.from("module_enrollments" as any) as any)
            .update({
                status: "cancelled",
                cancelled_at: now,
                updated_at: now,
            })
            .eq("user_id", userId)
            .eq("module_id", module.id)
            .select("*")
            .single();

        if (error) {
            if ((error as any).code === "PGRST116") {
                return {
                    success: true,
                };
            }
            console.error("Error cancelling module enrollment:", error);
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: true,
            enrollment: data ? mapEnrollmentRow(data as EnrollmentRow, module.slug) : undefined,
        };
    } catch (err) {
        console.error("Error cancelling enrollment:", err);
        return {
            success: false,
            error: "Failed to cancel enrollment",
        };
    }
};

/**
 * Re-activate or create a module enrollment.
 */
export const reEnrollInCourse = async (
    userId: string,
    courseSlug: string
): Promise<EnrollmentResult> => enrollInCourse(userId, courseSlug, "explicit");
