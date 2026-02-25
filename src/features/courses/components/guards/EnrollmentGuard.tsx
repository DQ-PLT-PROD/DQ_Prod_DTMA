/**
 * Enrollment Guard Component
 * Route-level access enforcement per DTMA Spec (Jan 29)
 * Updated for Feature 02.1 - Server-side access enforcement
 * 
 * Spec requirement: "Access checks are enforced at route level (not UI hints)"
 * 
 * This guard checks enrollment status before rendering protected routes.
 * Non-enrolled users are redirected to course details page.
 */
import React, { useEffect, useState } from 'react';
import { Navigate, useSearchParams, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { lessonAccessApiClient } from '@/lib/api/lessonAccessApiClient';

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
    const { courseId: pathCourseId } = useParams<{ courseId: string }>();
    const [accessSummary, setAccessSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get course slug from props, path params (:courseId), or query params (?courseId=)
    const courseSlug = propCourseSlug || pathCourseId || searchParams.get('courseId');

    useEffect(() => {
        const checkAccess = async () => {
            // Must have course slug
            if (!courseSlug) {
                setError('Course not specified');
                setIsLoading(false);
                return;
            }

            try {
                // Get course access summary from server
                const summary = await lessonAccessApiClient.getCourseAccessSummary(courseSlug);
                
                if (!summary) {
                    setError('Failed to verify access');
                    setIsLoading(false);
                    return;
                }

                setAccessSummary(summary);

                // If preview is allowed and user has access to preview content, allow access
                if (allowPreview && summary.summary.previewLessons > 0) {
                    setIsLoading(false);
                    return;
                }

            } catch (err) {
                console.error('Error checking enrollment access:', err);
                setError('Failed to verify access');
                setAccessSummary({
                    isEnrolled: false,
                    summary: { accessibleLessons: 0 }
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

    // Access granted - user is enrolled or has preview access
    if (accessSummary?.isEnrolled || (allowPreview && accessSummary?.summary?.previewLessons > 0)) {
        return <>{children}</>;
    }

    // Access denied - redirect to course details for enrollment
    const redirectPath = redirectTo || `/courses/${encodeURIComponent(courseSlug)}`;
    console.log('🚫 Access denied - redirecting to:', redirectPath);

    return <Navigate to={redirectPath} replace />;
};

/**
 * Hook for checking enrollment access in components
 * Updated to use server-side access control
 */
export const useEnrollmentAccess = (courseSlug: string | null) => {
    const { databaseUser } = useAuth();
    const [accessSummary, setAccessSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            if (!courseSlug) {
                setAccessSummary({
                    isEnrolled: false,
                    summary: { accessibleLessons: 0 }
                });
                setIsLoading(false);
                return;
            }

            try {
                const summary = await lessonAccessApiClient.getCourseAccessSummary(courseSlug);
                setAccessSummary(summary || {
                    isEnrolled: false,
                    summary: { accessibleLessons: 0 }
                });
            } catch (err) {
                console.error('Error checking enrollment access:', err);
                setAccessSummary({
                    isEnrolled: false,
                    summary: { accessibleLessons: 0 }
                });
            } finally {
                setIsLoading(false);
            }
        };

        checkAccess();
    }, [courseSlug, databaseUser?.id]);

    return {
        accessSummary,
        isLoading,
        isEnrolled: accessSummary?.isEnrolled || false,
        enrollmentStatus: accessSummary?.enrollmentStatus,
        accessibleLessons: accessSummary?.summary?.accessibleLessons || 0,
        totalLessons: accessSummary?.summary?.totalLessons || 0,
        previewLessons: accessSummary?.summary?.previewLessons || 0
    };
};
