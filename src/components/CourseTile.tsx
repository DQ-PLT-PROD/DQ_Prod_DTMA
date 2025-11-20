import React, { useMemo } from "react";
import { StarIcon, ScaleIcon } from "lucide-react";
import { Tag, TagVariant } from "./ui/Tag";
import { CourseMeta } from "./ui/CourseMeta";

export interface CourseTileProps {
  title: string;
  description: string;
  providerName: string;
  providerLogoUrl: string;
  thumbnailUrl?: string;
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
  onCardClick?: () => void;
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
}

export const CourseTile: React.FC<CourseTileProps> = ({
  title,
  description,
  providerName,
  providerLogoUrl,
  thumbnailUrl,
  category,
  levelTag,
  audienceLevel,
  topicTags = [],
  duration,
  lessonCount,
  rating,
  reviewCount,
  primaryCtaLabel = "Enroll Now",
  secondaryCtaLabel = "View Details",
  onPrimaryClick = () => {},
  onSecondaryClick = () => {},
  showActions = true,
  variant = "course",
  onAddToComparison,
  onCardClick,
  onToggleBookmark,
  isBookmarked,
}) => {
  const levelDisplay = useMemo(() => {
    if (audienceLevel && levelTag) {
      return `${audienceLevel}, ${levelTag}`;
    }
    return audienceLevel || levelTag || "";
  }, [audienceLevel, levelTag]);

  const primaryTopic = useMemo(() => {
    if (!Array.isArray(topicTags)) return "";
    const firstNonEmpty = topicTags.find((tag) => tag && tag.trim().length > 0);
    return firstNonEmpty || "";
  }, [topicTags]);

  const tags = useMemo<{ label: string; variant: TagVariant }[]>(() => {
    const collected: { label: string; variant: TagVariant }[] = [];
    if (category) collected.push({ label: category, variant: "category" });
    if (levelDisplay)
      collected.push({ label: levelDisplay, variant: "level" });
    if (primaryTopic) collected.push({ label: primaryTopic, variant: "topic" });
    return collected.slice(0, 3);
  }, [category, levelDisplay, primaryTopic]);

  const heroSrc = thumbnailUrl || providerLogoUrl || "/mzn_logo.png";
  const displayRating = rating ?? 4.6;
  const displayReviews = reviewCount ?? 24;

  if (variant === "classic") {
    return (
      <div
        className="group relative flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-[2px] transition-all duration-200"
        onClick={onCardClick}
      >
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-lg border border-gray-100 bg-gradient-to-b from-slate-50 to-white overflow-hidden flex items-center justify-center shadow-inner">
              <img
                src={providerLogoUrl}
                alt={`${providerName} logo`}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-2">
                {category ? <Tag variant="category">{category}</Tag> : null}
                {levelTag ? <Tag variant="level">{levelTag}</Tag> : null}
                {audienceLevel ? (
                  <Tag variant="audience">{audienceLevel}</Tag>
                ) : null}
              </div>
              <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="font-medium text-gray-700">{providerName}</span>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          displayRating >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{displayRating.toFixed(1)}</span>
                  <span className="text-gray-400">({displayReviews})</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
            {description}
          </p>

          {topicTags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {topicTags.slice(0, 4).map((tag, index) => (
                <Tag key={`${tag}-${index}`} variant="topic">
                  {tag}
                </Tag>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <CourseMeta duration={duration} lessonCount={lessonCount} />
            <div className="flex items-center gap-2">
              {onToggleBookmark ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark();
                  }}
                  className={`p-2 rounded-full ${
                    isBookmarked
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                  aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                >
                  <StarIcon
                    size={16}
                    className={isBookmarked ? "fill-yellow-500" : ""}
                  />
                </button>
              ) : null}
              {onAddToComparison ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToComparison();
                  }}
                  className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                  aria-label="Add to comparison"
                >
                  <ScaleIcon size={16} />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {showActions ? (
          <div className="border-t border-gray-100 bg-gray-50 p-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSecondaryClick(e);
              }}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap flex-1"
            >
              {secondaryCtaLabel}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrimaryClick(e);
              }}
              className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-colors whitespace-nowrap flex-1"
            >
              {primaryCtaLabel}
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-[2px] transition-all duration-200"
      onClick={onCardClick}
    >
      <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
        <img
          src={heroSrc}
          alt={`${title || providerName} thumbnail`}
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = providerLogoUrl || "/mzn_logo.png";
          }}
        />
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(({ label, variant }, index) => (
              <Tag
                key={`${variant}-${index}-${label}`}
                variant={variant}
                className="text-[11px] px-2 py-0.5 leading-tight"
              >
                {label}
              </Tag>
            ))}
          </div>
        ) : null}

        <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2">
          {title}
        </h3>

        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 flex-1">
          {description}
        </p>

        <div className="flex items-center justify-between gap-3">
          <CourseMeta duration={duration} lessonCount={lessonCount} />
          <div className="flex items-center gap-2">
            {onToggleBookmark ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark();
                }}
                className={`p-2 rounded-full ${
                  isBookmarked
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                <StarIcon
                  size={16}
                  className={isBookmarked ? "fill-yellow-500" : ""}
                />
              </button>
            ) : null}
            {onAddToComparison ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToComparison();
                }}
                className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                aria-label="Add to comparison"
              >
                <ScaleIcon size={16} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {showActions ? (
        <div className="border-t border-gray-100 bg-gray-50 p-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSecondaryClick(e);
            }}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap flex-1"
          >
            {secondaryCtaLabel}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrimaryClick(e);
            }}
            className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-colors whitespace-nowrap flex-1"
          >
            {primaryCtaLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
};
