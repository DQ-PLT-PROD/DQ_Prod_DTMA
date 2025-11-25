import React from 'react';
import { CourseType } from '../utils/mockData';
import { BookmarkIcon, ScaleIcon, Clock, BookOpen } from 'lucide-react';
interface CourseCardProps {
  course: CourseType;
  onClick: () => void;
  onQuickView: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onAddToComparison: () => void;
}
export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onQuickView,
  isBookmarked,
  onToggleBookmark,
  onAddToComparison
}) => {
  const imageSrc =
    (course as any).imageUrl ||
    (course as any).thumbnailUrl ||
    course.provider?.logoUrl ||
    "/image.png";
  const categoryLabel = course.category || "Economy 4.0";
  const levelLabel =
    (course as any).level ||
    course.durationType ||
    course.businessStage ||
    "Intermediate";
  const topBadge =
    (course.tags && course.tags[0]) ||
    (course as any).audience ||
    "Digital Leaders";
  const lessonCount =
    (course as any).lessons ||
    (course.learningOutcomes ? course.learningOutcomes.length : null);

  return (
    <div
      className="group flex flex-col min-h-[420px] bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
      onClick={onQuickView}
    >
      <div className="relative h-40 bg-gray-100">
        <img
          src={imageSrc}
          alt={course.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/0"></div>
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white text-[#2E469E] text-xs font-semibold shadow-sm">
            {topBadge}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
            className={`h-9 w-9 flex items-center justify-center rounded-full shadow bg-white hover:bg-gray-100 ${
              isBookmarked ? "text-[#2E469E]" : "text-gray-500"
            }`}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <BookmarkIcon size={16} className={isBookmarked ? "fill-[#2E469E]" : ""} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToComparison();
            }}
            className="h-9 w-9 flex items-center justify-center rounded-full shadow bg-white text-gray-600 hover:bg-gray-100"
            aria-label="Add to comparison"
          >
            <ScaleIcon size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col flex-1">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-2">
          <span className="text-[#2E469E]">{categoryLabel.toUpperCase()}</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700">
            {levelLabel}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2">
          {course.title}
        </h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {course.description}
        </p>
        <div className="mt-auto pt-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1">
              <Clock size={16} />
              {course.duration || "58 mins"}
            </span>
            {lessonCount !== null && lessonCount !== undefined && (
              <span className="inline-flex items-center gap-1">
                <BookOpen size={16} />
                {lessonCount} Lessons
              </span>
            )}
            {course.provider?.logoUrl && (
              <span className="ml-auto">
                <img
                  src={course.provider.logoUrl}
                  alt={course.provider.name}
                  className="h-5 object-contain"
                />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
