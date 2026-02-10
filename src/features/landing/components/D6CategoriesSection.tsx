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
      "Understand how the digital economy is reshaping value creation, competition, and organizational priorities\u2014and what this means for leaders and professionals navigating change.",
    image: "/images/landing/category-economy-4-0.png",
  },
  {
    title: "Architecting the Future Organization",
    slug: "digital-cognitive-organization",
    description:
      "Learn how organizations must be re-imagined to operate effectively in a digital environment, including new structures, decision models, and ways of working.",
    image: "/images/landing/category-digital-cognitive-organization.jpg",
  },
  {
    title: "Navigating the Digital Pivot",
    slug: "digital-business-platform",
    description:
      "Build clarity on how organizations move from today\u2019s state to future digital states\u2014covering transformation journeys, sequencing, and change coordination.",
    image: "/images/landing/category-digital-business-platform.jpg",
  },
  {
    title: "Designing Digital Ecosystems",
    slug: "digital-transformation-2-0",
    description:
      "Understand how digital platforms, data, and services come together to create scalable ecosystems that support products, services, and organizational growth.",
    image: "/images/landing/category-digital-transformation-2-0.jpg",
  },
  {
    title: "The Digital Architect Path",
    slug: "digital-worker-workspace",
    description:
      "Learn how to orchestrate people, platforms, and technologies\u2014translating strategy into coherent digital operating models across the organization.",
    image: "/images/landing/category-digital-worker-workspace.jpg",
  },
  {
    title: "Enabling Digital Velocity",
    slug: "digital-accelerators-tools",
    description:
      "Explore how enabling technologies, data, and automation support faster decision-making and execution\u2014without losing alignment or control.",
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
            Explore the Dimensions of Digital Transformation
          </h2>
          <p className="text-lg text-gray-600">
            DTMA learning is organized into structured pathways that reflect the key dimensions of digital transformation. Each pathway helps professionals and leaders build clarity in a specific area—while staying connected to the bigger picture of how organizations evolve.
          </p>
          <p className="text-base text-gray-500">
            These are not isolated topics. Together, they form a coherent view of how digital transformation actually works in real organizations.
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
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  {category.title}
                </h3>
                <p className="mt-3 text-base text-gray-700 leading-relaxed">
                  {category.description}
                </p>
                <Link
                  to={`/courses?category=${category.slug}`}
                  className="mt-6 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 hover:opacity-90 hover:shadow-md"
                  style={{ backgroundColor: BRAND_PRIMARY }}
                >
                  Explore Pathway
                  <ArrowRight size={16} className="ml-2" />
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
