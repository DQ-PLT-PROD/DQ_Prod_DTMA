import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileProgressBarProps {
    progressPct: number;
    currentLesson: number;
    totalLessons: number;
    onPrev: () => void;
    onNext: () => void;
    canGoPrev: boolean;
    canGoNext: boolean;
}

export const MobileProgressBar: React.FC<MobileProgressBarProps> = ({
    progressPct,
    currentLesson,
    totalLessons,
    onPrev,
    onNext,
    canGoPrev,
    canGoNext,
}) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden safe-area-inset-bottom">
            {/* Progress bar */}
            <div className="h-1 bg-gray-200">
                <div
                    className="h-full bg-[#1839AD] transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                />
            </div>

            {/* Navigation controls */}
            <div className="flex items-center justify-between px-2 py-2">
                <button
                    onClick={onPrev}
                    disabled={!canGoPrev}
                    className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed min-w-[44px] min-h-[44px]"
                    aria-label="Previous lesson"
                >
                    <ChevronLeft size={20} />
                    <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex-1 text-center">
                    <div className="text-sm font-semibold text-[#1839AD]">
                        {progressPct}% complete
                    </div>
                    <div className="text-xs text-gray-500">
                        Lesson {currentLesson} of {totalLessons}
                    </div>
                </div>

                <button
                    onClick={onNext}
                    disabled={!canGoNext}
                    className={`flex items-center gap-1 px-4 py-3 text-sm font-medium rounded-lg transition min-w-[44px] min-h-[44px] ${canGoNext
                            ? 'bg-[#1839AD] text-white hover:bg-[#132b7c]'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    aria-label="Next lesson"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default MobileProgressBar;
