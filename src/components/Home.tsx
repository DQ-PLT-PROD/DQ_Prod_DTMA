import React, { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeInUpOnScroll, StaggeredFadeIn } from "./AnimationUtils";
import { CourseTile } from "./CourseTile";
import { fetchCourses } from "../services/courseService";


const FeaturedCoursesSection: React.FC = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardsPerView, setCardsPerView] = useState(3);
  const navigate = useNavigate();

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
          videoUrl: course.isComingSoon ? undefined : (course.introVideoUrl || "/videos/C2-INTRO.mp4"),
          description: course.description || "",
          isComingSoon: course.isComingSoon || false,
        }));

        setCourses(mappedCourses);
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

  if (loading) {
    return (
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B]">
              Featured Courses
            </h2>
            <p className="text-lg text-gray-600">Loading courses...</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-80"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 pt-14 pb-12 sm:pb-16" style={{ paddingBottom: "56px" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUpOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B]">
            Featured Courses
          </h2>
          <p className="text-lg text-gray-600">
            Our flagship courses translate the D6 dimensions into applied
            learning journeys.
          </p>
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
                    className={`transition duration-300 ease-out ${!course.isComingSoon && isHovered ? "scale-105 z-10" : "scale-100"
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
                    />
                  </div>
                );
              })}
            </div>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow hover:bg-gray-50"
              aria-label="Previous courses"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow hover:bg-gray-50"
              aria-label="Next courses"
            >
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="flex justify-center items-center gap-3 mt-6">
            {Array.from({ length: totalSlides }).map((_, idx) => {
              const isActive = idx === Math.min(startIndex, maxStartIndex);
              return (
                <button
                  key={idx}
                  onClick={() => setStartIndex(Math.min(idx, maxStartIndex))}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-200 ${isActive ? "w-8 bg-[#1839AD]/30" : "w-2 bg-gray-300"
                    }`}
                ></button>
              );
            })}
          </div>
        </StaggeredFadeIn>
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;
