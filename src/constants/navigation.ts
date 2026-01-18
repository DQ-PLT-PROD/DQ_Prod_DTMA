import React from "react";
import {
  TrendingUpIcon,
  BuildingIcon,
  CreditCardIcon,
  UsersIcon,
  GraduationCapIcon,
  LucideProps,
} from "lucide-react";

export interface CourseCategory {
  title: string;
  slug: string;
  description: string;
  href: string;
  icon: React.ComponentType<LucideProps>;
}

/**
 * Course categories for navigation (6XD Dimensions)
 * Slugs match the database course_categories table
 */
export const COURSE_CATEGORIES: CourseCategory[] = [
  {
    title: "Mastering Economy 4.0",
    slug: "economy-4-0",
    description: "Navigating the opportunities and challenges in the new economy",
    href: "/courses?category=economy-4-0",
    icon: TrendingUpIcon,
  },
  {
    title: "Building Tomorrow's Organisations",
    slug: "digital-cognitive-organization",
    description: "Where organizations are headed in the age of digital transformation",
    href: "/courses?category=digital-cognitive-organization",
    icon: BuildingIcon,
  },
  {
    title: "Mastering Digital Transformation",
    slug: "digital-business-platform",
    description: "What legacy value or orchestration engine powers the future?",
    href: "/courses?category=digital-business-platform",
    icon: CreditCardIcon,
  },
  {
    title: "Designing for the Future",
    slug: "digital-transformation-2-0",
    description: "How to design and deploy next-generation transformation frameworks",
    href: "/courses?category=digital-transformation-2-0",
    icon: GraduationCapIcon,
  },
  {
    title: "Architecting Change",
    slug: "digital-worker-workspace",
    description: "Who are the orchestrators of the new digital workspace?",
    href: "/courses?category=digital-worker-workspace",
    icon: UsersIcon,
  },
  {
    title: "Empowering Change",
    slug: "digital-accelerators-tools",
    description: "When will we get there? Exploring tools to accelerate transformation",
    href: "/courses?category=digital-accelerators-tools",
    icon: TrendingUpIcon,
  },
];
