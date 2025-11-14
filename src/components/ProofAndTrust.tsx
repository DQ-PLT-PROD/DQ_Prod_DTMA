import React from "react";
import { ArrowRight } from "lucide-react";
import { FadeInUpOnScroll, StaggeredFadeIn } from "./AnimationUtils";
import {
  BRAND_GRADIENT,
  BRAND_BACKDROP_BLUR,
} from "../constants/branding";

const stats = [
  { value: "6XD", label: "Framework powering all DTMA courses" },
  { value: "30+", label: "Modular courses derived from real transformation work" },
  { value: "10K+", label: "Professionals & leaders building AI-era capability" },
  { value: "1", label: "Recognition badge validating AI-ready skills" },
];

const stories = [
  {
    title: "From Analyst to AI-Ready Strategist",
    description:
      "Fatima A. used Digital Worker & Workspace lessons to automate reporting - saving 20+ hours each month.",
  },
  {
    title: "Leading Change in a Hybrid Era",
    description:
      "Omar H. applied DT2.0 and DCO insights to launch his company's first AI-assisted customer journey pilot.",
  },
  {
    title: "Designing the Digital Operating Model",
    description:
      "Lina K. built a data-driven operations model after Digital Business Platforms - now scaling to three markets.",
  },
];

const inlineLinks = [
  { label: "Start Learning Today", href: "#final-cta" },
  { label: "Discover the D6 Dimensions", href: "#d6-categories" },
];

const whyHighlights = [
  {
    title: "Framework-first Learning",
    description:
      "Every DTMA course is grounded in the 6XD Framework so teams move from theory into applied outcomes.",
  },
  {
    title: "Built by Practitioners",
    description:
      "Digital Qatalyst’s transformation architects translate field playbooks into practical, guided lessons.",
  },
  {
    title: "Designed for Momentum",
    description:
      "Bite-sized sprints, templates, and reflections help leaders orchestrate change while work keeps moving.",
  },
];

const ProofAndTrust: React.FC = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 items-center">
          <FadeInUpOnScroll className="w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <img
                src="/background%20image.png"
                alt="Leaders collaborating on digital transformation"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#030C2B]/50 to-transparent"></div>
            </div>
          </FadeInUpOnScroll>

          <FadeInUpOnScroll className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#1839AD]">
                Why DTMA?
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Built for modern leaders, rooted in real transformation
              </h2>
            </div>
            <div className="space-y-4">
              {whyHighlights.map((item) => (
                <div key={item.title}>
                  <p className="text-base font-semibold text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </FadeInUpOnScroll>
        </div>

        <div>
          <StaggeredFadeIn
            staggerDelay={0.1}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="text-3xl font-bold text-[#1839AD]">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </StaggeredFadeIn>

          <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-[#1839AD]">
            {inlineLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 hover:underline"
              >
                {link.label}
                <ArrowRight size={16} />
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <FadeInUpOnScroll className="space-y-3 text-center">
            <h3 className="text-3xl font-bold text-gray-900">
              Real Stories from the Digital Transformation Frontline
            </h3>
            <p className="text-lg text-gray-600">
              DTMA learners do not just earn a badge - they apply skills to lead
              AI-driven change, align teams, and improve outcomes.
            </p>
          </FadeInUpOnScroll>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {stories.map((story) => (
              <FadeInUpOnScroll key={story.title} className="h-full">
                <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm">
                  <h4 className="text-xl font-semibold text-gray-900">
                    {story.title}
                  </h4>
                  <p className="mt-3 flex-1 text-sm text-gray-600">
                    {story.description}
                  </p>
                  <a
                    href="#"
                    className="mt-4 inline-flex items-center text-sm font-semibold text-[#1839AD] hover:underline"
                  >
                    Read Story
                    <ArrowRight size={16} className="ml-1" />
                  </a>
                </div>
              </FadeInUpOnScroll>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500">
            From learning digital transformation to leading it - backed by a
            Digital Qatalyst Recognition Badge.
          </p>
        </div>

        <div
          className="rounded-3xl px-6 py-10 text-white sm:px-10"
          style={{
            background: BRAND_GRADIENT,
            backdropFilter: BRAND_BACKDROP_BLUR,
            WebkitBackdropFilter: BRAND_BACKDROP_BLUR,
          }}
        >
          <FadeInUpOnScroll className="space-y-6">
            <h3 className="text-3xl font-bold">Powered by Digital Qatalyst</h3>
            <p className="text-base text-white/80">
              DTMA is developed by Digital Qatalyst (DQ) - the team behind the 6XD
              Framework and the thought-leadership series Digital Perspectives. Our
              courses distill real transformation work into structured learning, tools,
              and reflections you can apply immediately.
            </p>
            <div className="flex flex-wrap gap-6 text-sm font-semibold text-white/90">
              <a href="#" className="flex items-center gap-2 hover:underline">
                About Digital Qatalyst
                <ArrowRight size={16} />
              </a>
              <a href="#" className="flex items-center gap-2 hover:underline">
                What is the 6XD Framework?
                <ArrowRight size={16} />
              </a>
            </div>
          </FadeInUpOnScroll>
        </div>
      </div>
    </section>
  );
};

export default ProofAndTrust;
