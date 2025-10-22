import React from "react";
import { ArrowRight } from "lucide-react";
import { FadeInUpOnScroll, StaggeredFadeIn } from "./AnimationUtils";
import { BRAND_PRIMARY } from "../constants/branding";

const categories = [
  {
    title: "Economy 4.0",
    description:
      "Understand the new economic paradigm shaping competitive advantage, value creation, and growth.",
  },
  {
    title: "Digital Cognitive Organisations (DCOs)",
    description:
      "Design adaptive, learning organisations that move from survival to leadership in Economy 4.0.",
  },
  {
    title: "Digital Business Platforms (DBPs)",
    description:
      "Master platform thinking and operating models that build connected ecosystems and new revenue.",
  },
  {
    title: "Digital Transformation 2.0 (DT2.0)",
    description:
      "Apply architectures and methods that make transformation measurable, repeatable, and effective.",
  },
  {
    title: "Digital Worker & Digital Workspace (DW.DWS)",
    description:
      "Build resilient, AI-enabled teams and workflows; redesign how work actually gets done.",
  },
  {
    title: "Digital Accelerators (Tools)",
    description:
      "Leverage data, automation, and intelligent tooling to execute transformation efficiently.",
  },
];

const D6CategoriesSection: React.FC = () => {
  return (
    <section id="d6-categories" className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUpOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Discover the D6 Categories
          </h2>
          <p className="text-lg text-gray-600">
            Each category opens a pathway into the AI working era. Dive into the
            dimension that matches your goals, then explore guided courses,
            playbooks, and tools that translate directly to your day-to-day
            leadership.
          </p>
        </FadeInUpOnScroll>

        <StaggeredFadeIn
          staggerDelay={0.1}
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {categories.map((category) => (
            <div
              key={category.title}
              className="h-full rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-gray-900">
                {category.title}
              </h3>
              <p className="mt-4 text-sm text-gray-600">
                {category.description}
              </p>
              <a
                href="#"
                className="mt-6 inline-flex items-center text-sm font-semibold hover:underline"
                style={{ color: BRAND_PRIMARY }}
              >
                Explore Courses
                <ArrowRight size={16} className="ml-1" />
              </a>
            </div>
          ))}
        </StaggeredFadeIn>
      </div>
    </section>
  );
};

export default D6CategoriesSection;
