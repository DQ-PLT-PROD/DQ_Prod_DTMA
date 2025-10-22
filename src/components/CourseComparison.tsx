import React, { useEffect, useRef } from 'react';
import { CourseType } from '../utils/mockData';
import { XIcon, Check, Minus } from 'lucide-react';
import { Button } from './Button';
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
  return <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Course Comparison</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <XIcon size={24} />
          </button>
        </div>
        <div className="p-6">
          {courses.length === 0 ? <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No courses selected for comparison
              </p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div> : <>
              {/* Course headers */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="col-span-1">
                  <div className="h-24 flex items-end">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Course Details
                    </h3>
                  </div>
                </div>
                {courses.map(course => <div key={course.id} className="col-span-1 relative">
                    <button onClick={() => onRemoveCourse(course.id)} className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600" aria-label="Remove from comparison">
                      <XIcon size={16} />
                    </button>
                    <div className="flex flex-col items-center mb-2">
                      <img src={course.provider.logoUrl} alt={course.provider.name} className="h-12 w-12 object-contain mb-2" />
                      <span className="text-sm text-gray-500">
                        {course.provider.name}
                      </span>
                    </div>
                    <h4 className="text-center font-medium text-gray-900">
                      {course.title}
                    </h4>
                  </div>)}
                {Array(3 - courses.length).fill(0).map((_, index) => <div key={`empty-${index}`} className="col-span-1 border border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-sm">
                        Add a course
                      </span>
                    </div>)}
              </div>
              {/* Comparison rows */}
              <div className="space-y-4">
                {comparisonCategories.map(category => <div key={category.key} className="grid grid-cols-4 gap-4 py-3 border-t border-gray-100">
                    <div className="col-span-1 font-medium text-gray-700">
                      {category.name}
                    </div>
                    {courses.map(course => <div key={`${course.id}-${category.key}`} className="col-span-1 text-center">
                        {category.key === 'price' && !course[category.key] ? <span className="text-gray-500">Free</span> : course[category.key] ? <span className="text-gray-900">
                            {course[category.key]}
                          </span> : <span className="text-gray-400">N/A</span>}
                      </div>)}
                    {Array(3 - courses.length).fill(0).map((_, index) => <div key={`empty-${category.key}-${index}`} className="col-span-1" />)}
                  </div>)}
                {/* Learning outcomes */}
                <div className="grid grid-cols-4 gap-4 py-3 border-t border-gray-100">
                  <div className="col-span-1 font-medium text-gray-700">
                    Learning Outcomes
                  </div>
                  {courses.map(course => <div key={`${course.id}-outcomes`} className="col-span-1">
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                        {course.learningOutcomes.map((outcome, index) => <li key={index}>{outcome}</li>)}
                      </ul>
                    </div>)}
                  {Array(3 - courses.length).fill(0).map((_, index) => <div key={`empty-outcomes-${index}`} className="col-span-1" />)}
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </>}
        </div>
      </div>
    </div>;
};
