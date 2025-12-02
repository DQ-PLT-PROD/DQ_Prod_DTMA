import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ListVideo,
  Pause,
  Play,
  Volume2,
  VolumeX,
  BadgeCheck,
  Maximize2,
  User,
  Menu,
  // X,
  // Calendar,
  // Target,
  ClipboardCheck,
  Download,
  Info,
} from "lucide-react";
import CourseAssessment from "./CourseAssessment";

type Lesson = {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  description?: string;
};

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
  // Initialize lessons from localStorage if available, otherwise use initial data
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  // Reminder feature (temporarily disabled)
  // const [reminderSet, setReminderSet] = useState(false);
  // const [showReminderModal, setShowReminderModal] = useState(false);
  // const [selectedDeadline, setSelectedDeadline] = useState("");
  // const [showTooltip, setShowTooltip] = useState(false);
  
  // Course progress interactivity states
  const [isNextLessonUnlocked, setIsNextLessonUnlocked] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  
  // Save progress to localStorage whenever lessons change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('courseProgress', JSON.stringify(lessons));
    }
  }, [lessons]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = playbackRate;
    video.volume = volume;
    const track = video.textTracks?.[0];
    if (track) {
      track.mode = captionsEnabled ? "showing" : "disabled";
    }
  }, [playbackRate, volume, captionsEnabled, currentLessonIndex]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration || 0;
      
      setCurrentTime(currentTime);
      
      // Check if user is within 60 seconds of video completion
      // This enables the "Next Lesson" button when close to the end
      const timeRemaining = duration - currentTime;
      const isNearEnd = timeRemaining <= 60 && duration > 0;
      
      setIsNextLessonUnlocked(isNearEnd);
      
      // Mark current lesson as completed when reaching the unlock threshold
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
    
    const handleLoaded = () => {
      const duration = video.duration || 0;
      setDuration(duration);
      // Reset unlock state when new video loads
      setIsNextLessonUnlocked(false);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoaded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoaded);
    };
  }, [currentLessonIndex, lessons]);

  const formatTime = (value: number) => {
    if (!Number.isFinite(value)) return "00:00";
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    const nextVolume = Math.max(0, Math.min(1, value));
    video.volume = nextVolume;
    setVolume(nextVolume);
  };

  const handleSpeedChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = value;
    setPlaybackRate(value);
  };

  const handleToggleCaptions = () => setCaptionsEnabled((prev) => !prev);

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (!document.fullscreenElement) {
      // Request fullscreen on the video element directly
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if ((video as any).webkitRequestFullscreen) {
        (video as any).webkitRequestFullscreen();
      } else if ((video as any).msRequestFullscreen) {
        (video as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };



  const handlePrev = () => {
    setShowQuiz(false);
    setCurrentLessonIndex((prev) => Math.max(0, prev - 1));
    setCurrentTime(0);
  };

  const handleNext = () => {
    // Mark current lesson as completed when navigating to next
    // This provides a fallback completion method if video threshold wasn't reached
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
    setIsNextLessonUnlocked(false); // Reset for new lesson
  };

  const handleLessonSelect = (idx: number) => {
    setShowQuiz(false);
    setCurrentLessonIndex(idx);
    setCurrentTime(0);
    setIsNextLessonUnlocked(false); // Reset unlock state when switching lessons
  };

  const scrollToPlayer = () => {
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleShowQuiz = () => {
    setShowQuiz(true);
    setShowMobileActions(false);
    setTimeout(scrollToPlayer, 50);
  };

  const handleBackFromQuiz = () => {
    setShowQuiz(false);
    setTimeout(scrollToPlayer, 50);
  };

  useEffect(() => {
    if (showQuiz && videoRef.current) {
      videoRef.current.pause();
    }
  }, [showQuiz]);

  const atFirstLesson = currentLessonIndex === 0;
  const atLastLesson = currentLessonIndex === lessons.length - 1;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 shadow-sm">
        <div className="border-b border-black/5" style={{
          background: "linear-gradient(90deg, #1839AD 0%, #2E469E 20%, #4A5FC7 40%, #8FA4E3 60%, #C5D1F0 80%, #ffffff 100%)"
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-10 text-[#030C2B]">
            {/* Left: Logo */}
            <div className="flex items-center flex-shrink-0">
              <img
                src="/DTMA LOGO WHITE.svg"
                alt="DTMA"
                className="h-6 w-auto"
              />
            </div>

            {/* Course Title in Full Width Container */}
            <div className="flex-1">
              <div className="rounded-lg shadow-sm w-full flex items-center overflow-hidden" style={{ background: "linear-gradient(90deg, #1839AD 0%, #2E469E 20%, #4A5FC7 40%, #8FA4E3 60%, #C5D1F0 80%, #ffffff 100%)" }}>
                <div className="flex items-center pl-20 py-2 flex-1">
                  <BookOpen size={14} className="text-white mr-2" />
                  <h1 className="text-base font-normal text-white leading-tight">
                    Perfecting Life Transactions: A Digital Builder's Blueprint
                  </h1>
                </div>
                
                {/* Set Study Reminder Button (disabled for now) */}
                {/*
                <div className="relative">
                  <button
                    onClick={() => setShowReminderModal(true)}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="bg-[#1839AD] hover:bg-[#132b7c] text-white h-full px-6 py-4 flex items-center justify-center transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                  
                  {showTooltip && (
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap shadow-lg" style={{ zIndex: 9999 }}>
                      Set study reminders
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
                */}
              </div>
            </div>

            {/* Right: actions */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">

              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu((prev) => !prev)}
                    className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition shadow-sm"
                  >
                    <User size={20} />
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-44 bg-white text-[#030C2B] rounded-xl shadow-lg border border-gray-100 py-2 text-sm z-30">
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50">
                        Account Settings
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50">
                        View Profile
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50">
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setShowMobileActions((prev) => !prev)}
                className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Mobile actions tray */}
          {showMobileActions && (
            <div className="lg:hidden px-4 sm:px-6 lg:px-8 pb-3 space-y-3 text-[#030C2B]">
              <div className="bg-white text-[#030C2B] rounded-2xl p-3 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold">Course Progress</p>
                  <span className="text-sm font-bold">{boundedProgress}%</span>
                  <Info size={14} className="text-[#1839AD]" />
                </div>
                <div className="h-3 rounded-full bg-[#e5eef5] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1839AD] transition-all duration-300"
                    style={{ width: `${boundedProgress}%` }}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={boundedProgress}
                    role="progressbar"
                    aria-label="Course progress"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="h-10 px-3 rounded-full bg-white text-[#1839AD] flex items-center gap-2 shadow-sm"
                >
                  <User size={16} />
                  <ChevronDown size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={atFirstLesson}
                  className="flex-1 px-4 py-2 rounded-full border border-transparent bg-transparent text-[#1839AD] font-semibold hover:bg-[#1839AD]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                  >
                    <ArrowLeft size={16} />
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={atLastLesson || !isNextLessonUnlocked}
                    className={`flex-1 px-4 py-2 rounded-full border border-transparent font-semibold flex items-center justify-center gap-2 transition ${
                      atLastLesson || !isNextLessonUnlocked
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                        : "bg-transparent text-[#1839AD] hover:bg-[#1839AD]/10 cursor-pointer"
                    }`}
                    title={!isNextLessonUnlocked && !atLastLesson ? "Watch until 1 minute before the end to unlock next lesson" : ""}
                  >
                    Next
                    <ArrowRight size={16} />
                  </button>
              </div>
              {showProfileMenu && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2 text-sm">
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50">
                    Account Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50">
                    View Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#030C2B] font-semibold">
              <ListVideo size={18} />
              Course Outline
            </div>
            <button
              onClick={() => setModuleOpen((prev) => !prev)}
              className="text-sm text-[#1839AD] font-semibold flex items-center gap-1"
            >
              {moduleOpen ? (
                <>
                  Hide <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Show <ChevronDown size={14} />
                </>
              )}
            </button>
          </div>

          <div
            className={`transition-all duration-300 ${
              moduleOpen ? "max-h-[calc(100vh-320px)]" : "max-h-0"
            } overflow-y-auto`}
          >
            <div className="p-3 space-y-2">
              {lessons.map((lesson, idx) => {
                const isActive = idx === currentLessonIndex;
                const isCompleted = lesson.completed;
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonSelect(idx)}
                    className={`w-full text-left rounded-xl px-3 py-3 border transition flex items-start gap-3 relative ${
                      isActive
                        ? "border-[#1839AD] bg-[#1839AD]/5 shadow-sm"
                        : isCompleted
                        ? "border-green-200 bg-green-50 hover:bg-green-100"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-[#1839AD] text-white"
                          : "bg-gray-200 text-[#030C2B]"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={12} /> : idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-semibold ${
                            isActive 
                              ? "text-[#1839AD]" 
                              : isCompleted
                              ? "text-green-700"
                              : "text-[#030C2B]"
                          }`}
                        >
                          {lesson.title}
                        </p>
                        {isCompleted && (
                          <span className="text-[10px] text-green-600 font-semibold uppercase bg-green-100 px-1.5 py-0.5 rounded">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${isCompleted ? "text-green-600" : "text-gray-500"}`}>
                        {lesson.duration}
                      </p>
                      {lesson.description && (
                        <p className={`text-xs mt-1 ${isCompleted ? "text-green-600" : "text-gray-500"}`}>
                          {lesson.description}
                        </p>
                      )}
                      
                      {/* Progress bar for current lesson */}
                      {isActive && !isCompleted && duration > 0 && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-[#1839AD] h-1 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((currentTime / duration) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {Math.round((currentTime / duration) * 100)}% watched
                            {isNextLessonUnlocked && " • Next lesson unlocked!"}
                          </p>
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <span className="text-[10px] text-[#2E469E] font-semibold uppercase bg-blue-100 px-1.5 py-0.5 rounded">
                        Now Playing
                      </span>
                    )}
                  </button>
                );
              })}
              
              {/* Course Assessment */}
              <button
                onClick={handleShowQuiz}
                disabled={false}
                aria-pressed={showQuiz}
                className={`w-full text-left rounded-xl px-3 py-3 border cursor-pointer transition flex items-start gap-3 ${
                  showQuiz
                    ? "border-[#1839AD] bg-[#1839AD]/15 shadow-sm"
                    : "border-[#1839AD] bg-[#1839AD]/5 hover:bg-[#1839AD]/10"
                }`}
              >
                <div className="mt-1 h-5 w-5 rounded-full flex items-center justify-center bg-[#1839AD]">
                  <ClipboardCheck size={12} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#1839AD]">
                      Course Assessment
                    </p>
                    <span className="text-[10px] text-[#1839AD] font-semibold uppercase bg-[#1839AD]/10 px-1.5 py-0.5 rounded">
                      Available
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Take the final quiz
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="bg-white text-[#030C2B] rounded-2xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold">Course Progress</span>
                <span className="text-sm font-bold">{boundedProgress}%</span>
                <Info size={14} className="text-[#1839AD]" />
              </div>
              <div className="h-3 rounded-full bg-[#e5eef5] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1839AD] transition-all duration-300"
                  style={{ width: `${boundedProgress}%` }}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={boundedProgress}
                  role="progressbar"
                  aria-label="Course progress"
                />
              </div>
              <p className="text-[11px] text-gray-700 mt-2">
                {completedCount} of {lessons.length} lessons covered
              </p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="space-y-4">
          {/* Lesson Title */}
          {!showQuiz && (
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg md:text-xl font-medium text-[#030C2B] leading-tight">
                  {activeLesson.title}
                </h2>
              </div>
            </div>
          )}

          <div
            ref={playerRef}
            className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden"
          >
            {showQuiz ? (
              <div className="p-4 md:p-6">
                <CourseAssessment 
                  variant="inline"
                  allLessonsCompleted={allLessonsCompleted}
                  onBack={handleBackFromQuiz}
                />
              </div>
            ) : (
              <>
                <div className="bg-[#0E1940]">
                  <video
                    ref={videoRef}
                    className="w-full h-[320px] md:h-[360px] bg-black"
                    src="/videos/C2-INTRO.mp4"
                    poster="/Economy%204.0%20thumnail.png"
                    controls={false}
                  >
                    <track
                      default
                      kind="subtitles"
                      src="https://www.w3schools.com/tags/movie.vtt"
                      srcLang="en"
                      label="English"
                    />
                  </video>
                </div>

                <div className="bg-gray-900 p-3">
                  <div className="flex items-center gap-4">
                    {/* Play/Pause Button - Far Left */}
                    <button
                      onClick={handlePlayPause}
                      className="h-10 w-10 rounded bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    {/* Current Time */}
                    <div className="text-white text-sm font-medium min-w-[45px]">
                      {formatTime(currentTime)}
                    </div>

                    {/* Progress Bar - Center */}
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step="0.1"
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#1839AD]"
                      style={{
                        background: `linear-gradient(to right, #1839AD 0%, #1839AD ${(currentTime / (duration || 1)) * 100}%, #374151 ${(currentTime / (duration || 1)) * 100}%, #374151 100%)`
                      }}
                    />

                    {/* Total Duration */}
                    <div className="text-white text-sm font-medium min-w-[45px]">
                      {formatTime(duration)}
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVolume(volume === 0 ? 0.6 : 0)}
                        className="text-white hover:text-gray-300 transition"
                      >
                        {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={(e) => handleVolume(Number(e.target.value))}
                        className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#1839AD]"
                      />
                    </div>

                    {/* Speed Control */}
                    <div className="relative">
                      <select
                        value={playbackRate}
                        onChange={(e) => handleSpeedChange(Number(e.target.value))}
                        className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#1839AD] appearance-none cursor-pointer"
                      >
                        {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <option key={rate} value={rate} className="bg-gray-800">
                            {rate}x
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Captions Toggle */}
                    <button
                      onClick={handleToggleCaptions}
                      className={`px-3 py-1 rounded text-sm font-medium transition ${
                        captionsEnabled
                          ? "bg-[#1839AD] text-white"
                          : "bg-gray-800 text-white border border-gray-600"
                      }`}
                    >
                      CC
                    </button>

                    {/* Fullscreen Button - Far Right */}
                    <button
                      onClick={handleFullscreen}
                      className="text-white hover:text-gray-300 transition"
                    >
                      <Maximize2 size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {!showQuiz && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={atFirstLesson}
                className="px-4 py-2 rounded-full border border-gray-200 text-[#030C2B] font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={atLastLesson || !isNextLessonUnlocked}
                className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 transition ${
                  atLastLesson || !isNextLessonUnlocked
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                    : "bg-[#1839AD] text-white hover:bg-[#132b7c] cursor-pointer"
                }`}
                title={!isNextLessonUnlocked && !atLastLesson ? "Watch until 1 minute before the end to unlock next lesson" : ""}
              >
                Next Lesson
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {!showQuiz && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#030C2B] font-semibold mb-2">
                <BadgeCheck size={18} className="text-[#1839AD]" />
                Resources & Downloads
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Access supporting materials to keep learning on the move.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/25.01_DQ DTMB_WP_Perfect Life Transactions_v0.0.1 (1).pdf"
                  download="Perfect Life Transactions.pdf"
                  className="px-4 py-2 rounded-xl border border-[#1839AD]/20 bg-[#1839AD]/5 text-[#1839AD] font-semibold text-sm hover:bg-[#1839AD]/10 transition flex items-center gap-2"
                >
                  <Download size={16} />
                  Perfect Life Transactions
                </a>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Study Reminder Modal (disabled for now) */}
      {/*
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-[#030C2B]">
                When do you want to finish this course by?
              </h2>
              <button
                onClick={() => setShowReminderModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-64 h-48 bg-gradient-to-br from-[#1839AD] to-[#2E469E] rounded-2xl flex items-center justify-center relative overflow-hidden">
                      <div className="absolute top-4 right-4">
                        <Target className="text-white w-8 h-8" />
                      </div>
                      <div className="text-center text-white">
                        <Calendar className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm font-medium">Set Your Goal</p>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-8 opacity-80" style={{ background: "linear-gradient(to right, #030C2B, #1839AD)" }}></div>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#030C2B] mb-4">
                    Set a personal deadline for this course
                  </h3>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {["3 Days", "7 Days", "10 Days"].map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedDeadline(option)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedDeadline === option
                            ? "border-[#1839AD] bg-[#1839AD]/10 text-[#1839AD]"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        <div className="font-medium">{option}</div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (selectedDeadline) {
                        setReminderSet(true);
                        setShowReminderModal(false);
                      }
                    }}
                    disabled={!selectedDeadline}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors mb-4 ${
                      selectedDeadline
                        ? "bg-[#1839AD] hover:bg-[#132b7c] text-white"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Set Goal
                  </button>

                  <div className="flex items-center my-4">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-3 text-sm text-gray-500">OR</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>

                  <button
                    onClick={() => {
                      setShowReminderModal(false);
                    }}
                    className="w-full py-3 px-4 border-2 border-[#1839AD] text-[#1839AD] rounded-lg font-semibold hover:bg-[#1839AD]/10 transition-colors"
                  >
                    Set A Custom Date
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      */}
    </div>
  );
};

export default LearningScreen;
