/**
 * Enrollment Service for managing course enrollments
 * Implements DTMA Feature Specification 02 requirements
 * 
 * Feature 02.1 Hardening: All operations now go through backend APIs
 * No direct Supabase access - backend is the single source of truth
 */
import { enrollmentApiClient } from "../api/enrollmentApiClient";
import { lessonAccessApiClient } from "../api/lessonAccessApiClient";

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
 * Check if user is enrolled in a course
 * FR3: Access enforcement point
 * Feature 02.1: Uses backend API
 */
export const isUserEnrolled = async (
    userId: string,
    courseSlug: string
): Promise<boolean> => {
    try {
        return await enrollmentApiClient.isUserEnrolled(courseSlug, userId);
    } catch (err) {
        console.error("Error checking enrollment:", err);
        return false;
    }
};

/**
 * Get enrollment details for a user and course
 * Spec requirement: getEnrollment(courseId)
 * Feature 02.1: Uses backend API
 */
export const getEnrollment = async (
    userId: string,
    courseSlug: string
): Promise<CourseEnrollment | null> => {
    try {
        return await enrollmentApiClient.getEnrollment(courseSlug, userId);
    } catch (err) {
        console.error("Error getting enrollment:", err);
        return null;
    }
};

/**
 * Explicitly enroll user in a course
 * FR1: Enrollment creation with explicit CTA
 * Spec requirement: enrollInCourse(courseId)
 * Feature 02.1: Uses backend API (authenticated user from token)
 */
export const enrollInCourse = async (
    userId: string,
    courseSlug: string,
    method: 'explicit' | 'auto' = 'explicit'
): Promise<EnrollmentResult> => {
    try {
        console.log('🎯 Starting enrollment process via API...');
        console.log('Course Slug:', courseSlug);
        console.log('Method:', method);

        // Backend uses authenticated user from token, don't pass userId
        const result = await enrollmentApiClient.enrollInCourse(courseSlug, method);
        
        if (result.success) {
            console.log('✅ Enrollment created successfully via API');
        } else {
            console.error('❌ Enrollment failed:', result.error);
        }

        return result;
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
 * Feature 02.1: Uses backend API (authenticated user from token)
 */
export const getUserEnrollments = async (
    userId: string
): Promise<CourseEnrollment[]> => {
    try {
        // Backend uses authenticated user from token, don't pass userId
        return await enrollmentApiClient.getUserEnrollments();
    } catch (err) {
        console.error("Error getting user enrollments:", err);
        return [];
    }
};

/**
 * Check if user can access lesson content
 * FR2: Access rules implementation
 * Feature 02.1: Uses backend API
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

    try {
        // Check access via backend API
        return await lessonAccessApiClient.canAccessLesson(courseSlug, lessonId);
    } catch (err) {
        console.error("Error checking lesson access:", err);
        return false;
    }
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
 * Feature 02.1: Placeholder - backend API not yet implemented
 */
export const getUserSubscription = async (
    userId: string
): Promise<Subscription | null> => {
    // TODO: Implement backend API endpoint for subscriptions
    // For now, return null (no subscription system in MVP)
    console.warn('getUserSubscription: Backend API not yet implemented');
    return null;
};

/**
 * Get Access Contract - Standardized interface for access control
 * Spec requirement: Stable read contract consumed by other features
 * Feature 02.1: Uses backend API
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

    try {
        // Get access contract from backend API
        // Don't pass userId — server derives user identity from the auth token
        return await enrollmentApiClient.getAccessContract(courseSlug);
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
 * Feature 02.1: Uses backend API (authenticated user from token)
 */
export const cancelEnrollment = async (
    userId: string,
    courseSlug: string
): Promise<EnrollmentResult> => {
    try {
        // Backend uses authenticated user from token, don't pass userId
        return await enrollmentApiClient.cancelEnrollment(courseSlug);
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
 * Feature 02.1: Uses backend API
 */
export const reEnrollInCourse = async (
    userId: string,
    courseSlug: string
): Promise<EnrollmentResult> => {
    try {
        // Check if there's a cancelled or expired enrollment
        const existingEnrollment = await getEnrollment(userId, courseSlug);

        if (existingEnrollment && (existingEnrollment.status === 'cancelled' || existingEnrollment.status === 'expired')) {
            // For now, just create a new enrollment
            // TODO: Backend API should support reactivation
            return await enrollInCourse(userId, courseSlug, 'explicit');
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
