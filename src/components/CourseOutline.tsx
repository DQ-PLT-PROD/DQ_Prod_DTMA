import React from "react";
import {
    ListVideo,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    ClipboardCheck,
    Download,
    FileText,
} from "lucide-react";
import { Lesson } from "../types/course";

interface CourseOutlineProps {
    lessons: Lesson[];
    currentLessonIndex: number;
    onLessonSelect: (index: number) => void;
    onShowQuiz: () => void;
    moduleOpen: boolean;
    setModuleOpen: (open: boolean) => void;
    currentTime: number;
    duration: number;
    isNextLessonUnlocked: boolean;
    showQuiz: boolean;
    completedCount: number;
    progressPct: number;
    isUserEnrolled?: boolean; // Add enrollment status
}

export const CourseOutline: React.FC<CourseOutlineProps> = ({
    lessons,
    currentLessonIndex,
    onLessonSelect,
    onShowQuiz,
    moduleOpen,
    setModuleOpen,
    currentTime,
    duration,
    isNextLessonUnlocked,
    showQuiz,
    completedCount,
    progressPct,
    isUserEnrolled = false, // Default to false
}) => {
    const firstLessonTitle = (lessons[0]?.title || "").toLowerCase();
    const hasIntroLesson =
        lessons[0]?.type === "intro" ||
        firstLessonTitle.includes("introduction");
    const shouldOffsetNumbering = hasIntroLesson || lessons.length >= 11;

    return (
        <aside className="bg-white border border-gray-200 rounded-none overflow-hidden flex flex-col h-full sticky top-4">
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-none">
                <div className="flex items-center gap-2 text-[#030C2B] font-semibold">
                    <ListVideo size={18} />
                    Course Outline
                </div>
                <button
                    onClick={() => setModuleOpen(!moduleOpen)}
                    className="text-sm text-[#1839AD] font-semibold flex items-center gap-1"
                >
                    {moduleOpen ? (
                        <>
                            Hide <ChevronLeft size={14} />
                        </>
                    ) : (
                        <>
                            Show <ChevronRight size={14} />
                        </>
                    )}
                </button>
            </div>

            <div
                className={`transition-all duration-300 ${moduleOpen ? "max-h-[calc(100vh-200px)]" : "max-h-0"
                    } overflow-y-auto flex flex-col`}
            >
                <div className="space-y-2 p-3 flex-1">
                    {lessons.map((lesson, idx) => {
                        const isActive = idx === currentLessonIndex && !showQuiz;
                        const isCompleted = lesson.completed;
                        const isLocked = !isCompleted && idx > currentLessonIndex && !lessons[idx - 1]?.completed;
                        const isIntroLesson = shouldOffsetNumbering && idx === 0;
                        const isConclusionLesson =
                            lesson.type === "outro" ||
                            /conclusion/i.test(lesson.title || "") ||
                            (lessons.length >= 11 && idx === lessons.length - 1);

                        const displayNumber =
                            !isIntroLesson && !isConclusionLesson
                                ? (shouldOffsetNumbering ? idx : idx + 1)
                                : null;

                        const badgeContent = isCompleted
                            ? <CheckCircle2 size={12} />
                            : (displayNumber ?? "");

                        // Access control logic:
                        // 1. Preview lessons are always accessible
                        // 2. For enrolled users: sequential access (completed, current, or next if previous completed)
                        // 3. For non-enrolled users: only preview lessons
                        const isPreviewLesson = lesson.isPreview || false;
                        const sequentialAccess = isCompleted || idx <= currentLessonIndex || (idx > 0 && lessons[idx - 1].completed);
                        const canAccess = isPreviewLesson || (isUserEnrolled && sequentialAccess);

                        return (
                            <button
                                key={lesson.id}
                                onClick={() => canAccess && onLessonSelect(idx)}
                                disabled={!canAccess}
                                className={`w-full text-left rounded-xl px-3 py-3 border transition flex items-start gap-3 relative ${isActive
                                    ? "border-[#1839AD] bg-[#1839AD]/5 shadow-sm"
                                    : isCompleted
                                        ? "border-green-200 bg-green-50 hover:bg-green-100"
                                        : !canAccess
                                            ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                                            : "border-gray-200 bg-white hover:bg-gray-50"
                                    }`}
                            >
                                {/* Preview Badge */}
                                {isPreviewLesson && (
                                    <div className="absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                                        Preview
                                    </div>
                                )}
                                
                                <div
                                    className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCompleted
                                        ? "bg-green-500 text-white"
                                        : isActive
                                            ? "bg-[#1839AD] text-white"
                                            : "bg-gray-200 text-[#030C2B]"
                                        }`}
                                >
                                    {badgeContent}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p
                                            className={`text-sm font-semibold truncate ${isActive
                                                ? "text-[#1839AD]"
                                                : isCompleted
                                                    ? "text-green-700"
                                                    : "text-[#030C2B]"
                                                }`}
                                        >
                                            {lesson.title}
                                        </p>
                                        {isIntroLesson && (
                                            <span className="text-[10px] text-gray-600 font-semibold uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                                                Course Introduction
                                            </span>
                                        )}
                                        {isConclusionLesson && (
                                            <span className="text-[10px] text-[#2E469E] font-semibold uppercase bg-blue-100 px-1.5 py-0.5 rounded">
                                                Course Conclusion
                                            </span>
                                        )}
                                        {isCompleted && (
                                            <span className="text-[10px] text-green-600 font-semibold uppercase bg-green-100 px-1.5 py-0.5 rounded">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                    <p
                                        className={`text-xs mt-1 ${isCompleted ? "text-green-600" : "text-gray-500"
                                            }`}
                                    >
                                        {lesson.duration}
                                    </p>

                                    {/* Progress bar for current lesson */}
                                    {isActive && !isCompleted && duration > 0 && (
                                        <div className="mt-2">
                                            <div className="w-full bg-gray-200 rounded-full h-1">
                                                <div
                                                    className="bg-[#1839AD] h-1 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${Math.min(
                                                            (currentTime / duration) * 100,
                                                            100
                                                        )}%`,
                                                    }}
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
                                    <span className="text-[10px] text-[#2E469E] font-semibold uppercase bg-blue-100 px-1.5 py-0.5 rounded shrink-0">
                                        Now Playing
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Assessment & Resources Section */}
                <div className="p-3 space-y-3 border-t border-gray-100 bg-gray-50/50">
                    {/* Course Assessment */}
                    <button
                        onClick={onShowQuiz}
                        className={`w-full text-left rounded-xl px-3 py-3 border cursor-pointer transition flex items-start gap-3 ${showQuiz
                            ? "border-[#1839AD] bg-[#1839AD]/15 shadow-sm"
                            : "border-[#1839AD] bg-white hover:bg-[#1839AD]/5"
                            }`}
                    >
                        <div className="mt-1 h-5 w-5 rounded-full flex items-center justify-center bg-[#1839AD] shrink-0">
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

                    {/* Downloadable Resources */}
                    <div className="rounded-xl px-3 py-3 border border-gray-200 bg-white">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText size={16} className="text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700">Resources</span>
                        </div>
                        <a
                            href="https://ugmybskacomcdgdngolz.supabase.co/storage/v1/object/public/course-content/plt-course-01/resources/25.01_DQ%20DTMB_WP_Perfect_Life_Transactions_The_Cornerstone_of_Economy_4.0.pdf"
                            download="25.01_DQ DTMB_WP_Perfect_Life_Transactions_The_Cornerstone_of_Economy_4.0.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-[#1839AD] hover:underline p-2 rounded hover:bg-blue-50 transition"
                        >
                            <Download size={14} />
                            Perfect Life Transactions.pdf
                        </a>
                    </div>
                </div>
            </div>
        </aside>
    );
};
