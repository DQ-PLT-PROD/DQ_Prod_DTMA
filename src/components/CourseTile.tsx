import React, { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Tag } from "./ui/Tag";
import { CourseMeta } from "./ui/CourseMeta";
import { getCoursePoster } from "../utils/courseMedia";

export interface CourseTileProps {
  // Course data - can be passed individually or as an item object
  item?: {
    id: string;
    title: string;
    description: string;
    category?: string;
    levelTag?: string;
    audienceLevel?: string;
    topicTags?: string[];
    duration?: string;
    lessonCount?: number;
    introVideoUrl?: string;
    heroImageUrl?: string;
    thumbnailUrl?: string;
    isComingSoon?: boolean;
    [key: string]: any;
  };
  // Individual props (used when not passing item object)
  title?: string;
  description?: string;
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
  // Variant styling
  variant?: "course" | "classic" | "coming-soon";
  // Click handler
  onCardClick?: (e: React.MouseEvent) => void;
  // Enable hover effects (scale, shadow, video preview) - set to true for catalog grid
  enableHoverEffects?: boolean;
  // For managing hover state externally if needed
  isHovered?: boolean;
}

export const CourseTile: React.FC<CourseTileProps> = ({
  item,
  title: propTitle,
  description: propDescription,
  thumbnailUrl: propThumbnailUrl,
  videoUrl: propVideoUrl,
  category: propCategory,
  levelTag: propLevelTag,
  audienceLevel: propAudienceLevel,
  duration: propDuration,
  lessonCount: propLessonCount,
  variant: propVariant,
  onCardClick,
  enableHoverEffects = false,
  isHovered: externalIsHovered,
}) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [internalIsHovered, setInternalIsHovered] = useState(false);

  // Resolve props from item or individual props
  const title = propTitle || item?.title || "";
  const description = propDescription || item?.description || "";
  const category = propCategory || item?.category;
  const levelTag = propLevelTag || item?.levelTag;
  const audienceLevel = propAudienceLevel || item?.audienceLevel;
  const duration = propDuration || item?.duration;
  const lessonCount = propLessonCount || item?.lessonCount;
  const videoUrl = propVideoUrl || item?.introVideoUrl;

  // Determine variant
  const variant = propVariant || (item?.isComingSoon ? "coming-soon" : "course");

  // Get thumbnail URL
  const thumbnailUrl = useMemo(() => {
    if (propThumbnailUrl) return propThumbnailUrl;
    if (item) return getCoursePoster(item);
    return "/images/placeholders/course-fallback.png";
  }, [propThumbnailUrl, item]);

  // Use external hover state if provided, otherwise internal
  const isHovered = externalIsHovered !== undefined ? externalIsHovered : internalIsHovered;

  // Prioritize local placeholder for coming soon
  const heroSrc = variant === "coming-soon"
    ? "/images/placeholders/coming-soon-placeholder.png"
    : (thumbnailUrl || "/images/placeholders/course-fallback.png");

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  // Handle hover effects
  const handleMouseEnter = () => {
    if (!enableHoverEffects) return;
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    // Delay hover effect to prevent accidental triggers
    hoverTimerRef.current = setTimeout(() => {
      setInternalIsHovered(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (!enableHoverEffects) return;
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setInternalIsHovered(false);
  };

  // Video play/pause on hover
  useEffect(() => {
    if (isHovered && videoRef.current && videoUrl && variant !== "coming-soon") {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented
        });
      }
    } else if (!isHovered && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovered, videoUrl, variant]);

  // Handle card click
  const handleClick = (e: React.MouseEvent) => {
    if (variant === "coming-soon") return;
    if (onCardClick) {
      onCardClick(e);
    } else if (item?.id) {
      navigate(`/courses/${item.id}`);
    }
  };

  // Coming Soon Card
  if (variant === "coming-soon") {
    return (
      <div className="group relative flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-default">
        {/* Image Section - Muted */}
        <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
          <div className="absolute inset-0 z-10 bg-white/10 mix-blend-overlay" />
          {heroSrc && (
            <img
              src={heroSrc}
              alt={`${title} thumbnail`}
              className="h-full w-full object-cover grayscale opacity-75"
            />
          )}

          {/* Coming Soon Badge */}
          <div className="absolute top-3 right-3 z-20">
            <span className="px-3 py-1.5 bg-amber-50/90 backdrop-blur-sm text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-200 shadow-sm flex items-center gap-1.5">
              <Lock size={12} /> Coming Soon
            </span>
          </div>
        </div>

        {/* Content Section - Muted */}
        <div className="p-5 flex flex-col flex-1 opacity-60">
          <div className="flex items-center justify-between mb-2">
            {category && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                {category}
              </span>
            )}
            {levelTag && (
              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {levelTag}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-700 leading-tight line-clamp-2 mb-2">
            {title}
          </h3>

          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
            {description}
          </p>

          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
              <span>{lessonCount ? `${lessonCount} Lessons` : 'Coming Soon'}</span>
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="p-4 bg-white rounded-full shadow-lg mb-3">
            <Lock className="w-6 h-6 text-amber-500" />
          </div>
          <span className="text-lg font-bold text-slate-800">Coming Soon</span>
          <p className="text-sm text-slate-500 mt-1">Stay tuned for updates</p>
        </div>
      </div>
    );
  }

  // Classic Card (Financial/Non-Financial Services)
  if (variant === "classic") {
    return (
      <div
        className="group relative flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full cursor-pointer"
        onClick={handleClick}
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
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {description}
          </p>

          <div className="mt-auto pt-2 flex items-center justify-between">
            <div className="flex gap-2">
              {/* Placeholder for extra meta if needed */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Course Card (Modern / Airbnb-like) - with optional hover effects
  const cardContent = (
    <div
      className={`
        group relative flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer
        ${isHovered ? 'shadow-xl' : ''}
      `}
      onClick={handleClick}
    >
      {/* Thumbnail Section */}
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
        {heroSrc && (
          <img
            src={heroSrc}
            alt={`${title} thumbnail`}
            className={`h-full w-full object-cover transition-opacity duration-300 ${isHovered && videoUrl ? 'opacity-0' : 'opacity-100'}`}
            style={{ contain: 'layout' }}
          />
        )}

        {/* Video Player on Hover */}
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            muted
            loop
            playsInline
            preload="none"
          />
        )}

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 items-start z-10">
          {audienceLevel && (
            <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm border border-purple-100">
              {audienceLevel}
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
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

        <p className={`text-sm text-gray-600 leading-relaxed mb-4 ${isHovered ? '' : 'line-clamp-2'}`}>
          {description}
        </p>

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
          <CourseMeta duration={duration} lessonCount={lessonCount} />
        </div>
      </div>
    </div>
  );

  // If hover effects are enabled, wrap with hover container
  if (enableHoverEffects) {
    return (
      <div
        ref={cardRef}
        className="h-full relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ zIndex: isHovered ? 50 : 1 }}
      >
        <div
          className={`
            transition-all duration-300 ease-out
            ${isHovered ? 'absolute top-0 left-0 w-full z-50 transform scale-105 shadow-2xl' : 'h-full'}
          `}
        >
          {cardContent}
        </div>
        {/* Placeholder to maintain layout space when card is absolute/scaled */}
        {isHovered && <div className="h-full w-full invisible" />}
      </div>
    );
  }

  return cardContent;
};
