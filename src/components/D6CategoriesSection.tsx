import React from "react";
import { ArrowRight } from "lucide-react";
import { FadeInUpOnScroll } from "./AnimationUtils";
import { BRAND_PRIMARY } from "../constants/branding";

const categories = [
  {
    title: "Economy 4.0",
    description:
      "Understand the new economic paradigm shaping competitive advantage, value creation, and growth.",
    image: "/Economy 4.0 thumnail.png",
  },
  {
    title: "Digital Cognitive Organisations",
    description:
      "Design adaptive, learning organisations that move from survival to leadership in Economy 4.0.",
    image: "/2nd category Thumbnail.jpg",
  },
  {
    title: "Digital Business Platforms (DBPs)",
    description:
      "Master platform thinking and operating models that build connected ecosystems and new revenue.",
    image: "/tl.jpg",
  },
  {
    title: "Digital Transformation 2.0 (DT2.0)",
    description:
      "Apply architectures and methods that make transformation measurable, repeatable, and effective.",
    image: "/thm4.jpg",
  },
  {
    title: "Digital Worker & Digital Workspace",
    description:
      "Build resilient, AI-enabled teams and workflows; redesign how work actually gets done.",
    image: "/thumb 3.jpg",
  },
  {
    title: "Digital Accelerators (Tools)",
    description:
      "Leverage data, automation, and intelligent tooling to execute transformation efficiently.",
    image: "/Thumb6.jpg",
  },
];

const D6CategoriesSection: React.FC = () => {
  return (
    <section id="d6-categories" className="bg-white pt-16 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUpOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ textShadow: "0 8px 20px rgba(3, 12, 43, 0.1)" }}
          >
            Discover Our D6 Course Categories
          </h2>
          <p className="text-lg text-gray-600">
            Each category opens a pathway into the AI era. Choose the dimension aligned to your goals and explore guided courses that translate directly to your role.
          </p>
        </FadeInUpOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.title}
              className="flex flex-col rounded-3xl overflow-hidden bg-white shadow-lg transition-transform duration-200 hover:-translate-y-1 h-full relative z-20"
            >
              <div className="relative h-36 bg-gray-100">
                {category.image && (
                  <>
                    <img
                      src={category.image}
                      alt={category.title}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      className={`h-full w-full object-cover ${
                        category.title === "Digital Transformation 2.0 (DT2.0)"
                          ? "object-top"
                          : ""
                      }`}
                    />
                    <div className="absolute inset-0 bg-[#030C2B]/20"></div>
                  </>
                )}
              </div>
              <div className="flex flex-col flex-1 p-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {category.title}
                </h3>
                <p className="mt-3 text-sm text-gray-600">
                  {category.description}
                </p>
                <a
                  href="/marketplace/courses"
                  className="mt-6 inline-flex items-center text-sm font-semibold hover:underline"
                  style={{ color: BRAND_PRIMARY }}
                >
                  Explore Courses
                  <ArrowRight size={16} className="ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default D6CategoriesSection;
