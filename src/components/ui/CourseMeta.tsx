import React from "react";
import { ClockIcon, BookOpenIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface CourseMetaProps {
  duration?: string | number;
  lessonCount?: number;
  className?: string;
}

export function CourseMeta({ duration, lessonCount, className }: CourseMetaProps) {
  if (!duration && !lessonCount) return null;

  return (
    <div className={cn("flex items-center space-x-3 text-xs text-gray-500", className)}>
      {duration && (
        <div className="flex items-center">
          <ClockIcon size={14} className="mr-1" />
          <span>{duration}</span>
        </div>
      )}
      {duration && lessonCount && <span>•</span>}
      {lessonCount && (
        <div className="flex items-center">
          <BookOpenIcon size={14} className="mr-1" />
          <span>{lessonCount} Lessons</span>
        </div>
      )}
    </div>
  );
}
