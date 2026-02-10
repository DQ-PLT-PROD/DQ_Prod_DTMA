import React from "react";
import { FadeInUpOnScroll } from "@/components/AnimationUtils";
import { PageContainer } from "@/components/layouts/PageContainer";

const stats = [
  {
    value: "6X",
    label: "Guided learning pathways across the key dimensions of digital transformation",
  },
  {
    value: "100+",
    label: "Applied courses, tools, templates, and playbooks for real organizational use",
  },
];

const whyHighlights = [
  {
    title: "Build clarity before action",
    description:
      "Understand digital transformation and the role AI plays before committing to tools or initiatives.",
  },
  {
    title: "Follow guided learning pathways",
    description:
      "Learn through structured pathways across the key dimensions of digital transformation — not scattered courses.",
  },
  {
    title: "Apply learning at work",
    description:
      "Use practical tools, templates, and playbooks to support real planning, coordination, and delivery.",
  },
];

const ProofAndTrust: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center py-16">
      <PageContainer className="space-y-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-12 lg:grid-cols-2 items-start">
          <FadeInUpOnScroll className="space-y-6 text-left flex flex-col items-start px-4">
            <img
              src="/images/landing/leaders-collaborating.png"
              alt="Leaders collaborating"
              className="w-full max-w-sm rounded-full mb-4 self-center lg:self-start"
            />
            <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B] leading-tight max-w-4xl">
              Empowering professionals and leaders
              <span className="block mt-2 text-[#1839AD]">Rooted in real digital transformation.</span>
            </h2>
          </FadeInUpOnScroll>

          <FadeInUpOnScroll className="space-y-6 text-left px-4 lg:pl-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1839AD]">
                WHY DTMA?
              </h3>
              <p className="text-lg text-gray-700 font-medium leading-relaxed">
                Digital transformation is complex, cross‑functional, and often unclear.
                DTMA exists to help professionals and leaders make sense of it together — and apply that understanding in real organizational settings.
              </p>

              <p className="text-lg font-bold text-[#030C2B] pt-2">
                With DTMA, you can:
              </p>
            </div>

            <div className="space-y-6 pt-2">
              {whyHighlights.map((item) => (
                <div key={item.title} className="space-y-2">
                  <h4 className="text-xl font-bold text-gray-900">
                    {item.title}
                  </h4>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </FadeInUpOnScroll>
        </div>

        <div className="rounded-3xl bg-[#2E469E] text-white px-6 py-12 shadow-lg max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 items-start">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center text-center gap-3 px-4 ${index !== stats.length - 1 ? "md:border-r md:border-white/20" : ""
                  }`}
              >
                <div className="text-5xl font-bold text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-lg text-white/90 font-medium max-w-md leading-relaxed">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

      </PageContainer>
    </div>
  );
};

export default ProofAndTrust;
