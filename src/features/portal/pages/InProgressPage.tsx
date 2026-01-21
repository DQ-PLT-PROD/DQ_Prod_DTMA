/**
 * InProgressPage - "In Progress" course list
 */
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Play,
    Clock,
    BookOpen,
    ChevronRight
} from "lucide-react";
import { PageContainer } from "../../../components/layouts/PageContainer";
import { CourseListSkeleton } from "../../../components/loading/CourseListSkeleton";
import { Button } from "../../../components/Button/Button";
import { useAuth } from "@/lib/auth";
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
        <PageContainer className="py-4 w-full">
            <div className="max-w-4xl mx-auto">
                {/* Welcome Header */}
                <div className="mb-4 rounded-xl border border-outline-variant bg-surface p-4">
                    <p className="text-body-sm text-on-surface-variant">
                        Welcome{user?.name ? `, ${user.name}` : ""}.
                    </p>
                    <h1 className="text-title-lg font-bold text-on-surface">
                        Continue where you left off
                    </h1>
                </div>

                {/* Page Title */}
                <div className="mb-6">
                    <h2 className="text-headline-md font-bold text-on-surface">My Courses</h2>
                    <p className="text-on-surface-variant text-body-md mt-1">In progress and ready to resume</p>
                </div>

                {/* In Progress Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Play size={18} className="text-primary" />
                        <h2 className="text-title-lg font-bold text-on-surface">In Progress</h2>
                        <span className="text-label-sm font-bold bg-primary text-on-primary px-2 py-0.5 rounded-full">
                            {enrollments.length}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="py-4">
                            <CourseListSkeleton />
                        </div>
                    ) : !user ? (
                        <div className="bg-surface rounded-xl border border-outline-variant p-8 text-center">
                            <BookOpen className="mx-auto mb-4 text-outline" size={48} />
                            <h3 className="text-title-lg font-medium text-on-surface mb-2">Sign in to see your courses</h3>
                            <p className="text-on-surface-variant mb-4">Track your progress and continue learning</p>
                            <Button
                                onClick={() => navigate("/courses")}
                                variant="filled"
                            >
                                Browse Courses
                            </Button>
                        </div>
                    ) : enrollments.length === 0 ? (
                        <div className="bg-surface rounded-xl border border-outline-variant p-8 text-center">
                            <BookOpen className="mx-auto mb-4 text-outline" size={48} />
                            <h3 className="text-title-lg font-medium text-on-surface mb-2">No courses in progress</h3>
                            <p className="text-on-surface-variant mb-4">Start learning by enrolling in a course</p>
                            <Button
                                onClick={() => navigate("/courses")}
                                variant="filled"
                            >
                                Browse Courses
                            </Button>
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
                                        className="w-full text-left bg-surface rounded-xl border border-outline-variant p-4 hover:shadow-elevation-1 hover:border-primary/30 transition group"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Course Thumbnail */}
                                            <div className="w-24 h-16 rounded-lg bg-surface-container-highest overflow-hidden shrink-0">
                                                {enrollment.course?.heroImageUrl ? (
                                                    <img
                                                        src={enrollment.course.heroImageUrl}
                                                        alt={enrollment.course.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-primary-container/30">
                                                        <BookOpen className="text-primary" size={24} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Course Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-title-md text-on-surface group-hover:text-primary transition truncate">
                                                    {enrollment.course?.title || enrollment.courseSlug}
                                                </h3>

                                                {/* Progress Bar - uses actual lesson completion count as source of truth */}
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all"
                                                            style={{ width: `${progressPct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-label-md font-bold text-primary">
                                                        {progressPct}%
                                                    </span>
                                                </div>

                                                {/* Meta Info */}
                                                <div className="flex items-center gap-4 mt-2 text-label-sm text-on-surface-variant">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {lastAccessedLabel}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Continue CTA */}
                                            <Button
                                                variant="filled"
                                                onClick={() => handleCourseResume(enrollment.courseSlug)}
                                                disabled={isResuming}
                                                className="shrink-0 rounded-full"
                                                rightIcon={<ChevronRight size={16} />}
                                            >
                                                {isResuming ? "Continuing..." : "Continue"}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

export default InProgressPage;
