import React from "react";
import { Clock, BookOpen } from "lucide-react";
import { Tag } from "./Tag";

interface CourseMetaProps {
  duration?: string;
  lessonCount?: number;
}

export const CourseMeta: React.FC<CourseMetaProps> = ({
  duration,
  lessonCount,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {duration ? (
        <Tag variant="meta" icon={<Clock size={14} className="text-gray-500" />}>
          {duration}
        </Tag>
      ) : null}
      {lessonCount ? (
        <Tag
          variant="meta"
          icon={<BookOpen size={14} className="text-gray-500" />}
        >
          {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
        </Tag>
      ) : null}
    </div>
  );
};
