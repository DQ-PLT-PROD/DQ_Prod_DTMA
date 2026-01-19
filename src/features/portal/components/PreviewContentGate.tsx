/**
 * Preview Content Gate Component
 * Implements FR2: Access Rules for preview vs full content
 */
import React from 'react';
import { Lock, BookOpen, Play } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { EnrollmentButton } from '@/components/enrollment/EnrollmentButton';
import { Course } from '@/types/dtma-lms';
import { useToast } from '@/components/ui/Toast';

interface PreviewContentGateProps {
    course: Course;
    isPreviewLesson: boolean;
    isUserEnrolled: boolean;
    children: React.ReactNode;
    onEnrollmentSuccess?: () => void;
}

export const PreviewContentGate: React.FC<PreviewContentGateProps> = ({
    course,
    isPreviewLesson,
    isUserEnrolled,
    children,
    onEnrollmentSuccess
}) => {
    const { user } = useAuth();
    const { showToast, ToastComponent } = useToast();

    // Allow access if:
    // 1. It's a preview lesson (always accessible)
    // 2. User is enrolled (full access)
    const hasAccess = isPreviewLesson || isUserEnrolled;

    const handleEnrollmentSuccess = () => {
        // Show success message specific to learning screen
        showToast(
            `🎓 Welcome to "${course.title}"! You can now access all lessons and start learning.`,
            'success'
        );

        // Call the parent callback after a brief delay
        if (onEnrollmentSuccess) {
            setTimeout(() => {
                onEnrollmentSuccess();
            }, 2000);
        }
    };

    if (hasAccess) {
        return (
            <div className="relative">
                {/* Preview badge for preview lessons */}
                {isPreviewLesson && (
                    <div className="absolute top-4 left-4 z-10">
                        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <Play size={12} />
                            Preview
                        </div>
                    </div>
                )}
                {children}
            </div>
        );
    }

    // Show enrollment gate for non-enrolled users trying to access full content
    return (
        <div className="relative">
            {/* Blurred/locked content */}
            <div className="relative">
                <div className="filter blur-sm pointer-events-none">
                    {children}
                </div>

                {/* Overlay with enrollment CTA */}
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock size={24} className="text-blue-600" />
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Full Content Locked
                        </h3>

                        <p className="text-gray-600 mb-6">
                            {user
                                ? "Enroll in this course to access all lessons and resources."
                                : "Sign in and enroll to access the complete course content."
                            }
                        </p>

                        <div className="space-y-3">
                            <EnrollmentButton
                                course={course}
                                onEnrollmentSuccess={handleEnrollmentSuccess}
                                className="w-full"
                            />

                            {/* Preview lessons available notice */}
                            <p className="text-sm text-gray-500">
                                You can still access preview lessons without enrolling
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notifications */}
            {ToastComponent}
        </div>
    );
};

/**
 * Hook to check if lesson content should be accessible
 */
export const useContentAccess = (
    courseSlug: string,
    isPreviewLesson: boolean,
    isUserEnrolled: boolean
) => {
    const { user } = useAuth();

    const canAccess = isPreviewLesson || isUserEnrolled;
    const needsEnrollment = !isPreviewLesson && !isUserEnrolled;
    const needsAuth = !user && needsEnrollment;

    return {
        canAccess,
        needsEnrollment,
        needsAuth,
        accessLevel: isPreviewLesson ? 'preview' : isUserEnrolled ? 'full' : 'restricted'
    };
};