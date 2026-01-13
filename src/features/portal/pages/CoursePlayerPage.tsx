/**
 * CoursePlayerPage - The active learning interface with video player and course outline
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import {
    ChevronRight,
    ChevronLeft,
    Loader2,
} from "lucide-react";
import { useAuth } from "../../../components/Header";
import CourseAssessment from "../../courses/pages/CourseAssessment";
import { VideoPlayer } from "../components/VideoPlayer";
import { CourseOutline } from "../../courses/components/CourseOutline";
import { Lesson, toUILesson } from "../../../types/course";
import { fetchCourseLessons, fetchCourseResources, fetchFullCourse, CourseResource } from "../../courses/services/courseService";
import {
    getOrCreateEnrollment,
    updateLessonProgress,
    updateEnrollmentProgress,
    syncLocalProgressToServer,
    Enrollment,
} from "../services/progressService";
import { isUserEnrolled } from "../../../services/enrollmentService";
import { PreviewContentGate } from "../../../components/learning/PreviewContentGate";
import { Lesson as DBLesson, Course } from "../../../types/dtma-lms";

// Defined so we can pass context up to the layout if we needed to (e.g. theater mode)
// But for now we manage theater mode locally and just hide sidebar via pure CSS or similar, 
// OR we lift state. Since PortalLayout handles sidebar, we need to communicate.
// We'll trust the user check that said "Layout Consistency" includes theater mode.
// We can use a simple prop or context.
// For simplicity in this refactor, we will rely on a new Outlet context or simple full screen.

const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();

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
    const [dbLessons, setDbLessons] = useState<DBLesson[]>([]);
    const [resources, setResources] = useState<CourseResource[]>([]);
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
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentLoading, setEnrollmentLoading] = useState(true);

    const navigate = useNavigate();
    const { user, databaseUser } = useAuth();

    // Fetch course, lessons, and resources
    useEffect(() => {
        if (!courseId) return;

        const loadCourseData = async () => {
            try {
                setIsLoading(true);
                const [fetchedCourse, fetchedLessons, fetchedResources] = await Promise.all([
                    fetchFullCourse(courseId),
                    fetchCourseLessons(courseId),
                    fetchCourseResources(courseId),
                ]);

                setCourse(fetchedCourse);

                if (fetchedLessons.length > 0) {
                    setDbLessons(fetchedLessons);

                    const storageKey = `courseProgress_${courseId}`;
                    const saved = localStorage.getItem(storageKey);
                    const savedLessons: Lesson[] = saved ? JSON.parse(saved) : [];
                    const completedIds = new Set<string>(
                        savedLessons.filter(l => l.completed).map(l => String(l.id))
                    );

                    const uiLessons = fetchedLessons.map((lesson, idx) =>
                        toUILesson(lesson, idx, completedIds)
                    );
                    setLessons(uiLessons);
                } else {
                    setLessons([]);
                }

                setResources(fetchedResources);
            } catch (error) {
                console.warn('Failed to load course data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCourseData();
    }, [courseId]);

    // Preload video durations
    useEffect(() => {
        if (lessons.length === 0 || !courseId) return;

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
            const durationPromises = lessons.map(async (lesson, index) => {
                if (!lesson.videoUrl || (lesson.duration !== '--:--' && lesson.duration !== '')) {
                    return { index, duration: lesson.duration };
                }
                try {
                    const durationSeconds = await fetchVideoDuration(lesson.videoUrl);
                    return { index, duration: formatDuration(durationSeconds) };
                } catch (error) {
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
    }, [lessons.length, courseId]);

    // Check enrollment status
    useEffect(() => {
        const checkEnrollmentStatus = async () => {
            if (!databaseUser?.id || !courseId) {
                setIsEnrolled(false);
                setEnrollmentLoading(false);
                return;
            }

            try {
                setEnrollmentLoading(true);
                const enrolled = await isUserEnrolled(databaseUser.id, courseId);
                setIsEnrolled(enrolled);
            } catch (error) {
                console.error('Error checking enrollment status:', error);
                setIsEnrolled(false);
            } finally {
                setEnrollmentLoading(false);
            }
        };

        checkEnrollmentStatus();
    }, [databaseUser?.id, courseId]);

    // Auto-enrollment logic
    useEffect(() => {
        const handleAutoEnrollment = async () => {
            if (!databaseUser?.id || lessons.length === 0 || enrollment || isEnrolled || !courseId) return;

            try {
                const enroll = await getOrCreateEnrollment(databaseUser.id, courseId);
                setEnrollment(enroll);

                if (enroll) {
                    setIsEnrolled(true);
                    const storageKey = `courseProgress_${courseId}`;
                    const saved = localStorage.getItem(storageKey);
                    if (saved) {
                        const localLessons: Lesson[] = JSON.parse(saved);
                        const localCompletedIds = localLessons
                            .filter(l => l.completed)
                            .map(l => ({ id: String(l.id), completed: true }));

                        if (localCompletedIds.length > 0) {
                            await syncLocalProgressToServer(databaseUser.id, courseId, localCompletedIds);
                        }
                    }
                }
            } catch (err) {
                console.warn('Failed to create enrollment or sync progress:', err);
            }
        };

        handleAutoEnrollment();
    }, [databaseUser?.id, lessons.length, courseId, enrollment, isEnrolled]);

    // Persist progress
    useEffect(() => {
        if (typeof window !== 'undefined' && lessons.length > 0 && courseId) {
            const storageKey = `courseProgress_${courseId}`;
            localStorage.setItem(storageKey, JSON.stringify(lessons));
        }
    }, [lessons, courseId]);

    const activeLesson = useMemo(
        () => lessons[currentLessonIndex],
        [lessons, currentLessonIndex]
    );

    const completedCount = useMemo(
        () => lessons.filter((lesson) => lesson.completed).length,
        [lessons]
    );

    const currentLesson = lessons[currentLessonIndex];
    const currentLessonProgress =
        currentLesson && !currentLesson.completed && duration > 0
            ? Math.min(currentTime / duration, 1)
            : 0;
    const progressPct = Math.round(
        ((completedCount + currentLessonProgress) / lessons.length) * 100
    );
    const boundedProgress = Math.min(Math.max(progressPct, 0), 100);
    const allLessonsCompleted = useMemo(
        () => lessons.every((lesson) => lesson.completed),
        [lessons]
    );

    const markLessonComplete = useCallback(async (lessonIndex: number) => {
        const lesson = lessons[lessonIndex];
        if (!lesson || lesson.completed) return;

        setLessons(prevLessons =>
            prevLessons.map((l, index) =>
                index === lessonIndex ? { ...l, completed: true } : l
            )
        );

        if (enrollment && databaseUser?.id && courseId) {
            try {
                await updateLessonProgress(databaseUser.id, courseId, String(lesson.id), true);
                const newCompletedCount = lessons.filter(l => l.completed).length + 1;
                const newProgressPct = (newCompletedCount / lessons.length) * 100;
                await updateEnrollmentProgress(databaseUser.id, courseId, newProgressPct);
            } catch (err) {
                console.warn('Failed to sync lesson completion to server:', err);
            }
        }
    }, [lessons, enrollment, databaseUser?.id, courseId]);

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
    const atFirstLesson = currentLessonIndex === 0;
    const atLastLesson = currentLessonIndex === lessons.length - 1;

    // Render content
    if (!courseId) return <div>No course ID provided</div>;

    return (
        <div className="flex h-full w-full">
            {/* Course Outline Sidebar */}
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
                                completedCount={completedCount}
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
            <main className={`flex-1 min-w-0 ${isTheater ? "p-0 h-full" : "p-3 md:p-4"} overflow-y-auto`}>
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={48} />
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

                            <PreviewContentGate
                                course={course!}
                                isPreviewLesson={activeLesson?.isPreview || false}
                                isUserEnrolled={isEnrolled}
                                onEnrollmentSuccess={() => {
                                    if (databaseUser?.id) {
                                        isUserEnrolled(databaseUser.id, courseId!).then(setIsEnrolled);
                                    }
                                }}
                            >
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
                            </PreviewContentGate>
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
                                        Lesson {currentLessonIndex + 1} of {lessons.length}
                                    </span>
                                </div>

                                <button
                                    onClick={handleNext}
                                    disabled={atLastLesson || !isNextLessonUnlocked}
                                    className={`px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition ${atLastLesson || !isNextLessonUnlocked
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-[#1839AD] text-white hover:bg-[#132b7c] shadow-sm"
                                        }`}
                                    title={!isNextLessonUnlocked && !atLastLesson ? "Watch until 1 minute before the end to unlock next lesson" : ""}
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
                                    {completedCount} of {lessons.length} lessons completed
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CoursePlayerPage;
