import React from "react";
import { StarIcon, ScaleIcon } from "lucide-react";
import { Tag } from "./ui/Tag";
import { CourseMeta } from "./ui/CourseMeta";

export interface CourseTileProps {
  title: string;
  description: string;
  providerName: string;
  providerLogoUrl: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  category?: string;
  levelTag?: string;
  audienceLevel?: string;
  topicTags?: string[];
  duration?: string;
  lessonCount?: number;
  rating?: number;
  reviewCount?: number;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  onPrimaryClick?: (e: React.MouseEvent) => void;
  onSecondaryClick?: (e: React.MouseEvent) => void;
  showActions?: boolean;
  variant?: "course" | "classic";
  onAddToComparison?: () => void;
  onCardClick?: (e: React.MouseEvent) => void;
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
  isHovered?: boolean;
  isDisabled?: boolean;
}

export const CourseTile: React.FC<CourseTileProps> = ({
  title,
  description,
  providerName,
  providerLogoUrl,
  thumbnailUrl,
  videoUrl,
  category,
  levelTag,
  audienceLevel,
  duration,
  lessonCount,
  rating,
  reviewCount,
  variant = "course",
  onAddToComparison,
  onCardClick,
  onToggleBookmark,
  isBookmarked,
  isHovered = false,
  isDisabled = false,
}) => {
  const heroSrc = thumbnailUrl || "/images/placeholders/course-fallback.png";
  const displayRating = rating ?? 4.6;
  const displayReviews = reviewCount ?? 24;
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (isDisabled) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      return;
    }
    if (isHovered && videoRef.current && videoUrl) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else if (!isHovered && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovered, videoUrl, isDisabled]);

  if (variant === "classic") {
    return (
      <div
        className="group relative flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full"
        onClick={onCardClick}
      >
        <div className="p-5 flex flex-col gap-4 flex-1">
          <div className="flex flex-col gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-1">
                {category ? <Tag variant="category">{category}</Tag> : null}
                {levelTag ? <Tag variant="level">{levelTag}</Tag> : null}
              </div>
              <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 text-base">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {rating && (
                  <>
                    <StarIcon size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{displayRating.toFixed(1)}</span>
                    <span className="text-gray-400">({displayReviews})</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {description}
          </p>

          <div className="mt-auto pt-2 flex items-center justify-between">
            <div className="flex gap-2" />
            <div className="flex items-center gap-2">
              {onToggleBookmark && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark();
                  }}
                  className={`p-2 rounded-full transition-colors ${
                    isBookmarked
                      ? "bg-yellow-50 text-yellow-600"
                      : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  }`}
                  aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                >
                  <StarIcon size={16} className={isBookmarked ? "fill-yellow-500" : ""} />
                </button>
              )}
              {onAddToComparison && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToComparison();
                  }}
                  className="p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label="Add to comparison"
                >
                  <ScaleIcon size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const shouldHideImage = isDisabled ? isHovered : isHovered && !!videoUrl;
  const shouldShowVideo = !isDisabled && isHovered && !!videoUrl;

  return (
    <div
      className={`
        group relative flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
        ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
        ${isHovered ? "shadow-xl" : ""}
      `}
      onClick={onCardClick}
    >
      <div
        className={`relative w-full bg-gray-100 overflow-hidden transition-all duration-300 rounded-2xl ${
          isHovered ? "aspect-video" : "aspect-video"
        }`}
      >
        <img
          src={heroSrc}
          alt={`${title} thumbnail`}
          className={`h-full w-full object-cover transition-opacity duration-300 rounded-2xl ${
            shouldHideImage ? "opacity-0" : "opacity-100"
          }`}
          style={{ contain: "layout" }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.includes("course-fallback.png")) return;
            target.src = "/images/placeholders/course-fallback.png";
          }}
        />

        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 rounded-2xl ${
              shouldShowVideo ? "opacity-100" : "opacity-0"
            }`}
            muted
            loop
            playsInline
            preload="none"
          />
        )}

        {isDisabled && isHovered && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-20 rounded-2xl">
            <span className="text-sm font-semibold text-gray-900">Coming Soon!</span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2 items-start z-10">
          {audienceLevel && (
            <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm border border-purple-100">
              {audienceLevel}
            </span>
          )}
        </div>

        <div
          className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-200 z-10 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {onToggleBookmark && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark();
              }}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-gray-500 hover:text-yellow-500 transition-colors"
            >
              <StarIcon size={16} className={isBookmarked ? "fill-yellow-500 text-yellow-500" : ""} />
            </button>
          )}
          {onAddToComparison && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToComparison();
              }}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ScaleIcon size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          {category && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              {category}
            </span>
          )}
          {levelTag && (
            <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {levelTag}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
          {title}
        </h3>

        <p className={`text-sm text-gray-600 leading-relaxed mb-4 ${isHovered ? "" : "line-clamp-2"}`}>
          {description}
        </p>

        {isHovered && (
          <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-wrap gap-2 mb-3" />
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
          <CourseMeta duration={duration} lessonCount={lessonCount} />
        </div>
      </div>
    </div>
  );
};
