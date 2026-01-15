/**
 * Enrollment Service for managing course enrollments
 * Implements DTMA Feature Specification 02 requirements
 * 
 * Uses Supabase service role for database operations to bypass RLS
 * since we're using Azure AD authentication instead of Supabase auth.
 */
import { getSupabaseForEnrollment, isServiceRoleConfigured } from "../../../lib/supabase/serviceClient";
import { isSupabaseConfigured } from "../../../lib/supabase/client";
import type { Database } from "../../../lib/supabase/types";

// Type aliases for better readability
type UserEnrollmentRow = Database['public']['Tables']['user_enrollments']['Row'];
type UserEnrollmentInsert = Database['public']['Tables']['user_enrollments']['Insert'];

// Types
export interface CourseEnrollment {
    id: string;
    userId: string;
    courseSlug: string;
    enrolledAt: string;
    status: 'active' | 'cancelled' | 'expired';
    enrollmentMethod: 'explicit' | 'auto';
    cancelledAt?: string | null;
}

export interface EnrollmentResult {
    success: boolean;
    enrollment?: CourseEnrollment;
    error?: string;
}

/**
 * Access Contract - Standardized interface for access control
 * Spec requirement: Stable read contract for other features
 */
export interface AccessContract {
    isEnrolled: boolean;
    enrollmentStatus: 'active' | 'cancelled' | 'expired' | null;
    subscriptionStatus?: 'active' | 'inactive' | null;
}

export interface Subscription {
    id: string;
    userId: string;
    planId: string;
    status: 'active' | 'inactive';
    provider: string;
    createdAt: string;
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
const mapRowToEnrollment = (row: UserEnrollmentRow): CourseEnrollment => ({
    id: row.id,
    userId: row.user_id,
    courseSlug: row.course_slug,
    enrolledAt: row.started_at,
    status: (row.status as 'active' | 'cancelled' | 'expired') || 'active',
    enrollmentMethod: (row.enrollment_method as 'explicit' | 'auto') || 'auto',
    cancelledAt: (row as any).cancelled_at || null,
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
            .single();

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
        const enrollmentData: UserEnrollmentInsert = {
            user_id: userId,
            course_slug: courseSlug,
            started_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
            progress_pct: 0,
            status: 'active',
            enrollment_method: method
        };

        const { data, error } = await supabase
            .from("user_enrollments")
            .insert(enrollmentData)
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
 * Unenroll user from a course (legacy function, use cancelEnrollment instead)
 * @deprecated Use cancelEnrollment for spec compliance
 */
export const unenrollFromCourse = async (
    userId: string,
    courseSlug: string
): Promise<EnrollmentResult> => {
    // Delegate to cancelEnrollment for consistency
    return await cancelEnrollment(userId, courseSlug);
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

/**
 * Get user's active subscription (if any)
 * Spec requirement: Support subscription status in access contract
 */
export const getUserSubscription = async (
    userId: string
): Promise<Subscription | null> => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    try {
        const supabase = getEnrollmentSupabase();
        const { data, error } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error) {
            // If no subscription found, return null (not an error)
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error("Error getting subscription:", error);
            return null;
        }

        return {
            id: data.id,
            userId: data.user_id,
            planId: data.plan_id,
            status: data.status as 'active' | 'inactive',
            provider: data.provider,
            createdAt: data.created_at,
        };
    } catch (err) {
        console.error("Error getting subscription:", err);
        return null;
    }
};

/**
 * Get Access Contract - Standardized interface for access control
 * Spec requirement: Stable read contract consumed by other features
 * 
 * This is the AUTHORITATIVE function for determining access rights.
 * All features should use this instead of querying tables directly.
 */
export const getAccessContract = async (
    userId: string | null,
    courseSlug: string
): Promise<AccessContract> => {
    // Non-authenticated users have no access
    if (!userId) {
        return {
            isEnrolled: false,
            enrollmentStatus: null,
            subscriptionStatus: null,
        };
    }

    if (!isSupabaseConfigured()) {
        return {
            isEnrolled: false,
            enrollmentStatus: null,
            subscriptionStatus: null,
        };
    }

    try {
        // Get enrollment and subscription in parallel
        const [enrollment, subscription] = await Promise.all([
            getEnrollment(userId, courseSlug),
            getUserSubscription(userId),
        ]);

        return {
            isEnrolled: enrollment?.status === 'active',
            enrollmentStatus: enrollment?.status || null,
            subscriptionStatus: subscription?.status || null,
        };
    } catch (err) {
        console.error("Error getting access contract:", err);
        return {
            isEnrolled: false,
            enrollmentStatus: null,
            subscriptionStatus: null,
        };
    }
};

/**
 * Cancel enrollment (spec-aligned naming)
 * Spec requirement: cancelEnrollment(courseId)
 */
export const cancelEnrollment = async (
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
                status: 'cancelled',
                cancelled_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq("user_id", userId)
            .eq("course_slug", courseSlug)
            .eq("status", "active")
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
        console.error("Error cancelling enrollment:", err);
        return {
            success: false,
            error: "Failed to cancel enrollment"
        };
    }
};

/**
 * Re-enroll in a course (reactivate cancelled/expired enrollment)
 */
export const reEnrollInCourse = async (
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

        // Check if there's a cancelled or expired enrollment
        const existingEnrollment = await getEnrollment(userId, courseSlug);
        
        if (existingEnrollment && (existingEnrollment.status === 'cancelled' || existingEnrollment.status === 'expired')) {
            // Reactivate existing enrollment
            const { data, error } = await supabase
                .from("user_enrollments")
                .update({ 
                    status: 'active',
                    cancelled_at: null,
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
        } else {
            // No existing enrollment, create new one
            return await enrollInCourse(userId, courseSlug, 'explicit');
        }
    } catch (err) {
        console.error("Error re-enrolling in course:", err);
        return {
            success: false,
            error: "Failed to re-enroll in course"
        };
    }
};