/**
 * Enrollment Service for managing course enrollments
 * Implements DTMA Feature Specification 02 requirements
 */
import { getSupabase, isSupabaseConfigured } from "../lib/supabase/client";
import { useAuth } from "../components/Header";

// Types
export interface CourseEnrollment {
    id: string;
    userId: string;
    courseSlug: string;
    enrolledAt: string;
    status: 'active' | 'revoked';
    enrollmentMethod: 'explicit' | 'auto';
}

export interface EnrollmentResult {
    success: boolean;
    enrollment?: CourseEnrollment;
    error?: string;
}

/**
 * Helper to get Supabase client for enrollment operations
 */
const getEnrollmentSupabase = (): any => {
    return getSupabase();
};

/**
 * Helper to map database row to CourseEnrollment type
 */
const mapRowToEnrollment = (row: any): CourseEnrollment => ({
    id: row.id,
    userId: row.user_id,
    courseSlug: row.course_slug,
    enrolledAt: row.started_at, // Map started_at to enrolledAt for consistency
    status: row.status || 'active',
    enrollmentMethod: row.enrollment_method || 'auto',
});

/**
 * Get current user from auth context
 */
const getCurrentUser = () => {
    // This will be called from components that have access to auth context
    // For now, we'll require userId to be passed in
    return null;
};

/**
 * Check if user is enrolled in a course
 * FR3: Access enforcement point
 */
export const isUserEnrolled = async (
    userId: string,
    courseSlug: string
): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, cannot check enrollment");
        return false;
    }

    try {
        const supabase = getEnrollmentSupabase();
        const { data, error } = await supabase
            .from("user_enrollments")
            .select("id, status")
            .eq("user_id", userId)
            .eq("course_slug", courseSlug)
            .eq("status", "active")
            .single();

        if (error || !data) {
            return false;
        }

        return true;
    } catch (err) {
        console.error("Error checking enrollment:", err);
        return false;
    }
};

/**
 * Get enrollment details for a user and course
 * Spec requirement: getEnrollment(courseId)
 */
export const getEnrollment = async (
    userId: string,
    courseSlug: string
): Promise<CourseEnrollment | null> => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    try {
        const supabase = getEnrollmentSupabase();
        const { data, error } = await supabase
            .from("user_enrollments")
            .select("*")
            .eq("user_id", userId)
            .eq("course_slug", courseSlug)
            .single();

        if (error || !data) {
            return null;
        }

        return mapRowToEnrollment(data);
    } catch (err) {
        console.error("Error getting enrollment:", err);
        return null;
    }
};

/**
 * Explicitly enroll user in a course
 * FR1: Enrollment creation with explicit CTA
 * Spec requirement: enrollInCourse(courseId)
 */
export const enrollInCourse = async (
    userId: string,
    courseSlug: string,
    method: 'explicit' | 'auto' = 'explicit'
): Promise<EnrollmentResult> => {
    if (!isSupabaseConfigured()) {
        return {
            success: false,
            error: "Database not configured"
        };
    }

    try {
        const supabase = getEnrollmentSupabase();

        // Check if already enrolled
        const existingEnrollment = await getEnrollment(userId, courseSlug);
        if (existingEnrollment && existingEnrollment.status === 'active') {
            return {
                success: true,
                enrollment: existingEnrollment
            };
        }

        // Create new enrollment
        const { data, error } = await supabase
            .from("user_enrollments")
            .insert({
                user_id: userId,
                course_slug: courseSlug,
                started_at: new Date().toISOString(),
                last_accessed_at: new Date().toISOString(),
                progress_pct: 0,
                status: 'active',
                enrollment_method: method
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating enrollment:", error);
            return {
                success: false,
                error: error.message
            };
        }

        return {
            success: true,
            enrollment: mapRowToEnrollment(data)
        };
    } catch (err) {
        console.error("Unexpected error in enrollInCourse:", err);
        return {
            success: false,
            error: "Failed to enroll in course"
        };
    }
};

/**
 * Unenroll user from a course (revoke enrollment)
 */
export const unenrollFromCourse = async (
    userId: string,
    courseSlug: string
): Promise<EnrollmentResult> => {
    if (!isSupabaseConfigured()) {
        return {
            success: false,
            error: "Database not configured"
        };
    }

    try {
        const supabase = getEnrollmentSupabase();

        const { data, error } = await supabase
            .from("user_enrollments")
            .update({ 
                status: 'revoked',
                updated_at: new Date().toISOString()
            })
            .eq("user_id", userId)
            .eq("course_slug", courseSlug)
            .select()
            .single();

        if (error) {
            return {
                success: false,
                error: error.message
            };
        }

        return {
            success: true,
            enrollment: data ? mapRowToEnrollment(data) : undefined
        };
    } catch (err) {
        console.error("Error unenrolling from course:", err);
        return {
            success: false,
            error: "Failed to unenroll from course"
        };
    }
};

/**
 * Get all enrollments for a user
 */
export const getUserEnrollments = async (
    userId: string
): Promise<CourseEnrollment[]> => {
    if (!isSupabaseConfigured()) {
        return [];
    }

    try {
        const supabase = getEnrollmentSupabase();
        const { data, error } = await supabase
            .from("user_enrollments")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "active")
            .order("started_at", { ascending: false });

        if (error || !data) {
            return [];
        }

        return data.map(mapRowToEnrollment);
    } catch (err) {
        console.error("Error getting user enrollments:", err);
        return [];
    }
};

/**
 * Check if user can access lesson content
 * FR2: Access rules implementation
 */
export const canAccessLesson = async (
    userId: string | null,
    courseSlug: string,
    lessonId: string,
    isPreview: boolean = false
): Promise<boolean> => {
    // Preview lessons are always accessible
    if (isPreview) {
        return true;
    }

    // Non-authenticated users can only access preview content
    if (!userId) {
        return false;
    }

    // Check if user is enrolled for full content access
    return await isUserEnrolled(userId, courseSlug);
};

/**
 * Validate enrollment eligibility
 * Can be extended for prerequisites, audience level, etc.
 */
export const validateEnrollmentEligibility = async (
    userId: string,
    courseSlug: string
): Promise<{ eligible: boolean; reason?: string }> => {
    // For MVP, all authenticated users are eligible
    // This can be extended for:
    // - Prerequisites checking
    // - Audience level validation
    // - Course capacity limits
    // - Enrollment periods
    
    if (!userId) {
        return {
            eligible: false,
            reason: "Authentication required"
        };
    }

    return {
        eligible: true
    };
};