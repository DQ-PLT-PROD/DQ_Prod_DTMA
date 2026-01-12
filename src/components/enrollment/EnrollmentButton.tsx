/**
 * Enrollment Button Component
 * Handles enrollment state and CTA display
 */
import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../Header';
import { isUserEnrolled, enrollInCourse } from '../../services/enrollmentService';
import { EnrollmentModal } from './EnrollmentModal';
import { Course } from '../../types/dtma-lms';

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
    const [enrollmentStatus, setEnrollmentStatus] = useState<'loading' | 'not-enrolled' | 'enrolled'>('loading');
    const [showModal, setShowModal] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);

    // Check enrollment status on mount and when user changes
    useEffect(() => {
        const checkEnrollmentStatus = async () => {
            if (!databaseUser?.id) {
                setEnrollmentStatus('not-enrolled');
                return;
            }

            try {
                const enrolled = await isUserEnrolled(databaseUser.id, course.slug);
                setEnrollmentStatus(enrolled ? 'enrolled' : 'not-enrolled');
            } catch (error) {
                console.error('Error checking enrollment status:', error);
                setEnrollmentStatus('not-enrolled');
            }
        };

        checkEnrollmentStatus();
    }, [databaseUser?.id, course.slug]);

    const handleEnrollClick = async () => {
        // If not authenticated, trigger login
        if (!user) {
            await login();
            return;
        }

        // If not enrolled, show enrollment modal
        if (enrollmentStatus === 'not-enrolled') {
            setShowModal(true);
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
            const result = await enrollInCourse(databaseUser.id, course.slug, 'explicit');
            
            if (result.success) {
                setEnrollmentStatus('enrolled');
                setShowModal(false);
                
                // Show success message (you can customize this)
                console.log('✅ Successfully enrolled in course:', course.title);
                
                if (onEnrollmentSuccess) {
                    onEnrollmentSuccess();
                }
            } else {
                console.error('Enrollment failed:', result.error);
                // You can add toast notification here
            }
        } catch (error) {
            console.error('Error during enrollment:', error);
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

        return (
            <>
                <BookOpen size={16} />
                Enroll Now
            </>
        );
    };

    const getButtonStyles = () => {
        const baseStyles = "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50";
        
        if (variant === 'secondary') {
            return `${baseStyles} bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50`;
        }

        // Primary variant
        if (enrollmentStatus === 'enrolled') {
            return `${baseStyles} bg-green-600 text-white hover:bg-green-700`;
        }

        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700`;
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
        </>
    );
};