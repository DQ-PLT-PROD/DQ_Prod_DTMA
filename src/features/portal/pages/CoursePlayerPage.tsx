/**
 * CoursePlayerPage - The active learning interface with video player and course outline.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
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
import {
    updateLessonProgress,
    updateEnrollmentProgress,
    syncLocalProgressToServer,
} from "../services/progressService";
import { lessonAccessApiClient } from "../../../lib/api/lessonAccessApiClient";
import {
    getLearningSnapshot,
    invalidateLearningSnapshot,
} from "../../learning/services/learningSnapshotService";
import { Course } from "../../../types/dtma-lms";

const CoursePlayerPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const location = useLocation();
    const { databaseUser } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLessonLoading, setIsLessonLoading] = useState(false);
    const [lessonLoadError, setLessonLoadError] = useState<string | null>(null);

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
    const [isEnrolled, setIsEnrolled] = useState(false);

    const resumeLessonId = useMemo(() => {
        const searchParams = new URLSearchParams(location.search);
        const value = searchParams.get("resumeLessonId");
        return value ? value : null;
    }, [location.search]);

    useEffect(() => {
        if (!courseId) return;

        let isMounted = true;

        const loadCourseData = async () => {
            try {
                setIsLoading(true);
                setLessonLoadError(null);

                const snapshot = await getLearningSnapshot(courseId, databaseUser?.id ?? null, {
                    useCache: false,
                });

                if (!isMounted) {
                    return;
                }

                setCourse(snapshot.course);
                setIsEnrolled(Boolean(snapshot.enrollment));

                const resumeIndex = resumeLessonId
                    ? snapshot.lessons.findIndex((lesson) => String(lesson.id) === resumeLessonId)
                    : -1;

                const completedLessonIds = new Set<string>();
                snapshot.lessonProgress.forEach((progress) => {
                    if (progress.completed) {
                        completedLessonIds.add(progress.lessonId);
                    }
                });

                const storageKey = `courseProgress_${courseId}`;
                const saved = localStorage.getItem(storageKey);

                if (saved) {
                    try {
                        const savedLessons: Lesson[] = JSON.parse(saved);
                        savedLessons.forEach((lesson) => {
                            if (lesson.completed) {
                                completedLessonIds.add(String(lesson.id));
                            }
                        });
                    } catch (error) {
                        console.warn("Failed to parse local progress", error);
                    }
                }

                const uiLessons = snapshot.lessons.map((lesson, idx) =>
                    toUILesson(lesson, idx, completedLessonIds)
                );

                if (saved) {
                    try {
                        const localLessons: Lesson[] = JSON.parse(saved);
                        uiLessons.forEach((uiLesson) => {
                            const savedMatch = localLessons.find(
                                (lesson) => String(lesson.id) === String(uiLesson.id)
                            );
                            if (savedMatch?.duration && savedMatch.duration !== "--:--") {
                                uiLesson.duration = savedMatch.duration;
                            }
                        });
                    } catch {
                        // Ignore malformed local progress cache.
                    }
                }

                setLessons(uiLessons);

                if (resumeIndex >= 0) {
                    setCurrentLessonIndex(resumeIndex);
                } else {
                    const savedIndex = localStorage.getItem(`activeLessonIndex_${courseId}`);
                    if (savedIndex !== null) {
                        const idx = parseInt(savedIndex, 10);
                        if (!Number.isNaN(idx) && idx >= 0 && idx < uiLessons.length) {
                            setCurrentLessonIndex(idx);
                        }
                    }
                }

                if (databaseUser?.id && snapshot.enrollment && saved) {
                    try {
                        const localLessons: Lesson[] = JSON.parse(saved);
                        const localCompleted = localLessons
                            .filter((lesson) => lesson.completed)
                            .map((lesson) => ({ id: String(lesson.id), completed: true }));

                        if (localCompleted.length > 0) {
                            syncLocalProgressToServer(databaseUser.id, courseId, localCompleted);
                        }
                    } catch {
                        // Ignore malformed local progress cache.
                    }
                }
            } catch (error) {
                console.warn("Failed to load course data:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadCourseData();

        return () => {
            isMounted = false;
        };
    }, [courseId, databaseUser?.id, resumeLessonId]);

    useEffect(() => {
        if (!courseId || lessons.length === 0 || !lessons[currentLessonIndex]) {
            return;
        }

        let isMounted = true;

        const loadLessonContent = async () => {
            setIsLessonLoading(true);
            setLessonLoadError(null);

            const lessonId = String(lessons[currentLessonIndex].id);
            const result = await lessonAccessApiClient.getLessonContent(courseId, lessonId);

            if (!isMounted) {
                return;
            }

            if (!result.success || !result.lesson) {
                setLessonLoadError(result.error || "Unable to load lesson content.");
                setIsLessonLoading(false);
                return;
            }

            setLessons((previousLessons) =>
                previousLessons.map((lesson, idx) =>
                    idx === currentLessonIndex
                        ? {
                            ...lesson,
                            description: result.lesson?.content || lesson.description,
                            videoUrl: result.lesson?.videoUrl,
                            resourceUrl: result.lesson?.resourceUrl,
                            isPreview: result.lesson?.isPreview ?? lesson.isPreview,
                        }
                        : lesson
                )
            );
            setIsLessonLoading(false);
        };

        loadLessonContent();

        return () => {
            isMounted = false;
        };
    }, [courseId, currentLessonIndex, lessons.length]);

    const lessonVideoUrls = useMemo(
        () => lessons.map((lesson) => lesson.videoUrl).filter(Boolean).join(","),
        [lessons]
    );

    useEffect(() => {
        if (lessons.length === 0 || !courseId || !lessonVideoUrls) return;

        const fetchVideoDuration = (videoUrl: string): Promise<number> =>
            new Promise((resolve, reject) => {
                const video = document.createElement("video");
                video.preload = "metadata";
                const timeout = setTimeout(() => {
                    video.src = "";
                    reject(new Error("Timeout loading video metadata"));
                }, 10000);

                video.onloadedmetadata = () => {
                    clearTimeout(timeout);
                    resolve(video.duration);
                    video.src = "";
                };
                video.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error("Failed to load video"));
                };
                video.src = videoUrl;
            });

        const formatDuration = (seconds: number): string => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        };

        const preloadAllDurations = async () => {
            const durationPromises = lessons.map(async (lesson, index) => {
                if (!lesson.videoUrl) {
                    return { index, duration: lesson.duration };
                }
                if (lesson.duration !== "--:--" && lesson.duration !== "") {
                    return { index, duration: lesson.duration };
                }
                try {
                    const durationSeconds = await fetchVideoDuration(lesson.videoUrl);
                    return { index, duration: formatDuration(durationSeconds) };
                } catch {
                    return { index, duration: "--:--" };
                }
            });

            const results = await Promise.allSettled(durationPromises);
            setLessons((previousLessons) => {
                const updatedLessons = [...previousLessons];
                results.forEach((result) => {
                    if (result.status === "fulfilled" && result.value) {
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
    }, [courseId, lessonVideoUrls, lessons]);

    useEffect(() => {
        if (typeof window !== "undefined" && lessons.length > 0 && courseId) {
            localStorage.setItem(`courseProgress_${courseId}`, JSON.stringify(lessons));
            localStorage.setItem(`activeLessonIndex_${courseId}`, String(currentLessonIndex));
        }
    }, [courseId, currentLessonIndex, lessons]);

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
    const progressPct = lessons.length
        ? Math.round(((completedCount + currentLessonProgress) / lessons.length) * 100)
        : 0;
    const boundedProgress = Math.min(Math.max(progressPct, 0), 100);
    const allLessonsCompleted = useMemo(
        () => lessons.length > 0 && lessons.every((lesson) => lesson.completed),
        [lessons]
    );

    const markLessonComplete = useCallback(async (lessonIndex: number) => {
        const lesson = lessons[lessonIndex];
        if (!lesson || lesson.completed || !courseId) return;

        setLessons((previousLessons) =>
            previousLessons.map((item, idx) =>
                idx === lessonIndex ? { ...item, completed: true } : item
            )
        );

        if (isEnrolled && databaseUser?.id) {
            try {
                await updateLessonProgress(databaseUser.id, courseId, String(lesson.id), true);
                invalidateLearningSnapshot(courseId, databaseUser.id);

                const newCompletedCount = lessons.filter((item) => item.completed).length + 1;
                const newProgressPct = (newCompletedCount / lessons.length) * 100;
                await updateEnrollmentProgress(databaseUser.id, courseId, newProgressPct);
            } catch (err) {
                console.warn("Failed to sync lesson completion to server:", err);
            }
        }
    }, [courseId, databaseUser?.id, isEnrolled, lessons]);

    const handleTimeUpdate = (time: number, totalDuration: number) => {
        setCurrentTime(time);
        if (totalDuration > 0) setDuration(totalDuration);

        const timeRemaining = totalDuration - time;
        const isNearEnd = timeRemaining <= 60 && totalDuration > 0;

        setIsNextLessonUnlocked(isNearEnd);

        if (isNearEnd && lessons[currentLessonIndex] && !lessons[currentLessonIndex].completed) {
            markLessonComplete(currentLessonIndex);
        }
    };

    const handleLoadedMetadata = (dur: number) => {
        setDuration(dur);
        setIsNextLessonUnlocked(false);

        if (dur > 0) {
            const minutes = Math.floor(dur / 60);
            const seconds = Math.floor(dur % 60);
            const formattedDuration = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

            setLessons((previousLessons) =>
                previousLessons.map((lesson, idx) =>
                    idx === currentLessonIndex
                        ? { ...lesson, duration: formattedDuration }
                        : lesson
                )
            );
        }
    };

    const handlePlayPause = () => setIsPlaying(!isPlaying);
    const handleVolume = (value: number) => setVolume(value);
    const handleSpeedChange = (value: number) => setPlaybackRate(value);
    const handleSeek = (value: number) => setCurrentTime(value);
    const handleToggleCaptions = () => setCaptionsEnabled(!captionsEnabled);
    const handleFullscreen = () => setIsTheater((value) => !value);

    const handlePrev = () => {
        setShowQuiz(false);
        setCurrentLessonIndex((prev) => Math.max(0, prev - 1));
        setCurrentTime(0);
    };

    const handleNext = () => {
        if (lessons[currentLessonIndex] && !lessons[currentLessonIndex].completed) {
            markLessonComplete(currentLessonIndex);
        }

        setShowQuiz(false);
        setCurrentLessonIndex((prev) => Math.min(lessons.length - 1, prev + 1));
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
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBackFromQuiz = () => {
        setShowQuiz(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const courseTitle = course?.title || "Loading...";
    const atFirstLesson = currentLessonIndex === 0;
    const atLastLesson = currentLessonIndex === lessons.length - 1;

    if (!courseId) return <div>No course ID provided</div>;

    return (
        <div className="flex h-full w-full">
            <div className={`${moduleOpen ? "w-80" : isTheater ? "w-0" : "w-12"} shrink-0 bg-white border-r border-gray-200 transition-all duration-300 hidden lg:flex flex-col ${showQuiz ? "opacity-50 pointer-events-none" : ""} rounded-none`}>
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
                        />
                    </div>
                ) : (
                    <div className={`${isTheater ? "w-full h-full space-y-4" : "max-w-6xl mx-auto space-y-3"}`}>
                        <div className={`relative overflow-hidden ${isTheater ? "h-full w-full rounded-none" : "rounded-xl shadow-lg"} group`}>
                            {isTheater && (
                                <button
                                    onClick={handleFullscreen}
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
                                    {activeLesson.title}
                                </h1>
                            </div>

                            {isLessonLoading ? (
                                <div className="flex min-h-[360px] items-center justify-center bg-black text-white">
                                    <PageLoader size="lg" label="Loading lesson..." />
                                </div>
                            ) : lessonLoadError || !activeLesson.videoUrl ? (
                                <div className="flex min-h-[360px] items-center justify-center bg-black px-6 text-center text-white">
                                    <div>
                                        <h2 className="text-lg font-semibold">Lesson unavailable</h2>
                                        <p className="mt-2 text-sm text-white/80">
                                            {lessonLoadError || "Lesson content is not available for this learner."}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <VideoPlayer
                                    src={activeLesson.videoUrl}
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
                            )}
                        </div>

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

                        <div className="lg:hidden mt-6 pb-20">
                            <div className="mb-3 px-1">
                                <h3 className="font-semibold text-gray-900">Course Content</h3>
                                <p className="text-xs text-gray-500">{completedCount} of {lessons.length} completed</p>
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
                                    completedCount={completedCount}
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
