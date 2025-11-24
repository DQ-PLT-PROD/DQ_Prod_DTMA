import React, { useEffect, useRef } from 'react';
import { CourseType } from '../types/course';
import { XIcon, BookmarkIcon, ScaleIcon, CheckCircleIcon, HomeIcon, ChevronRightIcon } from 'lucide-react';
import { Tag } from './ui/Tag';
import { CourseMeta } from './ui/CourseMeta';
interface CourseQuickViewModalProps {
  course: CourseType;
  onClose: () => void;
  onViewDetails: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onAddToComparison: () => void;
}
export const CourseQuickViewModal: React.FC<CourseQuickViewModalProps> = ({
  course,
  onClose,
  onViewDetails,
  isBookmarked,
  onToggleBookmark,
  onAddToComparison
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);
  const keyHighlights = (course.learningOutcomes || []).slice(0, 3);
  const displayTags = course.tags && course.tags.length
    ? course.tags
    : [course.category, course.deliveryMode, course.levelTag, course.audienceLevel].filter(Boolean);
  return <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 truncate">
          Course Preview
        </h2>
        <div className="flex items-center space-x-3">
          <button onClick={onToggleBookmark} className={`p-2 rounded-full ${isBookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
            <BookmarkIcon size={18} className={isBookmarked ? 'fill-yellow-600' : ''} />
          </button>
          <button onClick={onAddToComparison} className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200" aria-label="Add to comparison">
            <ScaleIcon size={18} />
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <XIcon size={24} />
          </button>
        </div>
      </div>
      <div className="p-6">
        {/* Breadcrumbs */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <a href="/" className="text-gray-600 hover:text-gray-900 inline-flex items-center text-sm">
                <HomeIcon size={14} className="mr-1" />
                <span>Home</span>
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon size={14} className="text-gray-400" />
                <a href="/courses" className="ml-1 text-gray-600 hover:text-gray-900 md:ml-2 text-sm">
                  Courses
                </a>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon size={14} className="text-gray-400" />
                <span className="ml-1 text-gray-500 md:ml-2 truncate max-w-[150px] text-sm">
                  {course.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>
        <div className="flex items-center justify-end gap-4 mb-4">
          <CourseMeta duration={course.duration} lessonCount={course.lessonCount} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {course.title}
        </h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {course.category ? <Tag variant="category">{course.category}</Tag> : null}
          {course.levelTag ? <Tag variant="level">{course.levelTag}</Tag> : null}
          {course.audienceLevel ? <Tag variant="audience">{course.audienceLevel}</Tag> : null}
          {displayTags.map((tag, index) => (
            <Tag key={`${tag}-${index}`} variant="topic">
              {tag}
            </Tag>
          ))}
        </div>
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Description
          </h3>
          <p className="text-gray-700">{course.description}</p>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Key Highlights
          </h3>
          <ul className="space-y-2">
            {keyHighlights.map((highlight, index) => <li key={index} className="flex items-start">
              <CheckCircleIcon size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{highlight}</span>
            </li>)}
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button onClick={onViewDetails} className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors">
            View Full Details
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:from-blue-700 hover:to-purple-700 transition-colors">
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  </div>;
};
