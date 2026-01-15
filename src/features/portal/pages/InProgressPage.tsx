/**
 * InProgressPage - "In Progress" course list
 */
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Play,
    Clock,
    Loader2,
    BookOpen,
    ChevronRight
} from "lucide-react";
import { useAuth } from "../../../components/Header";
import { getUserEnrollments, getActualProgressStats, Enrollment } from "../services/progressService";
import { fetchFullCourse } from "../../courses/services/courseService";
import { Course } from "../../../types/dtma-lms";
import { getLearningSnapshot } from "../../learning/services/learningSnapshotService";

interface CourseWithProgress extends Enrollment {
    course?: Course | null;
    actualProgress?: { completedCount: number; totalCount: number; progressPct: number };
}

const InProgressPage: React.FC = () => {
    const navigate = useNavigate();
    const { databaseUser, user, isLoading: isAuthLoading, isDatabaseUserLoading } = useAuth();
    const [enrollments, setEnrollments] = useState<CourseWithProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [resumeCourseId, setResumeCourseId] = useState<string | null>(null);
    const isAuthPending = isAuthLoading || isDatabaseUserLoading;

    useEffect(() => {
        const loadEnrollments = async () => {
            if (isAuthPending) {
                setIsLoading(true);
                return;
            }

            if (!user || !databaseUser?.id) {
                setEnrollments([]);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const userEnrollments = await getUserEnrollments(databaseUser.id);

                // Fetch course details AND actual progress for each enrollment
                const enrollmentsWithCourses = await Promise.all(
                    userEnrollments.map(async (enrollment) => {
                        const [course, actualProgress] = await Promise.all([
                            fetchFullCourse(enrollment.courseSlug),
                            getActualProgressStats(databaseUser.id, enrollment.courseSlug)
                        ]);
                        return { ...enrollment, course, actualProgress };
                    })
                );

                setEnrollments(enrollmentsWithCourses);
            } catch (error) {
                console.error("Error loading enrollments:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadEnrollments();
    }, [databaseUser?.id, user, isAuthPending]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleCourseResume = async (courseSlug: string) => {
        if (!databaseUser?.id) {
            navigate(`/portal/learning/${courseSlug}`);
            return;
        }

        setResumeCourseId(courseSlug);
        try {
            const snapshot = await getLearningSnapshot(courseSlug, databaseUser.id);
            const resumeLessonId = snapshot.resumeLessonId;
            if (resumeLessonId) {
                navigate(`/portal/learning/${courseSlug}?resumeLessonId=${encodeURIComponent(resumeLessonId)}`);
                return;
            }
        } catch (error) {
            console.warn("Resume snapshot failed, falling back to first lesson.", error);
        } finally {
            setResumeCourseId(null);
        }

        navigate(`/portal/learning/${courseSlug}`);
    };

    return (
        <div className="p-3 md:p-4 w-full">
            <div className="max-w-4xl mx-auto">
                {/* Welcome Header */}
                <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-sm text-gray-500">
                        Welcome{user?.name ? `, ${user.name}` : ""}.
                    </p>
                    <h1 className="text-lg font-semibold text-gray-900">
                        Continue where you left off
                    </h1>
                </div>

                {/* Page Title */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
                    <p className="text-gray-500 text-sm mt-1">In progress and ready to resume</p>
                </div>

                {/* In Progress Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Play size={18} className="text-[#1839AD]" />
                        <h2 className="text-lg font-semibold text-gray-900">In Progress</h2>
                        <span className="text-xs font-bold bg-[#1839AD] text-white px-2 py-0.5 rounded-full">
                            {enrollments.length}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-[#1839AD]" size={32} />
                        </div>
                    ) : !user ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                            <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to see your courses</h3>
                            <p className="text-gray-500 mb-4">Track your progress and continue learning</p>
                            <button
                                onClick={() => navigate("/courses")}
                                className="px-4 py-2 bg-[#1839AD] text-white rounded-lg hover:bg-[#132b7c] transition"
                            >
                                Browse Courses
                            </button>
                        </div>
                    ) : enrollments.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                            <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses in progress</h3>
                            <p className="text-gray-500 mb-4">Start learning by enrolling in a course</p>
                            <button
                                onClick={() => navigate("/courses")}
                                className="px-4 py-2 bg-[#1839AD] text-white rounded-lg hover:bg-[#132b7c] transition"
                            >
                                Browse Courses
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {enrollments.map((enrollment) => {
                                const progressPct = enrollment.actualProgress?.progressPct ?? Math.round(enrollment.progressPct);
                                const lastAccessedLabel = enrollment.lastAccessedAt
                                    ? `Last accessed ${formatDate(enrollment.lastAccessedAt)}`
                                    : "Last accessed —";
                                const isResuming = resumeCourseId === enrollment.courseSlug;

                                return (
                                    <div
                                        key={enrollment.id}
                                        className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-[#1839AD]/30 transition group"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Course Thumbnail */}
                                            <div className="w-24 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                                                {enrollment.course?.heroImageUrl ? (
                                                    <img
                                                        src={enrollment.course.heroImageUrl}
                                                        alt={enrollment.course.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-[#1839AD]/10">
                                                        <BookOpen className="text-[#1839AD]" size={24} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Course Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 group-hover:text-[#1839AD] transition truncate">
                                                    {enrollment.course?.title || enrollment.courseSlug}
                                                </h3>

                                                {/* Progress Bar - uses actual lesson completion count as source of truth */}
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#1839AD] rounded-full transition-all"
                                                            style={{ width: `${progressPct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold text-[#1839AD]">
                                                        {progressPct}%
                                                    </span>
                                                </div>

                                                {/* Meta Info */}
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {lastAccessedLabel}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Continue CTA */}
                                            <button
                                                type="button"
                                                onClick={() => handleCourseResume(enrollment.courseSlug)}
                                                disabled={isResuming}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1839AD] text-white text-sm font-semibold hover:bg-[#132b7c] disabled:opacity-60 disabled:cursor-not-allowed transition shrink-0"
                                            >
                                                {isResuming ? "Continuing..." : "Continue"}
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InProgressPage;
