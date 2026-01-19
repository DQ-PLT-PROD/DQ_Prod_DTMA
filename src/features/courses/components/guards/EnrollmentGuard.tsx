/**
 * Enrollment Guard Component
 * Route-level access enforcement per DTMA Spec (Jan 29)
 * 
 * Spec requirement: "Access checks are enforced at route level (not UI hints)"
 * 
 * This guard checks enrollment status before rendering protected routes.
 * Non-enrolled users are redirected to course details page.
 */
import React, { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getAccessContract, AccessContract } from '@/lib/enrollment';

interface EnrollmentGuardProps {
    children: React.ReactNode;
    courseSlug?: string; // If not provided, will try to get from URL params
    redirectTo?: string; // Custom redirect path
    allowPreview?: boolean; // Allow access to preview content without enrollment
}

export const EnrollmentGuard: React.FC<EnrollmentGuardProps> = ({
    children,
    courseSlug: propCourseSlug,
    redirectTo,
    allowPreview = false,
}) => {
    const { user, databaseUser } = useAuth();
    const [searchParams] = useSearchParams();
    const [accessContract, setAccessContract] = useState<AccessContract | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get course slug from props or URL params
    const courseSlug = propCourseSlug || searchParams.get('courseId');

    useEffect(() => {
        const checkAccess = async () => {
            // Must have course slug
            if (!courseSlug) {
                setError('Course not specified');
                setIsLoading(false);
                return;
            }

            // If preview is allowed and user is not authenticated, allow access
            if (allowPreview && !user) {
                setAccessContract({
                    isEnrolled: false,
                    enrollmentStatus: null,
                    subscriptionStatus: null,
                });
                setIsLoading(false);
                return;
            }

            // Must be authenticated for enrollment check
            if (!databaseUser?.id) {
                setAccessContract({
                    isEnrolled: false,
                    enrollmentStatus: null,
                    subscriptionStatus: null,
                });
                setIsLoading(false);
                return;
            }

            try {
                // Get authoritative access contract
                const contract = await getAccessContract(databaseUser.id, courseSlug);
                setAccessContract(contract);
            } catch (err) {
                console.error('Error checking enrollment access:', err);
                setError('Failed to verify access');
                // Default to deny access on error
                setAccessContract({
                    isEnrolled: false,
                    enrollmentStatus: null,
                    subscriptionStatus: null,
                });
            } finally {
                setIsLoading(false);
            }
        };

        checkAccess();
    }, [courseSlug, databaseUser?.id, user, allowPreview]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Error state - redirect to course details
    if (error || !courseSlug) {
        const fallbackRedirect = redirectTo || '/courses';
        return <Navigate to={fallbackRedirect} replace />;
    }

    // Access granted - user is enrolled
    if (accessContract?.isEnrolled) {
        return <>{children}</>;
    }

    // Access denied - redirect to course details for enrollment
    const redirectPath = redirectTo || `/courses/${encodeURIComponent(courseSlug)}`;
    console.log('🚫 Access denied - redirecting to:', redirectPath);

    return <Navigate to={redirectPath} replace />;
};

/**
 * Hook for checking enrollment access in components
 * Use this when you need access info but don't want to redirect
 */
export const useEnrollmentAccess = (courseSlug: string | null) => {
    const { databaseUser } = useAuth();
    const [accessContract, setAccessContract] = useState<AccessContract | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            if (!courseSlug || !databaseUser?.id) {
                setAccessContract({
                    isEnrolled: false,
                    enrollmentStatus: null,
                    subscriptionStatus: null,
                });
                setIsLoading(false);
                return;
            }

            try {
                const contract = await getAccessContract(databaseUser.id, courseSlug);
                setAccessContract(contract);
            } catch (err) {
                console.error('Error checking enrollment access:', err);
                setAccessContract({
                    isEnrolled: false,
                    enrollmentStatus: null,
                    subscriptionStatus: null,
                });
            } finally {
                setIsLoading(false);
            }
        };

        checkAccess();
    }, [courseSlug, databaseUser?.id]);

    return {
        accessContract,
        isLoading,
        isEnrolled: accessContract?.isEnrolled || false,
        enrollmentStatus: accessContract?.enrollmentStatus,
        subscriptionStatus: accessContract?.subscriptionStatus,
    };
};
