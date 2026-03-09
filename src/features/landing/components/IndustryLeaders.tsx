import React from "react";
import { ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layouts/PageContainer";

const IndustryLeaders: React.FC = () => {
  return (
    <div className="w-full flex flex-col justify-center py-8 sm:py-12">
      <PageContainer>
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B] leading-tight">
            Learn from Industry Leaders
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Gain invaluable insights and guidance from experts with over 15
            years of real-world digital transformation experience. Our
            mentorship program provides personalized support to help you
            navigate your learning path and apply knowledge to practical,
            real-world scenarios.
          </p>

          {/* CTA Button */}
          <div className="pt-2">
            <a
              href="/mentors"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#1839AD] text-white rounded-full hover:bg-[#0d2b8a] transition-colors font-semibold shadow-sm"
            >
              Browse Mentors
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default IndustryLeaders;
