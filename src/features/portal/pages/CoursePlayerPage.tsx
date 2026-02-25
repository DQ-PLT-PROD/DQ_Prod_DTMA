/**
 * CoursePlayerPage - The active learning interface with video player and course outline
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    ChevronRight,
    ChevronLeft,
} from "lucide-react";
import { PageLoader } from "../../../components/loading";
import { useAuth } from "@/lib/auth";
import CourseAssessment from "../../courses/pages/CourseAssessment";
import { VideoPlayer } from "../components/VideoPlayer";
import { CourseOutline } from "../../courses/components/CourseOutline";
import { Lesson, toUILesson } from "../../../types/course";
import { fetchCourseLessons, fetchCourseQuizzes, fetchFullCourse } from "../../courses/services/courseService";
import {
    updateLessonProgress,
    getUserCourseProgress,
    flushProgressQueue,
} from "../services/progressService";
import { isUserEnrolled } from "../../courses/services/enrollmentService";
import { Course } from "../../../types/dtma-lms";
import { lessonAccessApiClient } from "@/lib/api/lessonAccessApiClient";
import {
    computeTrackableProgress,
    getCountableLessonNumber,
    isIntroType,
    isOutroType,
    isQuizType,
} from "@/lib/courseProgress/metrics";

type ServerProgressSnapshot = {
    completedTrackableItems: number;
    trackableItemCount: number;
    progressPercent: number;
};

// Defined so we can pass context up to the layout if we needed to (e.g. theater mode)
// But for now we manage theater mode locally and just hide sidebar via pure CSS or similar, 
// OR we lift state. Since PortalLayout handles sidebar, we need to communicate.
// We'll trust the user check that said "Layout Consistency" includes theater mode.
// We can use a simple prop or context.
// For simplicity in this refactor, we will rely on a new Outlet context or simple full screen.

const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const location = useLocation();

    // We expect the Layout to provide a way to toggle theater mode via context or we assume Layout handles it
    // For now, let's just implement functionality and assume Layout is always present.
    // To support theater mode properly (hiding layout sidebar/header), we might need to modify this structure 
    // to control the parent layout. 
    // A common pattern is `useOutletContext`.

    // Let's assume the Layout provides: { setIsTheaterMode: (v: boolean) => void }
    // If not, we'll gracefully degrade (theater mode only expands inside content area).
    const safeSetIsTheaterMode = (val: boolean) => {
        // Placeholder for context connection
        // const { setTheaterMode } = useOutletContext<{setTheaterMode: (v: boolean) => void}>();
        // setTheaterMode(val);
        setIsTheater(val); // Local state for now
    }

    const [course, setCourse] = useState<Course | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [captionsEnabled, setCaptionsEnabled] = useState(true);
    const [moduleOpen, setModuleOpen] = useState(true);
    const [isNextLessonUnlocked, setIsNextLessonUnlocked] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [isTheater, setIsTheater] = useState(false);
    const [hasAssessmentQuiz, setHasAssessmentQuiz] = useState(false);
    const [assessmentCompleted, setAssessmentCompleted] = useState(false);
    const [serverProgress, setServerProgress] = useState<ServerProgressSnapshot | null>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);

    const navigate = useNavigate();
    const { databaseUser } = useAuth();

    const resumeLessonId = useMemo(() => {
        const searchParams = new URLSearchParams(location.search);
        const value = searchParams.get("resumeLessonId");
        return value ? value : null;
    }, [location.search]);

    // Fetch course, lessons, resources, and user progress
    useEffect(() => {
        if (!courseId) return;

        const loadCourseData = async () => {
            try {
                setIsLoading(true);
                const [fetchedCourse, fetchedLessons, fetchedQuizzes] = await Promise.all([
                    fetchFullCourse(courseId),
                    fetchCourseLessons(courseId),
                    fetchCourseQuizzes(courseId),
                ]);

                setCourse(fetchedCourse);
                setHasAssessmentQuiz((fetchedQuizzes || []).length > 0);
                setAssessmentCompleted(false);
                setServerProgress(null);

                const resumeIndex = resumeLessonId
                    ? fetchedLessons.findIndex((lesson) => String(lesson.id) === resumeLessonId)
                    : -1;

                const completedLessonIds = new Set<string>();

                // If user is logged in, fetch server-side progress
                if (databaseUser?.id) {
                    try {
                        const [courseProgress, accessSummary] = await Promise.all([
                            getUserCourseProgress(databaseUser.id, courseId),
                            lessonAccessApiClient.getCourseAccessSummary(courseId),
                        ]);

                        const { lessonProgress } = courseProgress;
                        lessonProgress.forEach(p => {
                            if (p.completed) completedLessonIds.add(p.lessonId);
                        });

                        if (accessSummary) {
                            setHasAssessmentQuiz(Boolean(accessSummary.summary.hasAssessmentQuiz));
                            setAssessmentCompleted(Boolean(accessSummary.summary.assessmentCompleted));
                            setServerProgress({
                                completedTrackableItems: Number(accessSummary.summary.completedTrackableItems ?? 0) || 0,
                                trackableItemCount: Number(accessSummary.summary.trackableItemCount ?? 0) || 0,
                                progressPercent: Number(accessSummary.summary.progressPercent ?? 0) || 0,
                            });
                        }
                    } catch (err) {
                        console.warn("Failed to load server progress:", err);
                    }
                }

                // Load local storage progress only for unauthenticated users.
                const storageKey = `courseProgress_${courseId}`;
                const saved = localStorage.getItem(storageKey);
                const shouldUseLocalCompletion = !databaseUser?.id;

                if (fetchedLessons.length > 0) {
                    if (saved && shouldUseLocalCompletion) {
                        try {
                            const savedLessons: Lesson[] = JSON.parse(saved);
                            savedLessons.forEach(l => {
                                if (l.completed) completedLessonIds.add(String(l.id));
                            });
                        } catch (e) {
                            console.warn("Failed to parse local progress", e);
                        }
                    }

                    const uiLessons = fetchedLessons.map((lesson, idx) =>
                        toUILesson(lesson, idx, completedLessonIds)
                    );

                    // Merge saved durations if available
                    if (saved) {
                        try {
                            const localLessons: Lesson[] = JSON.parse(saved);
                            if (localLessons.length > 0) {
                                uiLessons.forEach(uiLesson => {
                                    const savedMatch = localLessons.find(sl => String(sl.id) === String(uiLesson.id));
                                    if (savedMatch && savedMatch.duration && savedMatch.duration !== '--:--') {
                                        uiLesson.duration = savedMatch.duration;
                                    }
                                });
                            }
                        } catch (e) { /* ignore */ }
                    }

                    setLessons(uiLessons);

                    if (resumeIndex >= 0) {
                        setCurrentLessonIndex(resumeIndex);
                    } else {
                        // Restore from local storage if no direct link
                        const savedIndex = localStorage.getItem(`activeLessonIndex_${courseId}`);
                        if (savedIndex !== null) {
                            const idx = parseInt(savedIndex, 10);
                            if (!isNaN(idx) && idx >= 0 && idx < uiLessons.length) {
                                setCurrentLessonIndex(idx);
                            }
                        }
                    }
                } else {
                    setLessons([]);
                }

            } catch (error) {
                console.warn('Failed to load course data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCourseData();
    }, [courseId, databaseUser?.id]);

    useEffect(() => {
        if (!databaseUser?.id) return;
        flushProgressQueue();
    }, [databaseUser?.id]);

    // Create a stable reference to lesson video URLs for the preload effect
    const lessonVideoUrls = useMemo(
        () => lessons.map(l => l.videoUrl).filter(Boolean).join(','),
        [lessons]
    );

    // Preload video durations
    useEffect(() => {
        if (lessons.length === 0 || !courseId || !lessonVideoUrls) return;

        const fetchVideoDuration = (videoUrl: string): Promise<number> => {
            return new Promise((resolve, reject) => {
                const video = document.createElement('video');
                video.preload = 'metadata';
                const timeout = setTimeout(() => {
                    video.src = '';
                    reject(new Error('Timeout loading video metadata'));
                }, 10000);

                video.onloadedmetadata = () => {
                    clearTimeout(timeout);
                    resolve(video.duration);
                    video.src = '';
                };
                video.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Failed to load video'));
                };
                video.src = videoUrl;
            });
        };

        const formatDuration = (seconds: number): string => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        };

        const preloadAllDurations = async () => {
            console.log('📊 Preloading durations for', lessons.length, 'lessons');
            const durationPromises = lessons.map(async (lesson, index) => {
                // Skip lessons that already have a valid duration or no video URL
                if (!lesson.videoUrl) {
                    console.log(`⏭️ Lesson ${index}: No video URL, skipping`);
                    return { index, duration: lesson.duration };
                }
                if (lesson.duration !== '--:--' && lesson.duration !== '') {
                    console.log(`✅ Lesson ${index}: Already has duration: ${lesson.duration}`);
                    return { index, duration: lesson.duration };
                }
                try {
                    console.log(`🎬 Lesson ${index}: Fetching duration for ${lesson.videoUrl}`);
                    const durationSeconds = await fetchVideoDuration(lesson.videoUrl);
                    const formatted = formatDuration(durationSeconds);
                    console.log(`✅ Lesson ${index}: Duration fetched: ${formatted}`);
                    return { index, duration: formatted };
                } catch (error) {
                    console.warn(`❌ Lesson ${index}: Failed to fetch duration`, error);
                    return { index, duration: '--:--' };
                }
            });

            const results = await Promise.allSettled(durationPromises);
            setLessons(prevLessons => {
                const updatedLessons = [...prevLessons];
                results.forEach(result => {
                    if (result.status === 'fulfilled' && result.value) {
                        const { index, duration } = result.value;
                        if (updatedLessons[index]) {
                            updatedLessons[index] = { ...updatedLessons[index], duration };
                        }
                    }
                });
                return updatedLessons;
            });
        };

        preloadAllDurations();
    }, [lessons.length, courseId, lessonVideoUrls]);

    // Check enrollment status and redirect if not enrolled
    useEffect(() => {
        const checkEnrollmentStatus = async () => {
            if (!databaseUser?.id || !courseId) {
                setIsEnrolled(false);
                return;
            }

            try {
                const enrolled = await isUserEnrolled(databaseUser.id, courseId);
                setIsEnrolled(enrolled);

                // Redirect unenrolled users to the course details page
                if (!enrolled) {
                    console.log('🚫 User not enrolled, redirecting to course details page');
                    navigate(`/courses/${courseId}`, { replace: true });
                }
            } catch (error) {
                console.error('Error checking enrollment status:', error);
                setIsEnrolled(false);
            }
        };

        checkEnrollmentStatus();
    }, [databaseUser?.id, courseId, navigate]);

    // Note: Auto-enrollment removed. Users must enroll via the course details page before accessing the portal.

    // Persist progress and active lesson
    useEffect(() => {
        if (typeof window !== 'undefined' && lessons.length > 0 && courseId) {
            const storageKey = `courseProgress_${courseId}`;
            localStorage.setItem(storageKey, JSON.stringify(lessons));
            localStorage.setItem(`activeLessonIndex_${courseId}`, String(currentLessonIndex));
        }
    }, [lessons, courseId, currentLessonIndex]);

    const activeLesson = useMemo(
        () => lessons[currentLessonIndex],
        [lessons, currentLessonIndex]
    );

    const completedLessonIds = useMemo(
        () =>
            lessons
                .filter((lesson) => lesson.completed)
                .map((lesson) => String(lesson.id)),
        [lessons]
    );

    const progressStats = useMemo(
        () =>
            computeTrackableProgress(
                lessons,
                completedLessonIds,
                hasAssessmentQuiz,
                assessmentCompleted
            ),
        [lessons, completedLessonIds, hasAssessmentQuiz, assessmentCompleted]
    );
    const allLessonsCompleted = useMemo(
        () => progressStats.completedTrackableLessons >= progressStats.trackableLessonCount,
        [progressStats.completedTrackableLessons, progressStats.trackableLessonCount]
    );

    const refreshServerProgress = useCallback(async () => {
        if (!databaseUser?.id || !courseId) {
            return;
        }

        try {
            const accessSummary = await lessonAccessApiClient.getCourseAccessSummary(courseId);
            if (!accessSummary?.success) {
                return;
            }

            setHasAssessmentQuiz(Boolean(accessSummary.summary.hasAssessmentQuiz));
            setAssessmentCompleted(Boolean(accessSummary.summary.assessmentCompleted));
            setServerProgress({
                completedTrackableItems: Number(accessSummary.summary.completedTrackableItems ?? 0) || 0,
                trackableItemCount: Number(accessSummary.summary.trackableItemCount ?? 0) || 0,
                progressPercent: Number(accessSummary.summary.progressPercent ?? 0) || 0,
            });
        } catch (error) {
            console.warn("Failed to refresh server progress summary.", error);
        }
    }, [databaseUser?.id, courseId]);

    const boundedProgress =
        databaseUser?.id && serverProgress
            ? serverProgress.progressPercent
            : progressStats.progressPercent;
    const completedTrackableItems =
        databaseUser?.id && serverProgress
            ? serverProgress.completedTrackableItems
            : progressStats.completedTrackableItems;
    const totalTrackableItems =
        databaseUser?.id && serverProgress
            ? serverProgress.trackableItemCount
            : progressStats.trackableItemCount;

    const markLessonComplete = useCallback(async (lessonIndex: number) => {
        const lesson = lessons[lessonIndex];
        if (!lesson || lesson.completed) return;

        // Use isEnrolled instead of enrollment to ensure sync works for all enrolled users
        if (isEnrolled && databaseUser?.id && courseId) {
            try {
                const persisted = await updateLessonProgress(databaseUser.id, courseId, String(lesson.id), true);
                if (!persisted) {
                    console.warn("Lesson completion was not persisted; keeping local state unchanged.");
                    return;
                }
                await refreshServerProgress();
            } catch (err) {
                console.warn('Failed to sync lesson completion to server:', err);
                return;
            }
        }

        setLessons(prevLessons =>
            prevLessons.map((l, index) =>
                index === lessonIndex ? { ...l, completed: true } : l
            )
        );
    }, [lessons, isEnrolled, databaseUser?.id, courseId, refreshServerProgress]);

    const handleTimeUpdate = (time: number, totalDuration: number) => {
        setCurrentTime(time);
        if (totalDuration > 0) setDuration(totalDuration);

        const timeRemaining = totalDuration - time;
        const isNearEnd = timeRemaining <= 60 && totalDuration > 0;

        setIsNextLessonUnlocked(isNearEnd);

        if (isNearEnd && !lessons[currentLessonIndex].completed) {
            markLessonComplete(currentLessonIndex);
        }
    };

    const handleLoadedMetadata = (dur: number) => {
        setDuration(dur);
        setIsNextLessonUnlocked(false);

        if (dur > 0) {
            const minutes = Math.floor(dur / 60);
            const seconds = Math.floor(dur % 60);
            const formattedDuration = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            setLessons(prevLessons =>
                prevLessons.map((lesson, index) =>
                    index === currentLessonIndex
                        ? { ...lesson, duration: formattedDuration }
                        : lesson
                )
            );
        }
    };

    const handlePlayPause = () => setIsPlaying(!isPlaying);
    const handleVolume = (val: number) => setVolume(val);
    const handleSpeedChange = (val: number) => setPlaybackRate(val);
    const handleSeek = (val: number) => setCurrentTime(val);
    const handleToggleCaptions = () => setCaptionsEnabled(!captionsEnabled);

    const handleFullscreen = () => {
        safeSetIsTheaterMode(!isTheater);
    };

    const handlePrev = () => {
        setShowQuiz(false);
        setCurrentLessonIndex((prev) => Math.max(0, prev - 1));
        setCurrentTime(0);
    };

    const handleNext = () => {
        if (!lessons[currentLessonIndex].completed) {
            markLessonComplete(currentLessonIndex);
        }

        setShowQuiz(false);
        setCurrentLessonIndex((prev) =>
            Math.min(lessons.length - 1, prev + 1)
        );
        setCurrentTime(0);
        setIsNextLessonUnlocked(false);
    };

    const handleLessonSelect = (idx: number) => {
        setShowQuiz(false);
        setCurrentLessonIndex(idx);
        setCurrentTime(0);
        setIsNextLessonUnlocked(false);

        if (window.innerWidth < 1024) {
            setModuleOpen(false);
        }
    };

    const handleShowQuiz = () => {
        setShowQuiz(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackFromQuiz = () => {
        setShowQuiz(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const courseTitle = course?.title || "Loading...";
    const currentContentLabel = useMemo(() => {
        const lesson = lessons[currentLessonIndex];
        if (!lesson) {
            return "";
        }

        if (isIntroType(lesson.type)) {
            return "Intro";
        }
        if (isOutroType(lesson.type)) {
            return "Outro";
        }
        if (isQuizType(lesson.type)) {
            return "Quiz";
        }

        const lessonNumber = getCountableLessonNumber(lessons, currentLessonIndex);
        if (lessonNumber) {
            return `Lesson ${lessonNumber} of ${progressStats.lessonCount}`;
        }

        return `Lesson ${currentLessonIndex + 1}`;
    }, [lessons, currentLessonIndex, progressStats.lessonCount]);
    const atFirstLesson = currentLessonIndex === 0;
    const atLastLesson = currentLessonIndex === lessons.length - 1;

    // Render content
    if (!courseId) return <div>No course ID provided</div>;

    return (
        <div className="flex h-full w-full">
            {/* Course Outline Sidebar (Desktop) */}
            <div className={`${moduleOpen ? 'w-80' : isTheater ? 'w-0' : 'w-12'} shrink-0 bg-white border-r border-gray-200 transition-all duration-300 hidden lg:flex flex-col ${showQuiz ? 'opacity-50 pointer-events-none' : ''} rounded-none`}>
                {moduleOpen ? (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto">
                            <CourseOutline
                                lessons={lessons}
                                currentLessonIndex={currentLessonIndex}
                                onLessonSelect={handleLessonSelect}
                                onShowQuiz={handleShowQuiz}
                                moduleOpen={true}
                                setModuleOpen={setModuleOpen}
                                currentTime={currentTime}
                                duration={duration}
                                isNextLessonUnlocked={isNextLessonUnlocked}
                                showQuiz={showQuiz}
                                completedTrackableItems={completedTrackableItems}
                                trackableItemCount={totalTrackableItems}
                                progressPct={boundedProgress}
                                isUserEnrolled={isEnrolled}
                            />
                        </div>
                    </div>
                ) : (
                    !isTheater && (
                        <div className="flex flex-col items-center py-4">
                            <button
                                onClick={() => setModuleOpen(true)}
                                className="p-2 rounded hover:bg-gray-100 text-gray-500"
                                title="Expand outline"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )
                )}
            </div>

            {/* Main Content */}
            <main className={`flex-1 min-w-0 ${isTheater ? "p-0 h-full" : "p-3 md:p-4"} overflow-y-auto flex flex-col`}>
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <PageLoader size="xl" label="Loading course..." />
                    </div>
                ) : !activeLesson ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <h3 className="text-xl font-medium text-gray-900">No lessons found</h3>
                            <p className="text-gray-500 mt-2">This course doesn't have any content yet.</p>
                        </div>
                    </div>
                ) : showQuiz ? (
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-8">
                        <CourseAssessment
                            variant="inline"
                            allLessonsCompleted={allLessonsCompleted}
                            courseSlug={courseId}
                            onBack={handleBackFromQuiz}
                            onAssessmentPassed={() => {
                                if (databaseUser?.id) {
                                    void refreshServerProgress();
                                    return;
                                }
                                setAssessmentCompleted(true);
                            }}
                        />
                    </div>
                ) : (
                    <div className={`${isTheater ? "w-full h-full space-y-4" : "max-w-6xl mx-auto space-y-3"}`}>
                        {/* Video Player */}
                        <div className={`relative overflow-hidden ${isTheater ? "h-full w-full rounded-none" : "rounded-xl shadow-lg"} group`}>
                            {isTheater && (
                                <button
                                    onClick={() => handleFullscreen()}
                                    className="absolute top-3 right-3 z-20 bg-white/80 text-[#1839AD] px-3 py-1 rounded-full text-xs font-semibold shadow hover:bg-white transition"
                                >
                                    Exit Fullscreen
                                </button>
                            )}
                            <div
                                className={`absolute top-3 left-3 right-3 z-10 px-4 py-3 bg-black/40 backdrop-blur-sm rounded-lg transition-opacity duration-300 ${isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
                            >
                                <p className="text-white/90 text-lg font-semibold">
                                    {courseTitle}
                                </p>
                                <h1 className="text-white text-sm md:text-base font-normal mt-0.5">
                                    {activeLesson?.title}
                                </h1>
                            </div>

                            <VideoPlayer
                                src={activeLesson?.videoUrl || "/videos/C2-INTRO.mp4"}
                                poster={course?.introVideoPosterUrl || course?.heroImageUrl || "/images/placeholders/course-fallback.png"}
                                isPlaying={isPlaying}
                                volume={volume}
                                playbackRate={playbackRate}
                                currentTime={currentTime}
                                duration={duration}
                                captionsEnabled={captionsEnabled}
                                onPlayPause={handlePlayPause}
                                onVolumeChange={handleVolume}
                                onSpeedChange={handleSpeedChange}
                                onSeek={handleSeek}
                                onToggleCaptions={handleToggleCaptions}
                                onFullscreen={handleFullscreen}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={() => setIsPlaying(false)}
                                className={isTheater ? "h-full rounded-none border-0 shadow-none" : ""}
                            />
                        </div>

                        {/* Navigation Buttons */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <button
                                    onClick={handlePrev}
                                    disabled={atFirstLesson}
                                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                                >
                                    <ChevronLeft size={18} />
                                    Previous
                                </button>

                                <div className="flex-1 text-center">
                                    <span className="text-sm text-gray-500">
                                        {currentContentLabel}
                                    </span>
                                </div>

                                <button
                                    onClick={handleNext}
                                    disabled={atLastLesson || (!isNextLessonUnlocked && !lessons[currentLessonIndex]?.completed)}
                                    className={`px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition ${atLastLesson || (!isNextLessonUnlocked && !lessons[currentLessonIndex]?.completed)
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-[#1839AD] text-white hover:bg-[#132b7c] shadow-sm"
                                        }`}
                                    title={!isNextLessonUnlocked && !atLastLesson && !lessons[currentLessonIndex]?.completed ? "Watch until 1 minute before the end to unlock next lesson" : ""}
                                >
                                    Next Lesson
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Course Progress Bar */}
                            <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-600 font-medium">Course Progress</span>
                                    <span className="text-[#1839AD] font-bold">{boundedProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-[#1839AD] h-full rounded-full transition-all duration-500"
                                        style={{ width: `${boundedProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {completedTrackableItems} of {totalTrackableItems} trackable items completed
                                </p>
                            </div>
                        </div>

                        {/* Mobile Course Outline (Vertical Stack) */}
                        <div className="lg:hidden mt-6 pb-20">
                            <div className="mb-3 px-1">
                                <h3 className="font-semibold text-gray-900">Course Content</h3>
                                <p className="text-xs text-gray-500">
                                    {completedTrackableItems} of {totalTrackableItems} trackable items completed
                                </p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <CourseOutline
                                    lessons={lessons}
                                    currentLessonIndex={currentLessonIndex}
                                    onLessonSelect={handleLessonSelect}
                                    onShowQuiz={handleShowQuiz}
                                    moduleOpen={true}
                                    setModuleOpen={setModuleOpen}
                                    currentTime={currentTime}
                                    duration={duration}
                                    isNextLessonUnlocked={isNextLessonUnlocked}
                                    showQuiz={showQuiz}
                                    completedTrackableItems={completedTrackableItems}
                                    trackableItemCount={totalTrackableItems}
                                    progressPct={boundedProgress}
                                    isUserEnrolled={isEnrolled}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CoursePlayerPage;
