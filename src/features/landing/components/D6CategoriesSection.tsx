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
      "Master the digital leadership skills needed to steer teams through rapid technological shifts and market volatility.",
    image: "/images/landing/category-economy-4-0.png",
  },
  {
    title: "Architecting the Future Organization",
    slug: "digital-cognitive-organization",
    description:
      "Implement agile workflows and automation guidelines to build a scalable, future-ready organizational structure.",
    image: "/images/landing/category-digital-cognitive-organization.jpg",
  },
  {
    title: "Mastering the Digital Pivot",
    slug: "digital-business-platform",
    description:
      "Transition from legacy processes to high-velocity digital tools that power tomorrow's industrial standards.",
    image: "/images/landing/category-digital-business-platform.jpg",
  },
  {
    title: "Build the Future: Designing Digital Ecosystems",
    slug: "digital-transformation-2-0",
    description:
      "Build sustainable, next-gen infrastructures. Master the core frameworks to scale future-proof digital environments.",
    image: "/images/landing/category-digital-transformation-2-0.jpg",
  },
  {
    title: "Lead Change: The Digital Architect Path",
    slug: "digital-worker-workspace",
    description:
      "Orchestrate people and tech. Gain the leadership skills to manage complex digital transformations in the modern office.",
    image: "/images/landing/category-digital-worker-workspace.jpg",
  },
  {
    title: "Accelerate Impact: Master Digital Velocity",
    slug: "digital-accelerators-tools",
    description:
      "Drive rapid evolution. Master high-speed tools to increase organizational efficiency and lead market shifts.",
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
            Master the frameworks of the AI era. Choose a guided pathway designed to align your skills with modern automation and digital-first workflows.
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
                  Start Pathway
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

