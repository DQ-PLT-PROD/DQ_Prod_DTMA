/**
 * Enhanced Course Card Component (Dev D - Feature D2)
 *
 * Displays course information with:
 * - Dynamic CTA based on enrollment status
 * - Save/bookmark functionality
 * - Coming soon indicator
 * - Instructor placeholder
 *
 * @see docs/DTMA_DevD_Technical_Audit.md
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  getAccessContract,
  AccessContract,
} from "../../../lib/enrollment/service";
import { getCtaState, CtaConfig } from "../utils/ctaStateManager";
import { SaveCourseIconButton } from "./SaveCourseButton";

interface EnhancedCourseCardProps {
  course: {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    categoryName?: string;
    levelTag?: string;
    audienceLevel?: string;
    duration?: string;
    durationMinutes?: number;
    lessonCount?: number;
    thumbnailUrl?: string;
    heroImageUrl?: string;
    isComingSoon?: boolean;
  };
  showSaveButton?: boolean;
  className?: string;
}

export const EnhancedCourseCard: React.FC<EnhancedCourseCardProps> = ({
  course,
  showSaveButton = true,
  className = "",
}) => {
  const navigate = useNavigate();
  const { databaseUser } = useAuth();
  const [accessContract, setAccessContract] = useState<AccessContract | null>(
    null
  );
  const [ctaConfig, setCtaConfig] = useState<CtaConfig | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch access contract on mount
  useEffect(() => {
    const fetchAccessContract = async () => {
      if (!databaseUser?.id) {
        setAccessContract(null);
        return;
      }

      try {
        const contract = await getAccessContract(databaseUser.id, course.slug);
        setAccessContract(contract);
      } catch (error) {
        console.error("Error fetching access contract:", error);
        setAccessContract(null);
      }
    };

    fetchAccessContract();
  }, [databaseUser?.id, course.slug]);

  // Update CTA config when access contract changes
  useEffect(() => {
    const config = getCtaState(
      course.isComingSoon || false,
      accessContract,
      undefined // Progress not available in card view
    );
    setCtaConfig(config);
  }, [course.isComingSoon, accessContract]);

  // Format duration
  const formatDuration = (minutes?: number): string => {
    if (!minutes) return "Self-paced";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  const duration = course.duration || formatDuration(course.durationMinutes);

  // Handle card click
  const handleCardClick = () => {
    if (course.isComingSoon) return;
    navigate(`/courses/${course.slug}`);
  };

  // Handle CTA click
  const handleCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!ctaConfig || ctaConfig.disabled) return;

    switch (ctaConfig.action) {
      case "navigate-to-player":
        navigate(`/portal/learning/${course.slug}`);
        break;
      case "navigate-to-enroll":
      case "show-certificate":
        navigate(`/courses/${course.slug}`);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={`
        group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
        transition-all duration-300 h-full flex flex-col
        ${
          course.isComingSoon
            ? "cursor-default"
            : "cursor-pointer hover:shadow-lg"
        }
        ${isHovered && !course.isComingSoon ? "transform scale-105" : ""}
        ${className}
      `}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Course Image */}
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 z-10 bg-[#1839AD]/15 mix-blend-multiply pointer-events-none" />

        {course.heroImageUrl || course.thumbnailUrl ? (
          <img
            src={course.heroImageUrl || course.thumbnailUrl}
            alt={`${course.title} thumbnail`}
            className={`h-full w-full object-cover ${
              course.isComingSoon ? "grayscale opacity-75" : ""
            }`}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <BookOpen className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {course.audienceLevel && (
            <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm border border-purple-100">
              {course.audienceLevel}
            </span>
          )}
        </div>

        {/* Coming Soon Badge */}
        {course.isComingSoon && (
          <div className="absolute top-3 right-3 z-20">
            <span className="px-3 py-1.5 bg-amber-50/90 backdrop-blur-sm text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-200 shadow-sm flex items-center gap-1.5">
              <Lock size={12} /> Coming Soon
            </span>
          </div>
        )}

        {/* Save Button */}
        {showSaveButton && !course.isComingSoon && (
          <div className="absolute top-3 right-3 z-20">
            <SaveCourseIconButton
              courseSlug={course.slug}
              courseTitle={course.title}
            />
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category and Level */}
        <div className="flex items-center justify-between mb-2">
          {course.categoryName && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              {course.categoryName}
            </span>
          )}
          {course.levelTag && (
            <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {course.levelTag}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={`
          text-xl font-bold leading-tight line-clamp-2 mb-2
          ${
            course.isComingSoon
              ? "text-gray-700"
              : "text-gray-900 group-hover:text-blue-700"
          }
          transition-colors
        `}
        >
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
          {course.shortDescription}
        </p>

        {/* Instructor (Static Placeholder) */}
        <div className="text-xs text-gray-500 mb-3">
          <span className="font-medium">Instructor:</span> DTMA Academy
        </div>

        {/* Meta Information */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>
              {course.lessonCount || 0}{" "}
              {course.lessonCount === 1 ? "Lesson" : "Lessons"}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        {ctaConfig && (
          <button
            onClick={handleCtaClick}
            disabled={ctaConfig.disabled}
            className={`
              w-full py-2.5 px-4 rounded-lg font-semibold text-sm
              transition-all duration-200
              ${
                ctaConfig.disabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : ctaConfig.variant === "primary"
                  ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                  : "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50"
              }
            `}
          >
            {ctaConfig.label}
          </button>
        )}
      </div>
    </div>
  );
};
