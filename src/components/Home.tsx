import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeInUpOnScroll, StaggeredFadeIn } from "./AnimationUtils";

const courses = [
  {
    id: "ai-working-era",
    title: "Leading in the AI Working Era",
    tag: "DT2.0 - Leadership",
    description:
      "Build a strategic lens for AI-enabled transformation and align teams around measurable outcomes.",
  },
  {
    id: "digital-workflows",
    title: "Designing Digital Workflows",
    tag: "DW.DWS - Productivity",
    description:
      "Redesign the flow of work with intelligent automation, data insights, and human-centred practices.",
  },
  {
    id: "platform-thinking-101",
    title: "Platform Thinking 101",
    tag: "DBPs - Strategy",
    description:
      "Shift from products to platforms, explore operating models, value exchanges, and ecosystem design.",
  },
  {
    id: "economy-4-0-fundamentals",
    title: "Economy 4.0 Fundamentals",
    tag: "E4.0 - Context",
    description:
      "Understand the macro shifts defining the AI economy and how they reshape competitiveness.",
  },
  {
    id: "digital-accelerators-toolkit",
    title: "Digital Accelerators Toolkit",
    tag: "Accelerators - Tools",
    description:
      "Get hands-on with Digital Qatalyst accelerators to execute transformation efficiently.",
  },
];

const FeaturedCoursesSection: React.FC = () => {
  const [startIndex, setStartIndex] = useState(0);
  const navigate = useNavigate();

  const visibleCourses = courses.slice(startIndex, startIndex + 3);
  const maxStartIndex = Math.max(0, courses.length - 3);
  const totalSlides = maxStartIndex + 1;

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? Math.max(courses.length - 3, 0) : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      prev + 3 >= courses.length ? 0 : prev + 1
    );
  };

  const handleViewDetails = (id: string, action?: boolean) => {
    const search = action ? "?action=true" : "";
    navigate(`/courses/${id}${search}`);
  };

  return (
    <section className="bg-gray-50 pt-4 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <FadeInUpOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B]">
            Featured Courses
          </h2>
          <p className="text-lg text-gray-600">
            Our flagship courses translate the D6 dimensions into applied
            learning journeys. Each syllabus includes guided practice, prompts,
            and tools that move you from insight to action.
          </p>
        </FadeInUpOnScroll>

        <StaggeredFadeIn staggerDelay={0.1} className="mt-12">
          <div className="relative">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCourses.map((course) => {
                const tagChips =
                  course.tag
                    ?.split(" - ")
                    .map((chip) => chip.trim())
                    .filter(
                      (chip) =>
                        chip.toLowerCase() !== "leadership" &&
                        chip.toLowerCase() !== "productivity" &&
                        chip.toLowerCase() !== "strategy"
                    ) ?? [];
                return (
                  <div
                    key={course.title}
                    className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {course.title}
                      </h3>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-[#2E469E]">
                        <Layers size={18} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      {course.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tagChips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-[#1839AD]/10 bg-[#1839AD]/5 px-3 py-1 text-xs font-semibold text-[#1839AD]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleViewDetails(course.id)}
                        className="rounded-xl border border-[#1839AD] px-4 py-2 text-sm font-semibold text-[#1839AD] transition hover:bg-[#1839AD]/5"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleViewDetails(course.id, true)}
                        className="rounded-xl bg-[#1839AD] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#132b7c]"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow hover:bg-gray-50"
              aria-label="Previous courses"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow hover:bg-gray-50"
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
                  className={`h-2 w-2 rounded-full transition ${
                    isActive ? "bg-[#2E469E]" : "bg-gray-300"
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
