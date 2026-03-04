import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  User,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Loader2,
  Download,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import CourseAssessment from "../../courses/pages/CourseAssessment";
import { VideoPlayer } from "../../portal/components/VideoPlayer";
import { CourseOutline } from "../../courses/components/CourseOutline";
import { Lesson, toUILesson } from "../../../types/course";
import { fetchCourseLessons, fetchCourseModules, fetchCourseResources, fetchFullCourse, CourseResource } from "../../courses/services/courseService";
import {
  getUserCourseProgress,
  updateLessonProgress,
  updateEnrollmentProgress,
  syncLocalProgressToServer,
} from "../../portal/services/progressService";
import { isUserEnrolled, canAccessLesson } from "../../courses/services/enrollmentService";
import { PreviewContentGate } from "../../portal/components/PreviewContentGate";
import { Lesson as DBLesson, Course, Module } from "../../../types/dtma-lms";
import { ExploreDropdown } from "../../../components/Header/components/ExploreDropdown";
import { FEATURES } from "../../../config/features";

// Default fallback course slug if none provided in URL
const DEFAULT_COURSE_SLUG = 'perfecting-life-transactions';

const LearningScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId') || DEFAULT_COURSE_SLUG;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isNextLessonUnlocked, setIsNextLessonUnlocked] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);

  const navigate = useNavigate();
  const { user, databaseUser, logout } = useAuth();

  // Fetch course, lessons, and resources from Supabase on mount or when courseId changes
  // IMPORTANT: Do NOT include databaseUser?.id in dependencies to prevent double-run overwrite
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setIsLoading(true);
        const [fetchedCourse, fetchedModules, fetchedLessons, fetchedResources] = await Promise.all([
          fetchFullCourse(courseId),
          fetchCourseModules(courseId),
          fetchCourseLessons(courseId),
          fetchCourseResources(courseId),
        ]);

        setCourse(fetchedCourse);
        setModules(fetchedModules);

        if (fetchedLessons.length > 0) {
          setDbLessons(fetchedLessons);

          // Always read localStorage first (works for both anonymous and authenticated)
          const storageKey = `courseProgress_${courseId}`;
          const saved = localStorage.getItem(storageKey);
          const savedLessons: Lesson[] = saved ? JSON.parse(saved) : [];
          const completedIds = new Set<string>(
            savedLessons.filter(l => l.completed).map(l => String(l.id))
          );

          // Convert DB lessons to UI lessons with localStorage progress
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
  }, [courseId]); // Only re-run when course changes

  // Preload video durations for ALL lessons to show accurate timestamps in course outline
  // This runs after lessons are loaded and fetches actual durations from video metadata
  useEffect(() => {
    if (lessons.length === 0) return;

    const fetchVideoDuration = (videoUrl: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';

        const timeout = setTimeout(() => {
          video.src = '';
          reject(new Error('Timeout loading video metadata'));
        }, 10000); // 10 second timeout

        video.onloadedmetadata = () => {
          clearTimeout(timeout);
          resolve(video.duration);
          video.src = ''; // Clean up
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
        // Skip if no video URL or duration already loaded (not --:--)
        if (!lesson.videoUrl || (lesson.duration !== '--:--' && lesson.duration !== '')) {
          return { index, duration: lesson.duration };
        }

        try {
          const durationSeconds = await fetchVideoDuration(lesson.videoUrl);
          return { index, duration: formatDuration(durationSeconds) };
        } catch (error) {
          console.warn(`Failed to load duration for lesson ${index + 1}:`, error);
          return { index, duration: '--:--' }; // Keep empty state for failed videos
        }
      });

      const results = await Promise.allSettled(durationPromises);

      // Update lessons with fetched durations
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
  }, [lessons.length, courseId]); // Run when lessons are loaded

  // Check enrollment status when user or course changes
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

  // Persist progress to localStorage (scoped to courseId)
  useEffect(() => {
    if (typeof window !== 'undefined' && lessons.length > 0) {
      const storageKey = `courseProgress_${courseId}`;
      localStorage.setItem(storageKey, JSON.stringify(lessons));
    }
  }, [lessons, courseId]);

  const activeLesson = useMemo(
    () => lessons[currentLessonIndex],
    [lessons, currentLessonIndex]
  );

  const activeModuleThumbnail = useMemo(() => {
    if (!activeLesson?.moduleId) {
      return course?.heroImageUrl;
    }

    return modules.find((module) => module.id === activeLesson.moduleId)?.thumbnailUrl || course?.heroImageUrl;
  }, [activeLesson?.moduleId, course?.heroImageUrl, modules]);

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

  // Helper to mark a lesson complete and sync to server if authenticated
  const markLessonComplete = useCallback(async (lessonIndex: number) => {
    const lesson = lessons[lessonIndex];
    if (!lesson || lesson.completed) return;

    // Update local state immediately
    setLessons(prevLessons =>
      prevLessons.map((l, index) =>
        index === lessonIndex ? { ...l, completed: true } : l
      )
    );

    // Note: Server sync for lesson progress can be added later when needed
    // For now, progress is maintained in localStorage via the useEffect below
  }, [lessons]);

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

    // Update the lesson's displayed duration to reflect the actual video length
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
    setIsTheater((prev) => !prev);
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

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans flex flex-col">
      {/* Full-Width Header with Gradient */}
      <header
        className="sticky top-0 z-30 shadow-md"
        style={{
          background: "linear-gradient(90deg, #092893 0%, #1A3592 16.12%, #2D4492 29.33%, #33478E 39.99%, #3C4E8F 48.46%, #495995 55.11%, #4C5A8E 60.28%, #525F91 64.34%, #556293 67.66%, #566293 70.58%, #596594 73.46%, #5E6996 76.68%, #677195 80.58%, #737A96 85.53%, #7E8398 91.88%, #868B9E 100%)"
        }}
      >
        <div className="px-6 py-3 flex items-center gap-6">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src="/logo/dtma-logo-white.svg" alt="DTMA" className="h-8 w-auto" />
          </a>

          {/* Navigation */}
          <div className="hidden md:flex items-center">
            {FEATURES.COURSE_MARKETPLACE && <ExploreDropdown />}
          </div>

          {/* Profile Icon */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition border border-white/30"
            >
              <User size={20} />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white text-[#030C2B] rounded-xl shadow-lg border border-gray-100 py-2 text-sm z-30">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  onClick={logout}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content Area Below Header */}
      <div className={`flex-1 flex ${isTheater ? "h-[calc(100vh-140px)] max-h-[calc(100vh-140px)] w-full" : ""}`}>
        {/* Minimal Side Navigation - Learning Page with collapse toggle (hidden in theater) */}
        {!isTheater && (
          <aside
            className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${sidebarOpen ? "w-60" : "w-16"
              } hidden lg:flex flex-col shrink-0`}
          >
            <nav>
              <div
                className={`flex items-center px-4 py-3 bg-white text-[#1839AD] overflow-hidden border-b border-gray-200 ${!sidebarOpen ? 'cursor-pointer justify-center' : 'cursor-default'}`}
                onClick={() => !sidebarOpen && setSidebarOpen(true)}
              >
                <span className="w-8 flex items-center justify-center flex-shrink-0 text-[#1839AD]">
                  <BookOpen size={20} />
                </span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 ml-3 font-medium whitespace-nowrap text-[#1839AD]">Learning Page</span>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1 rounded hover:bg-gray-100 transition flex-shrink-0"
                      title="Collapse navigation"
                    >
                      <ChevronLeft size={18} className="text-[#1839AD]" />
                    </button>
                  </>
                )}
              </div>
            </nav>
          </aside>
        )}

        {/* Mobile toggle button */}
        {!isTheater && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed bottom-4 left-4 z-40 p-3 rounded-full bg-[#1839AD] text-white shadow-lg lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        {/* Mobile sidebar overlay */}
        {sidebarOpen && !isTheater && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        {!isTheater && (
          <aside
            className={`fixed inset-y-0 left-0 z-30 bg-white w-60 transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            style={{ top: '56px' }}
          >
            <nav className="py-4">
              <div className="flex items-center px-4 py-3 bg-[#1839AD] text-white">
                <BookOpen size={20} />
                <span className="ml-3 font-medium">Learning Page</span>
              </div>
            </nav>
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex">
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
          <main className={`flex-1 min-w-0 ${isTheater ? "p-0 h-full" : "p-4 md:p-6"} overflow-y-auto`}>
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
              <div className={`${isTheater ? "w-full h-full space-y-4" : "max-w-4xl mx-auto space-y-4"}`}>
                {/* Video Player with Overlay Title */}
                <div className={`relative overflow-hidden ${isTheater ? "h-full w-full rounded-none" : "rounded-xl shadow-lg"} group`}>
                  {isTheater && (
                    <button
                      onClick={() => setIsTheater(false)}
                      className="absolute top-3 right-3 z-20 bg-white/80 text-[#1839AD] px-3 py-1 rounded-full text-xs font-semibold shadow hover:bg-white transition"
                    >
                      Exit Fullscreen
                    </button>
                  )}
                  {/* Title Overlay - transparent strip over video */}
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

                  {/* Video Player with Preview Content Gate */}
                  {course && (
                    <PreviewContentGate
                      course={course}
                      isPreviewLesson={activeLesson?.isPreview || false}
                      isUserEnrolled={isEnrolled}
                      onEnrollmentSuccess={() => {
                        // Refresh enrollment status after successful enrollment
                        if (databaseUser?.id) {
                          isUserEnrolled(databaseUser.id, courseId).then(setIsEnrolled);
                        }
                      }}
                    >
                      <VideoPlayer
                        src={activeLesson?.videoUrl || "/videos/C2-INTRO.mp4"}
                        poster={activeModuleThumbnail || "/images/placeholders/course-fallback.png"}
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
                  )}
                </div>

                {/* Navigation Buttons - Below Video */}
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

                {/* Resources section removed */}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default LearningScreen;
