/**
 * Enrollment Button Component
 * Handles enrollment state and CTA display
 * Updated for Jan 29 Spec: Plan selection and payment integration
 */
import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Loader2, RotateCcw } from 'lucide-react';
import { useAuth } from '../../../../components/Header';
import { isUserEnrolled, enrollInCourse, getEnrollment } from '../../services/enrollmentService';
import { EnrollmentModal } from './EnrollmentModal';
import { PlanSelectionModal } from './PlanSelectionModal';
import { courseRequiresPayment } from '../../services/paymentService';
import { Course } from '../../../../types/dtma-lms';
import { useToast } from '../../../../components/ui/Toast';

interface EnrollmentButtonProps {
    course: Course;
    onEnrollmentSuccess?: () => void;
    className?: string;
    variant?: 'primary' | 'secondary';
}

export const EnrollmentButton: React.FC<EnrollmentButtonProps> = ({
    course,
    onEnrollmentSuccess,
    className = '',
    variant = 'primary'
}) => {
    const { user, databaseUser, login } = useAuth();
    const { showToast, ToastComponent } = useToast();
    const [enrollmentStatus, setEnrollmentStatus] = useState<'loading' | 'not-enrolled' | 'enrolled' | 'cancelled' | 'expired'>('loading');
    const [showModal, setShowModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [requiresPayment, setRequiresPayment] = useState(false);

    // Check enrollment status on mount and when user changes
    useEffect(() => {
        const checkEnrollmentStatus = async () => {
            console.log('🔍 Checking enrollment status for:', {
                userId: databaseUser?.id,
                courseSlug: course.slug,
                courseId: course.id,
                courseTitle: course.title,
                hasUser: !!user,
                hasDatabaseUser: !!databaseUser,
                supabaseConfigured: !!(import.meta as any).env?.VITE_SUPABASE_URL
            });

            if (!databaseUser?.id) {
                console.log('❌ No database user, setting not-enrolled');
                setEnrollmentStatus('not-enrolled');
                return;
            }

            if (!course.slug && !course.id) {
                console.error('❌ Both course slug and id are missing!', course);
                setEnrollmentStatus('not-enrolled');
                return;
            }

            try {
                // Use slug if available, otherwise fall back to id
                const courseIdentifier = course.slug || course.id;
                console.log('🔍 Checking enrollment with identifier:', courseIdentifier);
                
                // Get full enrollment details to check status
                const enrollment = await getEnrollment(databaseUser.id, courseIdentifier);
                console.log('✅ Enrollment check result:', enrollment);
                
                if (!enrollment) {
                    setEnrollmentStatus('not-enrolled');
                } else if (enrollment.status === 'active') {
                    setEnrollmentStatus('enrolled');
                } else if (enrollment.status === 'cancelled') {
                    setEnrollmentStatus('cancelled');
                } else if (enrollment.status === 'expired') {
                    setEnrollmentStatus('expired');
                } else {
                    setEnrollmentStatus('not-enrolled');
                }
                
                // Check if course requires payment
                const needsPayment = courseRequiresPayment(courseIdentifier);
                setRequiresPayment(needsPayment);
            } catch (error) {
                console.error('❌ Error checking enrollment status:', error);
                setEnrollmentStatus('not-enrolled');
            }
        };

        checkEnrollmentStatus();
    }, [databaseUser?.id, course.slug, course.id]);

    const handleEnrollClick = async () => {
        // If not authenticated, trigger login
        if (!user) {
            await login();
            return;
        }

        // If cancelled or expired, show re-enrollment option
        if (enrollmentStatus === 'cancelled' || enrollmentStatus === 'expired') {
            setShowModal(true);
            return;
        }

        // If not enrolled, check if payment is required
        if (enrollmentStatus === 'not-enrolled') {
            if (requiresPayment) {
                // Show plan selection modal for paid courses
                setShowPlanModal(true);
            } else {
                // Show enrollment confirmation for free courses
                setShowModal(true);
            }
            return;
        }

        // If already enrolled, navigate to course
        if (onEnrollmentSuccess) {
            onEnrollmentSuccess();
        }
    };

    const handleEnrollmentConfirm = async () => {
        if (!databaseUser?.id) return;

        setIsEnrolling(true);
        try {
            console.log('🚀 Starting enrollment for user:', databaseUser.id);
            const courseIdentifier = course.slug || course.id;
            const result = await enrollInCourse(databaseUser.id, courseIdentifier, 'explicit');
            
            if (result.success) {
                setEnrollmentStatus('enrolled');
                setShowModal(false);
                
                console.log('✅ Successfully enrolled in course:', course.title);
                
                // Show success toast
                showToast(
                    `🎉 Successfully enrolled in "${course.title}"! You now have full access to all course content.`,
                    'success'
                );
                
                if (onEnrollmentSuccess) {
                    // Small delay to let user see the success message
                    setTimeout(() => {
                        onEnrollmentSuccess();
                    }, 1500);
                }
            } else {
                console.error('❌ Enrollment failed:', result.error);
                showToast(
                    `Enrollment failed: ${result.error}. Please try again or contact support.`,
                    'error'
                );
            }
        } catch (error) {
            console.error('❌ Error during enrollment:', error);
            showToast(
                `Unexpected error during enrollment. Please check your connection and try again.`,
                'error'
            );
        } finally {
            setIsEnrolling(false);
        }
    };

    const getButtonContent = () => {
        if (enrollmentStatus === 'loading') {
            return (
                <>
                    <Loader2 size={16} className="animate-spin" />
                    Loading...
                </>
            );
        }

        if (!user) {
            return (
                <>
                    <BookOpen size={16} />
                    Sign In to Enroll
                </>
            );
        }

        if (enrollmentStatus === 'enrolled') {
            return (
                <>
                    <CheckCircle size={16} />
                    Continue Learning
                </>
            );
        }

        if (enrollmentStatus === 'cancelled' || enrollmentStatus === 'expired') {
            return (
                <>
                    <RotateCcw size={16} />
                    Re-enroll
                </>
            );
        }

        return (
            <>
                <BookOpen size={16} />
                Enroll Now
            </>
        );
    };

    const getButtonStyles = () => {
        const baseStyles = "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
        
        if (variant === 'secondary') {
            return `${baseStyles} bg-white text-blue-700 border-2 border-blue-600 hover:bg-blue-50 hover:text-blue-800 shadow-sm`;
        }

        // Primary variant - enrolled state
        if (enrollmentStatus === 'enrolled') {
            return `${baseStyles} bg-green-600 text-white hover:bg-green-700 shadow-md`;
        }

        // Primary variant - cancelled/expired state
        if (enrollmentStatus === 'cancelled' || enrollmentStatus === 'expired') {
            return `${baseStyles} bg-orange-600 text-white hover:bg-orange-700 shadow-md`;
        }

        // Primary variant - default state (not enrolled)
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md`;
    };

    return (
        <>
            <button
                onClick={handleEnrollClick}
                disabled={enrollmentStatus === 'loading' || isEnrolling}
                className={`${getButtonStyles()} ${className}`}
            >
                {getButtonContent()}
            </button>

            <EnrollmentModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleEnrollmentConfirm}
                course={course}
                isLoading={isEnrolling}
            />

            {databaseUser && (
                <PlanSelectionModal
                    isOpen={showPlanModal}
                    onClose={() => setShowPlanModal(false)}
                    course={course}
                    userId={databaseUser.id}
                    onPaymentInitiated={() => {
                        setShowPlanModal(false);
                        showToast('Redirecting to payment...', 'info');
                    }}
                />
            )}

            {/* Toast Notifications */}
            {ToastComponent}
        </>
    );
};