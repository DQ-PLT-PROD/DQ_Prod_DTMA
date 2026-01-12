import React, { useEffect, useRef } from 'react';
import { XIcon, Check, StarIcon, ArrowRight, ScaleIcon } from 'lucide-react';
import { Button } from './Button/Button';
import { CourseType } from '../utils/mockData';
import { BRAND_GRADIENT } from '../constants/branding';


interface CourseComparisonProps {
  courses: CourseType[];
  onClose: () => void;
  onRemoveCourse: (courseId: string) => void;
}

export const CourseComparison: React.FC<CourseComparisonProps> = ({
  courses,
  onClose,
  onRemoveCourse
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
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  const comparisonCategories = [{
    name: 'Category',
    key: 'category'
  }, {
    name: 'Delivery Mode',
    key: 'deliveryMode'
  }, {
    name: 'Duration',
    key: 'duration'
  }, {
    name: 'Business Stage',
    key: 'businessStage'
  }, {
    name: 'Price',
    key: 'price',
    optional: true
  }, {
    name: 'Location',
    key: 'location',
    optional: true
  }];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div
          className="px-8 py-6 flex justify-between items-start text-white shrink-0"
          style={{ background: BRAND_GRADIENT }}
        >
          <div>
            <h2 className="text-2xl font-bold">Compare Courses</h2>
            <p className="text-white/80 mt-1 font-light">
              Compare features, outcomes, and details to find the right fit for you.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <XIcon size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-8 flex-1 bg-gray-50/50">
          {courses.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                <ScaleIcon size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No courses selected</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Add courses from the catalog to compare them side by side. You can compare up to 3 courses.
              </p>
              <Button onClick={onClose} className="px-8">
                Return to Catalog
              </Button>
            </div>
          ) : (
            <>
              {/* Course headers */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="col-span-1 flex flex-col justify-end pb-4 pr-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Course Overview</h3>
                  <p className="text-sm text-gray-500">
                    Review key details and select the best course for your learning path.
                  </p>
                </div>
                {courses.map(course => (
                  <div key={course.id} className="col-span-1 relative group h-full">
                    <button
                      onClick={() => onRemoveCourse(course.id)}
                      className="absolute -top-3 -right-3 p-2 bg-white shadow-lg rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-20 border border-gray-100 hover:scale-110"
                      aria-label="Remove from comparison"
                    >
                      <XIcon size={16} />
                    </button>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col relative overflow-hidden">
                      {/* Top accent line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Rating badge in top-right */}
                      {course.rating && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                          <StarIcon size={12} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-yellow-700">{course.rating}</span>
                        </div>
                      )}

                      <h4 className="font-bold text-gray-900 leading-tight mb-3 line-clamp-3 pr-12">
                        {course.title}
                      </h4>

                      <div className="mt-auto pt-4">
                        <Button className="w-full text-sm py-2.5 rounded-xl shadow-sm">
                          Start Learning
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {Array(3 - courses.length).fill(0).map((_, index) => (
                  <div key={`empty-${index}`} className="col-span-1 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group" onClick={onClose}>
                    <div className="h-14 w-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3 text-gray-400 group-hover:text-blue-500 group-hover:border-blue-200 transition-colors shadow-sm">
                      <span className="text-2xl">+</span>
                    </div>
                    <span className="text-gray-500 font-medium text-sm group-hover:text-gray-700">
                      Add another course
                    </span>
                  </div>
                ))}
              </div>

              {/* Comparison rows */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {comparisonCategories.map((category, idx) => (
                  <div
                    key={category.key}
                    className={`grid grid-cols-4 gap-6 py-5 px-6 border-b border-gray-100 last:border-0 ${idx % 2 !== 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                  >
                    <div className="col-span-1 font-semibold text-gray-700 flex items-center">
                      {category.name}
                    </div>
                    {courses.map(course => (
                      <div key={`${course.id}-${category.key}`} className="col-span-1 text-sm text-gray-600 flex items-center">
                        {category.key === 'price' && !course[category.key as keyof CourseType] ? (
                          <span className="text-green-700 font-bold bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                            Free
                          </span>
                        ) : course[category.key as keyof CourseType] ? (
                          <span className="text-gray-900 font-medium">
                            {course[category.key as keyof CourseType] as React.ReactNode}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </div>
                    ))}
                    {Array(3 - courses.length).fill(0).map((_, index) => (
                      <div key={`empty-${category.key}-${index}`} className="col-span-1" />
                    ))}
                  </div>
                ))}

                {/* Learning outcomes */}
                <div className="grid grid-cols-4 gap-6 py-6 px-6 bg-white">
                  <div className="col-span-1 font-semibold text-gray-700 pt-1">
                    Key Outcomes
                  </div>
                  {courses.map(course => (
                    <div key={`${course.id}-outcomes`} className="col-span-1">
                      <ul className="space-y-3">
                        {course.learningOutcomes.slice(0, 4).map((outcome, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <div className="mt-0.5 mr-3 flex-shrink-0 h-5 w-5 rounded-full bg-green-50 flex items-center justify-center">
                              <Check size={12} className="text-green-600" />
                            </div>
                            <span className="leading-snug">{outcome}</span>
                          </li>
                        ))}
                        {course.learningOutcomes.length > 4 && (
                          <li className="text-xs text-blue-600 font-bold pl-8 flex items-center cursor-pointer hover:underline">
                            +{course.learningOutcomes.length - 4} more outcomes
                            <ArrowRight size={12} className="ml-1" />
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                  {Array(3 - courses.length).fill(0).map((_, index) => (
                    <div key={`empty-outcomes-${index}`} className="col-span-1" />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};