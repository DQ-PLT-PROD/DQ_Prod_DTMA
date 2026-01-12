/**
 * Enrollment Confirmation Modal
 * Implements explicit enrollment CTA as per DTMA Feature Specification 02
 */
import React, { useState } from 'react';
import { X, BookOpen, Clock, Users, CheckCircle } from 'lucide-react';
import { Course } from '../../types/dtma-lms';

interface EnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    course: Course | null;
    isLoading?: boolean;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    course,
    isLoading = false
}) => {
    const [isEnrolling, setIsEnrolling] = useState(false);

    if (!isOpen || !course) return null;

    const handleConfirm = async () => {
        setIsEnrolling(true);
        try {
            await onConfirm();
        } finally {
            setIsEnrolling(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Enroll in Course
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isEnrolling}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Course Info */}
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        {course.thumbnailUrl && (
                            <img
                                src={course.thumbnailUrl}
                                alt={course.title}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                {course.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                                {course.shortDescription}
                            </p>
                        </div>
                    </div>

                    {/* Course Details */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={16} />
                            <span>{course.estimatedDurationMinutes} min</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpen size={16} />
                            <span>{course.lessonCount} lessons</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users size={16} />
                            <span>{course.audienceLevel}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle size={16} />
                            <span>Free Course</span>
                        </div>
                    </div>

                    {/* Enrollment Benefits */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-blue-900 mb-2">
                            What you'll get:
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Access to all course lessons</li>
                            <li>• Progress tracking across devices</li>
                            <li>• Course completion certificate</li>
                            <li>• Downloadable resources</li>
                        </ul>
                    </div>

                    {/* Preview Notice */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600">
                            <strong>Note:</strong> You can preview the first few lessons without enrolling. 
                            Enrollment gives you access to the complete course content.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        disabled={isEnrolling}
                        className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isEnrolling}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
        </div>
    );
};