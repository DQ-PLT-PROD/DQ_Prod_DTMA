/**
 * Course Card Component
 *
 * The canonical course card component used across the platform.
 * Displays course information with:
 * - Dynamic CTA based on enrollment status
 * - Save/bookmark functionality
 * - Coming soon indicator
 * - Video preview on hover
 * - Instructor display
 *
 * Used in: Landing Page, Catalog, Course Details (Related Courses)
 *
 * @see docs/DTMA_DevD_Technical_Audit.md
 */


import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  getAccessContract,
  AccessContract,
} from "../../../lib/enrollment/service";
import { getCtaState, CtaConfig } from "../utils/ctaStateManager";
import { SaveCourseIconButton } from "./SaveCourseButton";

interface CourseCardProps {
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
    introVideoUrl?: string;
    isComingSoon?: boolean;
  };
  showSaveButton?: boolean;
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
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
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Handle video play/pause on hover
  useEffect(() => {
    if (videoRef.current) {
      if (isHovered && course.introVideoUrl) {
        videoRef.current.play().catch((e) => {
          // Auto-play might be blocked, usually requires user interaction or mute
          console.debug("Video playback failed/blocked:", e);
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, course.introVideoUrl]);

  // Format duration
  const formatDuration = (minutes?: number): string => {
    if (!minutes) return "";
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
    navigate(`/modules/${course.slug}`);
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
        navigate(`/modules/${course.slug}`);
        break;
      default:
        break;
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <div
      className={`
        group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
        transition-all duration-300 h-full flex flex-col
        ${course.isComingSoon
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
      {/* Course Image / Video */}
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
        {/* Video Player */}
        {course.introVideoUrl && isHovered && !course.isComingSoon && (
          <video
            ref={videoRef}
            src={course.introVideoUrl}
            poster={course.heroImageUrl || course.thumbnailUrl}
            className="absolute inset-0 w-full h-full object-cover z-20"
            muted={isMuted}
            loop
            playsInline
            autoPlay
            preload="none"
          />
        )}

        {/* Video Overlay Gradient (when video is showing) - optional, for text legibility if needed */}

        <div className="absolute inset-0 z-10 bg-[#1839AD]/15 mix-blend-multiply pointer-events-none" />

        {course.heroImageUrl || course.thumbnailUrl ? (
          <img
            src={course.heroImageUrl || course.thumbnailUrl}
            alt={`${course.title} thumbnail`}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover z-0 ${course.isComingSoon ? "grayscale opacity-75" : ""
              }`}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <BookOpen className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Save Button */}
        {showSaveButton && !course.isComingSoon && (
          <div className="absolute top-3 right-3 z-30">
            <SaveCourseIconButton
              courseSlug={course.slug}
              courseTitle={course.title}
            />
          </div>
        )}

        {/* Mute Toggle Button */}
        {course.introVideoUrl && isHovered && !course.isComingSoon && (
          <div className="absolute bottom-3 right-3 z-30">
            <button
              onClick={toggleMute}
              className="p-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-colors"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-5 flex flex-col flex-1 relative z-10 bg-white">
        {/* Category and Level */}
        <div className="flex items-center justify-between mb-2">
          {course.categoryName && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              {course.categoryName}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={`
          text-xl font-bold leading-tight line-clamp-2 mb-2
          ${course.isComingSoon
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


        {/* Meta Information */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-sm text-gray-600 mb-3">
          {course.lessonCount && course.lessonCount > 0 ? (
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>
                {course.lessonCount}{" "}
                {course.lessonCount === 1 ? "Lesson" : "Lessons"}
              </span>
            </div>
          ) : null}
          {duration ? (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
          ) : null}
        </div>

        {/* CTA Button */}
        {ctaConfig && (
          <button
            onClick={handleCtaClick}
            disabled={ctaConfig.disabled}
            className={`
              w-full py-2.5 px-4 rounded-lg font-semibold text-sm
              transition-all duration-200
              ${ctaConfig.disabled
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
