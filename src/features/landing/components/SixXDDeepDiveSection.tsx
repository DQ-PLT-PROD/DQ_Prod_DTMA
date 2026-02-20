import React from "react";
import { Link } from "react-router-dom";
import { FadeInUpOnScroll } from "@/components/AnimationUtils";
import { PageContainer } from "@/components/layouts/PageContainer";

const SixXDDeepDiveSection: React.FC = () => {
  return (
    <div className="w-full flex flex-col justify-center py-16 sm:py-24">
      <PageContainer>
        <FadeInUpOnScroll className="max-w-3xl mx-auto text-center space-y-6">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ textShadow: "0 8px 20px rgba(3, 12, 43, 0.1)" }}
          >
            Dive deep into the 6X Perspectives of Digital
          </h2>
          <p className="text-lg text-gray-600">
            All our courses have a supporting reference material, a whitepaper authored by expert digital transformation practitioners within DQ
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/coming-soon/6xd"
              className="px-8 py-3.5 rounded-full bg-[#1839AD] text-white font-semibold shadow-md hover:bg-[#0d2b8a] hover:-translate-y-0.5 transition-all duration-200 text-sm"
            >
              Explore 6XD
            </Link>
            <Link
              to="/coming-soon/6xd-insights"
              className="px-8 py-3.5 rounded-full border-2 border-[#1839AD] text-[#1839AD] font-semibold hover:bg-[#1839AD]/5 hover:-translate-y-0.5 transition-all duration-200 text-sm"
            >
              Gain 6XD Insights
            </Link>
          </div>
        </FadeInUpOnScroll>
      </PageContainer>
    </div>
  );
};

export default SixXDDeepDiveSection;
