import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  User,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import CourseAssessment from "./CourseAssessment";
import { VideoPlayer } from "../components/VideoPlayer";
import { CourseOutline } from "../components/CourseOutline";
import { Lesson } from "../types/course";

const initialLessons: Lesson[] = [
  {
    id: 1,
    title: "Economy 4.0 & Your Role in Perfecting Life's Transactions",
    duration: "08:12",
    completed: true,
    description: "Ground yourself in the core ideas behind Economy 4.0.",
  },
  {
    id: 2,
    title: "Seeing Your Work as a Transaction, Not a Task",
    duration: "12:45",
    completed: true,
    description: "See how DBPs unlock orchestration across teams.",
  },
  {
    id: 3,
    title: "Applying the 5 PLT Pillars as a Design & Build Checklist",
    duration: "10:34",
    completed: false,
    description: "Map where automation and AI add momentum.",
  },
  {
    id: 4,
    title: "The Transaction Lifecycle: Using the Growth Hack Lens",
    duration: "09:58",
    completed: false,
    description: "Use 6XD to prioritize and scale winning moves.",
  },
  {
    id: 5,
    title: "Designing PLTs in Practice (UX, Flows & Handoffs)",
    duration: "07:20",
    completed: false,
    description: "Turn lessons into a 30-day execution plan.",
  },
  {
    id: 6,
    title: "Building PLTs on Platforms: DBPs, Automation & Reuse",
    duration: "11:15",
    completed: false,
    description: "Learn to build on platforms for scalability.",
  },
  {
    id: 7,
    title: "Making Transactions Intelligent: Data, Metrics & AI",
    duration: "13:30",
    completed: false,
    description: "Integrate intelligence into your transactions.",
  },
  {
    id: 8,
    title: "Trust, Transparency & Security in Everyday Design",
    duration: "09:45",
    completed: false,
    description: "Build trust and security into your designs.",
  },
  {
    id: 9,
    title: "Capstone: Redesigning a Real Transaction You're Working On",
    duration: "15:20",
    completed: false,
    description: "Apply everything to a real-world project.",
  },
];

const LearningScreen: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('courseProgress');
      return saved ? JSON.parse(saved) : initialLessons;
    }
    return initialLessons;
  });

  const [currentLessonIndex, setCurrentLessonIndex] = useState(2);
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

  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('courseProgress', JSON.stringify(lessons));
    }
  }, [lessons]);

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

  const handleTimeUpdate = (time: number, totalDuration: number) => {
    setCurrentTime(time);
    if (totalDuration > 0) setDuration(totalDuration);

    const timeRemaining = totalDuration - time;
    const isNearEnd = timeRemaining <= 60 && totalDuration > 0;

    setIsNextLessonUnlocked(isNearEnd);

    if (isNearEnd && !lessons[currentLessonIndex].completed) {
      setLessons(prevLessons =>
        prevLessons.map((lesson, index) =>
          index === currentLessonIndex
            ? { ...lesson, completed: true }
            : lesson
        )
      );
    }
  };

  const handleLoadedMetadata = (dur: number) => {
    setDuration(dur);
    setIsNextLessonUnlocked(false);
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
      setLessons(prevLessons =>
        prevLessons.map((lesson, index) =>
          index === currentLessonIndex
            ? { ...lesson, completed: true }
            : lesson
        )
      );
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

  const courseTitle = "Perfecting Life Transactions: A Digital Builder's Blueprint";
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
        <div className="px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src="/DTMA LOGO WHITE.svg" alt="DTMA" className="h-8 w-auto" />
          </a>

          {/* Profile Icon */}
          <div className="relative">
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
                  onClick={() => navigate('/')}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content Area Below Header */}
      <div className="flex-1 flex">
        {/* Minimal Side Navigation - Learning Page with collapse toggle (hidden in theater) */}
        {!isTheater && (
          <aside
            className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${sidebarOpen ? "w-60" : "w-16"
              } hidden lg:flex flex-col shrink-0`}
          >
            <nav>
              <div
                className={`flex items-center px-4 py-3 bg-[#1839AD] text-white overflow-hidden ${!sidebarOpen ? 'cursor-pointer justify-center' : 'cursor-default'}`}
                onClick={() => !sidebarOpen && setSidebarOpen(true)}
              >
                <span className="w-8 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={20} />
                </span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 ml-3 font-medium whitespace-nowrap">Learning Page</span>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1 rounded hover:bg-white/20 transition flex-shrink-0"
                      title="Collapse navigation"
                    >
                      <ChevronLeft size={18} />
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
          <main className={`flex-1 min-w-0 ${isTheater ? "p-2 md:p-3" : "p-4 md:p-6"} overflow-y-auto`}>
            {showQuiz ? (
              <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-8">
                <CourseAssessment
                  variant="inline"
                  allLessonsCompleted={allLessonsCompleted}
                  onBack={handleBackFromQuiz}
                />
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Video Player with Overlay Title */}
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  {/* Title Overlay - Dark Header Bar */}
                  <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 via-black/60 to-transparent px-4 py-3">
                    <p className="text-white/90 text-lg font-semibold">
                      {courseTitle}
                    </p>
                    <h1 className="text-white text-sm md:text-base font-normal mt-0.5">
                      {activeLesson.title}
                    </h1>
                  </div>

                  {/* Video Player */}
                  <VideoPlayer
                    src="/videos/C2-INTRO.mp4"
                    poster="/Economy%204.0%20thumnail.png"
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
                  />
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
