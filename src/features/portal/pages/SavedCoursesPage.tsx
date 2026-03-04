/**
 * SavedCoursesPage - Displays courses the learner has bookmarked
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookOpen, Trash2 } from "lucide-react";
import { PageContainer } from "../../../components/layouts/PageContainer";
import { CourseListSkeleton } from "../../../components/loading/CourseListSkeleton";
import { useAuth } from "@/lib/auth";
import { useSavedCourses } from "@/features/courses/context/SavedCoursesContext";
import { fetchFullCourse } from "@/services/courseService";
import { Course } from "../../../types/dtma-lms";

const SavedCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading, isDatabaseUserLoading } = useAuth();
  const { savedCourseIds, isLoaded: isSavedLoaded, toggleSave } = useSavedCourses();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingSlug, setRemovingSlug] = useState<string | null>(null);

  const isAuthPending = isAuthLoading || isDatabaseUserLoading;

  // Load full course data for each saved slug
  useEffect(() => {
    if (isAuthPending || !isSavedLoaded) {
      setIsLoading(true);
      return;
    }

    if (!user || savedCourseIds.size === 0) {
      setCourses([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadCourses = async () => {
      setIsLoading(true);
      try {
        const slugs: string[] = Array.from(savedCourseIds);
        const results = await Promise.all(
          slugs.map(slug => fetchFullCourse(slug))
        );
        if (!cancelled) {
          setCourses(results.filter((c): c is Course => c !== null));
        }
      } catch (err) {
        console.error("Failed to load saved courses:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadCourses();
    return () => { cancelled = true; };
  }, [user, isAuthPending, isSavedLoaded, savedCourseIds]);

  const handleRemove = async (slug: string) => {
    setRemovingSlug(slug);
    try {
      await toggleSave(slug);
      setCourses(prev => prev.filter(c => c.slug !== slug));
    } finally {
      setRemovingSlug(null);
    }
  };

  return (
    <PageContainer className="py-4 w-full">
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Saved Modules</h2>
          <p className="text-gray-500 text-sm mt-1">Modules you've bookmarked for later</p>
        </div>

        {/* Saved Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Bookmark size={18} className="text-[#1839AD]" />
            <h2 className="text-lg font-semibold text-gray-900">Bookmarked Modules</h2>
            {!isLoading && user && (
              <span className="text-xs font-bold bg-[#1839AD] text-white px-2 py-0.5 rounded-full">
                {courses.length}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="py-4">
              <CourseListSkeleton />
            </div>
          ) : !user ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to see your saved modules</h3>
              <p className="text-gray-500 mb-4">Save modules to revisit them anytime</p>
              <button
                onClick={() => navigate("/courses")}
                className="px-4 py-2 bg-[#1839AD] text-white rounded-lg hover:bg-[#132b7c] transition"
              >
                Browse Courses
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <Bookmark className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">You haven't saved any modules yet</h3>
              <p className="text-gray-500 mb-4">Browse the catalog and bookmark modules for later</p>
              <button
                onClick={() => navigate("/courses")}
                className="px-4 py-2 bg-[#1839AD] text-white rounded-lg hover:bg-[#132b7c] transition"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map(course => {
                const isRemoving = removingSlug === course.slug;

                return (
                  <div
                    key={course.slug}
                    className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-[#1839AD]/30 transition group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-24 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                        {course.heroImageUrl ? (
                          <img
                            src={course.heroImageUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#1839AD]/10">
                            <BookOpen className="text-[#1839AD]" size={24} />
                          </div>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 group-hover:text-[#1839AD] transition truncate">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {course.shortDescription}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          {course.levelTag && <span>{course.levelTag}</span>}
                          {course.estimatedDurationMinutes > 0 && (
                            <span>{course.estimatedDurationMinutes} min</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRemove(course.slug)}
                          disabled={isRemoving}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 border border-red-200 disabled:opacity-50 transition"
                          title="Remove from saved"
                        >
                          <Trash2 size={14} />
                          <span className="hidden sm:inline">{isRemoving ? "Removing..." : "Remove"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/modules/${course.slug}`)}
                          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#1839AD] text-white text-sm font-semibold hover:bg-[#132b7c] transition"
                        >
                          Open Module
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default SavedCoursesPage;
