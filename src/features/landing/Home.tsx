import React, { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeInUpOnScroll, StaggeredFadeIn } from "../../components/AnimationUtils";
import { CourseTile } from "../courses/components/CourseTile";
import { fetchCourses } from "../courses/services/courseService";
import { CourseCardSkeleton } from "../../components/SkeletonLoader";
import { Button } from "../../components/Button/Button";
import { IconButton } from "../../components/ui/IconButton";
import { useAuth } from "@/lib/auth";
import { getUserEnrollments } from "@/lib/enrollment/service";

import { PageContainer } from "../../components/layouts/PageContainer";

const FeaturedCoursesSection: React.FC = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [lastCourse, setLastCourse] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch user enrollments to show "Continue Learning"
  useEffect(() => {
    const checkEnrollments = async () => {
      if (user) {
        try {
          const enrollments = await getUserEnrollments(user.id);
          if (enrollments && enrollments.length > 0) {
            // Get the most recent enrollment
            const recentEnrollment = enrollments[0];
            // We need course details for the button text/link
            // Since we are fetching all courses anyway, we can find it there
            setLastCourse({ ...recentEnrollment });
          }
        } catch (err) {
          console.error("Failed to fetch enrollments", err);
        }
      }
    };
    checkEnrollments();
  }, [user]);


  // Fetch courses from database (includes both active and coming soon courses)
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const dbCourses = await fetchCourses();

        // Map DB courses to our display format
        const mappedCourses = dbCourses.map((course: any) => ({
          id: course.slug || course.id,
          title: course.title,
          category: course.category?.toUpperCase() || "ECONOMY 4.0",
          levelTag: course.levelTag || "Beginner",
          audienceLevel: course.audienceLevel?.toUpperCase() || "DIGITAL LEADERS",
          duration: course.isComingSoon ? "Coming Soon" : (course.duration || "55 mins"),
          lessonCount: course.lessonCount || 4,
          thumbnailUrl: course.heroImageUrl || course.thumbnailUrl,
          videoUrl: course.isComingSoon ? undefined : course.introVideoUrl,
          description: course.description || "",
          isComingSoon: course.isComingSoon || false,
        }));

        setCourses(mappedCourses);

        // Match last course details if we have an ID but no title
        setLastCourse((prev: any) => {
          if (prev && !prev.title) {
            const found = mappedCourses.find((c: any) => c.id === prev.courseSlug);
            return found ? { ...prev, ...found } : prev;
          }
          return prev;
        });

      } catch (error) {
        console.error("Error fetching featured courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const updateCardsPerView = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setCardsPerView(1);
      } else if (w < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };
    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const visibleCourses = courses.slice(startIndex, startIndex + cardsPerView);
  const maxStartIndex = Math.max(0, courses.length - cardsPerView);
  const totalSlides = maxStartIndex + 1;

  const handlePrev = () => {
    setStartIndex((prev) =>
      prev === 0 ? Math.max(courses.length - cardsPerView, 0) : Math.max(prev - cardsPerView, 0)
    );
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      prev + cardsPerView >= courses.length ? 0 : prev + cardsPerView
    );
  };

  const handleViewDetails = (id: string, action?: boolean) => {
    const search = action ? "?action=true" : "";
    navigate(`/courses/${id}${search}`);
  };

  const handleContinueLearning = () => {
    if (lastCourse && lastCourse.courseSlug) {
      navigate(`/portal/learning/${lastCourse.courseSlug}`);
    } else {
      navigate('/portal');
    }
  };

  if (loading) {
    return (
      <section className="bg-surface py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-headline-lg font-bold text-on-surface">
              Featured Courses
            </h2>
            <p className="text-body-lg text-on-surface-variant">Loading courses...</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <CourseCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-center py-16 relative bg-surface">
      <PageContainer>
        <FadeInUpOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-headline-lg md:text-display-sm font-bold text-on-surface">
            Featured Courses
          </h2>
          <p className="text-body-lg text-on-surface-variant">
            Our flagship courses translate the D6 dimensions into applied
            learning journeys.
          </p>

          {/* Continue Learning Button for Logged In Users */}
          {user && lastCourse && (
            <div className="mt-8 animate-in fade-in zoom-in duration-500">
              <Button
                variant="filled"
                size="lg"
                onClick={handleContinueLearning}
                leftIcon={<PlayCircle className="w-6 h-6" />}
                rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                className="shadow-elevation-3 hover:shadow-elevation-4"
              >
                Continue Learning: {lastCourse.title || "Your Course"}
              </Button>
            </div>
          )}

        </FadeInUpOnScroll>

        <StaggeredFadeIn staggerDelay={0.1} className="mt-12">
          <div className="relative">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCourses.map((course) => {
                const isHovered = hoveredId === course.id;

                return (
                  <div
                    key={course.id}
                    onMouseEnter={() => !course.isComingSoon && setHoveredId(course.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`transition duration-300 ease-out ${!course.isComingSoon && isHovered ? "z-10" : "z-0"
                      }`}
                  >
                    <CourseTile
                      title={course.title}
                      description={course.description}
                      category={course.category}
                      levelTag={course.levelTag}
                      audienceLevel={course.audienceLevel}
                      duration={course.duration}
                      lessonCount={course.lessonCount}
                      thumbnailUrl={course.thumbnailUrl}
                      videoUrl={course.videoUrl}

                      variant={course.isComingSoon ? "coming-soon" : "course"}
                      onCardClick={course.isComingSoon ? undefined : () => handleViewDetails(course.id)}
                      isHovered={isHovered}
                      enableHoverEffects={true}
                    />
                  </div>
                );
              })}
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20">
              <IconButton
                variant="filled"
                onClick={handlePrev}
                className="bg-surface-container-high text-on-surface hover:bg-surface-container-highest shadow-elevation-2"
                aria-label="Previous courses"
              >
                <ArrowLeft size={18} />
              </IconButton>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20">
              <IconButton
                variant="filled"
                onClick={handleNext}
                className="bg-surface-container-high text-on-surface hover:bg-surface-container-highest shadow-elevation-2"
                aria-label="Next courses"
              >
                <ArrowRight size={18} />
              </IconButton>
            </div>
          </div>
          <div className="flex justify-center items-center gap-3 mt-6">
            {Array.from({ length: totalSlides }).map((_, idx) => {
              const isActive = idx === Math.min(startIndex, maxStartIndex);
              return (
                <button
                  key={idx}
                  onClick={() => setStartIndex(Math.min(idx, maxStartIndex))}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-200 ${isActive ? "w-8 bg-primary" : "w-2 bg-outline-variant"
                    }`}
                ></button>
              );
            })}
          </div>
        </StaggeredFadeIn>
      </PageContainer>
    </div>
  );
};

export default FeaturedCoursesSection;
