/**
 * Enrollment Service for managing course enrollments
 * Implements DTMA Feature Specification 02 requirements
 * 
 * Uses Supabase service role for database operations to bypass RLS
 * since we're using Azure AD authentication instead of Supabase auth.
 */
import { getSupabaseForEnrollment, isServiceRoleConfigured } from "../../../lib/supabase/serviceClient";
import { isSupabaseConfigured } from "../../../lib/supabase/client";

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
 * Uses service role to bypass RLS for Azure AD authenticated users
 */
const getEnrollmentSupabase = (): any => {
    return getSupabaseForEnrollment();
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
            .maybeSingle();

        if (error) {
            // If no record found, user is not enrolled
            if (error.code === 'PGRST116') {
                return false;
            }
            console.error("Error checking enrollment:", error);
            return false;
        }

        return Boolean(data);
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
            .maybeSingle();

        if (error) {
            // If no record found, return null
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error("Error getting enrollment:", error);
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
        console.log('🎯 Starting enrollment process...');
        console.log('User ID:', userId);
        console.log('Course Slug:', courseSlug);
        console.log('Method:', method);
        
        const supabase = getEnrollmentSupabase();
        console.log('✅ Got Supabase client for enrollment');

        // Check if already enrolled
        console.log('🔍 Checking existing enrollment...');
        const existingEnrollment = await getEnrollment(userId, courseSlug);
        if (existingEnrollment && existingEnrollment.status === 'active') {
            console.log('✅ User already enrolled');
            return {
                success: true,
                enrollment: existingEnrollment
            };
        }

        // Create new enrollment
        console.log('📝 Creating new enrollment...');
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
            console.error("❌ Error creating enrollment:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            console.error("Error details:", error.details);
            return {
                success: false,
                error: error.message
            };
        }

        console.log('✅ Enrollment created successfully:', data);
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
