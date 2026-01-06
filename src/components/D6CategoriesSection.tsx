import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FadeInUpOnScroll } from "./AnimationUtils";
import { BRAND_PRIMARY } from "../constants/branding";

/**
 * Category data with slugs matching the database course_categories table.
 * The slug is used to pre-select the category filter on the Course Catalog page.
 */
const categories = [
  {
    title: "Mastering Economy 4.0",
    slug: "economy-4-0",
    description:
      "Navigating the opportunities and challenges in the new economy",
    image: "/Economy 4.0 thumnail.png",
  },
  {
    title: "Building Tomorrow's Organisations",
    slug: "digital-cognitive-organization",
    description:
      "Where organizations are headed in the age of digital transformation",
    image: "/2nd category Thumbnail.jpg",
  },
  {
    title: "Mastering Digital Transformation",
    slug: "digital-business-platform",
    description:
      "What legacy value or orchestration engine powers the future?",
    image: "/tl.jpg",
  },
  {
    title: "Designing for the Future",
    slug: "digital-transformation-2-0",
    description:
      "How to design and deploy next-generation transformation frameworks",
    image: "/thm4.jpg",
  },
  {
    title: "Architecting Change",
    slug: "digital-worker-workspace",
    description:
      "Who are the orchestrators of the new digital workspace?",
    image: "/thumb 3.jpg",
  },
  {
    title: "Empowering Change",
    slug: "digital-accelerators-tools",
    description:
      "When will we get there? Exploring tools to accelerate transformation",
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
            Discover Our Course Categories
          </h2>
          <p className="text-lg text-gray-600">
            Each category helps you step into the AI era. Pick the area that fits your goals and follow the guided courses built for your role.
          </p>
        </FadeInUpOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.slug}
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
                      className="h-full w-full object-cover"
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
                <Link
                  to={`/courses?category=${category.slug}`}
                  className="mt-6 inline-flex items-center text-sm font-semibold hover:underline"
                  style={{ color: BRAND_PRIMARY }}
                >
                  Explore Courses
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default D6CategoriesSection;

