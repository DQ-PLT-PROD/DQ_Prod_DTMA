/**
 * Enrollment Confirmation Modal
 * Implements explicit enrollment CTA as per DTMA Feature Specification 02
 */
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Clock, Users, CheckCircle } from 'lucide-react';
import { Course } from '../../types/dtma-lms';

interface EnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    course: Course | null;
    isLoading?: boolean;
    /** Formatted duration string (e.g., "1 hr 30 min") to override course.estimatedDurationMinutes */
    calculatedDuration?: string;
    /** Accurate lesson count (excluding intro/outro) to override course.lessonCount */
    calculatedLessonCount?: number;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    course,
    isLoading = false,
    calculatedDuration,
    calculatedLessonCount
}) => {
    const [isEnrolling, setIsEnrolling] = useState(false);

    // Disable body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isEnrolling) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, isEnrolling, onClose]);

    if (!isOpen || !course) return null;

    const handleConfirm = async () => {
        setIsEnrolling(true);
        try {
            await onConfirm();
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget && !isEnrolling) {
            onClose();
        }
    };

    // Use portal to render modal at document body level, escaping stacking contexts
    return createPortal(
        <div
            className="fixed inset-0 bg-black/45 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div
                className="md-card-elevated max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-200 scale-100 animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[color:var(--md-outline-variant)]">
                    <h2 className="text-xl font-semibold text-[color:var(--md-on-surface)]">
                        Enroll in Course
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-[color:var(--md-on-surface-variant)] hover:text-[color:var(--md-on-surface)] hover:bg-[color:var(--md-surface-variant)] transition-colors"
                        disabled={isEnrolling}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Course Info */}
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        {(course.thumbnailUrl || course.heroImageUrl) && (
                            <img
                                src={course.thumbnailUrl || course.heroImageUrl}
                                alt={course.title}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-[color:var(--md-on-surface)] mb-2">
                                {course.title}
                            </h3>
                            <p className="text-sm text-[color:var(--md-on-surface-variant)] line-clamp-2">
                                {course.shortDescription}
                            </p>
                        </div>
                    </div>

                    {/* Course Details */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-[color:var(--md-on-surface-variant)]">
                            <Clock size={16} />
                            <span>{calculatedDuration || `${course.estimatedDurationMinutes} min`}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[color:var(--md-on-surface-variant)]">
                            <BookOpen size={16} />
                            <span>{calculatedLessonCount ?? course.lessonCount} lessons</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[color:var(--md-on-surface-variant)]">
                            <Users size={16} />
                            <span>{course.audienceLevel}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle size={16} />
                            <span>Free Course</span>
                        </div>
                    </div>

                    {/* Enrollment Benefits */}
                    <div className="bg-[color:var(--md-primary-container)] rounded-[var(--md-radius-md)] p-4 mb-6">
                        <h4 className="font-medium text-[color:var(--md-on-primary-container)] mb-2">
                            What you'll get:
                        </h4>
                        <ul className="text-sm text-[color:var(--md-on-primary-container)] space-y-1">
                            <li>• Access to all course lessons</li>
                            <li>• Progress tracking across devices</li>
                            <li>• Course completion certificate</li>
                            <li>• Downloadable resources</li>
                        </ul>
                    </div>

                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t border-[color:var(--md-outline-variant)] bg-[color:var(--md-surface-variant)] rounded-b-[var(--md-radius-lg)]">
                    <button
                        onClick={onClose}
                        disabled={isEnrolling}
                        className="flex-1 px-4 py-2 text-[color:var(--md-on-surface)] bg-[color:var(--md-surface)] border border-[color:var(--md-outline)] rounded-full hover:bg-[color:var(--md-surface-variant)] transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isEnrolling}
                        className="flex-1 px-4 py-2 bg-[color:var(--md-primary)] text-white rounded-full hover:bg-[color:var(--md-primary-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md-1"
                    >
                        {isEnrolling ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Enrolling...
                            </>
                        ) : (
                            'Enroll Now'
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
