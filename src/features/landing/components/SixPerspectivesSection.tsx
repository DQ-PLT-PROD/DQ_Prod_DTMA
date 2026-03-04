import React from "react";
import { ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layouts/PageContainer";

const perspectives = [
  {
    number: 1,
    title: "Digital Economy",
    description:
      "Understand how to leverage emerging technologies to drive growth in the digital economy.",
  },
  {
    number: 2,
    title: "Digital Cognitive Organizations",
    description:
      "Master the design and management of intelligent organizations using AI and automation.",
  },
  {
    number: 3,
    title: "Digital Business Platform (DBP)",
    description:
      "Decode the platform models and ecosystems that underpin modern digital businesses.",
  },
  {
    number: 4,
    title: "Digital Transformation",
    description:
      "Gain the skills needed to lead and implement digital transformation strategies within organizations.",
  },
  {
    number: 5,
    title: "Digital Workers & Workspaces",
    description:
      "Build and manage a digitally empowered workforce with flexible, collaborative work environments.",
  },
  {
    number: 6,
    title: "Digital Accelerators & Tools",
    description:
      "Learn the tools and accelerators that make transformation processes faster and more efficient.",
  },
];

const SixPerspectivesSection: React.FC = () => {
  return (
    <div className="w-full flex flex-col justify-center py-16 sm:py-20">
      <PageContainer>
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ textShadow: "0 8px 20px rgba(3, 12, 43, 0.1)" }}
          >
            Explore Digital Transformation with 6XD
          </h2>
          <p className="text-lg text-gray-600">
            Built on the 6XD framework, our courses equip you with the skills to
            lead and succeed in digital transformation.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {perspectives.map((item) => (
            <div
              key={item.number}
              className="flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 h-full"
            >
              <div className="flex flex-col flex-1 p-6 space-y-3">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#1839AD]/10 text-[#1839AD] text-xs font-bold self-start flex-shrink-0">
                  {String(item.number).padStart(2, "0")}
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <a
            href="https://digitalqatalyst.com/insights"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-[#1839AD] text-white rounded-full hover:bg-[#0d2b8a] transition-colors font-semibold inline-flex items-center gap-2 shadow-sm min-w-[200px] justify-center"
          >
            Explore Insights
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="https://digitalqatalyst.com/6xd-book"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-white text-[#1839AD] border-2 border-[#1839AD] rounded-full hover:bg-blue-50 transition-colors font-semibold inline-flex items-center gap-2 min-w-[200px] justify-center"
          >
            Read 6XD Book
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </PageContainer>
    </div>
  );
};

export default SixPerspectivesSection;
