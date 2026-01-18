/**
 * Enrollment Debug Panel
 * Testing component for enrollment functionality
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import {
    isUserEnrolled,
    enrollInCourse,
    getEnrollment,
    unenrollFromCourse,
    getUserEnrollments
} from '@/lib/enrollment';
import { CheckCircle, XCircle, Loader2, User, BookOpen } from 'lucide-react';

const DEFAULT_COURSE_SLUG = 'perfecting-life-transactions';

export const EnrollmentDebugPanel: React.FC = () => {
    const { user, databaseUser } = useAuth();
    const [courseSlug, setCourseSlug] = useState(DEFAULT_COURSE_SLUG);
    const [enrollmentStatus, setEnrollmentStatus] = useState<boolean | null>(null);
    const [enrollmentDetails, setEnrollmentDetails] = useState<any>(null);
    const [userEnrollments, setUserEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const checkEnrollmentStatus = async () => {
        if (!databaseUser?.id) {
            showMessage('User not authenticated', 'error');
            return;
        }

        setLoading(true);
        try {
            const enrolled = await isUserEnrolled(databaseUser.id, courseSlug);
            setEnrollmentStatus(enrolled);

            const details = await getEnrollment(databaseUser.id, courseSlug);
            setEnrollmentDetails(details);

            showMessage(`Enrollment status: ${enrolled ? 'Enrolled' : 'Not enrolled'}`);
        } catch (error) {
            showMessage('Error checking enrollment status', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!databaseUser?.id) {
            showMessage('User not authenticated', 'error');
            return;
        }

        setLoading(true);
        try {
            const result = await enrollInCourse(databaseUser.id, courseSlug, 'explicit');
            if (result.success) {
                setEnrollmentStatus(true);
                setEnrollmentDetails(result.enrollment);
                showMessage('Successfully enrolled!');
                loadUserEnrollments();
            } else {
                showMessage(`Enrollment failed: ${result.error}`, 'error');
            }
        } catch (error) {
            showMessage('Error during enrollment', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnenroll = async () => {
        if (!databaseUser?.id) {
            showMessage('User not authenticated', 'error');
            return;
        }

        setLoading(true);
        try {
            const result = await unenrollFromCourse(databaseUser.id, courseSlug);
            if (result.success) {
                setEnrollmentStatus(false);
                setEnrollmentDetails(null);
                showMessage('Successfully unenrolled!');
                loadUserEnrollments();
            } else {
                showMessage(`Unenrollment failed: ${result.error}`, 'error');
            }
        } catch (error) {
            showMessage('Error during unenrollment', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserEnrollments = async () => {
        if (!databaseUser?.id) return;

        try {
            const enrollments = await getUserEnrollments(databaseUser.id);
            setUserEnrollments(enrollments);
        } catch (error) {
            console.error('Error loading user enrollments:', error);
        }
    };

    useEffect(() => {
        if (databaseUser?.id) {
            checkEnrollmentStatus();
            loadUserEnrollments();
        }
    }, [databaseUser?.id, courseSlug]);

    if (!user) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">Please sign in to test enrollment functionality.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold">Enrollment Debug Panel</h3>
            </div>

            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <User size={16} className="text-gray-600" />
                    <span className="font-medium">User Info</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Database ID:</strong> {databaseUser?.id || 'Not found'}</p>
                </div>
            </div>

            {/* Course Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Slug
                </label>
                <input
                    type="text"
                    value={courseSlug}
                    onChange={(e) => setCourseSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter course slug"
                />
            </div>

            {/* Enrollment Status */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Enrollment Status</span>
                    <button
                        onClick={checkEnrollmentStatus}
                        disabled={loading}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : 'Refresh'}
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    {enrollmentStatus === true ? (
                        <CheckCircle size={16} className="text-green-600" />
                    ) : enrollmentStatus === false ? (
                        <XCircle size={16} className="text-red-600" />
                    ) : (
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                    )}
                    <span className="text-sm">
                        {enrollmentStatus === true ? 'Enrolled' :
                            enrollmentStatus === false ? 'Not Enrolled' : 'Checking...'}
                    </span>
                </div>

                {enrollmentDetails && (
                    <div className="text-xs text-gray-600 space-y-1 mt-2">
                        <p><strong>Enrollment ID:</strong> {enrollmentDetails.id}</p>
                        <p><strong>Enrolled At:</strong> {new Date(enrollmentDetails.enrolledAt).toLocaleString()}</p>
                        <p><strong>Status:</strong> {enrollmentDetails.status}</p>
                        <p><strong>Method:</strong> {enrollmentDetails.enrollmentMethod}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handleEnroll}
                    disabled={loading || enrollmentStatus === true}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Enroll'}
                </button>
                <button
                    onClick={handleUnenroll}
                    disabled={loading || enrollmentStatus === false}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Unenroll'}
                </button>
            </div>

            {/* User Enrollments */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">All User Enrollments ({userEnrollments.length})</h4>
                {userEnrollments.length > 0 ? (
                    <div className="space-y-2">
                        {userEnrollments.map((enrollment) => (
                            <div key={enrollment.id} className="bg-white rounded p-3 text-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{enrollment.courseSlug}</p>
                                        <p className="text-gray-600">
                                            Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs ${enrollment.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {enrollment.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 text-sm">No enrollments found</p>
                )}
            </div>

            {/* Message */}
            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes('Error') || message.includes('failed')
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-green-50 text-green-800 border border-green-200'
                    }`}>
                    {message}
                </div>
            )}
        </div>
    );
};