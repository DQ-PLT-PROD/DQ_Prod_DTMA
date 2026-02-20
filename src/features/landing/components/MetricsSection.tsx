import React from "react";
import { FadeInUpOnScroll } from "@/components/AnimationUtils";
import { PageContainer } from "@/components/layouts/PageContainer";

const stats = [
  {
    value: "6",
    label: "Expertly designed course categories",
  },
  { value: "30+", label: "Bite‑sized courses for future‑ready professionals" },
  { value: "1", label: "Recognition badge validating AI-ready skills" },
];

/**
 * Metrics section — the blue stats bar presented as a dedicated viewport screen.
 * Stands alone so it gets the visual weight it deserves.
 */
const MetricsSection: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 sm:py-28">
      <PageContainer>
        <FadeInUpOnScroll>
          <div className="rounded-3xl bg-[#2E469E] text-white px-8 py-14 shadow-2xl max-w-4xl mx-auto w-full">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`flex flex-col items-center text-center gap-2 px-4 ${
                    index !== stats.length - 1
                      ? "md:border-r md:border-white/20"
                      : ""
                  }`}
                >
                  <div className="text-5xl font-bold text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/80 leading-snug max-w-[160px]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeInUpOnScroll>
      </PageContainer>
    </div>
  );
};

export default MetricsSection;
