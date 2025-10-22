import React from "react";
import { ArrowRight } from "lucide-react";
import { FadeInUpOnScroll, StaggeredFadeIn } from "./AnimationUtils";

const courses = [
  {
    title: "Leading in the AI Working Era",
    tag: "DT2.0 - Leadership",
    description:
      "Build a strategic lens for AI-enabled transformation and align teams around measurable outcomes.",
  },
  {
    title: "Designing Digital Workflows",
    tag: "DW.DWS - Productivity",
    description:
      "Redesign the flow of work with intelligent automation, data insights, and human-centred practices.",
  },
  {
    title: "Platform Thinking 101",
    tag: "DBPs - Strategy",
    description:
      "Shift from products to platforms, explore operating models, value exchanges, and ecosystem design.",
  },
  {
    title: "Economy 4.0 Fundamentals",
    tag: "E4.0 - Context",
    description:
      "Understand the macro shifts defining the AI economy and how they reshape competitiveness.",
  },
  {
    title: "Digital Accelerators Toolkit",
    tag: "Accelerators - Tools",
    description:
      "Get hands-on with Digital Qatalyst accelerators to execute transformation efficiently.",
  },
];

const FeaturedCoursesSection: React.FC = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUpOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Featured Courses
          </h2>
          <p className="text-lg text-gray-600">
            Our flagship courses translate the D6 dimensions into applied
            learning journeys. Each syllabus includes guided practice, prompts,
            and tools that move you from insight to action.
          </p>
        </FadeInUpOnScroll>

        <StaggeredFadeIn
          staggerDelay={0.1}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {courses.map((course) => (
            <div
              key={course.title}
              className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-sm font-semibold uppercase tracking-wide text-[#1839AD]">
                {course.tag}
              </div>
              <h3 className="mt-3 text-xl font-semibold text-gray-900">
                {course.title}
              </h3>
              <p className="mt-3 flex-1 text-sm text-gray-600">
                {course.description}
              </p>
              <a
                href="#"
                className="mt-6 inline-flex items-center text-sm font-semibold text-[#1839AD] hover:underline"
              >
                View Syllabus
                <ArrowRight size={16} className="ml-1" />
              </a>
            </div>
          ))}
        </StaggeredFadeIn>
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;
