import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FadeInUpOnScroll } from "@/components/AnimationUtils";
import { BRAND_PRIMARY } from "@/constants/branding";

/**
 * Category data with slugs matching the database course_categories table.
 * The slug is used to pre-select the category filter on the Course Catalog page.
 */
const categories = [
  {
    title: "Leading the New Economy",
    slug: "economy-4-0",
    description:
      "Equip yourself to navigate and dominate the shifts of the modern digital landscape.",
    image: "/images/landing/category-economy-4-0.png",
  },
  {
    title: "Architecting the Future Organization",
    slug: "digital-cognitive-organization",
    description:
      "Design and lead agile, tech-forward teams ready for the age of automation.",
    image: "/images/landing/category-digital-cognitive-organization.jpg",
  },
  {
    title: "Mastering the Digital Pivot",
    slug: "digital-business-platform",
    description:
      "Move beyond legacy systems to command the engines powering tomorrow's industries.",
    image: "/images/landing/category-digital-business-platform.jpg",
  },
  {
    title: "Designing Digital Ecosystems",
    slug: "digital-transformation-2-0",
    description:
      "Master the frameworks needed to build the sustainable, next-generation infrastructures of the future.",
    image: "/images/landing/category-digital-transformation-2-0.jpg",
  },
  {
    title: "The Digital Architect Path",
    slug: "digital-worker-workspace",
    description:
      "Lead the transformation. Learn to orchestrate people, tools, and tech in the modern workspace.",
    image: "/images/landing/category-digital-worker-workspace.jpg",
  },
  {
    title: "Commanding Digital Velocity",
    slug: "digital-accelerators-tools",
    description:
      "Accelerate your impact. Master the high-speed tools that drive rapid organizational evolution.",
    image: "/images/landing/category-digital-accelerators-tools.jpg",
  },
];

import { PageContainer } from "@/components/layouts/PageContainer";

const D6CategoriesSection: React.FC = () => {
  return (
    <div id="d6-categories" className="w-full h-full flex flex-col justify-center py-16">
      <PageContainer>
        <FadeInUpOnScroll className="text-center max-w-3xl mx-auto space-y-4">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ textShadow: "0 8px 20px rgba(3, 12, 43, 0.1)" }}
          >
            Choose Your Transformation Pathway
          </h2>
          <p className="text-lg text-gray-600">
            Each category helps you step into the AI era. Pick the area that fits your goals and follow the guided courses built for your role.
          </p>
        </FadeInUpOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 card-container">
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
      </PageContainer>
    </div>
  );
};

export default D6CategoriesSection;

